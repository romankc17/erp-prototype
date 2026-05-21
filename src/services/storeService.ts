import type {
  AppState,
  AuditEvent,
  DiscountPolicy,
  HardwarePreferences,
  HeldCart,
  Payment,
  ReceiptNumbering,
  Role,
  Shift,
  ShiftCashMovement,
  StoreProfile,
  Transaction,
  TransactionLine,
  User,
} from "@/lib/pos/types";
import type { Product } from "@/data/clothingData";
import { clothingProducts, clothingCategories } from "@/data/clothingData";
import { loadAppState, saveAppState } from "@/lib/pos/storage";
import { formatReceiptNumber, isoNow, uid } from "@/lib/pos/ids";

// ─── Seed & Load ─────────────────────────────────────────────────────────────

function seedState(): AppState {
  const currency = { code: "NPR", symbol: "Rs.", locale: "en-IN" };
  return {
    version: 1,
    store: {
      businessName: "Demo Store",
      location: "Kathmandu, Nepal",
      receiptFooter: "Thank you for shopping with us!",
      currency,
      taxRules: [
        { id: "vat13", name: "VAT 13%", rate: 0.13, enabled: true },
        { id: "vat5", name: "VAT 5%", rate: 0.05, enabled: true },
        { id: "vat18", name: "VAT 18%", rate: 0.18, enabled: true },
      ],
    },
    hardware: {
      receiptPrinterEnabled: true,
      barcodeScannerEnabled: true,
      cashDrawerEnabled: true,
      paymentTerminalEnabled: true,
      autoOpenCashDrawerOnCashSale: true,
    },
    receipt: {
      prefix: "REC",
      includeDate: true,
      sequenceDigits: 4,
      nextSequence: 1,
    },
    discountPolicy: {
      managerOverridePercentThreshold: 15,
      managerOverrideFixedThreshold: 500,
    },
    categories: clothingCategories.filter((c) => c !== "All"),
    products: clothingProducts,
    users: [
      {
        id: "u-admin",
        name: "Admin",
        email: "admin@demo.local",
        role: "admin" as Role,
        pin: "1234",
        active: true,
        assignedBranches: [],
        primaryBranchId: null,
        canSwitchWorkspaces: true,
        crossBranchPermissions: ["view_reports", "view_inventory", "manage_branches"],
      },
      {
        id: "u-mgr",
        name: "Manager",
        email: "manager@demo.local",
        role: "manager" as Role,
        pin: "2345",
        active: true,
        assignedBranches: [],
        primaryBranchId: null,
        canSwitchWorkspaces: true,
        crossBranchPermissions: ["view_reports", "view_inventory"],
      },
      {
        id: "u-cash",
        name: "Cashier",
        email: "cashier@demo.local",
        role: "cashier" as Role,
        pin: "1111",
        active: true,
        assignedBranches: [],
        primaryBranchId: null,
        canSwitchWorkspaces: false,
        crossBranchPermissions: [],
      },
    ],
    auth: { userId: null, locked: false, lockReason: null, lastActiveAt: null },
    shifts: [],
    activeShiftId: null,
    transactions: [],
    heldCarts: [],
    audit: [],
  };
}

function loadState(): AppState {
  return loadAppState(seedState());
}

function saveState(state: AppState) {
  saveAppState(state);
}

function pushAudit(state: AppState, event: Omit<AuditEvent, "id" | "at">): AppState {
  const next: AuditEvent = { id: uid("audit"), at: isoNow(), ...event };
  const capped = [next, ...state.audit].slice(0, 2000);
  return { ...state, audit: capped };
}

function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login({ email, pin }: { email: string; pin: string }) {
  await delay(400);
  const state = loadState();
  const user = state.users.find((u) => u.active && u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false as const, error: "User not found" };
  if (user.pin !== pin) return { ok: false as const, error: "Invalid PIN" };

  const next = pushAudit(
    { ...state, auth: { userId: user.id, locked: false, lockReason: null, lastActiveAt: isoNow() } },
    { staffId: user.id, action: "auth.login", meta: { email: user.email } }
  );
  saveState(next);
  return { ok: true as const, user };
}

