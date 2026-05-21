import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Store, X, Check, Pencil, Trash2, Eye,
  Package, IndianRupee,
} from "lucide-react";
import { useProcurement } from "../context/ProcurementContext";
import type { VendorProfile } from "../domain/procurement/types";

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
};

export default function Vendors() {
  const navigate = useNavigate();
  const { vendors, addVendor, updateVendor, deleteVendor } = useProcurement();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<VendorProfile | null>(null);
  const [form, setForm] = useState<{ name: string; contactPerson: string; email: string; phone: string; address: string; status: "Active" | "Inactive" }>({ name: "", contactPerson: "", email: "", phone: "", address: "", status: "Active" });

  const filtered = vendors.filter((v) => {
    const matchSearch = search === "" || v.name.toLowerCase().includes(search.toLowerCase()) || v.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => { setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(v => v.id))); };
  const clearSelection = () => setSelectedIds(new Set());

  const handleSave = () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) return;
    if (editVendor) {
      updateVendor(editVendor.id, {
        name: trimmedName,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: form.address,
        status: form.status,
      });
    } else {
      addVendor({
        name: trimmedName,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: form.address,
        status: form.status,
        paymentTerms: "Net 30",
        leadTimeDays: 7,
        performanceRating: 3,
        onTimeDeliveryRate: 0,
        qualityRating: 3,
        categorySpecialization: [],
        isPreferred: false,
        priceList: [],
      });
    }
    setShowAdd(false);
    setEditVendor(null);
    setForm({ name: "", contactPerson: "", email: "", phone: "", address: "", status: "Active" });
  };

  const openEdit = (v: VendorProfile) => {
    setEditVendor(v);
    setForm({ name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, address: v.address, status: v.status });
    setShowAdd(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Contacts / Vendors</p>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage vendors and suppliers for purchase orders.</p>
        </div>
        <button onClick={() => { setEditVendor(null); setShowAdd(true); }} className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Store className="w-5 h-5 text-amber-500" /></div>
            <div><p className="text-xl font-bold text-slate-900">{vendors.length}</p><p className="text-xs text-slate-500">Total Vendors</p></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><Check className="w-5 h-5 text-emerald-500" /></div>
            <div><p className="text-xl font-bold text-slate-900">{vendors.filter(v => v.status === "Active").length}</p><p className="text-xs text-slate-500">Active</p></div>
          </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Package className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-xl font-bold text-slate-900">12</p><p className="text-xs text-slate-500">Total POs</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-violet-500" /></div>
          <div><p className="text-xl font-bold text-slate-900">Rs. 4,75,000</p><p className="text-xs text-slate-500">Total Purchased</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search vendor name, contact person..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white">
          <option>All</option><option>Active</option><option>Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
              <button onClick={clearSelection} className="h-8 px-3 text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Clear</button>
            </div>
          ) : <span className="text-sm text-slate-400">0 selected</span>}
          <span className="text-xs text-slate-400">{filtered.length} vendors</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50 text-left">
              <th className="px-4 py-3 w-10"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4" /></th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Contact Person</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Address</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase w-24">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)} className="w-4 h-4" /></td>
                  <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-900">{v.name}</p></td>
                  <td className="px-4 py-3 text-sm text-slate-700">{v.contactPerson}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{v.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{v.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{v.address}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[v.status]}`}>{v.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/vendors/${v.id}`)} className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center" title="Open profile"><Eye className="w-3.5 h-3.5 text-blue-500" /></button>
                      <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center" title="Edit"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                      <button onClick={() => setDeleteConfirm(v)} className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-xl w-[440px]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editVendor ? "Edit Vendor" : "Add New Vendor"}</h3>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name <span className="text-red-500">*</span></label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label><input type="text" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value as "Active" | "Inactive"})} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-slate-300 text-slate-700 text-sm rounded-lg">Cancel</button>
              <button onClick={handleSave} className="h-9 px-4 bg-blue-500 text-white text-sm rounded-lg">{editVendor ? "Update" : "Save"} Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Vendor</h3>
            <p className="text-xs text-slate-500 mb-4">Delete “{deleteConfirm.name}”? This will not delete past POs in this prototype.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => { deleteVendor(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 h-10 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
