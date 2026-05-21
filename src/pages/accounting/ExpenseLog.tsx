import { useState } from "react";
import {
  IndianRupee, Plus, Save, X, CheckCircle, Clock,
  XCircle, Pencil, Trash2, Search,
} from "lucide-react";
import { expenses, expenseCategories, vendors } from "../../data";
import type { Expense } from "../../data";

const categoryColors: Record<string, { bg: string; text: string }> = {
  Salary: { bg: "bg-rose-100", text: "text-rose-700" },
  Repair: { bg: "bg-amber-100", text: "text-amber-700" },
  Utilities: { bg: "bg-blue-100", text: "text-blue-700" },
  Packaging: { bg: "bg-violet-100", text: "text-violet-700" },
  Rent: { bg: "bg-cyan-100", text: "text-cyan-700" },
  Transport: { bg: "bg-orange-100", text: "text-orange-700" },
  Miscellaneous: { bg: "bg-slate-100", text: "text-slate-700" },
};

export default function ExpenseLog() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenseList, setExpenseList] = useState<Expense[]>(expenses);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchVendor, setSearchVendor] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    totalAmount: 0,
    paidTo: "",
    paymentMethod: "Cash",
    reference: "",
    notes: "",
  });

  const filtered = categoryFilter === "All" ? expenseList : expenseList.filter((e) => e.category === categoryFilter);

  const totalExpenses = expenseList.reduce((s, e) => s + e.totalAmount, 0);
  const pendingApproval = expenseList.filter((e) => e.status === "Pending Approval").reduce((s, e) => s + e.totalAmount, 0);

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
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    setExpenseList((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    clearSelection();
  };

  const handleDelete = (id: string) => {
    setExpenseList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      totalAmount: expense.totalAmount,
      paidTo: expense.addedBy,
      paymentMethod: "Cash",
      reference: "",
      notes: "",
    });
    setShowAddForm(true);
  };

  const handleSaveExpense = () => {
    if (!form.category || !form.description || !form.paidTo) return;
    if (editingExpense) {
      setExpenseList((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? { ...e, date: form.date, category: form.category, description: form.description, totalAmount: form.totalAmount, addedBy: form.paidTo }
            : e
        )
      );
      setEditingExpense(null);
    } else {
      const newExpense: Expense = {
        id: `e-${Date.now()}`,
        expenseId: `EXP-2024-${String(expenseList.length + 1).padStart(4, "0")}`,
        date: form.date,
        category: form.category,
        description: form.description,
        qty: 1,
        unitCost: form.totalAmount,
        totalAmount: form.totalAmount,
        addedBy: form.paidTo,
        status: "Pending Approval",
      };
      setExpenseList([newExpense, ...expenseList]);
    }
    setShowAddForm(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
      totalAmount: 0,
      paidTo: "",
      paymentMethod: "Cash",
      reference: "",
      notes: "",
    });
    setSearchVendor("");
  };

  const filteredVendors = vendors.filter((v) =>
    searchVendor && (v.name.toLowerCase().includes(searchVendor.toLowerCase()) || v.contactPerson.toLowerCase().includes(searchVendor.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Accounting / Expenses</p>
          <h1 className="text-2xl font-bold text-slate-900">Expense Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage business expenses across categories.</p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setShowAddForm(!showAddForm); }}
          className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Rs. {totalExpenses.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">Total Expenses</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">Rs. {pendingApproval.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">Pending Approval</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">{expenseList.filter((e) => e.status === "Approved").length}</p>
            <p className="text-xs text-slate-500">Approved</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500">
                <option value="">Select Category</option>
                {expenseCategories.filter((c) => c !== "All").map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter expense description" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (NPR) <span className="text-red-500">*</span></label>
              <input type="number" value={form.totalAmount || ""} onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })} placeholder="0.00" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Paid To <span className="text-red-500">*</span></label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.paidTo || searchVendor}
                  onChange={(e) => { setSearchVendor(e.target.value); setForm({ ...form, paidTo: e.target.value }); }}
                  placeholder="Search vendor or type name..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {searchVendor && filteredVendors.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredVendors.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setForm({ ...form, paidTo: v.name }); setSearchVendor(""); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-medium">{v.name}</span>
                      <span className="text-xs text-slate-400 ml-2">{v.contactPerson}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500">
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Check</option>
                <option>UPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
              <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Invoice / Bill No." className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes (optional)" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button onClick={() => setShowAddForm(false)} className="h-10 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleSaveExpense} className="h-10 px-4 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
              <Save className="w-4 h-4" /> {editingExpense ? "Update" : "Save"} Expense
            </button>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500 mr-2">Filter:</span>
        {expenseCategories.map((cat) => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${categoryFilter === cat ? "bg-blue-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{cat}</button>
        ))}
      </div>

      {/* Expense Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
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
          <span className="text-xs text-slate-400">{filtered.length} expenses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-blue-500" />
                </th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Expense ID</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Added By</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((expense) => {
                const colors = categoryColors[expense.category] || { bg: "bg-slate-100", text: "text-slate-700" };
                return (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selectedIds.has(expense.id)} onChange={() => toggleSelect(expense.id)} className="w-4 h-4 rounded border-slate-300 text-blue-500" />
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900">{expense.expenseId}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{expense.date}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}>{expense.category}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-900">{expense.description}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">Rs. {expense.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{expense.addedBy}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${expense.status === "Approved" ? "bg-emerald-100 text-emerald-700" : expense.status === "Pending Approval" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {expense.status === "Approved" ? <CheckCircle className="w-3 h-3" /> : expense.status === "Pending Approval" ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(expense)} className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {expenseList.length} entries
        </div>
      </div>
    </div>
  );
}
