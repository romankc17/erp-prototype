import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ApprovalRule,
  ProcurementSettings,
  VendorPriceListItem,
  VendorProfile,
  Warehouse,
  TaxRule,
  DepartmentBudget,
  VariantAttributePreset,
} from "@/domain/procurement/types";
import * as procurementService from "@/services/procurementService";

type ProcurementCtx = {
  loading: boolean;
  settings: ProcurementSettings;
  vendors: VendorProfile[];

  // settings
  updateSettings: (patch: Partial<ProcurementSettings>) => Promise<void>;
  upsertApprovalRule: (rule: ApprovalRule) => Promise<void>;
  deleteApprovalRule: (id: string) => Promise<void>;
  upsertTaxRule: (rule: TaxRule) => Promise<void>;
  deleteTaxRule: (id: string) => Promise<void>;
  upsertWarehouse: (wh: Warehouse) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  upsertBudget: (b: DepartmentBudget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // variant attribute presets
  upsertVariantAttributePreset: (preset: VariantAttributePreset) => Promise<void>;
  deleteVariantAttributePreset: (id: string) => Promise<void>;

  // vendors
  addVendor: (v: Omit<VendorProfile, "id">) => Promise<VendorProfile>;
  updateVendor: (id: number, patch: Partial<VendorProfile>) => Promise<void>;
  deleteVendor: (id: number) => Promise<void>;
  upsertVendorPriceListItem: (vendorId: number, item: VendorPriceListItem) => Promise<void>;
  deleteVendorPriceListItem: (vendorId: number, itemId: string) => Promise<void>;

  refresh: () => Promise<void>;
};

const ProcurementContext = createContext<ProcurementCtx | null>(null);

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ProcurementSettings | null>(null);
  const [vendors, setVendors] = useState<VendorProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [s, v] = await Promise.all([
      procurementService.getSettings(),
      procurementService.getVendors(),
    ]);
    setSettings(s);
    setVendors(v);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [s, v] = await Promise.all([
        procurementService.getSettings(),
        procurementService.getVendors(),
      ]);
      if (mounted) {
        setSettings(s);
        setVendors(v);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updateSettings = async (patch: Partial<ProcurementSettings>) => {
    await procurementService.updateSettings(patch);
    await refresh();
  };

  const upsertApprovalRule = async (rule: ApprovalRule) => {
    await procurementService.upsertApprovalRule(rule);
    await refresh();
  };

  const deleteApprovalRule = async (id: string) => {
    await procurementService.deleteApprovalRule(id);
    await refresh();
  };

  const upsertTaxRule = async (rule: TaxRule) => {
    await procurementService.upsertTaxRule(rule);
    await refresh();
  };

  const deleteTaxRule = async (id: string) => {
    await procurementService.deleteTaxRule(id);
    await refresh();
  };

  const upsertWarehouse = async (wh: Warehouse) => {
    await procurementService.upsertWarehouse(wh);
    await refresh();
  };

  const deleteWarehouse = async (id: string) => {
    await procurementService.deleteWarehouse(id);
    await refresh();
  };

  const upsertBudget = async (b: DepartmentBudget) => {
    await procurementService.upsertBudget(b);
    await refresh();
  };

  const deleteBudget = async (id: string) => {
    await procurementService.deleteBudget(id);
    await refresh();
  };

  const upsertVariantAttributePreset = async (preset: VariantAttributePreset) => {
    await procurementService.upsertVariantAttributePreset(preset);
    await refresh();
  };

  const deleteVariantAttributePreset = async (id: string) => {
    await procurementService.deleteVariantAttributePreset(id);
    await refresh();
  };

  const addVendor = async (v: Omit<VendorProfile, "id">) => {
    const created = await procurementService.createVendor(v);
    await refresh();
    return created;
  };

  const updateVendor = async (id: number, patch: Partial<VendorProfile>) => {
    await procurementService.updateVendor(id, patch);
    await refresh();
  };

  const deleteVendor = async (id: number) => {
    await procurementService.deleteVendor(id);
    await refresh();
  };

  const upsertVendorPriceListItem = async (vendorId: number, item: VendorPriceListItem) => {
    await procurementService.upsertVendorPriceListItem(vendorId, item);
    await refresh();
  };

  const deleteVendorPriceListItem = async (vendorId: number, itemId: string) => {
    await procurementService.deleteVendorPriceListItem(vendorId, itemId);
    await refresh();
  };

  const ctx = useMemo<ProcurementCtx>(
    () => ({
      loading,
      settings: settings ?? seedSettings(),
      vendors: vendors ?? [],
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
      addVendor,
      updateVendor,
      deleteVendor,
      upsertVendorPriceListItem,
      deleteVendorPriceListItem,
      refresh,
    }),
    [loading, settings, vendors]
  );

  return <ProcurementContext.Provider value={ctx}>{children}</ProcurementContext.Provider>;
}

function seedSettings(): ProcurementSettings {
  return {
    approvalRules: [],
    budgets: [],
    poNumbering: { prefix: "PO", yearFormat: "YYYY", sequenceLength: 4, nextSequence: 1 },
    prNumbering: { prefix: "PR", yearFormat: "YYYY", sequenceLength: 4, nextSequence: 1 },
    grnNumbering: { prefix: "GRN", yearFormat: "YYYY", sequenceLength: 4, nextSequence: 1 },
    taxRules: [],
    currency: { code: "NPR", symbol: "Rs." },
    warehouses: [],
    variantAttributePresets: [],
  };
}

export function useProcurement() {
  const ctx = useContext(ProcurementContext);
  if (!ctx) throw new Error("useProcurement must be used within ProcurementProvider");
  return ctx;
}
