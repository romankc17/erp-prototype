import { useMemo, useRef, useState, useEffect } from "react";
import {
  Plus, Minus, Trash2, Search, Pause, Play, Receipt,
  Banknote, CreditCard, Split, Package,
  LayoutGrid, List, History, Lock, Unlock,
  ShoppingCart, Tag, X, TrendingUp, Printer, RotateCcw as ReturnIcon,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { DENOMINATIONS } from "../data/clothingData";
import type { Shift, Transaction } from "../lib/pos/types";

// --- Types ---
interface CartItem {
  id: string; name: string; price: number; originalPrice: number;
  qty: number; isReturn: boolean; variant: string; sku: string;
  bargainPrice: number | null; bargainEnabled: boolean;
  discount: number;
  vatEnabled: boolean;
}

// --- Helpers ---
const nowTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
const today = () => new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
const parseTaxSlab = (slab: string) => {
  const m = slab.match(/(\d+(?:\.\d+)?)%/);
  return m ? Number(m[1]) / 100 : 0;
};

// Category color scheme
const catScheme: Record<string, { pill: string; card: string; icon: string }> = {
  "T-Shirt":     { pill: "bg-sky-100 text-sky-700",     card: "from-sky-100 to-sky-50",     icon: "text-sky-400" },
  "Shirt":       { pill: "bg-blue-100 text-blue-700",   card: "from-blue-100 to-blue-50",   icon: "text-blue-400" },
  "Pant":        { pill: "bg-amber-100 text-amber-700", card: "from-amber-100 to-amber-50", icon: "text-amber-400" },
  "Kurta":       { pill: "bg-emerald-100 text-emerald-700", card: "from-emerald-100 to-emerald-50", icon: "text-emerald-400" },
  "Jacket":      { pill: "bg-slate-200 text-slate-700", card: "from-slate-100 to-slate-50", icon: "text-slate-400" },
  "Accessories": { pill: "bg-rose-100 text-rose-700",   card: "from-rose-100 to-rose-50",   icon: "text-rose-400" },
};
const defaultScheme = { pill: "bg-violet-100 text-violet-700", card: "from-violet-100 to-violet-50", icon: "text-violet-400" };
const getScheme = (cat: string) => catScheme[cat] ?? defaultScheme;
const POS_VIEW_MODE_KEY = "pos.productListingViewMode";

function loadSavedViewMode(): "grid" | "list" {
  try {
    return localStorage.getItem(POS_VIEW_MODE_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function POS() {
  const {
    posProducts,
    categories,
    storeProfile,
    discountPolicy,
    users,
    currentUser,
    activeShift,
    openShift,
    closeShift,
    recordCashMovement,
    createTransaction,
    transactions,
    heldCarts,
    holdCart,
    deleteHeldCart,
  } = useStore();
  const [activeTab, setActiveTab] = useState("sell");
  const [lastClosedShift, setLastClosedShift] = useState<Shift | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">(loadSavedViewMode);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<CartItem[]>([]);
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [paymentMode, setPaymentMode] = useState<"cash" | "epay" | "split">("cash");
  const [cashInput, setCashInput] = useState("");
  const [epayRef, setEpayRef] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitEpay, setSplitEpay] = useState("");
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [extraDiscType] = useState<"percent" | "fixed">("percent");
  const [showVariantPicker, setShowVariantPicker] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [holdNote, setHoldNote] = useState("");
  const [showRecallPanel, setShowRecallPanel] = useState(false);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [cashAction, setCashAction] = useState<"add" | "remove">("add");
  const [cashAmount, setCashAmount] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeDenom, setCloseDenom] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [showBargainDialog, setShowBargainDialog] = useState<string | null>(null);
  const [bargainPrice, setBargainPrice] = useState("");
  const [showDiscDialog, setShowDiscDialog] = useState<string | null>(null);
  const [itemDisc, setItemDisc] = useState(0);
  const [openDenom, setOpenDenom] = useState<Record<number, number>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const userNameById = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users]);
  const cashierName = currentUser?.name ?? "—";

  const productById = useMemo(() => Object.fromEntries(posProducts.map(p => [p.id, p])), [posProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(POS_VIEW_MODE_KEY, viewMode);
    } catch {
      // Ignore storage failures so POS remains usable in restricted browser modes.
    }
  }, [viewMode]);

  // === Calculations ===
  const { subtotal, vatTotal, lineDiscountTotal } = useMemo(() => {
    let subtotalAcc = 0;
    let vatAcc = 0;
    let discountAcc = 0;
    for (const i of cart) {
      const sign = i.isReturn ? -1 : 1;
      const unitPrice = i.bargainPrice ?? i.price;
      const gross = unitPrice * i.qty;
      const disc = Math.round(gross * (i.discount / 100));
      const taxable = gross - disc;
      const taxRate = i.vatEnabled ? parseTaxSlab(productById[i.id]?.taxSlab ?? "0%") : 0;
      const tax = Math.round(taxable * taxRate);
      subtotalAcc += sign * taxable;
      vatAcc += sign * tax;
      discountAcc += sign * disc;
    }
    return { subtotal: subtotalAcc, vatTotal: vatAcc, lineDiscountTotal: discountAcc };
  }, [cart, productById]);

  const extraDiscAmount = extraDiscType === "percent"
    ? Math.round(Math.abs(subtotal) * (extraDiscount / 100))
    : extraDiscount;

  const total = subtotal + vatTotal - extraDiscAmount;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const change = paymentMode === "cash" && total > 0 && Number(cashInput) >= total ? Number(cashInput) - total : 0;
  const cashShort = paymentMode === "cash" && total > 0 && Number(cashInput) > 0 && Number(cashInput) < total ? total - Number(cashInput) : 0;

  const canComplete = cart.length > 0 && total !== 0 &&
    (total < 0 || (
      !(paymentMode === "cash" && (Number(cashInput) === 0 || Number(cashInput) < total)) &&
      !(paymentMode === "split" && (Number(splitCash) + Number(splitEpay) < total))
    ));

  const receiptMeta = useMemo(() => ({
    date: lastTx ? fmtDate(lastTx.createdAt) : today(),
    time: lastTx ? fmtTime(lastTx.createdAt) : nowTime(),
    cashier: lastTx ? (userNameById[lastTx.staffId] ?? cashierName) : cashierName,
    customer: lastTx?.customerName || customerName || "Walk-in",
    payment: lastTx
      ? (Array.from(new Set(lastTx.payments.map(p => p.method))).join(" + ") || "-")
      : (paymentMode === "cash" ? "Cash" : paymentMode === "epay" ? "E-Payment" : "Split"),
  }), [cashierName, customerName, lastTx, paymentMode, userNameById]);

  const receiptTotals = useMemo(() => ({
    subtotal: Math.abs(lastTx?.totals.subtotal ?? subtotal),
    tax: Math.abs(lastTx?.totals.tax ?? vatTotal),
    discount: Math.abs(lastTx?.totals.discount ?? extraDiscAmount),
    total: lastTx?.totals.total ?? total,
  }), [extraDiscAmount, lastTx, subtotal, total, vatTotal]);

  const printReceipt = () => {
    const printWindow = window.open("", "pos-receipt-print", "width=420,height=680");
    if (!printWindow) return;

    const money = (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`;
    const lineRows = receiptData.map((item) => {
      const name = `${item.name}${item.variant ? ` (${item.variant})` : ""} x${item.qty}`;
      const lineTotal = (item.bargainPrice || item.price) * item.qty;
      return `<div class="row item"><span>${escapeHtml(name)}</span><strong>${escapeHtml(money(lineTotal))}</strong></div>`;
    }).join("");

    const metaRows = [
      ["Date", receiptMeta.date],
      ["Time", receiptMeta.time],
      ["Cashier", receiptMeta.cashier],
      ["Customer", receiptMeta.customer],
      ["Payment", receiptMeta.payment],
    ].map(([label, value]) => `<div class="row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(lastTx?.receiptNumber ?? "Receipt")}</title>
          <style>
            @page { size: 80mm auto; margin: 6mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, sans-serif; color: #111827; }
            .receipt { width: 100%; max-width: 320px; margin: 0 auto; }
            .center { text-align: center; }
            h1 { font-size: 20px; margin: 8px 0 2px; }
            p { margin: 2px 0; font-size: 12px; color: #64748b; }
            .rule { border-top: 1px dashed #cbd5e1; margin: 14px 0; }
            .row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; margin: 8px 0; }
            .row span { color: #64748b; }
            .item span { color: #111827; }
            .total { font-size: 16px; font-weight: 700; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 18px; padding-top: 14px; border-top: 1px dashed #cbd5e1; text-align: center; }
            .footer strong { display: block; font-size: 13px; margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <h1>${escapeHtml(storeProfile.businessName)}</h1>
              <p>${escapeHtml(storeProfile.location)}</p>
              ${lastTx ? `<p>Receipt: ${escapeHtml(lastTx.receiptNumber)}</p>` : ""}
            </div>
            <div class="rule"></div>
            ${metaRows}
            <div class="rule"></div>
            ${lineRows}
            <div class="rule"></div>
            <div class="row"><span>Subtotal</span><strong>${escapeHtml(money(receiptTotals.subtotal))}</strong></div>
            ${receiptTotals.tax > 0 ? `<div class="row"><span>Tax</span><strong>${escapeHtml(money(receiptTotals.tax))}</strong></div>` : ""}
            ${receiptTotals.discount > 0 ? `<div class="row"><span>Discount</span><strong>-${escapeHtml(money(receiptTotals.discount))}</strong></div>` : ""}
            <div class="row total"><span>Total</span><strong>${escapeHtml(money(receiptTotals.total))}</strong></div>
            <div class="footer">
              <strong>${escapeHtml(storeProfile.receiptFooter || "Thank you for shopping with us!")}</strong>
              <p>Returns accepted within 7 days with receipt</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sessionView = useMemo(() => {
    const shift = activeShift ?? lastClosedShift;
    if (!shift) return null;
    const addedCash = shift.cashMovements.filter(m => m.type === "paid_in").reduce((s, m) => s + m.amount, 0);
    const removedCash = shift.cashMovements.filter(m => m.type === "paid_out").reduce((s, m) => s + m.amount, 0);
    return {
      status: shift.status,
      openedAt: fmtTime(shift.openedAt),
      openedBy: userNameById[shift.openedBy] ?? shift.openedBy,
      openingCash: shift.openingCash,
      cashInDrawer: shift.expectedCash,
      addedCash,
      removedCash,
      closingCash: shift.countedCash,
      closedAt: shift.closedAt ? fmtTime(shift.closedAt) : null,
      closedBy: shift.closedBy ? (userNameById[shift.closedBy] ?? shift.closedBy) : null,
      shortOver: shift.shortOver,
    };
  }, [activeShift, lastClosedShift, userNameById]);

  // === Product Filtering ===
  const filteredProducts = posProducts.filter((p) => {
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchSearch = productSearch === "" ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.barcode.includes(productSearch);
    return matchCat && matchSearch;
  });

  // === Add to Cart ===
  const addToCart = (product: typeof posProducts[0]) => {
    if (product.hasVariants && product.variants.length > 0) {
      setShowVariantPicker(product.id);
      setSelectedVariant({});
      return;
    }
    const effectivePrice = product.salePrice ?? product.basePrice;
    const discPrice = Math.round(effectivePrice * (1 - product.seasonalDiscount / 100));
    const existing = cart.find(i => i.id === product.id && !i.variant);
    if (existing) {
      setCart(cart.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, {
        id: product.id, name: product.name, price: discPrice, originalPrice: effectivePrice,
        qty: 1, isReturn: false, variant: "", sku: product.sku,
        bargainPrice: null, bargainEnabled: product.bargainEnabled, discount: 0, vatEnabled: true,
      }]);
    }
  };

  const addVariantToCart = () => {
    if (!showVariantPicker) return;
    const product = posProducts.find(p => p.id === showVariantPicker);
    if (!product) return;
    const variant = product.variants.find(v =>
      Object.entries(selectedVariant).every(([k, val]) => v.attributes[k] === val)
    );
    if (!variant) return;
    const discPrice = Math.round(variant.price * (1 - product.seasonalDiscount / 100));
    const variantLabel = Object.entries(selectedVariant).map(([, v]) => v).join(" / ");
    const existing = cart.find(i => i.id === product.id && i.variant === variantLabel);
    if (existing) {
      setCart(cart.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, {
        id: product.id, name: product.name, price: discPrice, originalPrice: variant.price,
        qty: 1, isReturn: false, variant: variantLabel, sku: variant.sku,
        bargainPrice: null, bargainEnabled: product.bargainEnabled, discount: 0, vatEnabled: true,
      }]);
    }
    setShowVariantPicker(null);
    setSelectedVariant({});
  };

  const openBargain = (itemId: string) => {
    const item = cart.find(i => i.id + i.variant === itemId);
    if (!item) return;
    setShowBargainDialog(itemId);
    setBargainPrice(item.bargainPrice ? String(item.bargainPrice) : String(item.price));
  };

  const applyBargain = () => {
    if (!showBargainDialog) return;
    setCart(cart.map(i =>
      i.id + i.variant === showBargainDialog ? { ...i, bargainPrice: Number(bargainPrice) || i.price } : i
    ));
    setShowBargainDialog(null);
  };

  const requireManagerOverride = (reason: string) => {
    if (!currentUser || currentUser.role !== "cashier") return true;
    const pin = window.prompt(`Manager override required: ${reason}\\nEnter manager/admin PIN:`) ?? "";
    if (!pin) return false;
    const ok = users.some((u) => u.active && (u.role === "manager" || u.role === "admin") && u.pin === pin);
    if (!ok) window.alert("Invalid manager PIN");
    return ok;
  };

  const applyItemDisc = () => {
    if (!showDiscDialog) return;
    if (itemDisc > discountPolicy.managerOverridePercentThreshold && !requireManagerOverride(`Item discount ${itemDisc}%`)) return;
    setCart(cart.map(i =>
      i.id + i.variant === showDiscDialog ? { ...i, discount: itemDisc } : i
    ));
    setShowDiscDialog(null);
  };

  const completeSale = async () => {
    if (!canComplete) return;
    if (extraDiscount > 0) {
      const need =
        extraDiscType === "percent"
          ? extraDiscount > discountPolicy.managerOverridePercentThreshold
          : extraDiscAmount > discountPolicy.managerOverrideFixedThreshold;
      if (need && !requireManagerOverride(`Extra discount ${extraDiscType === "percent" ? `${extraDiscount}%` : `Rs. ${extraDiscAmount}`}`)) return;
    }
    const maxItemDisc = cart.reduce((m, i) => Math.max(m, i.discount), 0);
    if (maxItemDisc > discountPolicy.managerOverridePercentThreshold && !requireManagerOverride(`Item discount ${maxItemDisc}%`)) return;

    const lines = cart.map((i) => {
      const sign = i.isReturn ? -1 : 1;
      const unitPrice = i.bargainPrice ?? i.price;
      const product = productById[i.id];
      const taxRate = i.vatEnabled ? parseTaxSlab(product?.taxSlab ?? "0%") : 0;
      const gross = unitPrice * i.qty;
      const discountAmount = Math.round(gross * (i.discount / 100));
      return {
        productId: i.id,
        sku: i.sku,
        name: i.name,
        variant: i.variant,
        unit: product?.unit ?? "Piece",
        qty: sign * i.qty,
        unitPrice,
        discountAmount,
        taxRate,
      };
    });

    const payments = (() => {
      if (total < 0) {
        return [{ method: "cash" as const, amount: total, reference: null }];
      }
      if (paymentMode === "cash") {
        return [{ method: "cash" as const, amount: total, reference: null }];
      }
      if (paymentMode === "epay") {
        return [{ method: "digital_wallet" as const, amount: total, reference: epayRef || null }];
      }
      return [
        { method: "cash" as const, amount: Number(splitCash) || 0, reference: null },
        { method: "digital_wallet" as const, amount: Number(splitEpay) || 0, reference: epayRef || null },
      ].filter((p) => p.amount !== 0);
    })();

    const result = await createTransaction({
      customerName: customerName || "Walk-in",
      type: "sale",
      lines,
      totals: {
        subtotal,
        tax: vatTotal,
        discount: Math.abs(lineDiscountTotal) + extraDiscAmount,
        total,
      },
      payments,
      originalReceiptNumber: null,
    });

    if (!result.ok) return;
    setLastTx(result.tx);

    setReceiptData([...cart]);
    setCart([]);
    setShowReceipt(true);
    setCashInput("");
    setEpayRef("");
    setSplitCash("");
    setSplitEpay("");
    setExtraDiscount(0);
    setCustomerName("");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F1") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F2") { e.preventDefault(); }
      if (e.key === "F9" && cart.length > 0) { e.preventDefault(); setShowHoldDialog(true); }
      if (e.key === "F10" && canComplete) { e.preventDefault(); completeSale(); }
      if (e.key === "Escape") {
        e.preventDefault();
        if (showReceipt) setShowReceipt(false);
        else if (showHoldDialog) setShowHoldDialog(false);
        else if (showBargainDialog) setShowBargainDialog(null);
        else if (showDiscDialog) setShowDiscDialog(null);
        else if (showVariantPicker) setShowVariantPicker(null);
        else if (showCashDialog) setShowCashDialog(false);
        else if (showCloseDialog) setShowCloseDialog(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart.length, canComplete, showReceipt, showHoldDialog, showBargainDialog, showDiscDialog, showVariantPicker, showCashDialog, showCloseDialog]);

  const holdBill = async () => {
    if (cart.length === 0) return;
    const ok = (activeShift && currentUser) ? await holdCart({
      customerName: customerName || "Walk-in",
      note: holdNote,
      lines: cart.map((i) => ({
        productId: i.id,
        sku: i.sku,
        name: i.name,
        variant: i.variant,
        unit: productById[i.id]?.unit ?? "Piece",
        qty: i.qty,
        unitPrice: i.bargainPrice ?? i.price,
      })),
    }) : { ok: false, error: "Shift not open" };

    if (!ok.ok) return;
    setCart([]);
    setHoldNote("");
    setShowHoldDialog(false);
  };

  const recallBill = (heldId: string) => {
    const bill = heldCarts.find((c) => c.id === heldId);
    if (!bill) return;
    const recalled: CartItem[] = bill.lines.map((it) => {
      const product = productById[it.productId];
      return {
        id: it.productId,
        name: it.name,
        price: it.unitPrice,
        originalPrice: it.unitPrice,
        qty: it.qty,
        isReturn: false,
        variant: it.variant || "",
        sku: it.sku,
        bargainPrice: null,
        bargainEnabled: product?.bargainEnabled ?? false,
        discount: 0,
        vatEnabled: true,
      };
    });
    setCart(recalled);
    deleteHeldCart(heldId);
    setShowRecallPanel(false);
  };

  const openSession = async (amount: number) => {
    const res = await openShift(amount);
    if (!res.ok) return;
    setActiveTab("sell");
  };

  const closeSession = async (countedCash: number) => {
    if (!activeShift) return;
    const res = await closeShift(countedCash);
    if (!res.ok) return;
    setLastClosedShift({ ...activeShift, status: "closed", closedAt: new Date().toISOString(), closedBy: currentUser?.id ?? null, countedCash, shortOver: countedCash - activeShift.expectedCash });
    setShowCloseDialog(false);
    setCloseDenom({});
    setActiveTab("analytics");
  };

  const recordCash = async () => {
    const amt = Number(cashAmount);
    if (amt <= 0) return;
    await recordCashMovement({
      type: cashAction === "add" ? "paid_in" : "paid_out",
      amount: amt,
      reason: cashAction === "add" ? "Paid-in" : "Paid-out",
    });
    setShowCashDialog(false);
    setCashAmount("");
  };

  // ==================== OPEN SESSION SCREEN ====================
  const openDenomTotal = Object.entries(openDenom).reduce((s, [d, c]) => s + Number(d) * c, 0);

  if (!activeShift && !(activeTab === "analytics" && lastClosedShift) && !showCloseDialog) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-base font-bold text-slate-900 whitespace-nowrap">Point of Sale</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Main Showroom
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: "sell", label: "Sell", icon: LayoutGrid },
              { id: "history", label: "History", icon: History },
              { id: "returns", label: "Returns", icon: ReturnIcon },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3 h-3" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="px-4 py-1.5 flex items-center gap-4 text-[11px] text-slate-400 border-b border-slate-100 bg-white/50">
          <span><kbd className="font-mono text-slate-500">F1</kbd> Search</span>
          <span><kbd className="font-mono text-slate-500">F2</kbd> Barcode</span>
          <span><kbd className="font-mono text-slate-500">F9</kbd> Hold</span>
          <span><kbd className="font-mono text-slate-500">F10</kbd> Charge</span>
          <span><kbd className="font-mono text-slate-500">Esc</kbd> Close dialog</span>
        </div>

        {/* Center content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-7 h-7 text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No Open POS Session</h2>
              <p className="text-sm text-slate-500 mt-1">Open a cash session before making sales.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Count Opening Cash</p>
              <div className="grid grid-cols-3 gap-3">
                {DENOMINATIONS.map(d => (
                  <div key={d}>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Rs. {d}</label>
                    <input
                      type="number"
                      min={0}
                      value={openDenom[d] || ""}
                      onChange={e => setOpenDenom({ ...openDenom, [d]: Number(e.target.value) || 0 })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between px-1">
                <span className="text-sm text-slate-500">Total Opening Cash</span>
                <span className="text-lg font-bold text-slate-900">Rs. {openDenomTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => openSession(openDenomTotal)}
                disabled={openDenomTotal === 0}
                className={`w-full mt-4 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  openDenomTotal > 0
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Unlock className="w-4 h-4" /> Open Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN POS UI ====================
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base font-bold text-slate-900 whitespace-nowrap">Point of Sale</h1>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full shrink-0 ${
            activeShift ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeShift ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            Main Showroom
          </span>
          {sessionView && (
            <span className="text-[11px] text-slate-400 whitespace-nowrap hidden md:inline">
              Drawer: Rs. {sessionView.cashInDrawer.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {activeShift && (
            <>
              <button
                onClick={() => { setCashAction("add"); setShowCashDialog(true); }}
                className="h-7 px-2 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md flex items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
              <button
                onClick={() => { setCashAction("remove"); setShowCashDialog(true); }}
                className="h-7 px-2 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-md flex items-center gap-1 hover:bg-amber-100 transition-colors"
              >
                <Minus className="w-3 h-3" /> Remove
              </button>
              <button
                onClick={() => setShowCloseDialog(true)}
                className="h-7 px-2 bg-red-50 text-red-600 text-[11px] font-semibold rounded-md flex items-center gap-1 hover:bg-red-100 transition-colors"
              >
                <Lock className="w-3 h-3" /> Close
              </button>
              <div className="w-px h-5 bg-slate-200 mx-0.5" />
            </>
          )}
          {[
            { id: "sell", label: "Sell", icon: LayoutGrid },
            { id: "history", label: "History", icon: History },
            { id: "returns", label: "Returns", icon: ReturnIcon },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3 h-3" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="px-6 py-2 flex items-center gap-4 text-[11px] text-slate-400 border-b border-slate-100 bg-white/50">
        <span><kbd className="font-mono text-slate-500">F1</kbd> Search</span>
        <span><kbd className="font-mono text-slate-500">F2</kbd> Barcode</span>
        <span><kbd className="font-mono text-slate-500">F9</kbd> Hold</span>
        <span><kbd className="font-mono text-slate-500">F10</kbd> Charge</span>
        <span><kbd className="font-mono text-slate-500">Esc</kbd> Close dialog</span>
        <span className="ml-auto text-slate-400">Cashier: {cashierName}</span>
      </div>

      {/* ==================== SELL TAB ==================== */}
      {activeTab === "sell" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Products Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search + Filter */}
            <div className="p-3 bg-white border-b border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Scan barcode or search product..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-9 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                  />
                  {productSearch && (
                    <button onClick={() => setProductSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                  title={viewMode === "grid" ? "Switch to list" : "Switch to grid"}
                >
                  {viewMode === "grid" ? <List className="w-4 h-4 text-slate-600" /> : <LayoutGrid className="w-4 h-4 text-slate-600" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {["All", ...categories].map(c => {
                  const scheme = c === "All" ? null : getScheme(c);
                  return (
                    <button
                      key={c}
                      onClick={() => setCatFilter(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        catFilter === c
                          ? "bg-blue-500 text-white shadow-sm"
                          : scheme
                            ? `${scheme.pill} hover:opacity-80`
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Grid / List */}
            <div className="flex-1 overflow-y-auto p-3">
              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-sm font-medium text-slate-500">No products found</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search or category</p>
                </div>
              )}

              {viewMode === "grid" ? (
                <div className="grid grid-cols-4 gap-3">
                  {filteredProducts.map(p => {
                    const scheme = getScheme(p.category);
                    const displayPrice = p.salePrice ?? p.basePrice;
                    const discountedPrice = Math.round(displayPrice * (1 - p.seasonalDiscount / 100));
                    const outOfStock = p.availableQty <= 0;
                    const lowStock = p.availableQty > 0 && p.availableQty <= 5;
                    return (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        disabled={outOfStock}
                        className={`bg-white rounded-xl border text-left transition-all relative flex flex-col overflow-hidden group ${
                          outOfStock
                            ? "opacity-50 cursor-not-allowed border-slate-200"
                            : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                      >
                        <div className={`w-full h-[72px] bg-gradient-to-br ${scheme.card} flex items-center justify-center relative`}>
                          <Package className={`w-7 h-7 ${scheme.icon} opacity-60`} />
                          {p.seasonalDiscount > 0 && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-md">
                              -{p.seasonalDiscount}%
                            </span>
                          )}
                          {!outOfStock && (
                            <span className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transition-opacity">
                              <Plus className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight mb-1.5">{p.name}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-bold text-blue-600">
                                Rs. {discountedPrice.toLocaleString("en-IN")}
                              </span>
                              {p.seasonalDiscount > 0 && (
                                <span className="text-[10px] text-slate-400 line-through ml-1">
                                  {displayPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                              outOfStock ? "bg-red-100 text-red-600" :
                              lowStock ? "bg-amber-100 text-amber-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {outOfStock ? "Out of stock" : `Qty: ${p.availableQty}`}
                            </span>
                            {p.bargainEnabled && (
                              <span className="text-[10px] text-amber-600 font-semibold">Bargain</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts.map(p => {
                    const scheme = getScheme(p.category);
                    const displayPrice = p.salePrice ?? p.basePrice;
                    const discountedPrice = Math.round(displayPrice * (1 - p.seasonalDiscount / 100));
                    const outOfStock = p.availableQty <= 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        disabled={outOfStock}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-white border border-transparent transition-all ${
                          outOfStock ? "opacity-50" : "hover:border-blue-200 hover:shadow-sm"
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${scheme.card} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Package className={`w-5 h-5 ${scheme.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.sku} · {p.category}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${outOfStock ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                          {outOfStock ? "Out" : `${p.availableQty}`}
                        </span>
                        {p.seasonalDiscount > 0 && (
                          <span className="text-[10px] text-red-500 font-semibold">-{p.seasonalDiscount}%</span>
                        )}
                        <span className="text-sm font-bold text-slate-900 w-24 text-right">Rs. {discountedPrice.toLocaleString("en-IN")}</span>
                        <Plus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ==================== CART PANEL ==================== */}
          <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col">
            {/* Customer + Hold */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 placeholder-slate-400"
              />
              <button
                onClick={() => cart.length > 0 && setShowHoldDialog(true)}
                disabled={cart.length === 0}
                className="h-9 px-3 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                <Pause className="w-3.5 h-3.5" /> Hold
              </button>
            </div>

            {/* Cart Header */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cart ({totalItems})</span>
                {heldCarts.length > 0 && (
                  <button
                    onClick={() => setShowRecallPanel(!showRecallPanel)}
                    className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-full flex items-center gap-1 hover:bg-amber-100 transition-colors"
                  >
                    <Pause className="w-2.5 h-2.5" /> {heldCarts.length} Held
                  </button>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Held Bills Panel */}
            {showRecallPanel && heldCarts.length > 0 && (
              <div className="p-3 bg-amber-50 border-b border-amber-200">
                <p className="text-xs font-semibold text-amber-700 mb-2">Held Bills</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {heldCarts.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-amber-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{bill.lines.length} items</p>
                        <p className="text-[10px] text-slate-400">{fmtTime(bill.createdAt)}{bill.note ? ` · ${bill.note}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Rs. {bill.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0).toLocaleString("en-IN")}</span>
                        <button
                          onClick={() => recallBill(bill.id)}
                          className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600"
                        >
                          <Play className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <ShoppingCart className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Scan or click a product to add</p>
                </div>
              )}

              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 transition-colors ${
                    item.isReturn ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.variant}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setCart(cart.filter((_, j) => j !== idx))}
                      className="text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCart(cart.map((i, j) => j === idx ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-slate-500" />
                      </button>
                      <span className="text-sm font-bold text-slate-900 w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => setCart(cart.map((i, j) => j === idx ? { ...i, qty: i.qty + 1 } : i))}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.bargainEnabled && (
                        <button
                          onClick={() => openBargain(item.id + item.variant)}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Tag className="w-2.5 h-2.5 inline mr-1" />Bargain
                        </button>
                      )}
                      <span className="text-sm font-bold text-slate-900">
                        Rs. {((item.bargainPrice ?? item.price) * item.qty).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ==================== PAYMENT SECTION ==================== */}
            <div className="border-t border-slate-200 bg-white">
              {cart.length > 0 && (
                <div className="px-4 pt-3 pb-2 border-b border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">% Extra Discount</span>
                    <input
                      type="number"
                      value={extraDiscount || ""}
                      onChange={e => setExtraDiscount(Number(e.target.value))}
                      className="w-14 h-6 px-2 rounded-lg border border-slate-200 text-xs text-right focus:outline-none focus:border-blue-400"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-800">Rs. {Math.abs(subtotal).toLocaleString("en-IN")}</span>
                    </div>
                    {Math.abs(vatTotal) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">VAT (13%)</span>
                        <span className="font-semibold text-slate-800">Rs. {Math.abs(vatTotal).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="px-4 pt-2.5 pb-3 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    Rs. {total.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex gap-1.5">
                  {[
                    { id: "cash" as const, icon: Banknote, label: "Cash" },
                    { id: "epay" as const, icon: CreditCard, label: "E-Pay" },
                    { id: "split" as const, icon: Split, label: "Split" },
                  ].map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMode(pm.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        paymentMode === pm.id
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <pm.icon className="w-3.5 h-3.5" />{pm.label}
                    </button>
                  ))}
                </div>

                {/* Cash payment */}
                {paymentMode === "cash" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">Cash Received</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000]
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map(amt => (
                          <button
                            key={amt}
                            onClick={() => setCashInput(String(amt))}
                            className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-semibold border transition-all ${
                              Number(cashInput) === amt
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {amt.toLocaleString("en-IN")}
                          </button>
                        ))}
                    </div>
                    <input
                      type="number"
                      value={cashInput}
                      onChange={e => setCashInput(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                    />
                    {change > 0 && (
                      <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-emerald-700">Change</span>
                        <span className="text-sm font-bold text-emerald-700">Rs. {change.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {cashShort > 0 && (
                      <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-red-600">Short</span>
                        <span className="text-sm font-bold text-red-600">Rs. {cashShort.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMode === "epay" && (
                  <div>
                    <input
                      type="text"
                      value={epayRef}
                      onChange={e => setEpayRef(e.target.value)}
                      placeholder="Transaction reference #"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                    />
                  </div>
                )}

                {paymentMode === "split" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Cash (Rs.)</label>
                      <input
                        type="number"
                        value={splitCash}
                        onChange={e => setSplitCash(e.target.value)}
                        placeholder="0"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">E-Pay (Rs.)</label>
                      <input
                        type="number"
                        value={splitEpay}
                        onChange={e => setSplitEpay(e.target.value)}
                        placeholder="0"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    {splitCash && splitEpay && (
                      <div className="col-span-2 flex justify-between text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <span className="text-blue-700 font-semibold">Split Total</span>
                        <span className="text-blue-800 font-bold">Rs. {(Number(splitCash) + Number(splitEpay)).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Charge CTA */}
                <button
                  onClick={completeSale}
                  disabled={!canComplete}
                  className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    canComplete
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-[0.98]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {canComplete ? (
                    <>
                      <Receipt className="w-4 h-4" />
                      Charge Rs. {total.toLocaleString("en-IN")} (F10)
                    </>
                  ) : (
                    "Add items to charge"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== HISTORY TAB ==================== */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Receipts", value: transactions.length.toString(), color: "text-slate-900", bg: "bg-slate-50" },
              { label: "Net Sales", value: `Rs. ${transactions.reduce((s, t) => s + t.totals.total, 0).toLocaleString("en-IN")}`, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Tax Collected", value: `Rs. ${transactions.reduce((s, t) => s + t.totals.tax, 0).toLocaleString("en-IN")}`, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Discounts", value: `Rs. ${transactions.reduce((s, t) => s + t.totals.discount, 0).toLocaleString("en-IN")}`, color: "text-violet-600", bg: "bg-violet-50" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} rounded-xl border border-white/80 shadow-sm p-4`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Receipt #", "Customer", "Date", "Time", "Items", "Amount", "Payment", "Cashier"].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === "Items" || h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.filter(t => t.totals.total >= 0).map((t) => {
                  const methods = Array.from(new Set(t.payments.map(p => p.method)));
                  const paymentLabel = methods.length === 0 ? "—" : (methods.length === 1 ? methods[0] : "split");
                  const badge =
                    paymentLabel === "cash" ? "bg-blue-100 text-blue-700" :
                    paymentLabel === "card" ? "bg-slate-200 text-slate-700" :
                    paymentLabel === "digital_wallet" ? "bg-emerald-100 text-emerald-700" :
                    paymentLabel === "store_credit" ? "bg-violet-100 text-violet-700" :
                    "bg-amber-100 text-amber-700";
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => {
                        setLastTx(t);
                        setReceiptData(t.lines.map((l) => ({
                          id: l.productId,
                          name: l.name,
                          price: l.unitPrice,
                          originalPrice: l.unitPrice,
                          qty: Math.abs(l.qty),
                          isReturn: l.qty < 0,
                          variant: l.variant,
                          sku: l.sku,
                          bargainPrice: null,
                          bargainEnabled: false,
                          discount: 0,
                          vatEnabled: l.taxRate > 0,
                        })));
                        setShowReceipt(true);
                      }}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">{t.receiptNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{t.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{fmtDate(t.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{fmtTime(t.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">{t.lines.reduce((s, l) => s + Math.abs(l.qty), 0)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">Rs. {t.totals.total.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${badge}`}>
                          {paymentLabel.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{userNameById[t.staffId] ?? t.staffId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== RETURNS TAB ==================== */}
      {activeTab === "returns" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Returns", value: transactions.filter(t => t.totals.total < 0).length.toString(), color: "text-red-700", bg: "bg-red-50" },
              { label: "Total Refunded", value: `Rs. ${Math.abs(transactions.filter(t => t.totals.total < 0).reduce((s, t) => s + t.totals.total, 0)).toLocaleString("en-IN")}`, color: "text-red-600", bg: "bg-red-50" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} rounded-xl border border-white/80 shadow-sm p-4`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Receipt #", "Customer", "Date", "Items", "Amount", "Cashier"].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === "Items" || h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.filter(t => t.totals.total < 0).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">{t.receiptNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{t.customerName}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{fmtDate(t.createdAt)} {fmtTime(t.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">{t.lines.reduce((s, l) => s + Math.abs(l.qty), 0)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">-Rs. {Math.abs(t.totals.total).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{userNameById[t.staffId] ?? t.staffId}</td>
                  </tr>
                ))}
                {transactions.filter(t => t.totals.total < 0).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                      No returns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== ANALYTICS TAB ==================== */}
      {activeTab === "analytics" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sessionView?.status === "closed" ? (
            <>
              {lastClosedShift && (() => {
                const shiftTxs = transactions.filter((t) => t.shiftId === lastClosedShift.id);
                const net = shiftTxs.reduce((s, t) => s + t.totals.total, 0);
                const sales = shiftTxs.filter((t) => t.totals.total > 0).reduce((s, t) => s + t.totals.total, 0);
                const refunds = shiftTxs.filter((t) => t.totals.total < 0).reduce((s, t) => s + t.totals.total, 0);
                const byMethod = shiftTxs.flatMap((t) => t.payments).reduce((acc, p) => {
                  acc[p.method] = (acc[p.method] ?? 0) + p.amount;
                  return acc;
                }, {} as Record<string, number>);
                return (
                  <>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Sales</p>
                        <p className="text-2xl font-bold text-emerald-700">Rs. {sales.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Refunds</p>
                        <p className="text-2xl font-bold text-red-600">Rs. {Math.abs(refunds).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Net</p>
                        <p className="text-2xl font-bold text-blue-700">Rs. {net.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Payments (Cash)</p>
                        <p className="text-2xl font-bold text-slate-900">Rs. {(byMethod.cash ?? 0).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Opening Cash</p>
                        <p className="text-2xl font-bold text-blue-700">Rs. {sessionView.openingCash.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Closing Cash</p>
                        <p className="text-2xl font-bold text-slate-900">Rs. {sessionView.closingCash?.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Expected Cash</p>
                        <p className="text-2xl font-bold text-violet-600">Rs. {sessionView.cashInDrawer.toLocaleString("en-IN")}</p>
                      </div>
                      <div className={`rounded-xl border p-4 shadow-sm ${(sessionView.shortOver ?? 0) >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                        <p className={`text-xs font-medium mb-1 ${(sessionView.shortOver ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {(sessionView.shortOver ?? 0) >= 0 ? "Over" : "Short"}
                        </p>
                        <p className={`text-2xl font-bold ${(sessionView.shortOver ?? 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                          Rs. {Math.abs(sessionView.shortOver ?? 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4">Session Details</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Opened By", value: sessionView.openedBy, sub: sessionView.openedAt },
                          { label: "Closed By", value: sessionView.closedBy ?? "—", sub: sessionView.closedAt ?? "—" },
                          { label: "Cash Added", value: `+Rs. ${sessionView.addedCash.toLocaleString("en-IN")}`, sub: null, green: true },
                          { label: "Cash Removed", value: `-Rs. ${sessionView.removedCash.toLocaleString("en-IN")}`, sub: null, red: true },
                        ].map(d => (
                          <div key={d.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[11px] text-slate-400 font-medium">{d.label}</p>
                            <p className={`text-sm font-bold mt-0.5 ${"green" in d && d.green ? "text-emerald-700" : "red" in d && d.red ? "text-red-600" : "text-slate-900"}`}>{d.value}</p>
                            {d.sub && <p className="text-xs text-slate-500 mt-0.5">{d.sub}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              {/* Today's summary when session is open */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Today's Sales", value: `Rs. ${transactions.filter(t => t.totals.total > 0).reduce((s, t) => s + t.totals.total, 0).toLocaleString("en-IN")}`, color: "text-emerald-700", bg: "bg-emerald-50" },
                  { label: "Today's Refunds", value: `Rs. ${Math.abs(transactions.filter(t => t.totals.total < 0).reduce((s, t) => s + t.totals.total, 0)).toLocaleString("en-IN")}`, color: "text-red-600", bg: "bg-red-50" },
                  { label: "Transactions", value: transactions.length.toString(), color: "text-blue-700", bg: "bg-blue-50" },
                  { label: "Drawer Balance", value: `Rs. ${(sessionView?.cashInDrawer ?? 0).toLocaleString("en-IN")}`, color: "text-slate-900", bg: "bg-slate-50" },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl border border-white/80 shadow-sm p-4`}>
                    <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Methods</h3>
                {(() => {
                  const byMethod = transactions.flatMap((t) => t.payments).reduce((acc, p) => {
                    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
                    return acc;
                  }, {} as Record<string, number>);
                  const methods = Object.entries(byMethod).sort((a, b) => b[1] - a[1]);
                  return methods.length === 0 ? (
                    <p className="text-sm text-slate-400">No transactions yet today</p>
                  ) : (
                    <div className="space-y-2">
                      {methods.map(([method, amount]) => (
                        <div key={method} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm font-medium text-slate-700 capitalize">{method.replace("_", " ")}</span>
                          <span className="text-sm font-bold text-slate-900">Rs. {amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Top Products</h3>
                {(() => {
                  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
                  for (const tx of transactions) {
                    for (const line of tx.lines) {
                      if (!productSales[line.productId]) {
                        productSales[line.productId] = { name: line.name, qty: 0, revenue: 0 };
                      }
                      productSales[line.productId].qty += Math.abs(line.qty);
                      productSales[line.productId].revenue += Math.abs(line.qty) * line.unitPrice;
                    }
                  }
                  const top = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
                  return top.length === 0 ? (
                    <p className="text-sm text-slate-400">No sales yet today</p>
                  ) : (
                    <div className="space-y-2">
                      {top.map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <div>
                            <span className="text-sm font-medium text-slate-700">{p.name}</span>
                            <span className="text-xs text-slate-400 ml-2">{p.qty} sold</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">Rs. {p.revenue.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== DIALOGS ==================== */}

      {/* Variant Picker */}
      {showVariantPicker && (() => {
        const product = posProducts.find(p => p.id === showVariantPicker);
        if (!product) return null;
        const ready = product.variantAttributes.every(a => selectedVariant[a.name]);
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowVariantPicker(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[380px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select variant to add to cart</p>
                </div>
                <button onClick={() => setShowVariantPicker(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              {product.variantAttributes.map(attr => (
                <div key={attr.name} className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{attr.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariant({ ...selectedVariant, [attr.name]: opt })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          selectedVariant[attr.name] === opt
                            ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowVariantPicker(null)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                <button
                  onClick={addVariantToCart}
                  disabled={!ready}
                  className={`flex-1 h-11 text-sm font-bold rounded-xl transition-all ${ready ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hold Dialog */}
      {showHoldDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowHoldDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[380px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hold Bill</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add a note to identify this held bill</p>
              </div>
              <button onClick={() => setShowHoldDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <input
              type="text"
              value={holdNote}
              onChange={e => setHoldNote(e.target.value)}
              placeholder="e.g. Customer will be back..."
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowHoldDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={holdBill} className="flex-1 h-11 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600">Hold Bill</button>
            </div>
          </div>
        </div>
      )}

      {/* Cash In/Out Dialog */}
      {showCashDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCashDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">{cashAction === "add" ? "Add Cash to Drawer" : "Remove Cash from Drawer"}</h3>
              <button onClick={() => setShowCashDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <input
              type="number"
              value={cashAmount}
              onChange={e => setCashAmount(e.target.value)}
              placeholder="Enter amount..."
              className="w-full h-12 px-3 rounded-xl border border-slate-200 text-base font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCashDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button
                onClick={recordCash}
                className={`flex-1 h-11 text-white text-sm font-bold rounded-xl ${cashAction === "add" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {cashAction === "add" ? "Add Cash" : "Remove Cash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Session Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCloseDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[460px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Close Session</h3>
                <p className="text-sm text-slate-400 mt-0.5">Count closing cash to end your shift</p>
              </div>
              <button onClick={() => setShowCloseDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center mt-0.5">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Count by Denominations</p>
              <div className="space-y-1.5">
                {DENOMINATIONS.map(d => (
                  <div key={d} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                    <span className="text-sm font-semibold text-slate-700 w-20">Rs. {d}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => setCloseDenom({ ...closeDenom, [d]: Math.max(0, (closeDenom[d] || 0) - 1) })}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <Minus className="w-3 h-3 text-slate-500" />
                      </button>
                      <input
                        type="number" min={0}
                        value={closeDenom[d] || ""}
                        onChange={e => setCloseDenom({ ...closeDenom, [d]: Number(e.target.value) || 0 })}
                        className="w-14 h-7 px-1 rounded-lg border border-slate-200 text-sm text-center font-semibold focus:outline-none focus:border-blue-400 bg-white"
                        placeholder="0"
                      />
                      <button
                        onClick={() => setCloseDenom({ ...closeDenom, [d]: (closeDenom[d] || 0) + 1 })}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                    <span className={`text-sm font-semibold w-24 text-right ${(closeDenom[d] || 0) > 0 ? "text-blue-600" : "text-slate-400"}`}>
                      Rs. {((closeDenom[d] || 0) * d).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              {[
                {
                  label: "Counted Cash",
                  value: Object.entries(closeDenom).reduce((s, [d, c]) => s + Number(d) * c, 0),
                  blue: true,
                },
                { label: "Expected Cash", value: sessionView?.cashInDrawer ?? activeShift?.expectedCash ?? 0 },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={`font-bold ${row.blue ? "text-blue-600" : "text-slate-900"}`}>
                    Rs. {row.value.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCloseDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => closeSession(Object.entries(closeDenom).reduce((s, [d, c]) => s + Number(d) * c, 0))}
                className="flex-1 h-11 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600"
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bargain Dialog */}
      {showBargainDialog && (() => {
        const item = cart.find(i => i.id + i.variant === showBargainDialog);
        if (!item) return null;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBargainDialog(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bargain Price</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.name} · Listed Rs. {item.price.toLocaleString("en-IN")}</p>
                </div>
                <button onClick={() => setShowBargainDialog(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <input
                type="number"
                value={bargainPrice}
                onChange={e => setBargainPrice(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-slate-200 text-base font-semibold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowBargainDialog(null)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={applyBargain} className="flex-1 h-11 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600">Apply Bargain</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Per-item Discount Dialog */}
      {showDiscDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDiscDialog(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[320px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Item Discount</h3>
              <button onClick={() => setShowDiscDialog(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                value={itemDisc}
                onChange={e => setItemDisc(Number(e.target.value))}
                className="flex-1 h-12 px-3 rounded-xl border border-slate-200 text-xl font-bold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/15 text-right"
                min={0} max={100}
              />
              <span className="text-2xl font-bold text-slate-400">%</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDiscDialog(null)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={applyItemDisc} className="flex-1 h-11 bg-violet-500 text-white text-sm font-bold rounded-xl hover:bg-violet-600">Apply Discount</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReceipt(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[380px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Receipt header */}
            <div className="p-6 pb-4">
              <div className="text-center pb-4 mb-4 border-b-2 border-dashed border-slate-200">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{storeProfile.businessName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{storeProfile.location}</p>
                {lastTx && <p className="text-xs text-slate-400">Receipt: {lastTx.receiptNumber}</p>}
              </div>

              <div className="space-y-1.5 text-sm mb-4">
                {[
                  { label: "Date", value: lastTx ? fmtDate(lastTx.createdAt) : today() },
                  { label: "Time", value: lastTx ? fmtTime(lastTx.createdAt) : nowTime() },
                  { label: "Cashier", value: lastTx ? (userNameById[lastTx.staffId] ?? cashierName) : cashierName },
                  ...(lastTx?.customerName ? [{ label: "Customer", value: lastTx.customerName }] : (customerName ? [{ label: "Customer", value: customerName }] : [])),
                  { label: "Payment", value: lastTx ? (Array.from(new Set(lastTx.payments.map(p => p.method))).join(" + ") || "—") : (paymentMode === "cash" ? "Cash" : paymentMode === "epay" ? "E-Payment" : "Split") },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-medium text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-3 mb-3 space-y-1.5">
                {receiptData.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700 flex-1 pr-2">{item.name}{item.variant ? ` (${item.variant})` : ""} ×{item.qty}</span>
                    <span className="font-semibold text-slate-900">Rs. {((item.bargainPrice || item.price) * item.qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span>Rs. {Math.abs(lastTx?.totals.subtotal ?? subtotal).toLocaleString("en-IN")}</span></div>
                {Math.abs(lastTx?.totals.tax ?? vatTotal) > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Tax</span><span>Rs. {Math.abs(lastTx?.totals.tax ?? vatTotal).toLocaleString("en-IN")}</span></div>
                )}
                {Math.abs(lastTx?.totals.discount ?? extraDiscAmount) > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-emerald-500">Discount</span><span className="text-emerald-600">-Rs. {Math.abs(lastTx?.totals.discount ?? extraDiscAmount).toLocaleString("en-IN")}</span></div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-1">
                  <span>Total</span><span>Rs. {(lastTx?.totals.total ?? total).toLocaleString("en-IN")}</span>
                </div>
                {change > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Change</span><span>Rs. {change.toLocaleString("en-IN")}</span></div>
                )}
              </div>

              <div className="mt-5 text-center border-t-2 border-dashed border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-600">{storeProfile.receiptFooter || "Thank you for shopping with us!"}</p>
                <p className="text-xs text-slate-400 mt-1">Returns accepted within 7 days with receipt</p>
              </div>
            </div>

            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <button
                onClick={printReceipt}
                className="h-12 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="h-12 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
