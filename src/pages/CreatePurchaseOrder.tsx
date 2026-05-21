import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronLeft, Plus, Trash2, Search, Info,
  CheckCircle2, Building2, Truck, FileText,
} from "lucide-react";
import { vendors, inventoryProducts } from "../data";
import type { POLineItem } from "../data";

const steps = [
  { id: 1, label: "Vendor & Delivery", icon: Building2 },
  { id: 2, label: "Add Items", icon: Plus },
  { id: 3, label: "Review & Approval", icon: CheckCircle2 },
  { id: 4, label: "Send", icon: FileText },
];

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<number | "">("");
  const [deliveryDetails, setDeliveryDetails] = useState({
    deliveryMethod: "delivery" as "delivery" | "pickup",
    storeBranch: "Main Branch",
    deliveryLocation: "",
    poDate: new Date().toISOString().split("T")[0],
    expectedDelivery: "",
    paymentTerms: 0,
    currency: "NPR",
    notes: "",
  });
  const [lineItems, setLineItems] = useState<POLineItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");

  const vendor = vendors.find((v) => v.id === selectedVendor);

  const addLineItem = (product: typeof inventoryProducts[0]) => {
    const newItem: POLineItem = {
      id: `li-${Date.now()}`,
      inventoryId: product.sku,
      sku: product.sku,
      productName: product.name,
      category: product.category,
      fabricType: "-",
      qty: 1,
      unit: product.unit,
      unitAmount: product.costPrice,
      subtotal: product.costPrice,
      receivedQty: 0,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const updateLineItem = (id: string, field: string, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "qty" || field === "unitAmount") {
          updated.subtotal = updated.qty * updated.unitAmount;
        }
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  const filteredProducts = inventoryProducts.filter(
    (p) =>
      !lineItems.find((li) => li.sku === p.sku) &&
      (itemSearch === "" ||
        p.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const canProceed = () => {
    const needsLocation = deliveryDetails.deliveryMethod === "delivery";
    if (currentStep === 1) {
      return (
        selectedVendor !== "" &&
        (!needsLocation || deliveryDetails.deliveryLocation !== "") &&
        deliveryDetails.expectedDelivery !== ""
      );
    }
    if (currentStep === 2) return lineItems.length > 0;
    return true;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">
          Inventory
        </button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => navigate("/purchase-orders")} className="hover:text-slate-700 transition-colors">
          Purchase Orders
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">Create Purchase Order</span>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-4.5 h-4.5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-200 mx-3 mb-5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? "bg-emerald-500 w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="col-span-2">
          {/* Step 1: Vendor & Delivery */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Vendor Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" /> Vendor Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name <span className="text-red-500">*</span></label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} — {v.contactPerson}
                        </option>
                      ))}
                    </select>
                  </div>
                  {vendor && (
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="text-[11px] text-slate-400">Contact Person</p>
                        <p className="text-sm font-medium text-slate-700">{vendor.contactPerson}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Email</p>
                        <p className="text-sm text-slate-700">{vendor.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Phone</p>
                        <p className="text-sm text-slate-700">{vendor.phone}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Address</p>
                        <p className="text-sm text-slate-700">{vendor.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-500" /> Delivery Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Method <span className="text-red-500">*</span></label>
                    <select
                      value={deliveryDetails.deliveryMethod}
                      onChange={(e) => {
                        const nextMethod = e.target.value as "delivery" | "pickup";
                        setDeliveryDetails({
                          ...deliveryDetails,
                          deliveryMethod: nextMethod,
                          deliveryLocation: nextMethod === "pickup" ? "" : deliveryDetails.deliveryLocation,
                        });
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="delivery">Delivery to location</option>
                      <option value="pickup">Pickup from vendor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Store / Branch <span className="text-red-500">*</span></label>
                    <select
                      value={deliveryDetails.storeBranch}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, storeBranch: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option>Main Branch</option>
                      <option>Thamel Branch</option>
                    </select>
                  </div>
                  {deliveryDetails.deliveryMethod === "delivery" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Location <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={deliveryDetails.deliveryLocation}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryLocation: e.target.value })}
                        placeholder="Enter delivery address"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">PO Date</label>
                    <input
                      type="date"
                      value={deliveryDetails.poDate}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, poDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={deliveryDetails.expectedDelivery}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, expectedDelivery: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={deliveryDetails.paymentTerms}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, paymentTerms: Number(e.target.value) })}
                        className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select
                      value={deliveryDetails.currency}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, currency: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option>NPR</option>
                      <option>INR</option>
                      <option>USD</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={deliveryDetails.notes}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, notes: e.target.value })}
                      placeholder="Additional notes for the vendor..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Items */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Line Items</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search existing inventory items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                {itemSearch && (
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto mb-4">
                    {filteredProducts.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">No products found</p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addLineItem(product)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.sku} — {product.category}</p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-500" />
                        </button>
                      ))
                    )}
                  </div>
                )}

                {lineItems.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-left">Product</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-left">SKU</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-left">Category</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-left">Fabric</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-right">Qty</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-left">Unit</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-right">Unit Price</th>
                          <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-right">Subtotal</th>
                          <th className="px-3 py-2 w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 text-xs font-medium text-slate-900">{item.productName}</td>
                            <td className="px-3 py-2 text-[11px] font-mono text-slate-500">{item.sku}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{item.category}</td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.fabricType}
                                onChange={(e) => updateLineItem(item.id, "fabricType", e.target.value)}
                                className="w-20 h-7 px-2 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateLineItem(item.id, "qty", Number(e.target.value))}
                                className="w-16 h-7 px-2 rounded border border-slate-200 text-xs text-right focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600">{item.unit}</td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                value={item.unitAmount}
                                onChange={(e) => updateLineItem(item.id, "unitAmount", Number(e.target.value))}
                                className="w-20 h-7 px-2 rounded border border-slate-200 text-xs text-right focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2 text-xs font-semibold text-slate-900 text-right">
                              Rs. {item.subtotal.toLocaleString("en-IN")}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeLineItem(item.id)}
                                className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Approval */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Review Purchase Order</h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Vendor</p>
                    <p className="text-sm font-semibold text-slate-900">{vendor?.name}</p>
                    <p className="text-xs text-slate-500">{vendor?.address}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Delivery</p>
                    <p className="text-sm font-semibold text-slate-900">{deliveryDetails.storeBranch}</p>
                    <p className="text-xs text-slate-500">
                      {deliveryDetails.deliveryMethod === "pickup" ? "Pickup from vendor" : deliveryDetails.deliveryLocation}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Expected Delivery</p>
                    <p className="text-sm font-semibold text-slate-900">{deliveryDetails.expectedDelivery}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Payment Terms</p>
                    <p className="text-sm font-semibold text-slate-900">{deliveryDetails.paymentTerms}%</p>
                  </div>
                </div>

                <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-left">Item</th>
                      <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-right">Qty</th>
                      <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-right">Unit Price</th>
                      <th className="px-3 py-2 text-[10px] font-medium text-slate-500 uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-xs text-slate-900">{item.productName}</td>
                        <td className="px-3 py-2 text-xs text-right">{item.qty} {item.unit}</td>
                        <td className="px-3 py-2 text-xs text-right">Rs. {item.unitAmount.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-right">Rs. {item.subtotal.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-slate-700 text-right">Total Amount:</td>
                      <td className="px-3 py-2 text-sm font-bold text-slate-900 text-right">
                        Rs. {totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Send */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-900">Purchase Order Created Successfully</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  PO-2025-0025 has been created and is ready to be sent to {vendor?.name}.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Send Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/purchase-orders")}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Send via Email & Continue
                  </button>
                  <button
                    onClick={() => navigate("/purchase-orders")}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Send via WhatsApp & Continue
                  </button>
                  <button
                    onClick={() => navigate("/purchase-orders")}
                    className="w-full h-10 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Save as Draft - Don&apos;t Send Yet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className={`h-10 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                  currentStep === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                disabled={!canProceed()}
                className={`h-10 px-4 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                  !canProceed() ? "opacity-40 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
              >
                {currentStep === 3 ? "Create PO" : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: PO Summary */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">PO Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-slate-400">Vendor</p>
                <p className="text-sm font-medium text-slate-900">{vendor?.name || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Store / Branch</p>
                <p className="text-sm text-slate-700">{deliveryDetails.storeBranch}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">PO Date</p>
                <p className="text-sm text-slate-700">{deliveryDetails.poDate}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Expected Delivery</p>
                <p className="text-sm text-slate-700">{deliveryDetails.expectedDelivery || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Payment Terms</p>
                <p className="text-sm text-slate-700">{deliveryDetails.paymentTerms}%</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] text-slate-400">Total Items</p>
                <p className="text-sm font-semibold text-slate-900">{lineItems.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Total Amount</p>
                <p className="text-lg font-bold text-blue-700">Rs. {totalAmount.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">How It Works</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    Fill in vendor and delivery details, add line items, review the PO, and submit for approval or send directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
