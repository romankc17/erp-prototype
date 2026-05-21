import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, CheckCircle, ChevronRight, AlertTriangle,
  Save,
} from "lucide-react";
import { purchaseOrdersDetailed } from "../data";

export default function POReceiving() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receivedItems, setReceivedItems] = useState<Record<string, { received: number; accepted: number; damaged: number; notes: string }>>({});
  const [submitted, setSubmitted] = useState(false);

  const po = purchaseOrdersDetailed.find((p) => p.id === id);

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Purchase order not found</p>
        <button onClick={() => navigate("/purchase-orders")} className="mt-4 text-blue-500 hover:underline">Back</button>
      </div>
    );
  }

  const updateItem = (itemId: string, field: string, value: string | number) => {
    setReceivedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      navigate("/purchase-orders");
    }, 1500);
  };

  const allReceived = po.lineItems.every((item) => {
    const received = receivedItems[item.id]?.received || 0;
    return received > 0;
  });

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">Inventory</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">Purchase Orders</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">Receive Stock</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/purchase-orders/${po.id}`)}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Receive Stock</h1>
            <p className="text-sm text-slate-500 mt-0.5">{po.poNumber} — {po.vendorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 text-sm font-medium rounded-full">
            <Package className="w-4 h-4" /> Sent
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Package className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Enter the received quantities for each line item. Accepted quantities will be added to inventory automatically.
          Damaged/short quantities will be flagged for review.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-emerald-900">Stock Received Successfully</h3>
          <p className="text-sm text-emerald-700 mt-1">Inventory has been updated based on accepted quantities.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Ordered Qty</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Received Qty</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Accepted Qty</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Damaged/Short</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {po.lineItems.map((item) => {
                  const received = receivedItems[item.id]?.received || 0;
                  const accepted = receivedItems[item.id]?.accepted || 0;
                  const damaged = receivedItems[item.id]?.damaged || 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-400">{item.sku}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-900 text-right font-medium">{item.qty}</td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={item.qty}
                          value={received || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateItem(item.id, "received", val);
                            updateItem(item.id, "accepted", val);
                          }}
                          className="w-20 h-9 px-2 rounded-lg border border-slate-300 text-sm text-right focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={received}
                          value={accepted || ""}
                          onChange={(e) => updateItem(item.id, "accepted", Number(e.target.value))}
                          className="w-20 h-9 px-2 rounded-lg border border-slate-300 text-sm text-right focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={received}
                          value={damaged || ""}
                          onChange={(e) => updateItem(item.id, "damaged", Number(e.target.value))}
                          className="w-20 h-9 px-2 rounded-lg border border-slate-300 text-sm text-right focus:outline-none focus:border-red-500"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={receivedItems[item.id]?.notes || ""}
                          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                          placeholder="Optional notes"
                          className="w-full h-9 px-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t border-slate-100 p-5 bg-slate-50">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-[11px] text-slate-400">Total Ordered</p>
                <p className="text-lg font-bold text-slate-900">{po.lineItems.reduce((s, i) => s + i.qty, 0)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-[11px] text-slate-400">Total Received</p>
                <p className="text-lg font-bold text-blue-700">
                  {Object.values(receivedItems).reduce((s, i) => s + (i.received || 0), 0)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <p className="text-[11px] text-emerald-600">Total Accepted</p>
                <p className="text-lg font-bold text-emerald-700">
                  {Object.values(receivedItems).reduce((s, i) => s + (i.accepted || 0), 0)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-[11px] text-red-600">Damaged/Short</p>
                <p className="text-lg font-bold text-red-700">
                  {Object.values(receivedItems).reduce((s, i) => s + (i.damaged || 0), 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Accepted quantities will be added to inventory. Damaged items will be flagged.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/purchase-orders/${po.id}`)}
                  className="h-10 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allReceived}
                  className={`h-10 px-6 bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                    !allReceived ? "opacity-40 cursor-not-allowed" : "hover:bg-emerald-600"
                  }`}
                >
                  <Save className="w-4 h-4" /> Save & Update Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
