import { useState, useCallback } from "react";
import type {
  Session, Sale, HeldBill, SaleReturn, Invoice, VoidLog, User,
} from "./posTypes";
import { USERS } from "./posTypes";
import { posProducts } from "../data/clothingData";
import { adToBS } from "./nepaliDate";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEY_SESSION = "pos_session_v3";
const KEY_SALES = "pos_sales_v3";
const KEY_HELD = "pos_held_v3";
const KEY_RETURNS = "pos_returns_v3";
const KEY_STOCK = "pos_stock_v3";
const KEY_COUNTER = "pos_receipt_counter_v3";
const KEY_INVOICES = "pos_invoices_v3";
const KEY_VOID_LOGS = "pos_void_logs_v3";
const KEY_CURRENT_USER = "pos_current_user_v3";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch { return fallback; }
}
function save(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ─── Users ────────────────────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
  return load<User | null>(KEY_CURRENT_USER, null);
}

export function loginUser(pin: string): User | null {
  const user = USERS.find((u) => u.pin === pin) ?? null;
  if (user) save(KEY_CURRENT_USER, user);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(KEY_CURRENT_USER);
}

export function setCurrentUser(user: User | null) {
  save(KEY_CURRENT_USER, user);
}

// ─── Fiscal Year ──────────────────────────────────────────────────────────────
export function getCurrentFiscalYear(): string {
  const now = new Date();
  // Nepal fiscal year: Shrawan (~July/Aug) to Ashadh (~June/July)
  // Simplified: if month >= 3 (April), FY = year/year+1 in BS approx
  const bs = adToBS(now);
  // Approximate: BS fiscal year runs roughly parallel
  return `${bs.year}/${bs.year + 1}`;
}

// ─── Stock overlay (starts with product defaults, mutations persist) ───────────
export type StockMap = Record<string, number>; // key = `productId:variantId` or `productId`

function buildDefaultStock(): StockMap {
  const map: StockMap = {};
  for (const p of posProducts) {
    if (p.hasVariants) {
      for (const v of p.variants) map[`${p.id}:${v.id}`] = v.stock;
    } else {
      map[p.id] = p.availableQty;
    }
  }
  return map;
}

function loadStock(): StockMap {
  const saved = load<StockMap | null>(KEY_STOCK, null);
  return saved ?? buildDefaultStock();
}

export function getStock(stock: StockMap, productId: string, variantId?: string): number {
  const key = variantId ? `${productId}:${variantId}` : productId;
  return stock[key] ?? 0;
}

// ─── Receipt numbering ─────────────────────────────────────────────────────────
function nextReceiptNo(): string {
  const year = new Date().getFullYear();
  const counter = load<number>(KEY_COUNTER, 100) + 1;
  save(KEY_COUNTER, counter);
  return `REC-${year}-${String(counter).padStart(4, "0")}`;
}

