import { useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { Users, Shield, Building2, Tag, LayoutGrid, Plus, Pencil, Trash2, X, Check, Layers, GitBranch } from "lucide-react";
import SettingsUsers from "./SettingsUsers";
import SettingsRoles from "./SettingsRoles";
import SettingsModules from "./SettingsModules";
import SettingsCompany from "./SettingsCompany";
import ProcurementSettings from "./ProcurementSettings";
import BranchesSettings from "./BranchesSettings";

const settingsNav = [
  { id: "users", label: "Users", icon: Users, path: "/settings/users" },
  { id: "roles", label: "Roles & Permissions", icon: Shield, path: "/settings/roles" },
  { id: "company", label: "Company Info", icon: Building2, path: "/settings/company" },
  { id: "branches", label: "Branches", icon: GitBranch, path: "/settings/branches" },
  { id: "categories", label: "Product Categories", icon: Tag, path: "/settings/categories" },
  { id: "procurement", label: "Procurement", icon: Layers, path: "/settings/procurement" },
  { id: "modules", label: "Module Settings", icon: LayoutGrid, path: "/settings/modules" },
];

interface Category {
  id: string;
  name: string;
  productCount: number;
}

function ProductCategories() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat-1", name: "Pant", productCount: 4 },
    { id: "cat-2", name: "T-Shirt", productCount: 4 },
    { id: "cat-3", name: "Kurta", productCount: 4 },
    { id: "cat-4", name: "Accessories", productCount: 8 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addCategory = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    setCategories([...categories, { id: `cat-${Date.now()}`, name: trimmed, productCount: 0 }]);
    setNewName("");
    setShowAdd(false);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed || !editingId) return;
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editingId)) return;
    setCategories(categories.map(c => c.id === editingId ? { ...c, name: trimmed } : c));
    setEditingId(null);
    setEditName("");
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage product categories for inventory organization. Categories are used across products, POS, and reports.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Add New Category</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Enter category name (e.g. Jacket, Shoes...)"
              onKeyDown={e => e.key === "Enter" && addCategory()}
              className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
            <button onClick={addCategory} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors">
              <Check className="w-4 h-4" /> Save
            </button>
            <button onClick={() => { setShowAdd(false); setNewName(""); }} className="h-10 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category Name</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Products Count</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No categories yet. Add your first category above.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                        className="h-8 px-2 rounded border border-blue-300 text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setEditingId(null)} className="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">{cat.productCount} products</td>
                <td className="px-5 py-3 text-right">
                  {editingId !== cat.id && (
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(cat)} className="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(cat.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-[360px]" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Category</h3>
            <p className="text-xs text-slate-500 mb-4">Are you sure you want to delete &quot;{categories.find(c => c.id === deleteConfirm)?.name}&quot;? This will not delete any products in this category.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteCategory(deleteConfirm)} className="flex-1 h-10 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsLayout() {
  return (
    <div className="flex gap-6" style={{ minHeight: "calc(100vh - 140px)" }}>
      {/* Left Sidebar */}
      <div className="w-64 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your business</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-500"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent"
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <Routes>
          <Route path="users" element={<SettingsUsers />} />
          <Route path="roles" element={<SettingsRoles />} />
          <Route path="modules" element={<SettingsModules />} />
          <Route path="company" element={<SettingsCompany />} />
          <Route path="categories" element={<ProductCategories />} />
          <Route path="procurement" element={<ProcurementSettings />} />
          <Route path="branches" element={<BranchesSettings />} />
          <Route path="*" element={<Navigate to="company" replace />} />
        </Routes>
      </div>
    </div>
  );
}
