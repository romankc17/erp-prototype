import type {
  ApprovalRule,
  DepartmentBudget,
  ProcurementSettings,
  TaxRule,
  VendorPriceListItem,
  VendorProfile,
  Warehouse,
} from "@/domain/procurement/types";
import { vendors as seedVendors } from "@/data";

const STORAGE_KEY = "procurement_state_v1";

type ProcurementState = {
  version: 1;
  settings: ProcurementSettings;
  vendors: VendorProfile[];
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function numbering(prefix: string, nextSequence: number) {
  return { prefix, yearFormat: "YYYY" as const, sequenceLength: 4, nextSequence };
}

function seedSettings(): ProcurementSettings {
  return {
    approvalRules: [
      { id: uid("apr"), department: "All", minAmount: 0, maxAmount: 1000, approverRole: "Department Head", escalationHours: 24 },
      { id: uid("apr"), department: "All", minAmount: 1000, maxAmount: 10000, approverRole: "Finance Director", escalationHours: 24 },
      { id: uid("apr"), department: "All", minAmount: 10000, maxAmount: 999999999, approverRole: "CEO", escalationHours: 24 },
    ],
    budgets: [
      { id: uid("bud"), department: "Marketing", fiscalYear: "2025-26", budgetCap: 1200000, committedAmount: 0, spentAmount: 0 },
      { id: uid("bud"), department: "Operations", fiscalYear: "2025-26", budgetCap: 2500000, committedAmount: 0, spentAmount: 0 },
    ],
    poNumbering: numbering("PO", 1),
    prNumbering: numbering("PR", 1),
    grnNumbering: numbering("GRN", 1),
    taxRules: [
      { id: "vat13", name: "VAT 13%", rate: 0.13, appliesTo: "all", enabled: true },
      { id: "vat5", name: "VAT 5%", rate: 0.05, appliesTo: "domestic", enabled: false },
    ],
    currency: { code: "NPR", symbol: "Rs." },
    warehouses: [
      { id: uid("wh"), name: "Main Warehouse", address: "Kathmandu", active: true },
      { id: uid("wh"), name: "Thamel Outlet Store", address: "Thamel, Kathmandu", active: true },
    ],
    variantAttributePresets: [
      { id: uid("pre"), name: "Color", values: ["Red", "Blue", "Black", "White", "Green", "Navy", "Grey", "Maroon", "Beige", "Olive"] },
      { id: uid("pre"), name: "Size", values: ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"] },
      { id: uid("pre"), name: "Material", values: ["Cotton", "Polyester", "Silk", "Linen", "Wool"] },
    ],
  };
}

function toVendorProfile(v: { id: number; name: string; contactPerson: string; email: string; phone: string; address: string; panNumber?: string; status: string }): VendorProfile {
  return {
    ...v,
    status: v.status as "Active" | "Inactive",
    paymentTerms: "Net 30",
    leadTimeDays: 7,
    performanceRating: 4,
    onTimeDeliveryRate: 92,
    qualityRating: 4,
    categorySpecialization: [],
    isPreferred: false,
    priceList: [],
  };
}

function seedState(): ProcurementState {
  return {
    version: 1,
    settings: seedSettings(),
    vendors: seedVendors.map(toVendorProfile),
  };
}

function loadState(): ProcurementState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as ProcurementState;
    if (parsed?.version !== 1) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

function saveState(state: ProcurementState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function replaceById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = [...list];
  next[idx] = item;
  return next;
}

function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<ProcurementSettings> {
  await delay(200);
  return loadState().settings;
}

export async function updateSettings(patch: Partial<ProcurementSettings>) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = { ...state, settings: { ...state.settings, ...patch } };
  saveState(next);
  return next.settings;
}

export async function upsertApprovalRule(rule: ApprovalRule) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, approvalRules: replaceById(state.settings.approvalRules, rule) },
  };
  saveState(next);
  return next.settings.approvalRules;
}

export async function deleteApprovalRule(id: string) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, approvalRules: state.settings.approvalRules.filter((r) => r.id !== id) },
  };
  saveState(next);
}

export async function upsertTaxRule(rule: TaxRule) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, taxRules: replaceById(state.settings.taxRules, rule) },
  };
  saveState(next);
  return next.settings.taxRules;
}

export async function deleteTaxRule(id: string) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, taxRules: state.settings.taxRules.filter((r) => r.id !== id) },
  };
  saveState(next);
}

export async function upsertWarehouse(wh: Warehouse) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, warehouses: replaceById(state.settings.warehouses, wh) },
  };
  saveState(next);
  return next.settings.warehouses;
}

export async function deleteWarehouse(id: string) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, warehouses: state.settings.warehouses.filter((w) => w.id !== id) },
  };
  saveState(next);
}

export async function upsertBudget(b: DepartmentBudget) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, budgets: replaceById(state.settings.budgets, b) },
  };
  saveState(next);
  return next.settings.budgets;
}

export async function deleteBudget(id: string) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, budgets: state.settings.budgets.filter((b) => b.id !== id) },
  };
  saveState(next);
}

// ─── Variant Attribute Presets ───────────────────────────────────────────────

export async function getVariantAttributePresets() {
  await delay(100);
  return loadState().settings.variantAttributePresets;
}

export async function upsertVariantAttributePreset(preset: { id: string; name: string; values: string[] }) {
  await delay(200);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, variantAttributePresets: replaceById(state.settings.variantAttributePresets, preset) },
  };
  saveState(next);
  return next.settings.variantAttributePresets;
}

export async function deleteVariantAttributePreset(id: string) {
  await delay(200);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    settings: { ...state.settings, variantAttributePresets: state.settings.variantAttributePresets.filter((p) => p.id !== id) },
  };
  saveState(next);
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export async function getVendors(): Promise<VendorProfile[]> {
  await delay(200);
  return loadState().vendors;
}

export async function getVendorById(id: number): Promise<VendorProfile | null> {
  await delay(100);
  return loadState().vendors.find((v) => v.id === id) ?? null;
}

export async function createVendor(v: Omit<VendorProfile, "id">) {
  await delay(400);
  const state = loadState();
  const nextId = Math.max(0, ...state.vendors.map((x) => x.id)) + 1;
  const created: VendorProfile = { ...v, id: nextId };
  const next: ProcurementState = { ...state, vendors: [created, ...state.vendors] };
  saveState(next);
  return created;
}

export async function updateVendor(id: number, patch: Partial<VendorProfile>) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...patch, id: v.id } : v)),
  };
  saveState(next);
  return next.vendors.find((v) => v.id === id)!;
}

export async function deleteVendor(id: number) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = { ...state, vendors: state.vendors.filter((v) => v.id !== id) };
  saveState(next);
}

export async function upsertVendorPriceListItem(vendorId: number, item: VendorPriceListItem) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    vendors: state.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      const nextList = replaceById(v.priceList, item);
      return { ...v, priceList: nextList };
    }),
  };
  saveState(next);
}

export async function deleteVendorPriceListItem(vendorId: number, itemId: string) {
  await delay(300);
  const state = loadState();
  const next: ProcurementState = {
    ...state,
    vendors: state.vendors.map((v) =>
      v.id === vendorId ? { ...v, priceList: v.priceList.filter((i) => i.id !== itemId) } : v
    ),
  };
  saveState(next);
}