function nextInvoiceNo(): string {
  const fy = getCurrentFiscalYear();
  const counter = load<number>(`pos_inv_counter_${fy}`, 0) + 1;
  save(`pos_inv_counter_${fy}`, counter);
  return `INV-${fy.replace("/", "-")}-${String(counter).padStart(4, "0")}`;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── Main hook ─────────────────────────────────────────────────────────────────
export function usePOSStore() {
  const [session, _setSession] = useState<Session | null>(() => load<Session | null>(KEY_SESSION, null));
  const [sales, _setSales] = useState<Sale[]>(() => load<Sale[]>(KEY_SALES, []));
  const [held, _setHeld] = useState<HeldBill[]>(() => load<HeldBill[]>(KEY_HELD, []));
  const [returns, _setReturns] = useState<SaleReturn[]>(() => load<SaleReturn[]>(KEY_RETURNS, []));
  const [stock, _setStock] = useState<StockMap>(loadStock);
  const [invoices, _setInvoices] = useState<Invoice[]>(() => load<Invoice[]>(KEY_INVOICES, []));
  const [voidLogs, _setVoidLogs] = useState<VoidLog[]>(() => load<VoidLog[]>(KEY_VOID_LOGS, []));
  const [currentUser, _setCurrentUser] = useState<User | null>(getCurrentUser);

  // Setters that also persist
  const setSession = useCallback((s: Session | null) => { _setSession(s); save(KEY_SESSION, s); }, []);
  const setSales = useCallback((arr: Sale[]) => { _setSales(arr); save(KEY_SALES, arr); }, []);
  const setHeld = useCallback((arr: HeldBill[]) => { _setHeld(arr); save(KEY_HELD, arr); }, []);
  const setReturns = useCallback((arr: SaleReturn[]) => { _setReturns(arr); save(KEY_RETURNS, arr); }, []);
  const setStock = useCallback((m: StockMap) => { _setStock(m); save(KEY_STOCK, m); }, []);
  const setInvoices = useCallback((arr: Invoice[]) => { _setInvoices(arr); save(KEY_INVOICES, arr); }, []);
  const setVoidLogs = useCallback((arr: VoidLog[]) => { _setVoidLogs(arr); save(KEY_VOID_LOGS, arr); }, []);
  const setCurrentUser = useCallback((u: User | null) => { _setCurrentUser(u); setCurrentUserPersist(u); }, []);

  // ── Session operations ────────────────────────────────────────────────────

  const openSession = useCallback((partial: Omit<Session, "id" | "status" | "cashInDrawer" | "addedCash" | "removedCash" | "cashEvents" | "closingCash" | "closingDenoms" | "closedAt" | "closedBy" | "shortOver" | "receiptCounter">) => {
    const s: Session = {
      ...partial,
      id: `sess-${Date.now()}`,
      status: "open",
      cashInDrawer: partial.openingCash,
      addedCash: 0,
      removedCash: 0,
      cashEvents: [],
      closingCash: null,
      closingDenoms: {},
      closedAt: null,
      closedBy: null,
      shortOver: null,
      receiptCounter: 0,
    };
    setSession(s);
  }, [setSession]);

  const closeSession = useCallback((countedCash: number, denoms: Record<number, number>, closedBy: string, closedAt: string) => {
    if (!session) return;
    const shortOver = countedCash - session.cashInDrawer;
    const closed: Session = { ...session, status: "closed", closingCash: countedCash, closingDenoms: denoms, closedAt, closedBy, shortOver };
    setSession(closed);
  }, [session, setSession]);

  const addCashEvent = useCallback((type: "in" | "out", amount: number, note: string, by: string) => {
    if (!session) return;
    const evt = { id: `ce-${Date.now()}`, type, amount, note, by, at: nowTime() };
    const updated: Session = {
      ...session,
      cashInDrawer: type === "in" ? session.cashInDrawer + amount : session.cashInDrawer - amount,
      addedCash: type === "in" ? session.addedCash + amount : session.addedCash,
      removedCash: type === "out" ? session.removedCash + amount : session.removedCash,
      cashEvents: [...session.cashEvents, evt],
    };
    setSession(updated);
  }, [session, setSession]);

  // ── Sale operations ──────────────────────────────────────────────────────

  const completeSale = useCallback((partial: Omit<Sale, "id" | "receiptNo">, stockDelta: Record<string, number>) => {
    const receiptNo = nextReceiptNo();
    const sale: Sale = { ...partial, id: `sale-${Date.now()}`, receiptNo };
    setSales([sale, ...sales]);
    // Deduct stock
    const newStock = { ...stock };
    for (const [key, delta] of Object.entries(stockDelta)) {
      newStock[key] = (newStock[key] ?? 0) - delta;
    }
    setStock(newStock);
    // Update cash in drawer if cash payment
    if (session && (partial.paymentMethod === "cash" || partial.paymentMethod === "split")) {
      const cashIn = partial.cashReceived - partial.changeGiven;
      setSession({ ...session, cashInDrawer: session.cashInDrawer + cashIn, receiptCounter: session.receiptCounter + 1 });
    } else if (session) {
      setSession({ ...session, receiptCounter: session.receiptCounter + 1 });
    }
    // Create invoice
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: nextInvoiceNo(),
      saleId: sale.id,
      receiptNo: sale.receiptNo,
      branchId: sale.branchId,
      branchName: sale.branchName,
      fiscalYear: getCurrentFiscalYear(),
      date: sale.date,
      dateBS: sale.dateBS,
      customerName: sale.customerName,
      subtotal: sale.subtotal,
      vatTotal: sale.vatTotal,
      grandTotal: sale.grandTotal,
      status: "active",
    };
    setInvoices([inv, ...invoices]);
    return { sale, invoice: inv };
  }, [sales, stock, session, invoices, setSales, setStock, setSession, setInvoices]);

  const voidSale = useCallback((saleId: string, reason: string, voidedBy: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const now = new Date();
    const voidedAt = now.toISOString();
    setSales(sales.map((s) => s.id === saleId ? { ...s, status: "voided" as const, voidReason: reason, voidedBy, voidedAt: nowTime() } : s));
    // Restore stock
    const newStock = { ...stock };
    for (const line of sale.lines) {
      const key = line.variant ? `${line.productId}:${findVariantId(line.productId, line.variant)}` : line.productId;
      newStock[key] = (newStock[key] ?? 0) + line.qty;
    }
    setStock(newStock);
    // Reverse cash if applicable
    if (session && (sale.paymentMethod === "cash" || sale.paymentMethod === "split")) {
      const cashIn = sale.cashReceived - sale.changeGiven;
      setSession({ ...session, cashInDrawer: session.cashInDrawer - cashIn });
    }
    // Void linked invoice
    setInvoices(invoices.map((inv) => inv.saleId === saleId ? { ...inv, status: "voided" as const, voidReason: reason, voidedBy } : inv));
    // Log void
    const log: VoidLog = {
      id: `vl-${Date.now()}`,
      saleId: sale.id,
      receiptNo: sale.receiptNo,
      reason,
      voidedBy,
      voidedAt,
      branchId: sale.branchId,
    };
    setVoidLogs([log, ...voidLogs]);
  }, [sales, stock, session, invoices, voidLogs, setSales, setStock, setSession, setInvoices, setVoidLogs]);

  const processReturn = useCallback((ret: Omit<SaleReturn, "id" | "receiptNo">) => {
    const full: SaleReturn = { ...ret, id: `ret-${Date.now()}`, receiptNo: nextReceiptNo() };
    setReturns([full, ...returns]);
    // Update sale returnedQty
    setSales(sales.map((s) => {
      if (s.id !== ret.originalSaleId) return s;
      const newLines = s.lines.map((l) => {
        const rl = ret.lines.find((r) => r.productId === l.productId && r.variant === l.variant);
        return rl ? { ...l, returnedQty: (l.returnedQty ?? 0) + rl.returnQty } : l;
      });
      const allReturned = newLines.every((l) => (l.returnedQty ?? 0) >= l.qty);
      return { ...s, lines: newLines, status: allReturned ? "voided" : "partial_return" };
    }));
    // Restore restockable inventory
    const newStock = { ...stock };
    for (const line of ret.lines) {
      if (line.condition === "restockable") {
        const key = line.variant ? `${line.productId}:${findVariantId(line.productId, line.variant)}` : line.productId;
        newStock[key] = (newStock[key] ?? 0) + line.returnQty;
      }
    }
    setStock(newStock);
    // Adjust cash drawer for cash refunds
    if (ret.refundMethod === "cash" && session) {
      setSession({ ...session, cashInDrawer: session.cashInDrawer - ret.refundTotal });
    }
    return full;
  }, [returns, sales, stock, session, setReturns, setSales, setStock, setSession]);

  // ── Held bill operations ─────────────────────────────────────────────────

  const holdBill = useCallback((bill: HeldBill) => {
    setHeld([...held, bill]);
  }, [held, setHeld]);

  const recallBill = useCallback((id: string) => {
    const bill = held.find((b) => b.id === id) ?? null;
    setHeld(held.filter((b) => b.id !== id));
    return bill;
  }, [held, setHeld]);

  const deleteHeld = useCallback((id: string) => {
    setHeld(held.filter((b) => b.id !== id));
  }, [held, setHeld]);

  // ── User ─────────────────────────────────────────────────────────────────

  const login = useCallback((pin: string) => {
    const user = loginUser(pin);
    _setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    _setCurrentUser(null);
  }, []);

  return {
    session, sales, held, returns, stock, invoices, voidLogs, currentUser,
    openSession, closeSession, addCashEvent,
    completeSale, voidSale, processReturn,
    holdBill, recallBill, deleteHeld,
    login, logout, setCurrentUser,
  };
}

// ─── Util: find variant id by label ───────────────────────────────────────────
function findVariantId(productId: string, variantLabel: string): string {
  const p = posProducts.find((x) => x.id === productId);
  if (!p) return variantLabel;
  const attrs = variantLabel.split(" / ");
  const v = p.variants.find((vt) => {
    const vals = Object.values(vt.attributes);
    return attrs.every((a) => vals.includes(a));
  });
  return v?.id ?? variantLabel;
}

function setCurrentUserPersist(u: User | null) {
  save(KEY_CURRENT_USER, u);
}
