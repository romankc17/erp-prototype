import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Store, Warehouse, Briefcase, Building2, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import type { Branch, BranchType, StorageLocation } from "../../domain/workspace/types";

const typeIcons: Record<BranchType, typeof Store> = {
  retail_store: Store, warehouse: Warehouse, corporate_office: Briefcase, franchise: Building2,
};

const typeColors: Record<BranchType, { bg: string; text: string; border: string; badge: string }> = {
  retail_store: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  warehouse: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  corporate_office: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", badge: "bg-slate-100 text-slate-700" },
  franchise: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
};

const typeLabels: Record<BranchType, string> = {
  retail_store: "Retail Store", warehouse: "Warehouse", corporate_office: "Corporate Office", franchise: "Franchise",
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultOperatingHours(): Branch["operatingHours"] {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days.map((day) => ({ day, open: "09:00", close: "21:00", isClosed: day === "Saturday" }));
}

export default function BranchesSettings() {
  const { branches, addBranch, updateBranch, deleteBranch, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Branch>>({
    code: "", name: "", type: "retail_store", address: "", phone: "",
    timezone: "Asia/Kathmandu", currency: "NPR",
    receiptHeader: "", receiptFooter: "", isActive: true,
    operatingHours: defaultOperatingHours(), storageLocations: [],
    taxRules: [{ id: uid("tax"), name: "VAT 13%", rate: 0.13, enabled: true }],
    holidays: [],
  });

  const resetForm = () => {
    setForm({
      code: "", name: "", type: "retail_store", address: "", phone: "",
      timezone: "Asia/Kathmandu", currency: "NPR",
      receiptHeader: "", receiptFooter: "", isActive: true,
      operatingHours: defaultOperatingHours(), storageLocations: [],
      taxRules: [{ id: uid("tax"), name: "VAT 13%", rate: 0.13, enabled: true }],
      holidays: [],
    });
  };

  const startAdd = () => { resetForm(); setShowAdd(true); setEditingId(null); };
  const startEdit = (branch: Branch) => { setForm({ ...branch }); setEditingId(branch.id); setShowAdd(false); setExpandedId(branch.id); };

  const save = () => {
    if (!form.code?.trim() || !form.name?.trim() || !form.address?.trim()) return;
    const payload: Omit<Branch, "id" | "createdAt"> = {
      code: form.code.trim(), name: form.name.trim(),
      type: (form.type as BranchType) || "retail_store",
      address: form.address.trim(), phone: form.phone?.trim() || "",
      timezone: form.timezone || "Asia/Kathmandu", currency: form.currency || "NPR",
      receiptHeader: form.receiptHeader?.trim() || "", receiptFooter: form.receiptFooter?.trim() || "",
      isActive: form.isActive ?? true, operatingHours: form.operatingHours || defaultOperatingHours(),
      storageLocations: form.storageLocations || [], taxRules: form.taxRules || [], holidays: form.holidays || [],
    };
    if (editingId) { updateBranch(editingId, payload); setEditingId(null); }
    else { addBranch(payload); setShowAdd(false); }
    resetForm();
  };

  const cancel = () => { setShowAdd(false); setEditingId(null); resetForm(); };

  const toggleDayClosed = (dayIndex: number) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours?.map((oh, i) => (i === dayIndex ? { ...oh, isClosed: !oh.isClosed } : oh)) || [],
    }));
  };

  const updateDayTime = (dayIndex: number, field: "open" | "close", value: string) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours?.map((oh, i) => (i === dayIndex ? { ...oh, [field]: value } : oh)) || [],
    }));
  };

  const addStorageLocation = () => {
    setForm((prev) => ({
      ...prev,
      storageLocations: [...(prev.storageLocations || []), { id: uid("loc"), name: "New Location", type: "shelf" }],
    }));
  };

  const updateStorageLocation = (index: number, patch: Partial<StorageLocation>) => {
    setForm((prev) => ({
      ...prev,
      storageLocations: prev.storageLocations?.map((loc, i) => (i === index ? { ...loc, ...patch } : loc)) || [],
    }));
  };

  const removeStorageLocation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      storageLocations: prev.storageLocations?.filter((_, i) => i !== index) || [],
    }));
  };

  const isFormOpen = showAdd || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Branches &amp; Workspaces</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage all your business locations, warehouses, and offices. Each branch becomes a workspace that users can operate in.</p>
        </div>
        <button onClick={startAdd} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Branches", value: branches.length, color: "bg-blue-50 text-blue-700" },
          { label: "Retail Stores", value: branches.filter((b) => b.type === "retail_store").length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Warehouses", value: branches.filter((b) => b.type === "warehouse").length, color: "bg-amber-50 text-amber-700" },
          { label: "Active Workspaces", value: branches.filter((b) => b.isActive).length, color: "bg-slate-50 text-slate-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color.split(" ")[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{editingId ? "Edit Branch" : "Add New Branch"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Branch Code</label><input value={form.code || ""} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g., THM-01" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Branch Name</label><input value={form.name || ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Thamel Outlet Store" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Type</label><select value={form.type || "retail_store"} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as BranchType }))} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"><option value="retail_store">Retail Store</option><option value="warehouse">Warehouse</option><option value="corporate_office">Corporate Office</option><option value="franchise">Franchise</option></select></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Phone</label><input value={form.phone || ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+977-1-4412345" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Address</label><input value={form.address || ""} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Full address" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Timezone</label><input value={form.timezone || ""} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} placeholder="Asia/Kathmandu" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Currency</label><input value={form.currency || ""} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} placeholder="NPR" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Receipt Header</label><input value={form.receiptHeader || ""} onChange={(e) => setForm((p) => ({ ...p, receiptHeader: e.target.value }))} placeholder="Line 1" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Receipt Footer</label><input value={form.receiptFooter || ""} onChange={(e) => setForm((p) => ({ ...p, receiptFooter: e.target.value }))} placeholder="Thank you message" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700 mb-2">Operating Hours</label>
            <div className="grid grid-cols-7 gap-2">
              {form.operatingHours?.map((oh, i) => (
                <div key={oh.day} className={`rounded-lg border p-2 ${oh.isClosed ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-700">{oh.day.slice(0,3)}</span>
                    <button onClick={() => toggleDayClosed(i)} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${oh.isClosed ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>{oh.isClosed ? "Closed" : "Open"}</button>
                  </div>
                  {!oh.isClosed && (
                    <div className="space-y-1">
                      <input type="time" value={oh.open} onChange={(e) => updateDayTime(i, "open", e.target.value)} className="w-full h-7 px-1 rounded border border-slate-200 text-[11px] focus:outline-none focus:border-blue-500" />
                      <input type="time" value={oh.close} onChange={(e) => updateDayTime(i, "close", e.target.value)} className="w-full h-7 px-1 rounded border border-slate-200 text-[11px] focus:outline-none focus:border-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-700">Storage Locations</label>
              <button onClick={addStorageLocation} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">+ Add Location</button>
            </div>
            <div className="space-y-2">
              {form.storageLocations?.map((loc, i) => (
                <div key={loc.id} className="flex items-center gap-2">
                  <input value={loc.name} onChange={(e) => updateStorageLocation(i, { name: e.target.value })} placeholder="Location name" className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  <select value={loc.type} onChange={(e) => updateStorageLocation(i, { type: e.target.value as StorageLocation["type"] })} className="h-9 px-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="shelf">Shelf</option><option value="counter">Counter</option><option value="back_office">Back Office</option><option value="cold_storage">Cold Storage</option><option value="floor">Floor</option><option value="rack">Rack</option>
                  </select>
                  <button onClick={() => removeStorageLocation(i)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {(form.storageLocations?.length ?? 0) === 0 && <p className="text-xs text-slate-400 py-2">No storage locations defined yet.</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-500" />
            <label className="text-sm text-slate-700">Branch is active and available as a workspace</label>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={save} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"><Check className="w-4 h-4" /> {editingId ? "Update Branch" : "Create Branch"}</button>
            <button onClick={cancel} className="h-10 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {branches.map((branch) => {
            const Icon = typeIcons[branch.type];
            const colors = typeColors[branch.type];
            const isExpanded = expandedId === branch.id;
            const isActive = activeWorkspace?.branchId === branch.id;
            return (
              <div key={branch.id}>
                <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${isExpanded ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{branch.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge}`}>{typeLabels[branch.type]}</span>
                      {!branch.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Inactive</span>}
                      {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">Current Workspace</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono">{branch.code}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {branch.address}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {branch.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!isActive && branch.isActive && (
                      <button onClick={() => setActiveWorkspace(branch.id)} className="h-8 px-3 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Switch</button>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : branch.id)} className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 flex items-center justify-center transition-colors">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                    <button onClick={() => startEdit(branch)} className="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(branch.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 bg-slate-50">
                    <div className="ml-14 grid grid-cols-3 gap-4 text-xs">
                      <div><p className="text-slate-400 mb-1">Timezone</p><p className="text-slate-700 font-medium">{branch.timezone}</p></div>
                      <div><p className="text-slate-400 mb-1">Currency</p><p className="text-slate-700 font-medium">{branch.currency}</p></div>
                      <div><p className="text-slate-400 mb-1">Storage Locations</p><p className="text-slate-700 font-medium">{branch.storageLocations.length} locations</p></div>
                      <div className="col-span-3">
                        <p className="text-slate-400 mb-1">Operating Hours</p>
                        <div className="flex flex-wrap gap-1.5">
                          {branch.operatingHours.map((oh) => (
                            <span key={oh.day} className={`px-2 py-0.5 rounded border text-[11px] ${oh.isClosed ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                              {oh.day.slice(0,3)}: {oh.isClosed ? "Closed" : `${oh.open}-${oh.close}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      {branch.storageLocations.length > 0 && (
                        <div className="col-span-3">
                          <p className="text-slate-400 mb-1">Storage Locations</p>
                          <div className="flex flex-wrap gap-1.5">
                            {branch.storageLocations.map((loc) => (
                              <span key={loc.id} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600">
                                {loc.name} <span className="text-slate-400">({loc.type.replace("_", " ")})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {branches.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-slate-400">No branches configured yet. Add your first branch to get started.</p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Branch</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to delete &quot;{branches.find((b) => b.id === deleteConfirm)?.name}&quot;? This will remove the branch and all associated workspace data.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => { deleteBranch(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 h-10 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
