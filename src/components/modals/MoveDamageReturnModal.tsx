import { useState } from "react";
import { X, AlertTriangle, RotateCcw } from "lucide-react";
import type { Product } from "../../data";

interface Props {
  products: Product[];
  onClose: () => void;
  onMove: (args: { productId: string; sku?: string; delta: number; reason: string; type: "damage" | "return" }) => void;
}

export default function MoveDamageReturnModal({ products, onClose, onMove }: Props) {
  const [moveType, setMoveType] = useState<"damage" | "return">("damage");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const maxQty = Math.min(...products.map((p) => p.availableQty));
  const qtyError = quantity > maxQty ? `Cannot exceed available quantity (${maxQty})` : quantity <= 0 ? "Must be greater than 0" : "";
  const reasonError = !reason.trim() ? "Reason is required" : "";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[480px] max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Move Inventory Item</h3>
            <p className="text-xs text-slate-500">What would you like to do with this inventory?</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Product info */}
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
                <p className="text-xs text-slate-500">{product.color} | {product.sku} | Available: {product.availableQty}</p>
              </div>
            </div>
          ))}

          {/* Move type selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMoveType("damage")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  moveType === "damage"
                    ? "border-red-200 bg-red-50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className={`w-5 h-5 mb-2 ${moveType === "damage" ? "text-red-500" : "text-slate-400"}`} />
                <p className={`text-sm font-medium ${moveType === "damage" ? "text-red-700" : "text-slate-700"}`}>Move to Damage</p>
                <p className="text-xs text-slate-500 mt-0.5">Mark as damaged inventory</p>
              </button>
              <button
                onClick={() => setMoveType("return")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  moveType === "return"
                    ? "border-blue-200 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <RotateCcw className={`w-5 h-5 mb-2 ${moveType === "return" ? "text-blue-500" : "text-slate-400"}`} />
                <p className={`text-sm font-medium ${moveType === "return" ? "text-blue-700" : "text-slate-700"}`}>Move to Return</p>
                <p className="text-xs text-slate-500 mt-0.5">Move to return inventory</p>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                qtyError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {qtyError && <p className="text-xs text-red-500 mt-1">{qtyError}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for moving..."
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                reasonError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {reasonError && <p className="text-xs text-red-500 mt-1">{reasonError}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              products.forEach((p) => {
                onMove({ productId: p.id, sku: p.sku, delta: -quantity, reason, type: moveType });
              });
              onClose();
            }}
            disabled={!!qtyError || !!reasonError}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !!qtyError || !!reasonError ? "bg-slate-200 text-slate-400 cursor-not-allowed" : moveType === "damage" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Confirm Move
          </button>
        </div>
      </div>
    </div>
  );
}
