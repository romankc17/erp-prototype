import { formatBS } from "../../lib/nepaliDate";
import type { CartLine } from "../../lib/posTypes";

export function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function todayDate() {
  return new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function todayDateBS() {
  return formatBS(new Date());
}

export function calcCartTotals(lines: CartLine[], extraDiscount = 0, extraDiscType: "percent" | "flat" = "percent") {
  const subtotal = lines.reduce((s, i) => {
    const price = i.bargainPrice ?? i.unitPrice;
    const lineTotal = price * i.qty;
    let disc = 0;
    if (i.discountType === "percent") disc = Math.round(lineTotal * (i.discountValue / 100));
    else disc = i.discountValue * i.qty;
    return s + (lineTotal - disc);
  }, 0);

  const vatTotal = lines.reduce((s, i) => {
    if (!i.vatEnabled) return s;
    const price = i.bargainPrice ?? i.unitPrice;
    const lineTotal = price * i.qty;
    let disc = 0;
    if (i.discountType === "percent") disc = Math.round(lineTotal * (i.discountValue / 100));
    else disc = i.discountValue * i.qty;
    return s + Math.round((lineTotal - disc) * i.vatRate);
  }, 0);

  const discountTotal = lines.reduce((s, i) => {
    const lineTotal = (i.bargainPrice ?? i.unitPrice) * i.qty;
    if (i.discountType === "percent") return s + Math.round(lineTotal * (i.discountValue / 100));
    return s + i.discountValue * i.qty;
  }, 0);

  const extraDiscAmount = extraDiscType === "percent" ? Math.round(subtotal * (extraDiscount / 100)) : extraDiscount;
  const grandTotal = Math.max(0, subtotal + vatTotal - extraDiscAmount);

  return { subtotal, vatTotal, discountTotal, extraDiscAmount, grandTotal };
}

export function generateReceiptNo() {
  const year = new Date().getFullYear();
  const counter = Math.floor(Math.random() * 9000) + 100;
  return `REC-${year}-${String(counter).padStart(4, "0")}`;
}

export const CATEGORY_SCHEME: Record<string, { pill: string; card: string; icon: string }> = {
  "T-Shirt": { pill: "bg-sky-100 text-sky-700", card: "from-sky-100 to-sky-50", icon: "text-sky-400" },
  "Shirt": { pill: "bg-blue-100 text-blue-700", card: "from-blue-100 to-blue-50", icon: "text-blue-400" },
  "Pant": { pill: "bg-amber-100 text-amber-700", card: "from-amber-100 to-amber-50", icon: "text-amber-400" },
  "Kurta": { pill: "bg-emerald-100 text-emerald-700", card: "from-emerald-100 to-emerald-50", icon: "text-emerald-400" },
  "Jacket": { pill: "bg-slate-200 text-slate-700", card: "from-slate-100 to-slate-50", icon: "text-slate-400" },
  "Accessories": { pill: "bg-rose-100 text-rose-700", card: "from-rose-100 to-rose-50", icon: "text-rose-400" },
};
export const DEFAULT_SCHEME = { pill: "bg-violet-100 text-violet-700", card: "from-violet-100 to-violet-50", icon: "text-violet-400" };

export function getScheme(cat: string) {
  return CATEGORY_SCHEME[cat] ?? DEFAULT_SCHEME;
}
