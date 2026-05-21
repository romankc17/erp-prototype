export const DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1] as const;
export type Denomination = (typeof DENOMINATIONS)[number];

export const BRANCHES = [
  { id: "b1", name: "Main Branch – Thamel" },
  { id: "b2", name: "Pokhara Branch" },
  { id: "b3", name: "Butwal Branch" },
];

export const REGISTERS = [
  { id: "r1", name: "Counter 1", branchId: "b1" },
  { id: "r2", name: "Counter 2", branchId: "b1" },
  { id: "r3", name: "Counter 1", branchId: "b2" },
  { id: "r4", name: "Counter 1", branchId: "b3" },
];

export type UserRole = "cashier" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  branchId?: string; // if assigned to a specific branch
}

export const USERS: User[] = [
  { id: "c1", name: "Ram Bahadur", role: "cashier", pin: "1234", branchId: "b1" },
  { id: "c2", name: "Gita Sharma", role: "cashier", pin: "2345", branchId: "b1" },
  { id: "c3", name: "Mohan Thapa", role: "manager", pin: "9999" },
  { id: "c4", name: "Admin User", role: "admin", pin: "0000" },
];

export const MAX_DISCOUNT_WITHOUT_APPROVAL = 20; // %

export type Permission = "pos_create" | "pos_edit" | "pos_void" | "pos_manager";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  cashier: ["pos_create"],
  manager: ["pos_create", "pos_edit", "pos_void", "pos_manager"],
  admin: ["pos_create", "pos_edit", "pos_void", "pos_manager"],
};

export function hasPermission(user: User | null, perm: Permission): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(perm);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface CashEvent {
  id: string;
  type: "in" | "out";
  amount: number;
  note: string;
  by: string;
  at: string;
}

export interface Session {
  id: string;
  status: "open" | "closed";
  branchId: string;
  branchName: string;
  registerId: string;
  registerName: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  openingCash: number;
  openingDenoms: Record<number, number>;
  cashInDrawer: number;
  addedCash: number;
  removedCash: number;
  cashEvents: CashEvent[];
  closingCash: number | null;
  closingDenoms: Record<number, number>;
  closedAt: string | null;
  closedBy: string | null;
  shortOver: number | null;
  receiptCounter: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartLine {
  lineId: string;
  productId: string;
  name: string;
  sku: string;
  variant: string;
  variantId?: string;
  unitPrice: number; // effective display price (after seasonal disc)
  originalPrice: number; // base / sale price before seasonal disc
  qty: number;
  discountType: "percent" | "flat";
  discountValue: number; // the discount % or flat Rs amount
  discountApprovedBy?: string;
  bargainPrice: number | null;
  bargainApprovedBy?: string;
  vatRate: number; // 0.13, 0.05, etc
  vatEnabled: boolean;
  isReturn: boolean;
  maxDiscountPercent: number; // e.g. 30
}

// ─── Held bills ───────────────────────────────────────────────────────────────

export interface HeldBill {
  id: string;
  label: string;
  sessionId: string;
  lines: CartLine[];
  customerName: string;
  extraDiscount: number;
  extraDiscType: "percent" | "flat";
  savedAt: string;
}

// ─── Split Payment Detail ─────────────────────────────────────────────────────

export interface SplitPayment {
  cash: number;
  epay: number;
  epayRef: string;
  epayAccount: string;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export interface SaleLine {
  productId: string;
  name: string;
  sku: string;
  variant: string;
  qty: number;
  unitPrice: number;
  discountType: "percent" | "flat";
  discountValue: number;
  vatRate: number;
  lineTotal: number;
  returnedQty: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  sessionId: string;
  branchId: string;
  branchName: string;
  registerId: string;
  registerName: string;
  cashierId: string;
  cashierName: string;
  date: string;
  dateBS: string;
  time: string;
  customerName: string;
  lines: SaleLine[];
  subtotal: number;
  discountTotal: number;
  vatTotal: number;
  grandTotal: number;
  paymentMethod: "cash" | "epay" | "split";
  cashReceived: number;
  epayAmount: number;
  epayRef: string;
  epayAccount: string;
  changeGiven: number;
  status: "completed" | "voided" | "partial_return";
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
}

// ─── Invoice (fiscal compliance) ──────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoiceNo: string;
  saleId: string;
  receiptNo: string;
  branchId: string;
  branchName: string;
  fiscalYear: string;
  date: string;
  dateBS: string;
  customerName: string;
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  status: "active" | "voided";
  voidReason?: string;
  voidedBy?: string;
}

// ─── Returns ──────────────────────────────────────────────────────────────────

export interface ReturnLine {
  productId: string;
  name: string;
  sku: string;
  variant: string;
  returnQty: number;
  unitPrice: number;
  condition: "restockable" | "damaged";
  lineRefund: number;
}

export interface SaleReturn {
  id: string;
  receiptNo: string;
  originalSaleId: string;
  originalReceiptNo: string;
  date: string;
  dateBS: string;
  time: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  lines: ReturnLine[];
  refundTotal: number;
  refundMethod: "cash" | "store_credit";
  note: string;
}

// ─── Void Log ─────────────────────────────────────────────────────────────────

export interface VoidLog {
  id: string;
  saleId: string;
  receiptNo: string;
  reason: string;
  voidedBy: string;
  voidedAt: string;
  branchId: string;
}
