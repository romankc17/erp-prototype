import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useProcurement } from "../../context/ProcurementContext";
import type { ApprovalRule, TaxRule, Warehouse, DepartmentBudget, VariantAttributePreset } from "../../domain/procurement/types";

export default function ProcurementSettings() {
  const {
    settings,
    updateSettings,
    upsertApprovalRule,
    deleteApprovalRule,
    upsertTaxRule,
    deleteTaxRule,
    upsertWarehouse,
    deleteWarehouse,
    upsertBudget,
    deleteBudget,
    upsertVariantAttributePreset,
    deleteVariantAttributePreset,
  } = useProcurement();

  const [newDept, setNewDept] = useState("All");
  const [newMin, setNewMin] = useState("0");
  const [newMax, setNewMax] = useState("1000");
  const [newRole, setNewRole] = useState("Department Head");
  const [newEsc, setNewEsc] = useState("24");

  const [taxName, setTaxName] = useState("VAT 13%");
  const [taxRate, setTaxRate] = useState("0.13");
  const [taxApplies, setTaxApplies] = useState<TaxRule["appliesTo"]>("all");

  const [whName, setWhName] = useState("");
  const [whAddress, setWhAddress] = useState("");

  const [budDept, setBudDept] = useState("Marketing");
  const [budYear, setBudYear] = useState("2025-26");
  const [budCap, setBudCap] = useState("1200000");

  const [presetName, setPresetName] = useState("");
  const [presetValues, setPresetValues] = useState("");

  const approvalSorted = useMemo(
    () => [...settings.approvalRules].sort((a, b) => a.minAmount - b.minAmount),
    [settings.approvalRules],
  );

  const addApprovalRule = () => {
    const rule: ApprovalRule = {
      id: `apr-${Date.now()}`,
      department: newDept.trim() || "All",
      minAmount: Number(newMin) || 0,
      maxAmount: Number(newMax) || 0,
      approverRole: newRole.trim() || "Approver",
      escalationHours: Number(newEsc) || 24,
    };
    upsertApprovalRule(rule);
  };

  const addTaxRule = () => {
    const rule: TaxRule = {
      id: `tax-${Date.now()}`,
      name: taxName.trim() || "Tax",
      rate: Number(taxRate) || 0,
      appliesTo: taxApplies,
      enabled: true,
    };
    upsertTaxRule(rule);
  };

  const addWarehouse = () => {
    const wh: Warehouse = {
      id: `wh-${Date.now()}`,
      name: whName.trim(),
      address: whAddress.trim() || undefined,
      active: true,
    };
    if (!wh.name) return;
    upsertWarehouse(wh);
    setWhName("");
    setWhAddress("");
  };

  const addBudget = () => {
    const b: DepartmentBudget = {
      id: `bud-${Date.now()}`,
      department: budDept.trim() || "Department",
      fiscalYear: budYear.trim() || "2025-26",
      budgetCap: Number(budCap) || 0,
      committedAmount: 0,
      spentAmount: 0,
    };
    upsertBudget(b);
  };

  const addPreset = () => {
    const trimmedName = presetName.trim();
    const trimmedValues = presetValues.split(",").map((v) => v.trim()).filter(Boolean);
    if (!trimmedName || trimmedValues.length === 0) return;
    const preset: VariantAttributePreset = {
      id: `pre-${Date.now()}`,
      name: trimmedName,
      values: trimmedValues,
    };
    upsertVariantAttributePreset(preset);
    setPresetName("");
    setPresetValues("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Procurement</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configure approval rules, budgets, numbering, tax presets, and warehouses.</p>
      </div>

      {/* Document numbering + currency */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Document Numbering</h3>
          <span className="text-xs text-slate-400">PO / PR / GRN</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-2">PO</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={settings.poNumbering.prefix} onChange={(e) => updateSettings({ poNumbering: { ...settings.poNumbering, prefix: e.target.value } })} className="h-9 px-2 rounded border border-slate-300 text-sm" />
              <input value={settings.poNumbering.nextSequence} onChange={(e) => updateSettings({ poNumbering: { ...settings.poNumbering, nextSequence: Number(e.target.value) || 1 } })} className="h-9 px-2 rounded border border-slate-300 text-sm" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-2">PR</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={settings.prNumbering.prefix} onChange={(e) => updateSettings({ prNumbering: { ...settings.prNumbering, prefix: e.target.value } })} className="h-9 px-2 rounded border border-slate-300 text-sm" />
              <input value={settings.prNumbering.nextSequence} onChange={(e) => updateSettings({ prNumbering: { ...settings.prNumbering, nextSequence: Number(e.target.value) || 1 } })} className="h-9 px-2 rounded border border-slate-300 text-sm" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-2">GRN</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={settings.grnNumbering.prefix} onChange={(e) => updateSettings({ grnNumbering: { ...settings.grnNumbering, prefix: e.target.value } })} className="h-9 px-2 rounded border border-slate-300 text-sm" />
              <input value={settings.grnNumbering.nextSequence} onChange={(e) => updateSettings({ grnNumbering: { ...settings.grnNumbering, nextSequence: Number(e.target.value) || 1 } })} className="h-9 px-2 rounded border border-slate-300 text-sm" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-2">Currency Code</p>
            <input value={settings.currency.code} onChange={(e) => updateSettings({ currency: { ...settings.currency, code: e.target.value.toUpperCase() } })} className="w-full h-9 px-2 rounded border border-slate-300 text-sm" />
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-2">Currency Symbol</p>
            <input value={settings.currency.symbol} onChange={(e) => updateSettings({ currency: { ...settings.currency, symbol: e.target.value } })} className="w-full h-9 px-2 rounded border border-slate-300 text-sm" />
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-2">Year Format</p>
            <select value={settings.poNumbering.yearFormat} onChange={(e) => updateSettings({ poNumbering: { ...settings.poNumbering, yearFormat: e.target.value as "YYYY" | "YY" } })} className="w-full h-9 px-2 rounded border border-slate-300 text-sm bg-white">
              <option value="YYYY">YYYY</option>
              <option value="YY">YY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approval rules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Approval Rules</h3>
          <span className="text-xs text-slate-400">Amount bands → approver</span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          <input value={newDept} onChange={(e) => setNewDept(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Department" />
          <input value={newMin} onChange={(e) => setNewMin(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Min" />
          <input value={newMax} onChange={(e) => setNewMax(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Max" />
          <input value={newRole} onChange={(e) => setNewRole(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Approver role" />
          <input value={newEsc} onChange={(e) => setNewEsc(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Esc (hrs)" />
          <button onClick={addApprovalRule} className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {approvalSorted.map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{r.department} — {r.approverRole}</p>
                <p className="text-xs text-slate-500">Amount: {r.minAmount} to {r.maxAmount} · Escalation: {r.escalationHours}h</p>
              </div>
              <button onClick={() => deleteApprovalRule(r.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Budgets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Department Budgets</h3>
          <span className="text-xs text-slate-400">Caps per fiscal year</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <input value={budDept} onChange={(e) => setBudDept(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Department" />
          <input value={budYear} onChange={(e) => setBudYear(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Fiscal year" />
          <input value={budCap} onChange={(e) => setBudCap(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Budget cap" />
          <button onClick={addBudget} className="h-9 px-3 bg-slate-900 hover:bg-slate-950 text-white text-sm rounded-lg flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {settings.budgets.map((b) => (
            <div key={b.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{b.department} ({b.fiscalYear})</p>
                <p className="text-xs text-slate-500">Cap: {b.budgetCap} · Committed: {b.committedAmount} · Spent: {b.spentAmount}</p>
              </div>
              <button onClick={() => deleteBudget(b.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tax rules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Tax Presets</h3>
          <span className="text-xs text-slate-400">VAT / GST presets</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <input value={taxName} onChange={(e) => setTaxName(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Name" />
          <input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Rate (0.13)" />
          <select value={taxApplies} onChange={(e) => setTaxApplies(e.target.value as TaxRule["appliesTo"])} className="h-9 px-2 rounded border border-slate-300 text-sm bg-white">
            <option value="all">All</option>
            <option value="domestic">Domestic</option>
            <option value="import">Import</option>
          </select>
          <button onClick={addTaxRule} className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {settings.taxRules.map((t) => (
            <div key={t.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{t.name} ({Math.round(t.rate * 100)}%)</p>
                <p className="text-xs text-slate-500">{t.appliesTo} · {t.enabled ? "Enabled" : "Disabled"}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => upsertTaxRule({ ...t, enabled: !t.enabled })}
                  className={`h-8 px-2 rounded-lg text-xs font-semibold ${t.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {t.enabled ? "On" : "Off"}
                </button>
                <button onClick={() => deleteTaxRule(t.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warehouses */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Warehouses / Delivery Locations</h3>
          <span className="text-xs text-slate-400">Receiving locations</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input value={whName} onChange={(e) => setWhName(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Warehouse name" />
          <input value={whAddress} onChange={(e) => setWhAddress(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Address (optional)" />
          <button onClick={addWarehouse} className="h-9 px-3 bg-slate-900 hover:bg-slate-950 text-white text-sm rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {settings.warehouses.map((w) => (
            <div key={w.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{w.name}</p>
                <p className="text-xs text-slate-500">{w.address ?? "-"} · {w.active ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => upsertWarehouse({ ...w, active: !w.active })}
                  className={`h-8 px-2 rounded-lg text-xs font-semibold ${w.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {w.active ? "On" : "Off"}
                </button>
                <button onClick={() => deleteWarehouse(w.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variant Attribute Presets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Variant Attribute Presets</h3>
          <span className="text-xs text-slate-400">Pre-defined Color, Size, Material values</span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2">
          <input value={presetName} onChange={(e) => setPresetName(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Name (e.g., Color)" />
          <input value={presetValues} onChange={(e) => setPresetValues(e.target.value)} className="h-9 px-2 rounded border border-slate-300 text-sm" placeholder="Values: Red, Blue, Black..." />
          <button onClick={addPreset} className="h-9 px-3 bg-slate-900 hover:bg-slate-950 text-white text-sm rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {settings.variantAttributePresets.map((p) => (
            <div key={p.id} className="p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{p.name}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {p.values.map((v) => (
                    <span key={v} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{v}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => deleteVariantAttributePreset(p.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
