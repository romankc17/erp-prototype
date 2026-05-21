import { useState, useRef, useMemo } from "react";
import {
  Plus, Minus, Trash2, Search, Pause, Play, Receipt, Banknote,
  CreditCard, Split, Package, Percent, LayoutGrid, List, User as UserIcon,
  Tag, X, Unlock, ChevronRight, ShoppingCart,
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import {
  type Session, type CartLine, type HeldBill, type Sale,
  type User, MAX_DISCOUNT_WITHOUT_APPROVAL, hasPermission,
} from "../../lib/posTypes";
import { getStock } from "../../lib/posStore";
import type { StockMap } from "../../lib/posStore";
import { calcCartTotals, getScheme, todayDate, todayDateBS, nowTime } from "./posUtils";
import ReceiptModal from "./ReceiptModal";

interface Props {
  session: Session;
  stock: StockMap;
  currentUser: User | null;
  heldBills: HeldBill[];
  onCompleteSale: (partial: Omit<Sale, "id" | "receiptNo">, stockDelta: Record<string, number>) => { sale: Sale; invoice: { invoiceNo: string } } | undefined;
  onHoldBill: (bill: HeldBill) => void;
  onRecallBill: (id: string) => HeldBill | null;
  onDeleteHeld: (id: string) => void;
}

function newLineId() { return `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

export default function TerminalPanel({ session, stock, currentUser, heldBills, onCompleteSale, onHoldBill, onRecallBill, onDeleteHeld }: Props) {
  const { posProducts, categories } = useStore();
  const [productSearch, setProductSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [paymentMode, setPaymentMode] = useState<"cash" | "epay" | "split">("cash");
  const [cashInput, setCashInput] = useState("");
  const [epayRef, setEpayRef] = useState("");
  const [epayAccount, setEpayAccount] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitEpay, setSplitEpay] = useState("");
  const [splitEpayRef, setSplitEpayRef] = useState("");
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [extraDiscType, setExtraDiscType] = useState<"percent" | "flat">("percent");
  const [showVariantPicker, setShowVariantPicker] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [holdNote, setHoldNote] = useState("");
  const [showRecallPanel, setShowRecallPanel] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [showBargainDialog, setShowBargainDialog] = useState<string | null>(null);
  const [bargainPrice, setBargainPrice] = useState("");
  const [showDiscDialog, setShowDiscDialog] = useState<string | null>(null);
  const [itemDisc, setItemDisc] = useState(0);
  const [itemDiscType, setItemDiscType] = useState<"percent" | "flat">("percent");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalPin, setApprovalPin] = useState("");
  const [approvalCallback, setApprovalCallback] = useState<(() => void) | null>(null);
  const [approvalError, setApprovalError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { subtotal, vatTotal, discountTotal, extraDiscAmount, grandTotal } = calcCartTotals(cart, extraDiscount, extraDiscType);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const epayAmount = paymentMode === "epay" ? grandTotal : paymentMode === "split" ? Number(splitEpay) : 0;
  const change = paymentMode === "cash" && Number(cashInput) >= grandTotal ? Number(cashInput) - grandTotal : 0;
  const splitTotal = paymentMode === "split" ? (Number(splitCash) + Number(splitEpay)) : 0;

  const canComplete = cart.length > 0 && grandTotal > 0 &&
    !(paymentMode === "cash" && (Number(cashInput) === 0 || Number(cashInput) < grandTotal)) &&
    !(paymentMode === "split" && splitTotal < grandTotal) &&
    !(paymentMode === "epay" && !epayRef);

  // Filter products by branch scope and search
  const filteredProducts = useMemo(() => {
    return posProducts.filter((p) => {
      // Branch scoping: if product has branch field, check it; otherwise allow all
      const branchMatch = !p.branch || p.branch === session.branchName || p.branch === "Main Branch";
      const matchCat = catFilter === "All" || p.category === catFilter;
      const matchSearch = productSearch === "" ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode.includes(productSearch);
      return branchMatch && matchCat && matchSearch;
    });
  }, [posProducts, catFilter, productSearch, session.branchName]);

  const getVariantStock = (productId: string, variantId: string) => getStock(stock, productId, variantId);
  const getProductStock = (productId: string) => getStock(stock, productId);

  const addToCart = (product: typeof posProducts[0]) => {
    if (product.hasVariants && product.variants.length > 0) {
      setShowVariantPicker(product.id);
      setSelectedVariant({});
      return;
    }
    const effectivePrice = product.salePrice ?? product.basePrice;
    const discPrice = Math.round(effectivePrice * (1 - product.seasonalDiscount / 100));
    const available = getProductStock(product.id);
    const existing = cart.find(i => i.productId === product.id && !i.variant);
    if (existing) {
      if (existing.qty + 1 > available) return;
      setCart(cart.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i));
    } else {
      if (available <= 0) return;
      setCart([...cart, {
        lineId: newLineId(), productId: product.id, name: product.name, sku: product.sku,
        variant: "", unitPrice: discPrice, originalPrice: effectivePrice, qty: 1,
        discountType: "percent", discountValue: 0, bargainPrice: null,
        vatRate: 0.13, vatEnabled: true, isReturn: false, maxDiscountPercent: 30,
      }]);
    }
  };

  const addVariantToCart = () => {
    if (!showVariantPicker) return;
    const product = posProducts.find(p => p.id === showVariantPicker);
    if (!product) return;
    const variant = product.variants.find(v => Object.entries(selectedVariant).every(([k, val]) => v.attributes[k] === val));
    if (!variant) return;
    const discPrice = Math.round(variant.price * (1 - product.seasonalDiscount / 100));
    const variantLabel = Object.entries(selectedVariant).map(([, v]) => v).join(" / ");
    const available = getVariantStock(product.id, variant.id);
    const existing = cart.find(i => i.productId === product.id && i.variant === variantLabel);
    if (existing) {
      if (existing.qty + 1 > available) return;
      setCart(cart.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i));
    } else {
      if (available <= 0) return;
      setCart([...cart, {
        lineId: newLineId(), productId: product.id, name: product.name, sku: variant.sku,
        variant: variantLabel, variantId: variant.id, unitPrice: discPrice, originalPrice: variant.price,
        qty: 1, discountType: "percent", discountValue: 0, bargainPrice: null,
        vatRate: 0.13, vatEnabled: true, isReturn: false, maxDiscountPercent: 30,
      }]);
    }
    setShowVariantPicker(null);
    setSelectedVariant({});
  };

  const requestApproval = (onApprove: () => void) => {
    setApprovalCallback(() => onApprove);
    setApprovalPin("");
    setApprovalError("");
    setShowApprovalDialog(true);
  };

  const checkApproval = () => {
    const manager = USERS.find(u => u.pin === approvalPin && (u.role === "manager" || u.role === "admin"));
    if (manager) {
      setShowApprovalDialog(false);
      approvalCallback?.();
      setApprovalCallback(null);
    } else {
      setApprovalError("Invalid manager PIN");
    }
  };

  const openBargain = (lineId: string) => {
    const item = cart.find(i => i.lineId === lineId);
    if (!item) return;
    setShowBargainDialog(lineId);
    setBargainPrice(item.bargainPrice ? String(item.bargainPrice) : String(item.unitPrice));
  };

  const applyBargain = () => {
    if (!showBargainDialog) return;
    const price = Number(bargainPrice);
    const item = cart.find(i => i.lineId === showBargainDialog);
    if (!item) return;
    const discountPct = Math.round((1 - price / item.originalPrice) * 100);
    if (discountPct > MAX_DISCOUNT_WITHOUT_APPROVAL) {
      requestApproval(() => {
        setCart(cart.map(i => i.lineId === showBargainDialog ? { ...i, bargainPrice: price, bargainApprovedBy: currentUser?.name } : i));
        setShowBargainDialog(null);
      });
      return;
    }
    setCart(cart.map(i => i.lineId === showBargainDialog ? { ...i, bargainPrice: price } : i));
    setShowBargainDialog(null);
  };

  const openItemDisc = (lineId: string) => {
    const item = cart.find(i => i.lineId === lineId);
    if (!item) return;
    setShowDiscDialog(lineId);
    setItemDisc(item.discountValue);
    setItemDiscType(item.discountType);
  };

  const applyItemDisc = () => {
    if (!showDiscDialog) return;
    if (itemDiscType === "percent" && itemDisc > MAX_DISCOUNT_WITHOUT_APPROVAL) {
      requestApproval(() => {
        setCart(cart.map(i => i.lineId === showDiscDialog ? { ...i, discountType: itemDiscType, discountValue: itemDisc, discountApprovedBy: currentUser?.name } : i));
        setShowDiscDialog(null);
      });
      return;
    }
    setCart(cart.map(i => i.lineId === showDiscDialog ? { ...i, discountType: itemDiscType, discountValue: itemDisc } : i));
    setShowDiscDialog(null);
  };

  const completeSale = () => {
    if (!canComplete || !currentUser) return;
    const stockDelta: Record<string, number> = {};
    for (const line of cart) {
      const key = line.variantId ? `${line.productId}:${line.variantId}` : line.productId;
      stockDelta[key] = (stockDelta[key] || 0) + line.qty;
    }
    const salePartial: Omit<Sale, "id" | "receiptNo"> = {
      sessionId: session.id,
      branchId: session.branchId,
      branchName: session.branchName,
      registerId: session.registerId,
      registerName: session.registerName,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      date: todayDate(),
      dateBS: todayDateBS(),
      time: nowTime(),
      customerName: customerName || "Walk-in",
      lines: cart.map(line => {
        const price = line.bargainPrice ?? line.unitPrice;
        const lineTotal = price * line.qty;
        let disc = 0;
        if (line.discountType === "percent") disc = Math.round(lineTotal * (line.discountValue / 100));
        else disc = line.discountValue * line.qty;
        return {
          productId: line.productId, name: line.name, sku: line.sku, variant: line.variant,
          qty: line.qty, unitPrice: price, discountType: line.discountType,
          discountValue: line.discountValue, vatRate: line.vatRate,
          lineTotal: lineTotal - disc + Math.round((lineTotal - disc) * (line.vatEnabled ? line.vatRate : 0)),
          returnedQty: 0,
        };
      }),
      subtotal, discountTotal: discountTotal + extraDiscAmount, vatTotal, grandTotal,
      paymentMethod: paymentMode,
      cashReceived: paymentMode === "cash" ? Number(cashInput) : paymentMode === "split" ? Number(splitCash) : 0,
      epayAmount,
      epayRef: paymentMode === "epay" ? epayRef : paymentMode === "split" ? splitEpayRef : "",
      epayAccount: paymentMode === "epay" ? epayAccount : "",
      changeGiven: change,
      status: "completed",
    };
    const result = onCompleteSale(salePartial, stockDelta);
    if (result) {
      setLastSale({ ...salePartial, id: result.sale.id, receiptNo: result.sale.receiptNo });
      setShowReceipt(true);
    }
    setCart([]);
    setCashInput("");
    setEpayRef("");
    setEpayAccount("");
    setSplitCash("");
    setSplitEpay("");
    setSplitEpayRef("");
    setExtraDiscount(0);
    setCustomerName("");
  };

  const holdBill = () => {
    if (cart.length === 0) return;
    const newBill: HeldBill = {
      id: `HB-${Date.now()}`,
      label: holdNote || `Hold #${heldBills.length + 1}`,
      sessionId: session.id,
      lines: [...cart],
      customerName,
      extraDiscount,
      extraDiscType,
      savedAt: new Date().toISOString(),
    };
    onHoldBill(newBill);
    setCart([]);
    setHoldNote("");
    setShowHoldDialog(false);
  };

  const recallBill = (bill: HeldBill) => {
    setCart(bill.lines);
    setCustomerName(bill.customerName);
    setExtraDiscount(bill.extraDiscount);
    setExtraDiscType(bill.extraDiscType);
    onRecallBill(bill.id);
    setShowRecallPanel(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/60">
        <div className="p-3 bg-white border-b border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input ref={searchRef} type="text" placeholder="Scan barcode or search product..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full h-10 pl-10 pr-9 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20" />
              {productSearch && <button onClick={() => setProductSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" /></button>}
            </div>
            <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors" title={viewMode === "grid" ? "Switch to list" : "Switch to grid"}>
              {viewMode === "grid" ? <List className="w-4 h-4 text-slate-600" /> : <LayoutGrid className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {["All", ...categories].map(c => {
              const scheme = c === "All" ? null : getScheme(c);
              return (
                <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${catFilter === c ? "bg-blue-500 text-white shadow-sm" : scheme ? `${scheme.pill} hover:opacity-80` : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

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
                const available = p.hasVariants ? p.variants.reduce((s, v) => s + getVariantStock(p.id, v.id), 0) : getProductStock(p.id);
                const outOfStock = available <= 0;
                const lowStock = available > 0 && available <= 10;
                return (
                  <button key={p.id} onClick={() => addToCart(p)} disabled={outOfStock} className={`bg-white rounded-xl border text-left transition-all relative flex flex-col overflow-hidden group ${outOfStock ? "opacity-50 cursor-not-allowed border-slate-200" : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"}`}>
                    <div className={`w-full h-[72px] bg-gradient-to-br ${scheme.card} flex items-center justify-center relative`}>
                      <Package className={`w-7 h-7 ${scheme.icon} opacity-60`} />
                      {p.seasonalDiscount > 0 && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-md">-{p.seasonalDiscount}%</span>}
                      {!outOfStock && <span className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transition-opacity"><Plus className="w-3 h-3 text-white" /></span>}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight mb-1.5">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-blue-600">Rs. {discountedPrice.toLocaleString("en-IN")}</span>
                          {p.seasonalDiscount > 0 && <span className="text-[10px] text-slate-400 line-through ml-1">{displayPrice.toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${outOfStock ? "bg-red-100 text-red-600" : lowStock ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{outOfStock ? "Out of stock" : `Qty: ${available}`}</span>
                        {p.bargainEnabled && <span className="text-[10px] text-amber-600 font-semibold">Bargain</span>}
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
                const available = p.hasVariants ? p.variants.reduce((s, v) => s + getVariantStock(p.id, v.id), 0) : getProductStock(p.id);
                const outOfStock = available <= 0;
                return (
                  <button key={p.id} onClick={() => addToCart(p)} disabled={outOfStock} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-white border border-transparent transition-all ${outOfStock ? "opacity-50" : "hover:border-blue-200 hover:shadow-sm"}`}>
                    <div className={`w-10 h-10 bg-gradient-to-br ${scheme.card} rounded-lg flex items-center justify-center flex-shrink-0`}><Package className={`w-5 h-5 ${scheme.icon}`} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.sku} · {p.category}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${outOfStock ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>{outOfStock ? "Out" : `${available}`}</span>
                    {p.seasonalDiscount > 0 && <span className="text-[10px] text-red-500 font-semibold">-{p.seasonalDiscount}%</span>}
                    <span className="text-sm font-bold text-slate-900 w-24 text-right">Rs. {discountedPrice.toLocaleString("en-IN")}</span>
                    <Plus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_20px_-4px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>}
            </div>
            <h3 className="font-bold text-slate-900">Cart</h3>
            {heldBills.length > 0 && (
              <button onClick={() => setShowRecallPanel(!showRecallPanel)} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1 hover:bg-amber-200 transition-colors">
                <Pause className="w-3 h-3" /> {heldBills.length} Held
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && <button onClick={() => setShowHoldDialog(true)} className="h-8 px-2.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-amber-100 transition-colors"><Pause className="w-3 h-3" /> Hold</button>}
            {cart.length > 0 && <button onClick={() => setCart([])} className="h-8 px-2.5 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors">Clear</button>}
          </div>
        </div>

        <div className="px-4 py-2 border-b border-slate-100">
          <div className="relative">
            <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input type="text" placeholder="Customer name (optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 placeholder-slate-300" />
          </div>
        </div>

        {showRecallPanel && heldBills.length > 0 && (
          <div className="p-3 bg-amber-50 border-b border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-2">Held Bills</p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {heldBills.map(bill => {
                const billTotal = calcCartTotals(bill.lines, bill.extraDiscount, bill.extraDiscType).grandTotal;
                return (
                  <div key={bill.id} className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-amber-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{bill.label}</p>
                      <p className="text-[10px] text-slate-400">{bill.lines.length} items · {new Date(bill.savedAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Rs. {billTotal.toLocaleString("en-IN")}</span>
                      <button onClick={() => recallBill(bill)} className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600"><Play className="w-3 h-3 text-white" /></button>
                      <button onClick={() => onDeleteHeld(bill.id)} className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100"><Trash2 className="w-3 h-3 text-red-400" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3"><ShoppingCart className="w-7 h-7 text-slate-300" /></div>
              <p className="text-sm font-medium text-slate-500">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">Scan or click a product to add</p>
            </div>
          )}
          {cart.map((item) => {
            const price = item.bargainPrice ?? item.unitPrice;
            const lineTotal = price * item.qty;
            let disc = 0;
            if (item.discountType === "percent") disc = Math.round(lineTotal * (item.discountValue / 100));
            else disc = item.discountValue * item.qty;
            const netLine = lineTotal - disc;
            return (
              <div key={item.lineId} className={`rounded-xl border p-3 transition-colors ${item.isReturn ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200/80"}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{item.name}</p>
                    {item.variant && <p className="text-xs text-slate-500 mt-0.5">{item.variant}</p>}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-xs font-semibold text-slate-700">Rs. {price.toLocaleString("en-IN")}</span>
                      {item.bargainPrice && item.bargainPrice !== item.unitPrice && <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded">Bargain: Rs. {item.bargainPrice.toLocaleString("en-IN")}</span>}
                      {item.discountValue > 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">-{item.discountValue}{item.discountType === "percent" ? "%" : ""}</span>}
                      {item.discountApprovedBy && <span className="text-[10px] bg-violet-100 text-violet-700 font-semibold px-1.5 py-0.5 rounded">Mgr: {item.discountApprovedBy}</span>}
                      {item.isReturn && <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded">Return</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setCart(cart.map(i => i.lineId === item.lineId ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"><Minus className="w-3 h-3 text-slate-500" /></button>
                    <span className="text-sm font-bold text-slate-900 w-6 text-center">{item.qty}</span>
                    <button onClick={() => {
                      const maxStock = item.variantId ? getVariantStock(item.productId, item.variantId) : getProductStock(item.productId);
                      if (item.qty + 1 <= maxStock) setCart(cart.map(i => i.lineId === item.lineId ? { ...i, qty: i.qty + 1 } : i));
                    }} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"><Plus className="w-3 h-3 text-slate-500" /></button>
                    <button onClick={() => setCart(cart.filter(i => i.lineId !== item.lineId))} className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors ml-0.5"><Trash2 className="w-3 h-3 text-red-400" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openBargain(item.lineId)} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-lg hover:bg-amber-200 transition-colors">Bargain</button>
                    <button onClick={() => openItemDisc(item.lineId)} className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-semibold rounded-lg flex items-center gap-1 hover:bg-violet-200 transition-colors"><Percent className="w-2.5 h-2.5" /> Disc</button>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Rs. {netLine.toLocaleString("en-IN")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Section */}
        <div className="border-t border-slate-200 bg-white">
          {cart.length > 0 && (
            <div className="px-4 pt-3 pb-2 border-b border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 flex-shrink-0">Extra Disc:</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExtraDiscType("percent")} className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${extraDiscType === "percent" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>%</button>
                  <button onClick={() => setExtraDiscType("flat")} className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${extraDiscType === "flat" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Rs</button>
                </div>
                <input type="number" value={extraDiscount || ""} onChange={e => setExtraDiscount(Number(e.target.value))} className="w-16 h-6 px-2 rounded-lg border border-slate-200 text-xs text-right focus:outline-none focus:border-blue-400" placeholder="0" />
                {extraDiscount > 0 && <span className="text-xs text-emerald-600 font-semibold ml-auto">-Rs. {extraDiscAmount.toLocaleString("en-IN")}</span>}
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span><span className="font-semibold text-slate-800">Rs. {subtotal.toLocaleString("en-IN")}</span></div>
                {discountTotal > 0 && <div className="flex justify-between"><span className="text-emerald-600">Item Discounts</span><span className="font-semibold text-emerald-600">-Rs. {discountTotal.toLocaleString("en-IN")}</span></div>}
                {vatTotal > 0 && <div className="flex justify-between"><span className="text-slate-500">VAT (13%)</span><span className="font-semibold text-slate-800">Rs. {vatTotal.toLocaleString("en-IN")}</span></div>}
                {extraDiscount > 0 && <div className="flex justify-between"><span className="text-emerald-600">Extra Discount</span><span className="font-semibold text-emerald-600">-Rs. {extraDiscAmount.toLocaleString("en-IN")}</span></div>}
              </div>
            </div>
          )}

          <div className="px-4 pt-2.5 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-blue-600">Rs. {grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex gap-1.5">
              {[{ id: "cash" as const, icon: Banknote, label: "Cash" }, { id: "epay" as const, icon: CreditCard, label: "E-Pay" }, { id: "split" as const, icon: Split, label: "Split" }].map(pm => (
                <button key={pm.id} onClick={() => setPaymentMode(pm.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${paymentMode === pm.id ? "bg-blue-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  <pm.icon className="w-3.5 h-3.5" />{pm.label}
                </button>
              ))}
            </div>

            {paymentMode === "cash" && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {[grandTotal, Math.ceil(grandTotal / 100) * 100, Math.ceil(grandTotal / 500) * 500, Math.ceil(grandTotal / 1000) * 1000].filter((v, i, a) => a.indexOf(v) === i).map(amt => (
                    <button key={amt} onClick={() => setCashInput(String(amt))} className={`flex-1 min-w-[72px] py-2 rounded-xl text-xs font-semibold border transition-all ${Number(cashInput) === amt ? "bg-blue-500 text-white border-blue-500" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"}`}>Rs. {amt.toLocaleString("en-IN")}</button>
                  ))}
                </div>
                <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} placeholder="Enter cash received..." className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15" />
                {change > 0 && <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5"><span className="text-sm font-semibold text-emerald-700">Change</span><span className="text-base font-bold text-emerald-700">Rs. {change.toLocaleString("en-IN")}</span></div>}
                {Number(cashInput) > 0 && Number(cashInput) < grandTotal && <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-xl px-3 py-2.5"><span className="text-sm font-semibold text-red-600">Short</span><span className="text-base font-bold text-red-600">Rs. {(grandTotal - Number(cashInput)).toLocaleString("en-IN")}</span></div>}
              </div>
            )}

            {paymentMode === "epay" && (
              <div className="space-y-2">
                <input type="text" value={epayRef} onChange={e => setEpayRef(e.target.value)} placeholder="Transaction reference #" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" />
                <input type="text" value={epayAccount} onChange={e => setEpayAccount(e.target.value)} placeholder="Bank / Wallet name (optional)" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            )}

            {paymentMode === "split" && (
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Cash (Rs.)</label><input type="number" value={splitCash} onChange={e => setSplitCash(e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">E-Pay (Rs.)</label><input type="number" value={splitEpay} onChange={e => setSplitEpay(e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" /></div>
                <div className="col-span-2"><input type="text" value={splitEpayRef} onChange={e => setSplitEpayRef(e.target.value)} placeholder="E-Pay reference #" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" /></div>
                {splitCash && splitEpay && (
                  <div className="col-span-2 flex justify-between text-sm bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                    <span className="text-blue-700 font-semibold">Split Total</span>
                    <span className="text-blue-800 font-bold">Rs. {splitTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            )}

            <button onClick={completeSale} disabled={!canComplete || !hasPermission(currentUser, "pos_create")} className={`w-full h-14 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${canComplete && hasPermission(currentUser, "pos_create") ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-200/60 active:scale-[0.98]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
              <Receipt className="w-4 h-4" />
              {canComplete && hasPermission(currentUser, "pos_create") ? `Charge Rs. ${grandTotal.toLocaleString("en-IN")}` : !hasPermission(currentUser, "pos_create") ? "No permission" : "Add items to charge"}
              {canComplete && hasPermission(currentUser, "pos_create") && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          </div>
        </div>
      </div>

      {/* Variant Picker */}
      {showVariantPicker && (() => {
        const product = posProducts.find(p => p.id === showVariantPicker);
        if (!product) return null;
        const ready = product.variantAttributes.every(a => selectedVariant[a.name]);
        const selectedVariantObj = product.variants.find(v => Object.entries(selectedVariant).every(([k, val]) => v.attributes[k] === val));
        const selectedStock = selectedVariantObj ? getVariantStock(product.id, selectedVariantObj.id) : null;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowVariantPicker(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select variant to add to cart</p>
                </div>
                <button onClick={() => setShowVariantPicker(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              {product.variantAttributes.map(attr => (
                <div key={attr.name} className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{attr.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map(opt => {
                      // Check stock for this option combination partial
                      const partialAttrs = { ...selectedVariant, [attr.name]: opt };
                      const v = product.variants.find(vt => Object.entries(partialAttrs).every(([k, val]) => vt.attributes[k] === val || !val));
                      const optStock = v ? getVariantStock(product.id, v.id) : 0;
                      const isSelected = selectedVariant[attr.name] === opt;
                      const disabled = optStock <= 0 && Object.keys(partialAttrs).filter(k => partialAttrs[k]).length === product.variantAttributes.length;
                      return (
                        <button key={opt} onClick={() => !disabled && setSelectedVariant({ ...selectedVariant, [attr.name]: opt })} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected ? "bg-blue-500 text-white border-blue-500 shadow-sm" : disabled ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"}`}>
                          {opt} {disabled ? "(Out)" : v && Object.keys(partialAttrs).filter(k => partialAttrs[k]).length === product.variantAttributes.length ? `(${optStock})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {selectedStock !== null && (
                <p className={`text-xs font-semibold mb-3 ${selectedStock > 0 ? "text-emerald-600" : "text-red-600"}`}>Stock: {selectedStock} available</p>
              )}
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowVariantPicker(null)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={addVariantToCart} disabled={!ready || (selectedStock !== null && selectedStock <= 0)} className={`flex-1 h-11 text-sm font-bold rounded-xl transition-all ${ready && (selectedStock === null || selectedStock > 0) ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>Add to Cart</button>
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
              <div><h3 className="text-base font-bold text-slate-900">Hold Bill</h3><p className="text-xs text-slate-400 mt-0.5">Add a note to identify this held bill</p></div>
              <button onClick={() => setShowHoldDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input type="text" value={holdNote} onChange={e => setHoldNote(e.target.value)} placeholder="e.g. Customer will be back..." className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setShowHoldDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={holdBill} className="flex-1 h-11 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600">Hold Bill</button>
            </div>
          </div>
        </div>
      )}

      {/* Bargain Dialog */}
      {showBargainDialog && (() => {
        const item = cart.find(i => i.lineId === showBargainDialog);
        if (!item) return null;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBargainDialog(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div><h3 className="text-base font-bold text-slate-900">Bargain Price</h3><p className="text-xs text-slate-400 mt-0.5">{item.name} · Listed Rs. {item.unitPrice.toLocaleString("en-IN")}</p></div>
                <button onClick={() => setShowBargainDialog(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <input type="number" value={bargainPrice} onChange={e => setBargainPrice(e.target.value)} className="w-full h-12 px-3 rounded-xl border border-slate-200 text-base font-semibold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 mb-4" />
              <div className="flex gap-2">
                <button onClick={() => setShowBargainDialog(null)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={applyBargain} className="flex-1 h-11 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600">Apply</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Discount Dialog */}
      {showDiscDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDiscDialog(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Item Discount</h3>
              <button onClick={() => setShowDiscDialog(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setItemDiscType("percent")} className={`px-3 py-1 rounded-lg text-xs font-semibold ${itemDiscType === "percent" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"}`}>%</button>
              <button onClick={() => setItemDiscType("flat")} className={`px-3 py-1 rounded-lg text-xs font-semibold ${itemDiscType === "flat" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"}`}>Rs</button>
            </div>
            <input type="number" value={itemDisc} onChange={e => setItemDisc(Number(e.target.value))} className="w-full h-12 px-3 rounded-xl border border-slate-200 text-xl font-bold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/15 text-right mb-4" min={0} max={itemDiscType === "percent" ? 100 : undefined} />
            <div className="flex gap-2">
              <button onClick={() => setShowDiscDialog(null)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={applyItemDisc} className="flex-1 h-11 bg-violet-500 text-white text-sm font-bold rounded-xl hover:bg-violet-600">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setShowApprovalDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manager Approval Required</h3>
                <p className="text-xs text-slate-400 mt-0.5">This discount exceeds the allowed limit. Please enter manager PIN.</p>
              </div>
              <button onClick={() => setShowApprovalDialog(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input type="password" value={approvalPin} onChange={e => setApprovalPin(e.target.value)} placeholder="Enter manager PIN" className="w-full h-12 px-3 rounded-xl border border-slate-200 text-base font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 mb-2" />
            {approvalError && <p className="text-xs text-red-500 mb-3">{approvalError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowApprovalDialog(false)} className="flex-1 h-11 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={checkApproval} className="flex-1 h-11 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2"><Unlock className="w-4 h-4" /> Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt */}
      {showReceipt && lastSale && <ReceiptModal sale={lastSale} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}

import { USERS } from "../../lib/posTypes";
