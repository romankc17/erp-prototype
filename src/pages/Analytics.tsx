import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  IndianRupee, ShoppingCart, BarChart2, Users, Download,
} from "lucide-react";
import { analyticsStats, dailySalesData, topProducts, topCustomers, salesByCategory, paymentMethods } from "../data";

const iconMap: Record<string, React.ElementType> = {
  IndianRupee, ShoppingCart, BarChart2, Users,
};
const colorMap: Record<string, { bg: string; icon: string }> = {
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500" },
  violet: { bg: "bg-violet-50", icon: "text-violet-500" },
  amber: { bg: "bg-amber-50", icon: "text-amber-500" },
};

function formatNPR(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

const categoryColors: Record<string, string> = {
  Pant: "#3b82f6",
  "T-Shirt": "#10b981",
  Kurta: "#8b5cf6",
  Accessories: "#f59e0b",
};

export default function Analytics() {
  const [period, setPeriod] = useState("This Month");
  const periods = ["Today", "This Week", "This Month", "Last Month", "This Year"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Report / Overview</p>
          <h1 className="text-2xl font-bold text-slate-900">Business Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Analyze sales, inventory, and business performance.</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                period === p
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button className="h-10 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {analyticsStats.map((s) => {
          const Icon = iconMap[s.icon];
          const colors = colorMap[s.color];
          return (
            <div key={s.title} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">{s.value}</div>
                <div className="text-xs text-slate-500">{s.title}</div>
                <div className="text-xs text-emerald-500 font-medium mt-0.5">{s.trend}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Sales Trend</h3>
          <p className="text-[13px] text-slate-500">Daily sales revenue</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={dailySalesData}>
            <defs>
              <linearGradient id="colorDailyRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              formatter={(value: number, name: string) => {
                if (name === "revenue") return [formatNPR(value), "Revenue"];
                return [value, name];
              }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorDailyRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100 text-sm">
          <span><strong>Peak Day:</strong> May 12 (Rs. 58,400)</span>
          <span><strong>Lowest Day:</strong> May 3 (Rs. 18,200)</span>
          <span><strong>Daily Average:</strong> Rs. 41,500</span>
        </div>
      </div>

      {/* Top Products + Customer Insights */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Products</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-2 text-xs font-medium text-slate-500 uppercase">Rank</th>
                <th className="pb-2 text-xs font-medium text-slate-500 uppercase">Product</th>
                <th className="pb-2 text-xs font-medium text-slate-500 uppercase text-right">Units</th>
                <th className="pb-2 text-xs font-medium text-slate-500 uppercase text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((p) => (
                <tr key={p.rank} className="hover:bg-slate-50">
                  <td className={`py-2.5 text-sm font-bold ${p.rank === 1 ? "text-amber-500" : "text-slate-600"}`}>{p.rank}</td>
                  <td className="py-2.5">
                    <div className="text-sm text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.category}</div>
                  </td>
                  <td className="py-2.5 text-sm text-slate-700 text-right">{p.unitsSold}</td>
                  <td className="py-2.5 text-sm font-semibold text-slate-900 text-right">{formatNPR(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Insights</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${(v/100000).toFixed(1)}L`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(value: number) => [formatNPR(value), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <span className="text-sm font-medium text-blue-700">New: 24</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <span className="text-sm font-medium text-emerald-700">Returning: 132</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Category + Payment Methods */}
      <div className="grid grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value">
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-2 mb-3">
              <div className="text-lg font-bold text-slate-900">Rs. 12.45L</div>
              <div className="text-[11px] text-slate-500">This Month</div>
            </div>
            <div className="w-full space-y-2">
              {paymentMethods.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-slate-700">{m.name}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
