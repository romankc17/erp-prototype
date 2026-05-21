import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Mail, Phone, FileText, ChevronRight,
  CheckCircle, Download, Paperclip,
} from "lucide-react";
import { purchaseOrdersDetailed } from "../data";

export default function SendPurchaseOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sendMethod, setSendMethod] = useState<"email" | "whatsapp">("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includePDF, setIncludePDF] = useState(true);
  const [includeTerms, setIncludeTerms] = useState(true);
  const [sent, setSent] = useState(false);

  const po = purchaseOrdersDetailed.find((p) => p.id === id);

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Purchase order not found</p>
        <button onClick={() => navigate("/purchase-orders")} className="mt-4 text-blue-500 hover:underline">
          Back
        </button>
      </div>
    );
  }

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      navigate("/purchase-orders");
    }, 2000);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">Inventory</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">Purchase Orders</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">Send PO</span>
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
            <h1 className="text-2xl font-bold text-slate-900">Send Purchase Order</h1>
            <p className="text-sm text-slate-500 mt-0.5">PO {po.poNumber} — {po.vendorName}</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Once sent, the purchase order status will change to <span className="font-semibold">Sent</span> and the vendor will be notified.
        </p>
      </div>

      {/* PO Summary Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <p className="text-[11px] text-slate-400">PO Number</p>
            <p className="text-sm font-semibold text-slate-900">{po.poNumber}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Vendor</p>
            <p className="text-sm font-semibold text-slate-900">{po.vendorName}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Expected Delivery</p>
            <p className="text-sm text-slate-700">{po.expectedDelivery}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Status</p>
            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Ready to Send
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Total Amount</p>
            <p className="text-sm font-bold text-slate-900">Rs. {po.totalAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: PDF Preview */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> PO PDF Preview (Vendor Copy)
              </h3>
              <button className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Download PDF
              </button>
            </div>
            <div className="p-8 bg-slate-100 min-h-[500px]">
              {/* Mock PDF Preview */}
              <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
                {/* Letterhead */}
                <div className="border-b-2 border-slate-800 pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Daraz Retail Pvt. Ltd.</h2>
                      <p className="text-sm text-slate-500">Thamel Marg, Ward 29, Kathmandu, Nepal</p>
                      <p className="text-sm text-slate-500">Phone: +977 1-4XXXXXX | Email: contact@darazretail.np</p>
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold text-slate-900">PURCHASE ORDER</h1>
                      <p className="text-sm text-slate-500 mt-1">{po.poNumber}</p>
                    </div>
                  </div>
                </div>

                {/* PO Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Vendor</p>
                    <p className="text-sm font-semibold text-slate-900">{po.vendorName}</p>
                    <p className="text-sm text-slate-600">{po.vendorAddress}</p>
                    <p className="text-sm text-slate-600">{po.vendorContact}</p>
                    <p className="text-sm text-slate-600">{po.vendorEmail}</p>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">PO Date:</span>
                        <span className="text-sm text-slate-900">{po.poDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Expected Delivery:</span>
                        <span className="text-sm text-slate-900">{po.expectedDelivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Payment Terms:</span>
                        <span className="text-sm text-slate-900">{po.paymentTerms}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-6">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Item</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {po.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-sm text-slate-900">{item.productName}</td>
                        <td className="px-3 py-2 text-sm text-slate-900 text-right">{item.qty}</td>
                        <td className="px-3 py-2 text-sm text-slate-600 text-right">Rs. {item.unitAmount.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-sm font-semibold text-slate-900 text-right">Rs. {item.subtotal.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200">
                      <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-slate-900 text-right">Total:</td>
                      <td className="px-3 py-2 text-sm font-bold text-slate-900 text-right">
                        Rs. {po.totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Notes */}
                {po.notes && (
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-600">{po.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Send Options */}
        <div className="col-span-2 space-y-4">
          {sent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-900">Purchase Order Sent!</h3>
              <p className="text-sm text-emerald-700 mt-1">{po.poNumber} has been sent to {po.vendorName}.</p>
            </div>
          ) : (
            <>
              {/* Recipient */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Recipient / Vendor Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-medium">{po.vendorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {po.vendorEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {po.vendorContact}
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Message Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={`Purchase Order ${po.poNumber} from Daraz Retail`}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message / Note</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter a message for the vendor..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Attachments</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePDF}
                      onChange={(e) => setIncludePDF(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Purchase Order PDF</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTerms}
                      onChange={(e) => setIncludeTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Terms & Notes</span>
                  </label>
                </div>
              </div>

              {/* Send Via */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Send Via</h3>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSendMethod("email")}
                    className={`flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      sendMethod === "email"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button
                    onClick={() => setSendMethod("whatsapp")}
                    className={`flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      sendMethod === "whatsapp"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Phone className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" /> Send Purchase Order
                </button>
                <button
                  onClick={() => navigate("/purchase-orders")}
                  className="w-full h-10 mt-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </>
          )}

          {/* Activity History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Activity History</h3>
            <div className="space-y-3">
              {po.approvalSteps.map((step, index) => (
                <div key={step.status} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      index <= po.approvalSteps.length - 1 ? "bg-emerald-500 text-white" : "bg-slate-200"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{step.label}</p>
                    {step.date && <p className="text-xs text-slate-400">{step.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
