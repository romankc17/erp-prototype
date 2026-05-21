export type Role = "cashier" | "manager" | "admin";

export type Currency = {
  code: string; // e.g. "NPR"
  symbol: string; // e.g. "Rs."
  locale: string; // e.g. "en-IN"
};

export type TaxRule = {
  id: string;
  name: string;
  rate: number; // 0.13 for 13%
  enabled: boolean;
};

export type StoreProfile = {
  businessName: string;
  location: string;
  receiptFooter: string;
  currency: Currency;
  taxRules: TaxRule[];
};

export type HardwarePreferences = {
  receiptPrinterEnabled: boolean;
  barcodeScannerEnabled: boolean;
  cashDrawerEnabled: boolean;
  paymentTerminalEnabled: boolean;
  autoOpenCashDrawerOnCashSale: boolean;
};

export type ReceiptNumbering = {
  prefix: string; // e.g. "REC"
  includeDate: boolean;
  sequenceDigits: number; // e.g. 4 => 0001
  nextSequence: number;
};

export type DiscountPolicy = {
  managerOverridePercentThreshold: number; // if discount% > threshold => manager PIN
  managerOverrideFixedThreshold: number; // if fixed discount > threshold => manager PIN
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  pin: string; // demo only
  active: boolean;
  assignedBranches: string[]; // branch IDs
  primaryBranchId: string | null;
  canSwitchWorkspaces: boolean;
  crossBranchPermissions: string[]; // e.g., ["view_reports", "view_inventory"]
};

export type AuthSession = {
  userId: string | null;
  locked: boolean;
  lockReason: "idle" | "manual" | null;
  lastActiveAt: string | null; // ISO
};

export type ShiftCashMovement = {
  id: string;
  shiftId: string;
  type: "paid_in" | "paid_out";
  amount: number;
  reason: string;
  createdAt: string; // ISO
  staffId: string;
};

export type Shift = {
  id: string;
  status: "open" | "closed";
  openedAt: string; // ISO
  openedBy: string; // staffId
  openingCash: number;

  closedAt: string | null; // ISO
  closedBy: string | null; // staffId
  countedCash: number | null;
  expectedCash: number;
  shortOver: number | null;

  cashMovements: ShiftCashMovement[];
};

export type PaymentMethod = "cash" | "card" | "digital_wallet" | "store_credit";

export type Payment = {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference: string | null;
};

export type TransactionLine = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  variant: string;
  unit: string;
  qty: number; // can be negative for returns/exchanges
  unitPrice: number;
  discountAmount: number; // line-level discount (absolute)
  taxRate: number; // 0.13, 0.05 etc
};

export type TransactionTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

export type Transaction = {
  id: string;
  receiptNumber: string;
  status: "completed" | "void";
  type: "sale" | "return";
  originalReceiptNumber: string | null;

  createdAt: string; // ISO
  shiftId: string;
  staffId: string;
  customerName: string;

  lines: TransactionLine[];
  totals: TransactionTotals;
  payments: Payment[];
};

export type HeldCart = {
  id: string;
  note: string;
  createdAt: string; // ISO
  staffId: string;
  customerName: string;
  lines: Array<{
    productId: string;
    sku: string;
    name: string;
    variant: string;
    unit: string;
    qty: number;
    unitPrice: number;
  }>;
};

export type AuditEvent = {
  id: string;
  at: string; // ISO
  staffId: string | null;
  action:
    | "auth.login"
    | "auth.logout"
    | "auth.lock"
    | "auth.unlock"
    | "shift.open"
    | "shift.close"
    | "shift.cash_movement"
    | "product.import"
    | "product.create"
    | "product.update"
    | "product.delete"
    | "product.update_stock"
    | "tx.create"
    | "tx.return";
  meta: Record<string, unknown>;
};

export type AppState = {
  version: 1;
  store: StoreProfile;
  hardware: HardwarePreferences;
  receipt: ReceiptNumbering;
  discountPolicy: DiscountPolicy;

  categories: string[];
  products: import("../../data/clothingData").Product[];

  users: User[];
  auth: AuthSession;

  shifts: Shift[];
  activeShiftId: string | null;

  transactions: Transaction[];
  heldCarts: HeldCart[];

  audit: AuditEvent[];
};