export async function logout() {
  await delay(200);
  const state = loadState();
  const next = pushAudit(
    { ...state, auth: { userId: null, locked: false, lockReason: null, lastActiveAt: null }, activeShiftId: null },
    { staffId: state.auth.userId, action: "auth.logout", meta: {} }
  );
  saveState(next);
}

export async function lock(reason: "idle" | "manual") {
  await delay(100);
  const state = loadState();
  const next = pushAudit(
    { ...state, auth: { ...state.auth, locked: true, lockReason: reason } },
    { staffId: state.auth.userId, action: "auth.lock", meta: { reason } }
  );
  saveState(next);
}

export async function unlock(pin: string) {
  await delay(300);
  const state = loadState();
  const userId = state.auth.userId;
  if (!userId) return { ok: false as const, error: "Not logged in" };
  const user = state.users.find((u) => u.id === userId);
  if (!user) return { ok: false as const, error: "User not found" };
  if (user.pin !== pin) return { ok: false as const, error: "Invalid PIN" };

  const next = pushAudit(
    { ...state, auth: { ...state.auth, locked: false, lockReason: null, lastActiveAt: isoNow() } },
    { staffId: userId, action: "auth.unlock", meta: {} }
  );
  saveState(next);
  return { ok: true as const };
}

export async function touchActivity() {
  const state = loadState();
  saveState({ ...state, auth: { ...state.auth, lastActiveAt: isoNow() } });
}

export async function getUsers(): Promise<User[]> {
  await delay(100);
  return loadState().users;
}

export async function getCurrentUser(): Promise<User | null> {
  const state = loadState();
  if (!state.auth.userId) return null;
  return state.users.find((u) => u.id === state.auth.userId) ?? null;
}

export async function getAuthSession() {
  await delay(50);
  return loadState().auth;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  await delay(200);
  return loadState().products;
}

export async function getProductById(id: string): Promise<Product | null> {
  await delay(100);
  return loadState().products.find((p) => p.id === id) ?? null;
}

export async function createProduct(product: Product) {
  await delay(400);
  const state = loadState();
  const cloned: Product = {
    ...product,
    variants: product.variants.map((v) => ({ ...v })),
    variantAttributes: product.variantAttributes.map((a) => ({ ...a, options: [...a.options] })),
  };
  const categories = cloned.category && !state.categories.includes(cloned.category)
    ? [...state.categories, cloned.category]
    : state.categories;
  const next = pushAudit(
    { ...state, products: [cloned, ...state.products], categories },
    { staffId: state.auth.userId, action: "product.create", meta: { productId: cloned.id, name: cloned.name } }
  );
  saveState(next);
  return cloned;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  await delay(300);
  const state = loadState();
  const products = state.products.map((p) => {
    if (p.id !== id) return p;
    const next = { ...p, ...updates };
    if (updates.variants) next.variants = updates.variants.map((v) => ({ ...v }));
    if (updates.variantAttributes) next.variantAttributes = updates.variantAttributes.map((a) => ({ ...a, options: [...a.options] }));
    return next;
  });
  const changed = products.find((p) => p.id === id);
  const next = pushAudit(
    { ...state, products },
    { staffId: state.auth.userId, action: "product.update", meta: { productId: id, name: changed?.name ?? "" } }
  );
  saveState(next);
  return products.find((p) => p.id === id)!;
}

export async function deleteProduct(id: string) {
  await delay(300);
  const state = loadState();
  const removed = state.products.find((p) => p.id === id);
  const next = pushAudit(
    { ...state, products: state.products.filter((p) => p.id !== id) },
    { staffId: state.auth.userId, action: "product.delete", meta: { productId: id, name: removed?.name ?? "" } }
  );
  saveState(next);
}

