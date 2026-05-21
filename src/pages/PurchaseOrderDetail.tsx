import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, XCircle, Send, Clock, Building2, Truck,
  CreditCard, FileText, Package, AlertCircle,
  ChevronRight, Edit3, Printer,
} from "lucide-react";
import { purchaseOrdersDetailed } from "../data";
import type { POStatus } from "../data";

const statusSteps: { key: string; label: string; status: POStatus }[] = [
  { key: "draft", label: "Draft", status: "Draft" },
  { key: "pending", label: "Approval Pending", status: "Approval Pending" },
  { key: "approved", label: "Approved", status: "Approved" },
  { key: "ready", label: "Ready to Send", status: "Ready to Send" },
  { key: "sent", label: "Sent", status: "Sent" },
];

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "approval">("overview");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const po = purchaseOrdersDetailed.find((p) => p.id === id);

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Purchase order not found</p>
        <button onClick={() => navigate("/purchase-orders")} className="mt-4 text-blue-500 hover:underline">
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === po.status);

  const handleApprove = () => {
    // In a real app, this would update the PO status
    alert("Purchase Order Approved!");
    navigate("/purchase-orders");
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    alert(`Purchase Order Rejected. Reason: ${rejectReason}`);
    setShowRejectDialog(false);
    navigate("/purchase-orders");
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">Inventory</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">Purchase Orders</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{po.poNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/purchase-orders")}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{po.poNumber}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Created by {po.createdBy} on {po.poDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {po.status === "Approval Pending" && (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                <Clock className="w-4 h-4" /> Approval Pending
              </span>
            </>
          )}
          {po.status === "Approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              <CheckCircle className="w-4 h-4" /> Approved
            </span>
          )}
          {po.status === "Sent" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 text-sm font-medium rounded-full">
              <Send className="w-4 h-4" /> Sent
            </span>
          )}
          {po.status === "Partially Received" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
              <Package className="w-4 h-4" /> Partially Received
            </span>
          )}
          {po.status === "Received" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
              <CheckCircle className="w-4 h-4" /> Received
            </span>
          )}
        </div>
      </div>

      {/* Approval Workflow */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepData = po.approvalSteps.find((s) => s.status === step.key);
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "bg-blue-500 text-white ring-4 ring-blue-100"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium ${
                      isCurrent ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {stepData?.date && (
                    <span className="text-[10px] text-slate-400">{stepData.date}</span>
                  )}
                  {stepData?.user && (
                    <span className="text-[10px] text-slate-500">{stepData.user}</span>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-200 mx-2 mb-6">
                    <div
                      className={`h-full transition-all ${
                        index < currentStepIndex ? "bg-emerald-500 w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit shadow-sm">
        {[
          { id: "overview" as const, label: "Overview", icon: FileText },
          { id: "items" as const, label: `Line Items (${po.lineItems.length})`, icon: Package },
          { id: "approval" as const, label: "Approval History", icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" /> Vendor Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-slate-400">Vendor Name</p>
                <p className="text-sm font-medium text-slate-900">{po.vendorName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Address</p>
                <p className="text-sm text-slate-700">{po.vendorAddress}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Contact</p>
                <p className="text-sm text-slate-700">{po.vendorContact}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{po.vendorEmail}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-500" /> Delivery Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-slate-400">Deliver To</p>
                <p className="text-sm font-medium text-slate-900">{po.storeBranch}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Delivery Location</p>
                <p className="text-sm text-slate-700">{po.deliveryLocation}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Expected Delivery</p>
                <p className="text-sm text-slate-700">{po.expectedDelivery}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" /> Payment Terms
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-slate-400">Payment Terms</p>
                <p className="text-sm font-medium text-slate-900">{po.paymentTerms}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Currency</p>
                <p className="text-sm text-slate-700">{po.currency}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Notes</p>
                <p className="text-sm text-slate-700">{po.notes || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">PO Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-blue-700">PO Number</span>
                <span className="text-xs font-semibold text-blue-900">{po.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-700">Total Items</span>
                <span className="text-xs font-semibold text-blue-900">{po.lineItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-700">Total Amount</span>
                <span className="text-xs font-semibold text-blue-900">Rs. {po.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-700">Created By</span>
                <span className="text-xs font-semibold text-blue-900">{po.createdBy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Line Items Tab */}
      {activeTab === "items" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">UOM</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Qty</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{item.productName}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">{item.sku}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{item.category}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{item.unit}</td>
                  <td className="px-5 py-3 text-sm text-slate-900 text-right">{item.qty}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-right">Rs. {item.unitAmount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">Rs. {item.subtotal.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50">
                <td colSpan={6} className="px-5 py-3 text-sm font-semibold text-slate-700 text-right">Total Amount:</td>
                <td className="px-5 py-3 text-base font-bold text-slate-900 text-right">
                  Rs. {po.totalAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Approval History Tab */}
      {activeTab === "approval" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Approval Activity</h3>
          <div className="space-y-4">
            {po.approvalSteps.map((step, index) => (
              <div key={step.status} className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    index <= currentStepIndex ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {index <= currentStepIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{step.label}</p>
                    {step.date && <p className="text-xs text-slate-400">{step.date}</p>}
                  </div>
                  {step.user && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      by {step.user} {step.role && `(${step.role})`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Actions */}
      {po.status === "Approval Pending" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">This purchase order is awaiting approval</h3>
              <p className="text-xs text-slate-500 mt-1">
                Submitted for approval by {po.createdBy}. Review the details and approve or reject this purchase order.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleApprove}
                  className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve PO
                </button>
                <button
                  onClick={handleReject}
                  className="h-10 px-6 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center gap-3">
        {po.status === "Draft" && (
          <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
            <Edit3 className="w-4 h-4" /> Edit Draft
          </button>
        )}
        {(po.status === "Approved" || po.status === "Ready to Send") && (
          <button
            onClick={() => navigate(`/purchase-orders/${po.id}/send`)}
            className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" /> Send Purchase Order
          </button>
        )}
        {po.status === "Sent" && (
          <button
            onClick={() => navigate(`/purchase-orders/${po.id}/receive`)}
            className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Package className="w-4 h-4" /> Receive Stock
          </button>
        )}
        <button className="h-10 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Printer className="w-4 h-4" /> Preview PO
        </button>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[420px]">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Purchase Order</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting this purchase order.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-red-500 resize-none mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
