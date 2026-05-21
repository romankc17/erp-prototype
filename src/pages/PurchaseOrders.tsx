import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Eye, Send, Package, CheckCircle, Clock,
  AlertTriangle, XCircle, Trash2, X, Check, Pencil,
} from "lucide-react";
import { purchaseOrdersDetailed } from "../data";
import type { POStatus } from "../data";

const statusConfig: Record<POStatus, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  Draft: { bg: "bg-slate-100", text: "text-slate-600", icon: Clock },
  "Approval Pending": { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  Approved: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
  "Ready to Send": { bg: "bg-violet-100", text: "text-violet-700", icon: Send },
  Sent: { bg: "bg-cyan-100", text: "text-cyan-700", icon: Send },
  "Partially Received": { bg: "bg-orange-100", text: "text-orange-700", icon: Package },
  Received: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
  Closed: { bg: "bg-slate-100", text: "text-slate-500", icon: CheckCircle },
  Cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  Overdue: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
};

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pos, setPos] = useState(purchaseOrdersDetailed);

  const filtered = pos.filter((po) => {
    const matchSearch = search === "" ||
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total POs", value: pos.length, color: "text-blue-700", bg: "bg-blue-50" },
    { label: "Pending Approval", value: pos.filter((p) => p.status === "Approval Pending").length, color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Sent", value: pos.filter((p) => p.status === "Sent" || p.status === "Ready to Send").length, color: "text-cyan-700", bg: "bg-cyan-50" },
    { label: "Received", value: pos.filter((p) => p.status === "Received" || p.status === "Partially Received").length, color: "text-emerald-700", bg: "bg-emerald-50" },
  ];

  const toggleSelect = (id: string) => {
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
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    setPos((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    clearSelection();
  };

  const canEdit = (status: POStatus) => {
    return status === "Draft" || status === "Approval Pending";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Inventory / Purchase Orders</p>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create, manage, and track purchase orders with vendors.</p>
        </div>
        <button
          onClick={() => navigate("/purchase-orders/create")}
          className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Purchase Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4`}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mt-0.5`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO number or vendor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500">
          <option>All</option>
          <option>Draft</option>
          <option>Approval Pending</option>
          <option>Approved</option>
          <option>Ready to Send</option>
          <option>Sent</option>
          <option>Partially Received</option>
          <option>Received</option>
          <option>Overdue</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
              </div>
              <button onClick={handleBulkDelete} className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={clearSelection} className="h-8 px-3 text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          ) : (
            <span className="text-sm text-slate-400">0 selected</span>
          )}
          <span className="text-xs text-slate-400">{filtered.length} purchase orders</span>
        </div>

        {/* PO Table */}
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
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">PO Number</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">PO Date</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Expected Delivery</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((po) => {
                const config = statusConfig[po.status];
                const StatusIcon = config.icon;
                return (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/purchase-orders/${po.id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(po.id)}
                        onChange={() => toggleSelect(po.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-900">{po.poNumber}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{po.lineItems.length} items</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{po.vendorName}</p>
                      <p className="text-xs text-slate-400">{po.vendorContact}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{po.poDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{po.expectedDelivery}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                      Rs. {po.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-medium rounded-full`}>
                        <StatusIcon className="w-3 h-3" /> {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/purchase-orders/${po.id}`); }} className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        {canEdit(po.status) && (
                          <button onClick={(e) => e.stopPropagation()} className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12"><p className="text-sm text-slate-400">No purchase orders found</p></div>
        )}
      </div>
    </div>
  );
}