export async function adjustStock(args: { productId: string; sku?: string; delta: number; reason?: string }) {
  await delay(200);
  const state = loadState();
  const products = state.products.map((p) => {
    if (p.id !== args.productId) return p;
    if (!p.hasVariants) {
      return { ...p, availableQty: Math.max(0, p.availableQty + args.delta) };
    }
    if (!args.sku) return p;
    const variants = p.variants.map((v) =>
      v.sku === args.sku ? { ...v, stock: Math.max(0, v.stock + args.delta) } : v
    );
    const availableQty = variants.reduce((sum, v) => sum + v.stock, 0);
    return { ...p, variants, availableQty };
  });
  const next = pushAudit(
    { ...state, products },
    { staffId: state.auth.userId, action: "product.update_stock", meta: { productId: args.productId, sku: args.sku ?? null, delta: args.delta, reason: args.reason ?? "" } }
  );
  saveState(next);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<string[]> {
  await delay(100);
  return loadState().categories;
}

export async function addCategory(name: string) {
  await delay(100);
  const state = loadState();
  const trimmed = name.trim();
  if (!trimmed) return state.categories;
  if (state.categories.includes(trimmed)) return state.categories;
  const next = { ...state, categories: [...state.categories, trimmed] };
  saveState(next);
  return next.categories;
}

// ─── CSV Import ──────────────────────────────────────────────────────────────

function parseCsvRows(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string) => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current);
    return out.map((v) => v.trim());
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export async function importProductsCsv(csvText: string) {
  await delay(600);
  const { headers, rows } = parseCsvRows(csvText);
  if (headers.length === 0) return { ok: false as const, error: "CSV is empty" };

  const idx = (key: string) => headers.indexOf(key);
  const required = ["name", "sku", "barcode", "price", "cost", "stock"];
  const missing = required.filter((r) => idx(r) === -1);
  if (missing.length > 0) return { ok: false as const, error: `Missing CSV columns: ${missing.join(", ")}` };

  const errors: string[] = [];
  const imported: Product[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const get = (key: string) => row[idx(key)] ?? "";

    const name = get("name");
    const sku = get("sku");
    const barcode = get("barcode");
    const price = Number(get("price"));
    const cost = Number(get("cost"));
    const category = get("category") || "Uncategorized";
    const stock = Number(get("stock"));
    const unit = get("unit") || "Piece";

    if (!name || !sku || !barcode || !Number.isFinite(price) || price < 0 || !Number.isFinite(cost) || cost < 0 || !Number.isFinite(stock) || stock < 0) {
      errors.push(`Row ${r + 2}: invalid or missing fields`);
      continue;
    }

    imported.push({
      id: uid("product"),
      name,
      sku,
      barcode,
      category,
      subCategory: "",
      brand: "",
      description: "",
      costPrice: cost,
      basePrice: price,
      salePrice: null,
      unit,
      color: "Multi",
      size: "Multi",
      hsnCode: "",
      taxSlab: "13%",
      availableQty: stock,
      reorderLevel: 10,
      minStock: 5,
      location: "",
      branch: "Main Branch",
      status: "Active",
      image: "",
      hasVariants: false,
      variantAttributes: [],
      variants: [],
      bargainEnabled: false,
      seasonalDiscount: 0,
    });
  }

  const state = loadState();
  const categories = [...new Set([...state.categories, ...imported.map((p) => p.category)].filter(Boolean))];
  const next = pushAudit(
    { ...state, products: [...imported, ...state.products], categories },
    { staffId: state.auth.userId, action: "product.import", meta: { count: imported.length, errors: errors.length } }
  );
  saveState(next);

  return { ok: true as const, added: imported.length, errors };
}

// ─── Shifts ──────────────────────────────────────────────────────────────────

export async function getShifts(): Promise<Shift[]> {
  await delay(100);
  return loadState().shifts;
}

export async function getActiveShift(): Promise<Shift | null> {
  await delay(50);
  const state = loadState();
  if (!state.activeShiftId) return null;
  return state.shifts.find((s) => s.id === state.activeShiftId) ?? null;
}

export async function openShift(openingCash: number, currentUserId: string) {
  await delay(400);
  const state = loadState();
  if (state.activeShiftId) return { ok: false as const, error: "Shift already open" };

  const shift: Shift = {
    id: uid("shift"),
    status: "open",
    openedAt: isoNow(),
    openedBy: currentUserId,
    openingCash,
    closedAt: null,
    closedBy: null,
    countedCash: null,
    expectedCash: openingCash,
    shortOver: null,
    cashMovements: [],
  };

  const next = pushAudit(
    { ...state, shifts: [shift, ...state.shifts], activeShiftId: shift.id },
    { staffId: currentUserId, action: "shift.open", meta: { openingCash } }
  );
  saveState(next);
  return { ok: true as const, shift };
}

