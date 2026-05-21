import { useState } from "react";
import { X, Barcode } from "lucide-react";
import type { Product } from "../../data";

interface Props {
  products: Product[];
  onClose: () => void;
}

export default function CreateBarcodeModal({ products, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const maxQty = Math.min(...products.map((p) => p.availableQty));
  const error = quantity > maxQty ? `Cannot exceed available quantity (${maxQty})` : quantity <= 0 ? "Must be greater than 0" : "";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[480px] max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <Barcode className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create Barcode</h3>
              <p className="text-xs text-slate-500">{products.length > 1 ? `${products.length} products selected` : products[0]?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="max-h-8 object-contain" />
                ) : (
                  <div className="text-xs text-slate-400 font-medium">{product.name.charAt(0)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-500">{product.color} | {product.sku} | Qty: {product.availableQty}</p>
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              How many barcodes to create?
            </label>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <p className="text-xs text-slate-400 mt-1">Max available: {maxQty}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!!error || quantity <= 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
              !!error || quantity <= 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <Barcode className="w-4 h-4" /> Generate Barcode
          </button>
        </div>
      </div>
    </div>
  );
}
