export type BranchType = "retail_store" | "warehouse" | "corporate_office" | "franchise";

export type StorageLocation = {
  id: string;
  name: string;
  type: "shelf" | "counter" | "back_office" | "cold_storage" | "floor" | "rack";
};

export type OperatingHours = {
  day: string; // e.g., "Monday"
  open: string; // e.g., "09:00"
  close: string; // e.g., "21:00"
  isClosed: boolean;
};

export type Branch = {
  id: string;
  code: string; // e.g., "THM-01"
  name: string; // e.g., "Thamel Outlet"
  type: BranchType;
  address: string;
  phone: string;
  timezone: string; // e.g., "Asia/Kathmandu"
  currency: string; // e.g., "NPR"
  taxRules: { id: string; name: string; rate: number; enabled: boolean }[];
  operatingHours: OperatingHours[];
  holidays: string[]; // ISO dates
  receiptHeader: string;
  receiptFooter: string;
  storageLocations: StorageLocation[];
  isActive: boolean;
  createdAt: string; // ISO
};

export type Workspace = {
  branchId: string;
  branchName: string;
  branchCode: string;
  branchType: BranchType;
};

export type WorkspaceState = {
  version: 1;
  branches: Branch[];
  activeWorkspaceId: string | null;
};
