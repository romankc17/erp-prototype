import { useState } from "react";
import {
  Eye, CreditCard, FileText,
} from "lucide-react";
import { bills } from "../../data";

export default function Bills() {
  const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null);
  const [statusTab, setStatusTab] = useState("All");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Bank Transfer",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
  });

  const filtered = statusTab === "All" ? bills : bills.filter((b) => b.status === statusTab);

  const statusTabs = ["All", "Queue", "Partially Paid", "Paid", "Closed"];

  const totalOutstanding = bills.filter((b) => b.status === "Queue" || b.status === "Partially Paid").reduce((s, b) => s + b.balance, 0);
  const paidThisMonth = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.paidAmount, 0);

  const handleRecordPayment = () => {
    if (!selectedBill) return;
    alert(`Payment of Rs. ${paymentForm.amount} recorded for ${selectedBill.billId}`);
    setPaymentForm({ ...paymentForm, amount: "", reference: "", notes: "" });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Accounting / Bills</p>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track vendor bills and payment obligations.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Bills in Queue</p>
          <p className="text-2xl font-bold text-blue-700">{bills.filter((b) => b.status === "Queue").length}</p>
          <p className="text-xs text-slate-400">pending payment</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Due This Week</p>
          <p className="text-2xl font-bold text-amber-600">1</p>
          <p className="text-xs text-slate-400">attention needed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600">Rs. {totalOutstanding.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-400">across all bills</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Paid This Month</p>
          <p className="text-2xl font-bold text-emerald-600">Rs. {paidThisMonth.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-400">Rs. {paidThisMonth.toLocaleString("en-IN")} paid</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit shadow-sm">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusTab === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-6">
        {/* Bills List */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Bill ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Linked PO</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Total</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Paid</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Balance</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((bill) => (
                    <tr
                      key={bill.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedBill?.id === bill.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedBill(bill)}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{bill.billId}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{bill.linkedPO}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{bill.supplier}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">{bill.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 text-right">{bill.paidAmount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{bill.balance.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            bill.status === "Paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : bill.status === "Partially Paid"
                              ? "bg-amber-100 text-amber-700"
                              : bill.status === "Queue"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-4">
          {selectedBill ? (
            <>
              {/* Bill Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">{selectedBill.billId}</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Total Bill</p>
                    <p className="text-lg font-bold text-slate-900">Rs. {selectedBill.totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-[11px] text-emerald-600">Paid</p>
                    <p className="text-lg font-bold text-emerald-700">Rs. {selectedBill.paidAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-[11px] text-amber-600">Balance</p>
                    <p className="text-lg font-bold text-amber-700">Rs. {selectedBill.balance.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-[11px] text-blue-600">Next Due</p>
                    <p className="text-sm font-bold text-blue-700">{selectedBill.dueDate}</p>
                  </div>
                </div>

                {/* Payment Schedule */}
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Schedule</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-left">Description</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-left">Type</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-right">Amount</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-right">Paid</th>
                        <th className="px-3 py-2 text-[10px] font-medium text-slate-500 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedBill.paymentSchedule.map((ps) => (
                        <tr key={ps.id}>
                          <td className="px-3 py-2 text-xs text-slate-900">{ps.description}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{ps.type}</td>
                          <td className="px-3 py-2 text-xs text-slate-900 text-right">{ps.amount.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-xs text-emerald-600 text-right">{ps.paidAmount.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                                ps.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {ps.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Record Payment */}
              {selectedBill.balance > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" /> Record Payment
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        placeholder={`Max: ${selectedBill.balance}`}
                        max={selectedBill.balance}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                      <select
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option>Bank Transfer</option>
                        <option>Cash</option>
                        <option>Check</option>
                        <option>UPI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={paymentForm.date}
                        onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Check No.</label>
                      <input
                        type="text"
                        value={paymentForm.reference}
                        onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                        placeholder="Enter reference number"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleRecordPayment}
                      disabled={!paymentForm.amount || Number(paymentForm.amount) <= 0}
                      className={`w-full h-10 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        !paymentForm.amount || Number(paymentForm.amount) <= 0
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-blue-600"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Save Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Payment History */}
              {selectedBill.paymentHistory.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {selectedBill.paymentHistory.map((ph, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm text-slate-900">{ph.description}</p>
                          <p className="text-xs text-slate-500">{ph.date} — {ph.method}</p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">Rs. {ph.amount.toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Select a bill to view details and record payments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
