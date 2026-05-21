import { useEffect, useRef } from "react";
import {
  X, Package, Barcode, MapPin, Building2, Layers,
  Boxes, Paintbrush, Ruler, Tag, Percent,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Product } from "../data";

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
  onAddStock: (product: Product) => void;
  onCreateBarcode: (product: Product) => void;
  onMoveDamage: (product: Product) => void;
}

export default function ProductDetailDrawer({
  product,
  onClose,
  onAddStock,
  onCreateBarcode,
  onMoveDamage,
}: ProductDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!product) return null;

  const sellingPrice = product.salePrice ?? product.basePrice;
  const profit = sellingPrice - product.costPrice;
  const margin = ((profit / sellingPrice) * 100).toFixed(1);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 w-[520px] max-w-full bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Product Hero */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={product.status} />
                  {product.bargainEnabled && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full">
                      <Tag className="w-3 h-3" /> Bargain
                    </span>
                  )}
                  {product.seasonalDiscount > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-medium rounded-full">
                      <Percent className="w-3 h-3" /> {product.seasonalDiscount}% Off
                    </span>
                  )}
                  {product.hasVariants && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-medium rounded-full">
                      <Layers className="w-3 h-3" />
                      Has Variants
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 font-mono">
                  SKU: {product.sku}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { onAddStock(product); onClose(); }}
                className="flex-1 h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Boxes className="w-3.5 h-3.5" /> Add Stock
              </button>
              <button
                onClick={() => { onCreateBarcode(product); onClose(); }}
                className="flex-1 h-9 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Barcode className="w-3.5 h-3.5" /> Barcode
              </button>
              <button
                onClick={() => { onMoveDamage(product); onClose(); }}
                className="flex-1 h-9 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" /> Damage / Return
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={Barcode} label="Barcode" value={product.barcode} />
              <DetailItem icon={Package} label="Category" value={product.category} />
              {product.color !== "-" && (
                <div className="flex items-start gap-2.5">
                  <Paintbrush className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-400">Color</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className="w-3 h-3 rounded-full border border-slate-300"
                        style={{
                          backgroundColor:
                            product.color === "Black"
                              ? "#1a1a2e"
                              : product.color === "Blue"
                              ? "#2563eb"
                              : product.color === "Gray"
                              ? "#9ca3af"
                              : product.color === "White"
                              ? "#f8fafc"
                              : product.color === "Multi"
                              ? "linear-gradient(45deg, #ef4444, #3b82f6, #10b981)"
                              : "#e2e8f0",
                        }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {product.color}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <DetailItem icon={Ruler} label="Unit" value={product.unit} />
              <DetailItem icon={MapPin} label="Location" value={product.location} />
              <DetailItem icon={Building2} label="Branch" value={product.branch} />
            </div>
          </div>

          {/* Pricing */}
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Pricing
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[11px] text-slate-400">Cost Price</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  Rs. {product.costPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[11px] text-slate-400">Selling Price</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Rs. {sellingPrice.toLocaleString("en-IN")}
                  {product.salePrice && (
                    <span className="text-[11px] text-slate-400 line-through ml-1.5">
                      Rs. {product.basePrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-[11px] text-emerald-600">Profit Margin</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  Rs. {profit.toLocaleString("en-IN")}
                  <span className="text-[10px] font-normal text-emerald-500 ml-1">
                    ({margin}%)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Stock Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-[11px] text-blue-500">Available Quantity</p>
                <p className="text-xl font-bold text-blue-700 mt-0.5">
                  {product.availableQty} <span className="text-xs font-normal">{product.unit}</span>
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[11px] text-slate-400">Stock Value (Cost)</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  Rs. {(product.costPrice * product.availableQty).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Variants */}
          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div className="p-5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Variants
                <span className="ml-2 text-[10px] font-normal normal-case">
                  ({product.variants.length} combinations)
                </span>
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {product.variantAttributes?.map((attr) => (
                        <th
                          key={attr.name}
                          className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left"
                        >
                          {attr.name}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left">
                        SKU
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left">
                        Barcode
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-slate-50">
                        {product.variantAttributes?.map((attr) => (
                          <td
                            key={attr.name}
                            className="px-3 py-2 text-xs text-slate-700"
                          >
                            {attr.name === "Color" ? (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                  style={{
                                    backgroundColor:
                                      variant.attributes[attr.name] === "Black"
                                        ? "#1a1a2e"
                                        : variant.attributes[attr.name] === "Blue"
                                        ? "#2563eb"
                                        : variant.attributes[attr.name] === "Red"
                                        ? "#ef4444"
                                        : "#e2e8f0",
                                  }}
                                />
                                {variant.attributes[attr.name]}
                              </div>
                            ) : (
                              variant.attributes[attr.name]
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-[11px] font-mono text-slate-600">
                          {variant.sku}
                        </td>
                        <td className="px-3 py-2 text-[11px] font-mono text-slate-400">
                          {variant.barcode}
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold text-slate-900 text-right">
                          {variant.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
