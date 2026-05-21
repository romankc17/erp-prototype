import { useState } from "react";
import {
  FileText, Download, Mail, Search, Trash2, X,
  Pencil, Eye,
} from "lucide-react";
import { invoices } from "../../data";

export default function Invoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [statusTab, setStatusTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const statusTabs = ["All", "Draft", "Sent", "Partially Settled", "Closed"];

  const filtered = invoices.filter((i) => {
    const matchTab = statusTab === "All" || i.status === statusTab;
    const matchSearch = search === "" ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.customerName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalReceived = invoices.reduce((s, i) => s + i.receivedSoFar, 0);
  const totalOutstanding = totalInvoiced - totalReceived;

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
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Accounting / Invoices</p>
          <h1 className="text-2xl font-bold text-slate-900">Customer Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage customer invoices and payment claims.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Invoiced</p>
          <p className="text-2xl font-bold text-blue-700">Rs. {totalInvoiced.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Received</p>
          <p className="text-2xl font-bold text-emerald-600">Rs. {totalReceived.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Outstanding</p>
          <p className="text-2xl font-bold text-amber-600">Rs. {totalOutstanding.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Invoices</p>
          <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit shadow-sm">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusTab === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-6">
        {/* Invoice Table */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
                  <button onClick={clearSelection} className="h-7 px-2 text-slate-500 hover:text-slate-700 text-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-blue-500" />
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Terms</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedInvoice?.id === inv.id ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(inv.id)} onChange={() => toggleSelect(inv.id)} className="w-4 h-4 rounded border-slate-300 text-blue-500" />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{inv.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{inv.paymentTerms}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">Rs. {inv.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          inv.status === "Closed" ? "bg-emerald-100 text-emerald-700" :
                          inv.status === "Partially Settled" ? "bg-amber-100 text-amber-700" :
                          inv.status === "Sent" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }} className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center" title="View">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                          <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center" title="Edit">
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center" title="Delete">
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
              <div className="text-center py-8"><p className="text-sm text-slate-400">No invoices found</p></div>
            )}
          </div>
        </div>

        {/* Right Panel - Invoice Detail */}
        <div className="col-span-3 space-y-4">
          {selectedInvoice ? (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">{selectedInvoice.invoiceNumber}</h3>
                  <div className="flex items-center gap-2">
                    <button className="h-8 px-3 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-blue-100 transition-colors">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button className="h-8 px-3 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-semibold text-slate-900">{selectedInvoice.customerName}</p>
                  <p className="text-xs text-slate-500">{selectedInvoice.customerAddress}</p>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Invoice Date</p>
                    <p className="text-sm font-medium text-slate-900">{selectedInvoice.invoiceDate}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-[11px] text-blue-500">Due Date</p>
                    <p className="text-sm font-medium text-blue-700">{selectedInvoice.dueDate}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Total Amount</p>
                    <p className="text-lg font-bold text-slate-900">Rs. {selectedInvoice.totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-[11px] text-emerald-600">Received</p>
                    <p className="text-lg font-bold text-emerald-700">Rs. {selectedInvoice.receivedSoFar.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="border border-slate-200 rounded-lg p-3 mb-4">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Payment Terms</p>
                  <p className="text-sm text-slate-700">{selectedInvoice.paymentTerms}</p>
                </div>

                {/* Items */}
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Line Items</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-left">Item</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-right">Qty</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-right">Price</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-xs text-slate-900">{item.name}</td>
                          <td className="px-3 py-2 text-xs text-slate-900 text-right">{item.qty}</td>
                          <td className="px-3 py-2 text-xs text-slate-600 text-right">Rs. {item.unitPrice.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-slate-900 text-right">Rs. {item.amount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Requests */}
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Schedule</h4>
                <div className="space-y-2">
                  {selectedInvoice.paymentRequests.map((pr) => (
                    <div key={pr.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm text-slate-900">{pr.term}</p>
                        <p className="text-xs text-slate-500">Due: {pr.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">Rs. {pr.amount.toLocaleString("en-IN")}</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                          pr.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>{pr.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Select an invoice to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
