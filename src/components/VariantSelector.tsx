import { useState } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product, ProductVariant } from "../data";

interface Props {
  product: Product;
  onSelect: (variant: ProductVariant, qty: number) => void;
  onClose: () => void;
}

export default function VariantSelector({ product, onSelect, onClose }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);

  // Group variants by Color (first attribute = primary)
  const attrs = product.variantAttributes || [];
  const primaryAttr = attrs[0]?.name || "";
  const groups: Record<string, ProductVariant[]> = {};
  if (primaryAttr) {
    product.variants?.forEach((v) => {
      const key = v.attributes[primaryAttr] || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });
  }

  const canAdd = selectedVariant && selectedVariant.stock > 0 && qty > 0 && qty <= selectedVariant.stock;

  // Color dot map
  const colorDot: Record<string, string> = {
    Red: "#ef4444",
    Blue: "#3b82f6",
    Black: "#1a1a2e",
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[460px] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-h-10 object-contain" />
              ) : (
                <span className="text-lg font-semibold text-slate-400">{product.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
              <p className="text-xs text-slate-500">Rs. {(product.salePrice ?? product.basePrice).toLocaleString("en-IN")} per unit</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[55vh]">
          {/* Variant Selection grouped by Color */}
          {Object.entries(groups).map(([groupName, variants]) => (
            <div key={groupName}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: colorDot[groupName] || "#cbd5e1" }} />
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{primaryAttr}: {groupName}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  const isOutOfStock = variant.stock <= 0;
                  // Secondary label = Size
                  const secondaryLabels = Object.entries(variant.attributes)
                    .filter(([k]) => k !== primaryAttr)
                    .map(([, val]) => val)
                    .join("");

                  return (
                    <button
                      key={variant.id}
                      onClick={() => !isOutOfStock && setSelectedVariantId(variant.id)}
                      disabled={isOutOfStock}
                      className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                        isOutOfStock
                          ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "border-blue-300 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <span className={`text-sm font-semibold block ${isOutOfStock ? "text-slate-400" : "text-slate-900"}`}>
                        {secondaryLabels}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${isOutOfStock ? "text-red-400" : variant.stock < 10 ? "text-amber-500" : "text-slate-400"}`}>
                        {isOutOfStock ? "Out" : `${variant.stock}`}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mx-auto mt-1">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          {selectedVariant && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
              <span className="text-sm font-medium text-slate-700">Quantity</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(selectedVariant.stock, qty + 1))} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400 ml-auto">Max: {selectedVariant.stock}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => { if (selectedVariant && canAdd) { onSelect(selectedVariant, qty); onClose(); } }}
            disabled={!canAdd}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              canAdd ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {selectedVariant ? `Add to Bill — Rs. ${((product.salePrice ?? product.basePrice) * qty).toLocaleString("en-IN")}` : "Select a variant"}
          </button>
        </div>
      </div>
    </div>
  );
}
