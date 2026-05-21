import { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Product } from "../../data";

interface Props {
  product: Product;
  onClose: () => void;
  onAddStock: (args: { sku?: string; delta: number; reason?: string }[]) => void;
}

export default function AddStockModal({ product, onClose, onAddStock }: Props) {
  const [simpleQty, setSimpleQty] = useState(1);
  const [costPrice, setCostPrice] = useState(product.costPrice);
  const [location, setLocation] = useState(product.location);
  const [notes, setNotes] = useState("");

  // For variant products: track qty per variant
  const [variantQtys, setVariantQtys] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    product.variants?.forEach((v) => { map[v.id] = 0; });
    return map;
  });

  const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;

  const totalVariantNew = Object.values(variantQtys).reduce((sum, q) => sum + q, 0);

  const updateVariantQty = (id: string, qty: number) => {
    setVariantQtys((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[560px] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Add Stock</h3>
            <p className="text-xs text-slate-500">{hasVariants ? "Increase stock per variant" : "Increase inventory quantity"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Product info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-h-8 object-contain" />
              ) : (
                <div className="text-xs text-slate-400 font-medium">{product.name.charAt(0)}</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">
                {product.color} | {product.sku}
                {hasVariants && (
                  <span className="ml-2 px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-medium rounded-full">
                    {product.variantAttributes?.map((a) => a.name).join(" x ")} — {product.variants?.length} variants
                  </span>
                )}
              </p>
            </div>
            {!hasVariants && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Current</p>
                <p className="text-sm font-semibold text-slate-900">{product.availableQty} {product.unit}</p>
              </div>
            )}
          </div>

          {hasVariants ? (
            /* Variant stock table */
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Add Stock per Variant</label>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  Total new: +{totalVariantNew}
                </span>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">Variant</th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">SKU</th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500">Current</th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500">Add Qty</th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500">New Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.variants?.map((v) => (
                      <tr key={v.id}>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {Object.entries(v.attributes).map(([key, val]) => (
                              <span key={key} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">
                                {val}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{v.sku}</td>
                        <td className="px-3 py-2 text-right text-xs text-slate-600">{v.stock}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={variantQtys[v.id] || 0}
                            onChange={(e) => updateVariantQty(v.id, Number(e.target.value))}
                            className="w-16 text-right text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 ml-auto block"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-semibold text-emerald-600">
                          {v.stock + (variantQtys[v.id] || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Simple product stock */
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Add Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={simpleQty}
                    onChange={(e) => setSimpleQty(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Total</label>
                  <div className="h-10 px-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center">
                    <span className="text-sm font-semibold text-emerald-700">{product.availableQty + simpleQty} {product.unit}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (NPR)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              const changes: { sku?: string; delta: number; reason?: string }[] = [];
              if (hasVariants) {
                product.variants?.forEach((v) => {
                  const delta = variantQtys[v.id] || 0;
                  if (delta > 0) changes.push({ sku: v.sku, delta, reason: notes || undefined });
                });
              } else {
                if (simpleQty > 0) changes.push({ delta: simpleQty, reason: notes || undefined });
              }
              if (changes.length) onAddStock(changes);
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}