export async function closeShift(countedCash: number, currentUserId: string, activeShiftId: string) {
  await delay(400);
  const state = loadState();
  const activeShift = state.shifts.find((s) => s.id === activeShiftId);
  if (!activeShift) return { ok: false as const, error: "No active shift" };
  if (activeShift.status !== "open") return { ok: false as const, error: "Shift is not open" };

  const shortOver = countedCash - activeShift.expectedCash;
  const shifts = state.shifts.map((sh) => {
    if (sh.id !== activeShiftId) return sh;
    return {
      ...sh,
      status: "closed" as const,
      closedAt: isoNow(),
      closedBy: currentUserId,
      countedCash,
      shortOver,
    };
  });

  const next = pushAudit(
    { ...state, shifts, activeShiftId: null },
    { staffId: currentUserId, action: "shift.close", meta: { countedCash, expectedCash: activeShift.expectedCash, shortOver } }
  );
  saveState(next);
  return { ok: true as const };
}

export async function recordCashMovement(args: { type: "paid_in" | "paid_out"; amount: number; reason: string; currentUserId: string; activeShiftId: string }) {
  await delay(200);
  const state = loadState();
  const movement: ShiftCashMovement = {
    id: uid("cash"),
    shiftId: args.activeShiftId,
    type: args.type,
    amount: args.amount,
    reason: args.reason,
    createdAt: isoNow(),
    staffId: args.currentUserId,
  };

  const shifts = state.shifts.map((sh) => {
    if (sh.id !== args.activeShiftId) return sh;
    const expectedCash = args.type === "paid_in" ? sh.expectedCash + args.amount : sh.expectedCash - args.amount;
    return { ...sh, expectedCash, cashMovements: [movement, ...sh.cashMovements] };
  });

  const next = pushAudit(
    { ...state, shifts },
    { staffId: args.currentUserId, action: "shift.cash_movement", meta: { type: args.type, amount: args.amount, reason: args.reason } }
  );
  saveState(next);
}

// ─── Transactions ────────────────────────────────────────────────────────────

export type CreateSaleInput = {
  customerName: string;
  lines: Array<{
    productId: string;
    sku: string;
    name: string;
    variant: string;
    unit: string;
    qty: number;
    unitPrice: number;
    discountAmount?: number;
    taxRate: number;
  }>;
  totals: { subtotal: number; tax: number; discount: number; total: number };
  payments: Array<{ method: "cash" | "card" | "digital_wallet" | "store_credit"; amount: number; reference?: string | null }>;
  type: "sale" | "return";
  originalReceiptNumber?: string | null;
};

export async function getTransactions(): Promise<Transaction[]> {
  await delay(100);
  return loadState().transactions;
}

export async function getTransactionByReceipt(receiptNumber: string): Promise<Transaction | null> {
  await delay(100);
  return loadState().transactions.find((t) => t.receiptNumber === receiptNumber) ?? null;
}

