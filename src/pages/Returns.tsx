import { useState } from "react";
import {
  AlertTriangle, RotateCcw, Package, Search, Trash2, X,
  Pencil, Eye, Workflow,
} from "lucide-react";

interface ReturnItem {
  id: number;
  date: string;
  type: "Damaged" | "Returned" | "Missing";
  product: string;
  sku: string;
  source: string;
  qty: number;
  reason: string;
  branch: string;
}

const returnItems: ReturnItem[] = [
  { id: 1, date: "10/05/2025", type: "Damaged", product: "Cotton T-Shirt (Black)", sku: "TSHIRT-BLK-M", source: "PO Receive", qty: 2, reason: "Stitch Issue", branch: "Main Branch" },
  { id: 2, date: "10/05/2025", type: "Damaged", product: "Hoodie (Grey)", sku: "HOODIE-GRY-L", source: "PO Receive", qty: 1, reason: "Fabric Tear", branch: "Main Branch" },
  { id: 3, date: "10/05/2025", type: "Returned", product: "Denim Jeans (Blue)", sku: "JEANS-BLU-32", source: "Sales Return", qty: 4, reason: "Size Issue", branch: "Main Branch" },
  { id: 4, date: "10/05/2025", type: "Missing", product: "Winter Jacket (Black)", sku: "JACKET-BLK-L", source: "PO Receive", qty: 2, reason: "Not Delivered", branch: "Main Branch" },
  { id: 5, date: "09/05/2025", type: "Damaged", product: "Formal Shirt (White)", sku: "SHIRT-WHT-M", source: "Inventory", qty: 3, reason: "Button Broken", branch: "Main Branch" },
  { id: 6, date: "08/05/2025", type: "Returned", product: "Running Shoes", sku: "SHOE-RUN-42", source: "Sales Return", qty: 1, reason: "Defective", branch: "Thamel Branch" },
  { id: 7, date: "07/05/2025", type: "Damaged", product: "Wool Sweater", sku: "SWTR-WOL-M", source: "PO Receive", qty: 5, reason: "Moth Damage", branch: "Main Branch" },
  { id: 8, date: "06/05/2025", type: "Missing", product: "Leather Belt", sku: "BELT-LTH-36", source: "PO Receive", qty: 3, reason: "Short Delivered", branch: "Main Branch" },
];

const typeBadge: Record<string, string> = {
  Damaged: "bg-red-100 text-red-700",
  Returned: "bg-blue-100 text-blue-700",
  Missing: "bg-amber-100 text-amber-700",
};

const stats = [
  { label: "Total Damaged", value: 28, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Total Returns", value: 37, icon: RotateCcw, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Missing Items", value: 16, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Est. Value", value: "Rs. 1,25,000", icon: () => <span className="text-lg font-bold text-violet-600">Rs.</span>, color: "text-violet-600", bg: "bg-violet-50" },
];

export default function Returns() {
  const [activeTab, setActiveTab] = useState("All Items");
  const [search, setSearch] = useState("");
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState(returnItems);

  const filtered = items.filter((item) => {
    const matchTab = activeTab === "All Items" ||
      (activeTab === "Damage (Inventory/PO)" && item.type === "Damaged") ||
      (activeTab === "Return (Customer)" && item.type === "Returned") ||
      (activeTab === "Missing From PO" && item.type === "Missing");
    const matchSearch = search === "" ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    clearSelection();
  };

  const handleDeleteRow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const tabs = ["All Items", "Damage (Inventory/PO)", "Return (Customer)", "Missing From PO"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Inventory / Damage / Return</p>
          <h1 className="text-2xl font-bold text-slate-900">Damage / Return / Missing</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track damaged inventory, customer returns, and missing items from POs.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show/Hide Workflows Toggle */}
      <button
        onClick={() => setShowWorkflows(!showWorkflows)}
        className="text-sm text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors"
      >
        <Workflow className="w-4 h-4" />
        {showWorkflows ? "Hide workflows" : "Show workflows"}
      </button>

      {/* Workflow Diagrams */}
      {showWorkflows && (
        <div className="grid grid-cols-2 gap-5">
          {/* PO Damage / Missing Workflow */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">PO Damage / Missing Workflow</h3>
            <div className="flex items-center gap-3">
              {[
                { icon: Package, label: "PO Created", color: "bg-blue-500" },
                { icon: RotateCcw, label: "Receive Goods", color: "bg-emerald-500" },
                { icon: AlertTriangle, label: "Damage/Missing", color: "bg-red-500" },
                { icon: RotateCcw, label: "Vendor Claim", color: "bg-amber-500" },
                { icon: Package, label: "Inventory Adj.", color: "bg-violet-500" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5 font-medium text-center w-16 leading-tight">{step.label}</p>
                  </div>
                  {i < 4 && <div className="w-4 h-0.5 bg-slate-300 mb-5" />}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Return Workflow */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Customer Return Workflow</h3>
            <div className="flex items-center gap-3">
              {[
                { icon: Package, label: "Sale", color: "bg-emerald-500" },
                { icon: RotateCcw, label: "Return", color: "bg-blue-500" },
                { icon: Package, label: "Restock", color: "bg-emerald-500" },
                { icon: AlertTriangle, label: "Damage", color: "bg-red-500" },
                { icon: RotateCcw, label: "Refund", color: "bg-amber-500" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5 font-medium text-center w-16 leading-tight">{step.label}</p>
                  </div>
                  {i < 4 && <div className="w-4 h-0.5 bg-slate-300 mb-5" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 p-1 border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
              <button
                onClick={handleBulkDelete}
                className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={clearSelection} className="h-8 px-3 text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">SKU / Barcode</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Qty</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 ${typeBadge[item.type]} text-xs font-medium rounded-full`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.product}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.source}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.reason}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.branch}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteRow(item.id, e)}
                        className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400">No items found</p>
          </div>
        )}
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} items
        </div>
      </div>
    </div>
  );
}
