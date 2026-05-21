import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useProcurement } from "../context/ProcurementContext";
import type { VendorPriceListItem } from "../domain/procurement/types";

type TabId = "overview" | "price-list" | "history" | "performance";

export default function VendorDetail() {
  const { id } = useParams();
  const vendorId = Number(id);
  const navigate = useNavigate();
  const { vendors, updateVendor, upsertVendorPriceListItem, deleteVendorPriceListItem } = useProcurement();

  const vendor = useMemo(() => vendors.find((v) => v.id === vendorId) ?? null, [vendors, vendorId]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [newItem, setNewItem] = useState({
    inventoryId: "",
    sku: "",
    productName: "",
    negotiatedPrice: "",
    minOrderQty: "1",
    effectiveFrom: new Date().toISOString().slice(0, 10),
  });

  if (!vendor || Number.isNaN(vendorId)) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <button onClick={() => navigate("/vendors")} className="text-sm text-blue-600 hover:underline">Back to vendors</button>
        <h1 className="text-lg font-bold text-slate-900 mt-3">Vendor not found</h1>
      </div>
    );
  }

  const upsertItem = () => {
    const item: VendorPriceListItem = {
      id: `vpli-${Date.now()}`,
      inventoryId: newItem.inventoryId.trim(),
      sku: newItem.sku.trim(),
      productName: newItem.productName.trim(),
      negotiatedPrice: Number(newItem.negotiatedPrice) || 0,
      minOrderQty: Number(newItem.minOrderQty) || 1,
      effectiveFrom: newItem.effectiveFrom,
    };
    if (!item.productName) return;
    upsertVendorPriceListItem(vendor.id, item);
    setNewItem({ inventoryId: "", sku: "", productName: "", negotiatedPrice: "", minOrderQty: "1", effectiveFrom: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/vendors")}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Vendors
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{vendor.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vendor profile, price list, and procurement performance.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "overview" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("price-list")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "price-list" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Price List
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "history" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "performance" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Performance
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Contact</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Contact Person</p>
                  <input
                    value={vendor.contactPerson}
                    onChange={(e) => updateVendor(vendor.id, { contactPerson: e.target.value })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <input
                    value={vendor.phone}
                    onChange={(e) => updateVendor(vendor.id, { phone: e.target.value })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <input
                    value={vendor.email}
                    onChange={(e) => updateVendor(vendor.id, { email: e.target.value })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment Terms</p>
                  <input
                    value={vendor.paymentTerms}
                    onChange={(e) => updateVendor(vendor.id, { paymentTerms: e.target.value })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-slate-400">Address</p>
                <textarea
                  value={vendor.address}
                  onChange={(e) => updateVendor(vendor.id, { address: e.target.value })}
                  rows={2}
                  className="mt-1 w-full px-2 py-2 rounded border border-slate-300 text-sm resize-none"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Procurement Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Lead Time (days)</p>
                  <input
                    value={vendor.leadTimeDays}
                    onChange={(e) => updateVendor(vendor.id, { leadTimeDays: Number(e.target.value) || 0 })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Preferred Vendor</p>
                  <select
                    value={vendor.isPreferred ? "yes" : "no"}
                    onChange={(e) => updateVendor(vendor.id, { isPreferred: e.target.value === "yes" })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-slate-400">On-time Delivery (%)</p>
                  <input
                    value={vendor.onTimeDeliveryRate}
                    onChange={(e) => updateVendor(vendor.id, { onTimeDeliveryRate: Number(e.target.value) || 0 })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Quality Rating (1-5)</p>
                  <input
                    value={vendor.qualityRating}
                    onChange={(e) => updateVendor(vendor.id, { qualityRating: Math.max(1, Math.min(5, Number(e.target.value) || 1)) })}
                    className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-slate-400">Category Specialization (comma separated)</p>
                <input
                  value={vendor.categorySpecialization.join(", ")}
                  onChange={(e) => updateVendor(vendor.id, { categorySpecialization: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                  className="mt-1 w-full h-9 px-2 rounded border border-slate-300 text-sm"
                  placeholder="Clothing, Accessories"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "price-list" && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-6 gap-2">
              <input value={newItem.inventoryId} onChange={(e) => setNewItem({ ...newItem, inventoryId: e.target.value })} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Inventory ID" />
              <input value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="SKU" />
              <input value={newItem.productName} onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })} className="h-9 px-2 rounded border border-slate-300 text-sm col-span-2" placeholder="Product name" />
              <input value={newItem.negotiatedPrice} onChange={(e) => setNewItem({ ...newItem, negotiatedPrice: e.target.value })} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Price" />
              <button onClick={upsertItem} className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <input value={newItem.minOrderQty} onChange={(e) => setNewItem({ ...newItem, minOrderQty: e.target.value })} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Min qty" />
              <input value={newItem.effectiveFrom} onChange={(e) => setNewItem({ ...newItem, effectiveFrom: e.target.value })} className="h-9 px-2 rounded border border-slate-300 text-sm" type="date" />
              <div className="col-span-4" />
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Min Qty</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Effective</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendor.priceList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No price list items yet</td>
                    </tr>
                  ) : (
                    vendor.priceList.map((i) => (
                      <tr key={i.id}>
                        <td className="px-4 py-2 text-sm text-slate-700">{i.sku || "-"}</td>
                        <td className="px-4 py-2 text-sm text-slate-900 font-medium">{i.productName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">{i.negotiatedPrice}</td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">{i.minOrderQty}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{i.effectiveFrom}{i.effectiveTo ? ` → ${i.effectiveTo}` : ""}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => deleteVendorPriceListItem(vendor.id, i.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 inline-flex items-center justify-center">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="p-5 text-sm text-slate-500">
            Order history will appear here once POs are connected to procurement events.
          </div>
        )}

        {activeTab === "performance" && (
          <div className="p-5 text-sm text-slate-500">
            Performance metrics will appear here once GRN + matching data is captured.
          </div>
        )}
      </div>
    </div>
  );
}