export async function createTransaction(input: CreateSaleInput, currentUserId: string, activeShiftId: string) {
  await delay(500);
  const state = loadState();

  const receiptNumber = formatReceiptNumber({
    prefix: state.receipt.prefix,
    includeDate: state.receipt.includeDate,
    sequenceDigits: state.receipt.sequenceDigits,
    sequence: state.receipt.nextSequence,
  });

  const lines: TransactionLine[] = input.lines.map((l) => ({
    id: uid("line"),
    productId: l.productId,
    sku: l.sku,
    name: l.name,
    variant: l.variant,
    unit: l.unit,
    qty: l.qty,
    unitPrice: l.unitPrice,
    discountAmount: l.discountAmount ?? 0,
    taxRate: l.taxRate,
  }));

  const payments: Payment[] = input.payments.map((p) => ({
    id: uid("pay"),
    method: p.method,
    amount: p.amount,
    reference: p.reference ?? null,
  }));

  const tx: Transaction = {
    id: uid("tx"),
    receiptNumber,
    status: "completed",
    type: input.type,
    originalReceiptNumber: input.originalReceiptNumber ?? null,
    createdAt: isoNow(),
    shiftId: activeShiftId,
    staffId: currentUserId,
    customerName: input.customerName || "Walk-in",
    lines,
    totals: { ...input.totals },
    payments,
  };

  const products = state.products.map((p) => {
    const related = lines.filter((l) => l.productId === p.id);
    if (related.length === 0) return p;
    if (!p.hasVariants) {
      const delta = related.reduce((sum, l) => sum - l.qty, 0);
      return { ...p, availableQty: Math.max(0, p.availableQty + delta) };
    }
    const variants = p.variants.map((v) => {
      const delta = related.filter((l) => l.sku === v.sku).reduce((sum, l) => sum - l.qty, 0);
      if (delta === 0) return v;
      return { ...v, stock: Math.max(0, v.stock + delta) };
    });
    const availableQty = variants.reduce((sum, v) => sum + v.stock, 0);
    return { ...p, variants, availableQty };
  });

  const nextReceipt = { ...state.receipt, nextSequence: state.receipt.nextSequence + 1 };
  const cashNet = payments.filter((p) => p.method === "cash").reduce((sum, p) => sum + p.amount, 0);
  const shifts = state.shifts.map((sh) => {
    if (sh.id !== activeShiftId) return sh;
    return { ...sh, expectedCash: sh.expectedCash + cashNet };
  });

  const next = pushAudit(
    { ...state, products, receipt: nextReceipt, transactions: [tx, ...state.transactions], shifts },
    { staffId: currentUserId, action: input.type === "sale" ? "tx.create" : "tx.return", meta: { receiptNumber, total: tx.totals.total } }
  );
  saveState(next);

  return { ok: true as const, tx };
}

// ─── Held Carts ──────────────────────────────────────────────────────────────

export async function getHeldCarts(): Promise<HeldCart[]> {
  await delay(100);
  return loadState().heldCarts;
}

export async function holdCart(cart: Omit<HeldCart, "id" | "createdAt" | "staffId">, currentUserId: string) {
  await delay(200);
  const state = loadState();
  const held: HeldCart = {
    id: uid("held"),
    createdAt: isoNow(),
    staffId: currentUserId,
    customerName: cart.customerName,
    note: cart.note,
    lines: cart.lines.map((l) => ({ ...l })),
  };
  saveState({ ...state, heldCarts: [held, ...state.heldCarts] });
  return { ok: true as const };
}

export async function recallCart(id: string): Promise<HeldCart | null> {
  await delay(100);
  return loadState().heldCarts.find((c) => c.id === id) ?? null;
}

export async function deleteHeldCart(id: string) {
  await delay(100);
  const state = loadState();
  saveState({ ...state, heldCarts: state.heldCarts.filter((c) => c.id !== id) });
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getStoreProfile(): Promise<StoreProfile> {
  await delay(50);
  return loadState().store;
}

export async function updateStoreProfile(profile: Partial<StoreProfile>) {
  await delay(200);
  const state = loadState();
  const next = { ...state, store: { ...state.store, ...profile } };
  saveState(next);
  return next.store;
}

export async function getHardware(): Promise<HardwarePreferences> {
  await delay(50);
  return loadState().hardware;
}

export async function updateHardware(hardware: Partial<HardwarePreferences>) {
  await delay(200);
  const state = loadState();
  const next = { ...state, hardware: { ...state.hardware, ...hardware } };
  saveState(next);
  return next.hardware;
}

export async function getReceipt(): Promise<ReceiptNumbering> {
  await delay(50);
  return loadState().receipt;
}

export async function updateReceipt(receipt: Partial<ReceiptNumbering>) {
  await delay(200);
  const state = loadState();
  const next = { ...state, receipt: { ...state.receipt, ...receipt } };
  saveState(next);
  return next.receipt;
}

export async function getDiscountPolicy(): Promise<DiscountPolicy> {
  await delay(50);
  return loadState().discountPolicy;
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export async function getAudit(): Promise<AuditEvent[]> {
  await delay(100);
  return loadState().audit;
}

// ─── Full State (for context hydration) ──────────────────────────────────────

export async function getAppState(): Promise<AppState> {
  await delay(100);
  return loadState();
}

export async function saveAppStateDirect(state: AppState) {
  saveState(state);
}
