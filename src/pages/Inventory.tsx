import { useState, useMemo } from "react";
import { Search, ChevronDown, Hash, IndianRupee, CheckCircle, AlertTriangle, Building2, X, RotateCcw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { useStore } from "../context/StoreContext";
import AddStockModal from "../components/modals/AddStockModal";
import MoveDamageReturnModal from "../components/modals/MoveDamageReturnModal";
import type { Product } from "../data";

function stockStatus(qty: number, minStock: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (qty <= 0) return "Out of Stock";
  if (qty <= (minStock || 10)) return "Low Stock";
  return "In Stock";
}

export default function Inventory() {
  const { products, adjustStock } = useStore();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAlert, setShowAlert] = useState(true);

  const [showAddStock, setShowAddStock] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [moveTargets, setMoveTargets] = useState<Product[]>([]);

  const rows = useMemo(() => {
    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      location: p.location || "Main Store",
      stockQty: p.availableQty,
      minQty: p.minStock || p.reorderLevel || 10,
      status: stockStatus(p.availableQty, p.minStock || p.reorderLevel || 10),
      costPrice: p.costPrice,
      product: p,
    }));
  }, [products]);

  const filtered = rows.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchLocation = locationFilter === "All" || item.location === locationFilter;
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchSearch && matchLocation && matchStatus;
  });

  const totalSkus = rows.length;
  const inStock = rows.filter((r) => r.status === "In Stock").length;
  const lowOrOut = rows.filter((r) => r.status === "Low Stock" || r.status === "Out of Stock").length;
  const stockValue = rows.reduce((sum, r) => sum + r.stockQty * r.costPrice, 0);

  const stats = [
    { icon: Hash, label: "Total SKUs", value: totalSkus.toLocaleString(), color: "text-blue-500", bg: "bg-blue-50" },
    { icon: IndianRupee, label: "Stock Value", value: `Rs. ${(stockValue / 100000).toFixed(1)}L`, color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: CheckCircle, label: "In Stock", value: inStock.toLocaleString(), color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: AlertTriangle, label: "Low / Out of Stock", value: lowOrOut.toLocaleString(), color: "text-red-500", bg: "bg-red-50" },
  ];

  const locations = useMemo(() => {
    const set = new Set<string>(["All"]);
    rows.forEach((r) => set.add(r.location));
    return Array.from(set);
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {showAlert && lowOrOut > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 relative">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            {lowOrOut} item{lowOrOut > 1 ? "s are" : " is"} running low or out of stock.
          </p>
          <button onClick={() => setShowAlert(false)} className="text-amber-400 hover:text-amber-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="relative">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              {["SKU", "Product Name", "Category", "Location", "Stock Qty", "Min Qty", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className={`hover:bg-slate-50 transition-colors duration-100 ${item.status === "Low Stock" ? "bg-amber-50/50" : ""}`}>
                <td className="px-4 py-3 font-mono text-[13px] font-semibold text-slate-900">{item.sku}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600">{item.category}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{item.stockQty}</td>
                <td className="px-4 py-3 text-[13px] text-slate-500 text-right">{item.minQty}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveProduct(item.product); setShowAddStock(true); }}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => { setMoveTargets([item.product]); setShowMove(true); }}
                      className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Move
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[13px] text-slate-500">Showing {filtered.length} of {rows.length} items</span>
        </div>
      </div>

      {/* Modals */}
      {showAddStock && activeProduct && (
        <AddStockModal
          product={activeProduct}
          onClose={() => { setShowAddStock(false); setActiveProduct(null); }}
          onAddStock={(changes) => {
            changes.forEach(({ sku, delta, reason }) => {
              adjustStock({ productId: activeProduct.id, sku, delta, reason });
            });
          }}
        />
      )}
      {showMove && moveTargets.length > 0 && (
        <MoveDamageReturnModal
          products={moveTargets}
          onClose={() => { setShowMove(false); setMoveTargets([]); }}
          onMove={({ productId, sku, delta, reason, type }) => adjustStock({ productId, sku, delta, reason: `${type}: ${reason}` })}
        />
      )}
    </div>
  );
}
