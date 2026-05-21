import { useState } from "react";
import { X, Plus, Trash2, FileText } from "lucide-react";

interface Props {
  onClose: () => void;
}

interface LineItem {
  id: number;
  description: string;
  qty: number;
  price: number;
}

export default function CreateInvoiceModal({ onClose }: Props) {
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "", qty: 1, price: 0 },
  ]);

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now(), description: "", qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const vat = Math.round(subtotal * 0.13);
  const total = subtotal + vat;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[640px] max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Create Invoice</h3>
            <p className="text-xs text-slate-500">Generate a new customer invoice</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Invoice # + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice #</label>
              <input type="text" defaultValue="INV-2025-0043" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono bg-slate-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white" />
            </div>
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Search customer name..."
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Line Items</label>
              <button onClick={addItem} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder={`Item ${idx + 1} description`}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                      min={1}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 text-center"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                      min={0}
                      placeholder="0.00"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-semibold text-slate-900">Rs. {(item.qty * item.price).toLocaleString("en-IN")}</span>
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(item.id)} className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">Rs. {subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">VAT (13%)</span>
              <span className="font-medium text-slate-900">Rs. {vat.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
              <span className="text-slate-900">Total</span>
              <span className="text-blue-600">Rs. {total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea rows={2} placeholder="Additional notes..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
