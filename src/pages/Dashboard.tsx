import { useEffect, useState } from "react";
import {
  IndianRupee, AlertTriangle, Clock,
  RotateCcw, Monitor, PackagePlus, FileText,
  ShoppingCart, Barcode, ClipboardList, ArrowRight, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import AddProductModal from "../components/modals/AddProductModal";
import CreateInvoiceModal from "../components/modals/CreateInvoiceModal";
import {
  revenueData, orderDistribution, recentOrders, activityFeed,
} from "../data";

const quickActionDefs = [
  { icon: PackagePlus, title: "Add New Product", desc: "Add item to inventory", color: "text-blue-500", bg: "bg-blue-50", modal: "addProduct" as const },
  { icon: FileText, title: "Create Invoice", desc: "Generate customer invoice", color: "text-emerald-500", bg: "bg-emerald-50", modal: "invoice" as const },
  { icon: ShoppingCart, title: "Record Sale", desc: "New sales transaction", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Barcode, title: "Print Barcode", desc: "Generate product barcode", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: ClipboardList, title: "New Purchase Order", desc: "Order from supplier", color: "text-cyan-500", bg: "bg-cyan-50" },
  { icon: Barcode, title: "View Reports", desc: "Analytics & insights", color: "text-red-500", bg: "bg-red-50" },
];

function formatNPR(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

const dashboardKpis = [
  { title: "Today's Sales", value: "Rs. 45,230", icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-50", trend: "+12.8%", sub: "18 receipts" },
  { title: "Today's Profit", value: "Rs. 14,850", icon: IndianRupee, color: "text-blue-500", bg: "bg-blue-50", trend: "+9.5%", sub: "33% margin" },
  { title: "Low Stock Items", value: "8", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", trend: "-1", sub: "need restocking" },
  { title: "Pending PO", value: "5", icon: Clock, color: "text-orange-500", bg: "bg-orange-50", trend: "+1", sub: "awaiting delivery" },
  { title: "Damage / Return", value: "6", icon: RotateCcw, color: "text-red-500", bg: "bg-red-50", trend: "+2", sub: "this week" },
  { title: "Open POS Session", value: "Active", icon: Monitor, color: "text-cyan-500", bg: "bg-cyan-50", trend: "", sub: "Drawer: Rs. 12,500" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`space-y-6 transition-opacity duration-150 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* KPI Cards - 6 cards in a row */}
      <div className="grid grid-cols-6 gap-4">
        {dashboardKpis.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                {card.trend && (
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                    card.trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold text-slate-900 leading-tight">{card.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{card.title}</div>
                <div className="text-[10px] text-slate-400">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
              <p className="text-[13px] text-slate-500">Monthly revenue for 2025</p>
            </div>
            <div className="flex bg-slate-100 rounded-full p-0.5">
              {["Week", "Month", "Year"].map((p, i) => (
                <button key={p} className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${i === 1 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} formatter={(value: number) => [formatNPR(value), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Total Revenue: Rs. 28,45,000</span>
            <span className="text-sm text-slate-600">Avg. Monthly: Rs. 4,74,167</span>
            <span className="text-sm font-semibold text-emerald-600">Growth: +18.5%</span>
          </div>
        </div>

        {/* Order Distribution Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Orders by Status</h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value">
                  {orderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-4 mb-4">
              <div className="text-[22px] font-bold text-slate-900">248</div>
              <div className="text-[11px] text-slate-500">Total Orders</div>
            </div>
            <div className="w-full space-y-2">
              {orderDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{item.value} ({Math.round((item.value / 248) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
          <button onClick={() => navigate("/analytics")} className="text-sm text-blue-500 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              {["Order ID", "Customer", "Date", "Amount", "Status", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors duration-100">
                <td className="px-4 py-3 font-mono text-[13px] font-semibold text-slate-900">{order.id}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{order.customer}</td>
                <td className="px-4 py-3 text-[13px] text-slate-500">{order.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">Rs. {order.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3"><button className="text-sm text-blue-500 hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-[13px] text-slate-500">Showing 1-5 of 42 orders</span>
          <div className="flex items-center gap-1 text-[13px]">
            <button className="px-2 py-1 text-slate-400 hover:text-slate-600">&larr; Previous</button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center ${p === 1 ? "bg-blue-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
            ))}
            <button className="px-2 py-1 text-slate-500">Next &rarr;</button>
          </div>
        </div>
      </div>

      {/* Quick Actions + Activity Feed */}
      <div className="grid grid-cols-[2fr_3fr] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActionDefs.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => {
                    if (action.modal === "addProduct") setShowAddProduct(true);
                    if (action.modal === "invoice") setShowInvoice(true);
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{action.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-0">
            {activityFeed.map((activity, i) => (
              <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-100 px-2 -mx-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i < 4 ? "animate-pulse" : ""}`} style={{ backgroundColor: activity.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">{activity.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-blue-500 hover:underline flex items-center gap-1">
            View All Activity <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} />}
      {showInvoice && <CreateInvoiceModal onClose={() => setShowInvoice(false)} />}
    </div>
  );
}
