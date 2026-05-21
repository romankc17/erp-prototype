import { useState } from "react";
import {
  Search, Trash2, X, Check, Pencil, Receipt,
  Download,
  ShoppingCart, Users, PieChart as PieChartIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SaleRecord {
  id: number;
  invoice: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  payment: string;
  status: string;
  cashier: string;
}

const salesRecords: SaleRecord[] = [
  { id: 1, invoice: "REC-2025-0101", customer: "Himalayan Traders", date: "May 21, 2025", items: 12, amount: 42500, payment: "Cash", status: "Completed", cashier: "Amit Desai" },
  { id: 2, invoice: "REC-2025-0100", customer: "Walk-in Customer", date: "May 21, 2025", items: 3, amount: 2850, payment: "E-Payment", status: "Completed", cashier: "Sita Gurung" },
  { id: 3, invoice: "REC-2025-0099", customer: "Kathmandu Crafts", date: "May 21, 2025", items: 8, amount: 15600, payment: "Split", status: "Completed", cashier: "Ram Bahadur" },
  { id: 4, invoice: "REC-2025-0098", customer: "Pokhara Outdoor", date: "May 20, 2025", items: 5, amount: 8900, payment: "Cash", status: "Completed", cashier: "Pooja Mehta" },
  { id: 5, invoice: "REC-2025-0097", customer: "Everest Groceries", date: "May 20, 2025", items: 25, amount: 125000, payment: "Cash", status: "Completed", cashier: "Amit Desai" },
  { id: 6, invoice: "REC-2025-0096", customer: "Walk-in Customer", date: "May 20, 2025", items: 2, amount: 1200, payment: "E-Payment", status: "Completed", cashier: "Sita Gurung" },
  { id: 7, invoice: "REC-2025-0095", customer: "Bhaktapur Ceramics", date: "May 19, 2025", items: 7, amount: 32000, payment: "Cash", status: "Completed", cashier: "Ram Bahadur" },
  { id: 8, invoice: "REC-2025-0094", customer: "Lalitpur Fabrics", date: "May 19, 2025", items: 10, amount: 45000, payment: "Split", status: "Completed", cashier: "Pooja Mehta" },
  { id: 9, invoice: "REC-2025-0093", customer: "Thamel Souvenirs", date: "May 18, 2025", items: 4, amount: 7800, payment: "Cash", status: "Completed", cashier: "Amit Desai" },
  { id: 10, invoice: "REC-2025-0092", customer: "Walk-in Customer", date: "May 18, 2025", items: 1, amount: 19500, payment: "E-Payment", status: "Completed", cashier: "Sita Gurung" },
  { id: 11, invoice: "REC-2025-0091", customer: "Himalayan Traders", date: "May 18, 2025", items: 15, amount: 67500, payment: "Cash", status: "Completed", cashier: "Ram Bahadur" },
  { id: 12, invoice: "REC-2025-0090", customer: "Walk-in Customer", date: "May 17, 2025", items: 6, amount: 8900, payment: "Split", status: "Completed", cashier: "Pooja Mehta" },
];

export default function Sales() {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);

  const filtered = salesRecords.filter((s) => {
    const matchSearch = search === "" ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.invoice.toLowerCase().includes(search.toLowerCase());
    const matchPayment = paymentFilter === "All" || s.payment === paymentFilter;
    let matchDate = true;
    if (dateFilter === "Today") matchDate = s.date === "May 21, 2025";
    else if (dateFilter === "Yesterday") matchDate = s.date === "May 20, 2025";
    return matchSearch && matchPayment && matchDate;
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
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    clearSelection();
  };

  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);
  const totalItems = filtered.reduce((s, r) => s + r.items, 0);

  const paymentChartData = [
    { name: "Cash", value: filtered.filter((s) => s.payment === "Cash").reduce((s, r) => s + r.amount, 0), count: filtered.filter((s) => s.payment === "Cash").length },
    { name: "E-Payment", value: filtered.filter((s) => s.payment === "E-Payment").reduce((s, r) => s + r.amount, 0), count: filtered.filter((s) => s.payment === "E-Payment").length },
    { name: "Split", value: filtered.filter((s) => s.payment === "Split").reduce((s, r) => s + r.amount, 0), count: filtered.filter((s) => s.payment === "Split").length },
  ].filter((d) => d.value > 0);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">POS / Sales History</p>
          <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and manage all sales transactions.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{filtered.length}</p>
            <p className="text-xs text-slate-500">Total Sales</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Rs. {totalAmount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <span className="text-lg font-bold text-violet-600">#</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalItems}</p>
            <p className="text-xs text-slate-500">Items Sold</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{new Set(filtered.map((s) => s.customer)).size}</p>
            <p className="text-xs text-slate-500">Unique Customers</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, receipt #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500">
          <option>All Payment</option>
          <option>Cash</option>
          <option>E-Payment</option>
          <option>Split</option>
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500">
          <option>All Dates</option>
          <option>Today</option>
          <option>Yesterday</option>
        </select>
        {(paymentFilter !== "All" || dateFilter !== "All") && (
          <button
            onClick={() => { setPaymentFilter("All"); setDateFilter("All"); }}
            className="h-10 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Table */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Toolbar */}
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
            <span className="text-xs text-slate-400">{filtered.length} receipts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Receipt #</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Items</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sale.id)}
                        onChange={() => toggleSelect(sale.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-slate-900">{sale.invoice}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{sale.customer}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{sale.date}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-900 text-right">{sale.items}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-slate-900 text-right">
                      Rs. {sale.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        sale.payment === "Cash" ? "bg-blue-100 text-blue-700" :
                        sale.payment === "E-Payment" ? "bg-emerald-100 text-emerald-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {sale.payment}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 flex items-center gap-1">
                        <button
                          onClick={() => setReceiptSale(sale)}
                          className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors"
                          title="View Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Showing {filtered.length} of {salesRecords.length}</span>
            <span className="text-sm font-semibold text-slate-900">Total: Rs. {totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-500" /> Payment Breakdown
            </h3>
            {paymentChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                    >
                      {paymentChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `Rs. ${value.toLocaleString("en-IN")}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {paymentChartData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-sm text-slate-600">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-slate-900">Rs. {d.value.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-slate-400 ml-2">({d.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No data for current filters</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Summary</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Total Receipts</span>
                <span className="font-semibold text-blue-900">{filtered.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Total Amount</span>
                <span className="font-semibold text-blue-900">Rs. {totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Total Items</span>
                <span className="font-semibold text-blue-900">{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Avg. Sale</span>
                <span className="font-semibold text-blue-900">
                  Rs. {filtered.length > 0 ? Math.round(totalAmount / filtered.length).toLocaleString("en-IN") : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptSale && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setReceiptSale(null)}>
          <div className="bg-white rounded-xl shadow-xl w-[400px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Receipt</h3>
              <button onClick={() => setReceiptSale(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-200 pb-4 mb-4">
                <h2 className="text-xl font-bold text-slate-900">Daraz Retail</h2>
                <p className="text-xs text-slate-500">Thamel Marg, Ward 29</p>
                <p className="text-xs text-slate-500">Kathmandu, Nepal</p>
                <p className="text-xs text-slate-500">Tel: +977 1-4XXXXXX</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-mono font-medium text-slate-700">{receiptSale.invoice}</span>
                </div>
              </div>

              {/* Receipt Info */}
              <div className="space-y-1 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-900">{receiptSale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span className="text-slate-900">{receiptSale.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="text-slate-900">{receiptSale.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="text-slate-900 font-medium">{receiptSale.payment}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-dashed border-slate-200 pt-3 mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Item</span>
                  <span>Qty x Price</span>
                </div>
                {Array.from({ length: Math.min(receiptSale.items, 5) }).map((_, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span className="text-slate-700">Item {i + 1}</span>
                    <span className="text-slate-900">1 x Rs. {Math.round(receiptSale.amount / receiptSale.items).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-200 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal ({receiptSale.items} items)</span>
                  <span className="text-slate-900">Rs. {receiptSale.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">VAT (13%)</span>
                  <span className="text-slate-900">Rs. {Math.round(receiptSale.amount * 0.13).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-900">TOTAL</span>
                  <span className="text-slate-900">Rs. {Math.round(receiptSale.amount * 1.13).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center border-t border-dashed border-slate-200 pt-4">
                <p className="text-xs text-slate-500">Thank you for shopping with us!</p>
                <p className="text-[10px] text-slate-400 mt-1">Returns accepted within 7 days with receipt</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-center gap-3">
              <button className="h-9 px-4 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button onClick={() => setReceiptSale(null)} className="h-9 px-4 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
