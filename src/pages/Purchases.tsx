import { useState } from "react";
import { Search, Plus, ChevronDown, ClipboardList, IndianRupee, Truck, AlertCircle, Building2, CalendarDays } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { purchaseStats, purchaseOrders } from "../data";

export default function Purchases() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const iconMap: Record<string, React.ElementType> = {
    ClipboardList, IndianRupee, Truck, AlertCircle,
  };
  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-500" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500" },
    red: { bg: "bg-red-50", icon: "text-red-500" },
  };

  const filtered = purchaseOrders.filter((po) => {
    const matchSearch = po.id.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {purchaseStats.map((s) => {
          const Icon = iconMap[s.icon];
          const colors = colorMap[s.color];
          return (
            <div key={s.title} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
                {s.subtext && <div className="text-xs text-slate-400 mt-0.5">{s.subtext}</div>}
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
            placeholder="Search by PO number, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Sent">Sent</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <button className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              {["PO Number", "Supplier", "Order Date", "Expected Delivery", "Items", "Total Amount", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((po) => (
              <tr key={po.id} className={`hover:bg-slate-50 transition-colors duration-100 ${po.status === "Overdue" ? "bg-red-50/50" : ""}`}>
                <td className="px-4 py-3 font-mono text-[13px] font-semibold text-slate-900">{po.id}</td>
                <td className="px-4 py-3 text-sm text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {po.supplier}
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-500">{po.orderDate}</td>
                <td className="px-4 py-3 text-[13px]">
                  <div className={`flex items-center gap-1.5 ${po.status === "Overdue" ? "text-red-500" : "text-slate-500"}`}>
                    <CalendarDays className="w-3.5 h-3.5" />
                    {po.expectedDelivery}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{po.items}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">Rs. {po.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-sm text-blue-500 hover:underline">View</button>
                    {(po.status === "Sent" || po.status === "Overdue") && (
                      <button className="text-sm text-blue-500 hover:underline">Edit</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[13px] text-slate-500">Showing 1-8 of 84 purchase orders</span>
          <div className="flex items-center gap-1 text-[13px]">
            {[1, 2, 3, "...", 11].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${p === 1 ? "bg-blue-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
