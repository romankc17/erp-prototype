export interface ApprovalRule {
  id: string;
  department: string;
  minAmount: number;
  maxAmount: number;
  approverRole: string;
  approverUserId?: string;
  escalationHours: number;
}

export interface DepartmentBudget {
  id: string;
  department: string;
  fiscalYear: string;
  budgetCap: number;
  committedAmount: number;
  spentAmount: number;
}

export interface DocumentNumbering {
  prefix: string;
  yearFormat: "YYYY" | "YY";
  sequenceLength: number;
  nextSequence: number;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  appliesTo: "all" | "import" | "domestic";
  enabled: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  active: boolean;
}

export interface VariantAttributePreset {
  id: string;
  name: string;
  values: string[];
}

export interface ProcurementSettings {
  approvalRules: ApprovalRule[];
  budgets: DepartmentBudget[];
  poNumbering: DocumentNumbering;
  prNumbering: DocumentNumbering;
  grnNumbering: DocumentNumbering;
  taxRules: TaxRule[];
  currency: { code: string; symbol: string };
  warehouses: Warehouse[];
  variantAttributePresets: VariantAttributePreset[];
}

export interface VendorPriceListItem {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  negotiatedPrice: number;
  minOrderQty: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface VendorProfile {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  panNumber?: string;
  status: "Active" | "Inactive";

  paymentTerms: string;
  leadTimeDays: number;
  performanceRating: number; // 1-5
  onTimeDeliveryRate: number; // 0-100
  qualityRating: number; // 1-5
  categorySpecialization: string[];
  isPreferred: boolean;
  priceList: VendorPriceListItem[];
}

