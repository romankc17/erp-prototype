import { Receipt, Printer } from "lucide-react";
import type { Sale } from "../../lib/posTypes";
import { todayDate, todayDateBS, nowTime } from "./posUtils";

interface Props {
  sale: Sale | null;
  onClose: () => void;
}

export default function ReceiptModal({ sale, onClose }: Props) {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4">
          <div className="text-center pb-4 mb-4 border-b-2 border-dashed border-slate-200">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Daraz Retail</h2>
            <p className="text-xs text-slate-500 mt-0.5">Thamel Marg, Ward 29, Kathmandu</p>
            <p className="text-xs text-slate-400">PAN: 302415678 · VAT: VAT-2023-0015</p>
          </div>

          <div className="space-y-1.5 text-sm mb-4">
            {[
              { label: "Receipt #", value: sale.receiptNo },
              { label: "Date (AD)", value: sale.date || todayDate() },
              { label: "Date (BS)", value: sale.dateBS || todayDateBS() },
              { label: "Time", value: sale.time || nowTime() },
              { label: "Cashier", value: sale.cashierName },
              ...(sale.customerName ? [{ label: "Customer", value: sale.customerName }] : []),
              { label: "Payment", value: sale.paymentMethod === "cash" ? "Cash" : sale.paymentMethod === "epay" ? "E-Payment" : "Split" },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-slate-400">{row.label}</span>
                <span className="font-medium text-slate-700">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-3 mb-3 space-y-1.5">
            {sale.lines.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-700 flex-1 pr-2">{item.name}{item.variant ? ` (${item.variant})` : ""} ×{item.qty}</span>
                <span className="font-semibold text-slate-900">Rs. {item.lineTotal.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span>Rs. {sale.subtotal.toLocaleString("en-IN")}</span></div>
            {sale.discountTotal > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-500">Discount</span><span className="text-emerald-600">-Rs. {sale.discountTotal.toLocaleString("en-IN")}</span></div>}
            {sale.vatTotal > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">VAT (13%)</span><span>Rs. {sale.vatTotal.toLocaleString("en-IN")}</span></div>}
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-1"><span>Total</span><span>Rs. {sale.grandTotal.toLocaleString("en-IN")}</span></div>
            {sale.cashReceived > sale.grandTotal && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Change</span><span>Rs. {sale.changeGiven.toLocaleString("en-IN")}</span></div>
            )}
            {sale.epayAmount > 0 && (
              <div className="flex justify-between text-sm text-blue-600 font-medium"><span>E-Pay</span><span>Rs. {sale.epayAmount.toLocaleString("en-IN")}</span></div>
            )}
          </div>

          <div className="mt-5 text-center border-t-2 border-dashed border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-600">Thank you for shopping with us!</p>
            <p className="text-xs text-slate-400 mt-1">Returns accepted within 7 days with receipt</p>
            <p className="text-[10px] text-slate-300 mt-2">Fiscal Year: {new Date().getFullYear()}</p>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <button onClick={() => window.print()} className="w-full h-11 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button onClick={onClose} className="w-full h-11 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
