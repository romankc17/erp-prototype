import type { Branch, WorkspaceState } from "@/domain/workspace/types";

const STORAGE_KEY = "erp_workspace_state_v1";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isoNow() {
  return new Date().toISOString();
}

function defaultOperatingHours(): Branch["operatingHours"] {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days.map((day) => ({
    day,
    open: "09:00",
    close: "21:00",
    isClosed: day === "Saturday",
  }));
}

function seedBranches(): Branch[] {
  return [
    {
      id: uid("br"),
      code: "THM-01",
      name: "Thamel Outlet Store",
      type: "retail_store",
      address: "Thamel, Kathmandu, Nepal",
      phone: "+977-1-4412345",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      taxRules: [
        { id: "vat13", name: "VAT 13%", rate: 0.13, enabled: true },
        { id: "vat5", name: "VAT 5%", rate: 0.05, enabled: false },
      ],
      operatingHours: defaultOperatingHours(),
      holidays: [],
      receiptHeader: "Daraz Retail Pvt. Ltd.\nThamel Outlet",
      receiptFooter: "Thank you for shopping with us!\nVisit us again at Thamel Outlet",
      storageLocations: [
        { id: uid("loc"), name: "Main Shelf", type: "shelf" },
        { id: uid("loc"), name: "Counter Display", type: "counter" },
        { id: uid("loc"), name: "Back Office", type: "back_office" },
      ],
      isActive: true,
      createdAt: isoNow(),
    },
    {
      id: uid("br"),
      code: "PKR-01",
      name: "Pokhara Lakeside Branch",
      type: "retail_store",
      address: "Lakeside, Pokhara, Nepal",
      phone: "+977-61-463210",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      taxRules: [
        { id: "vat13", name: "VAT 13%", rate: 0.13, enabled: true },
      ],
      operatingHours: defaultOperatingHours(),
      holidays: [],
      receiptHeader: "Daraz Retail Pvt. Ltd.\nPokhara Lakeside",
      receiptFooter: "Thank you for shopping with us!\nVisit us again at Pokhara",
      storageLocations: [
        { id: uid("loc"), name: "Front Rack", type: "rack" },
        { id: uid("loc"), name: "Storage Room", type: "back_office" },
      ],
      isActive: true,
      createdAt: isoNow(),
    },
    {
      id: uid("br"),
      code: "MWH-01",
      name: "Main Warehouse",
      type: "warehouse",
      address: "Balaju, Kathmandu, Nepal",
      phone: "+977-1-4356789",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      taxRules: [
        { id: "vat13", name: "VAT 13%", rate: 0.13, enabled: true },
      ],
      operatingHours: [
        { day: "Sunday", open: "08:00", close: "18:00", isClosed: false },
        { day: "Monday", open: "08:00", close: "18:00", isClosed: false },
        { day: "Tuesday", open: "08:00", close: "18:00", isClosed: false },
        { day: "Wednesday", open: "08:00", close: "18:00", isClosed: false },
        { day: "Thursday", open: "08:00", close: "18:00", isClosed: false },
        { day: "Friday", open: "08:00", close: "18:00", isClosed: false },
        { day: "Saturday", open: "08:00", close: "14:00", isClosed: false },
      ],
      holidays: [],
      receiptHeader: "Daraz Retail Pvt. Ltd.\nMain Warehouse",
      receiptFooter: "Warehouse receipt — Not for retail sale",
      storageLocations: [
        { id: uid("loc"), name: "Zone A — Fast Moving", type: "rack" },
        { id: uid("loc"), name: "Zone B — Bulk Storage", type: "shelf" },
        { id: uid("loc"), name: "Zone C — Cold Storage", type: "cold_storage" },
        { id: uid("loc"), name: "Receiving Dock", type: "floor" },
      ],
      isActive: true,
      createdAt: isoNow(),
    },
    {
      id: uid("br"),
      code: "HQ-01",
      name: "Headquarters",
      type: "corporate_office",
      address: "New Baneshwor, Kathmandu, Nepal",
      phone: "+977-1-4789012",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      taxRules: [
        { id: "vat13", name: "VAT 13%", rate: 0.13, enabled: true },
      ],
      operatingHours: [
        { day: "Sunday", open: "09:00", close: "17:00", isClosed: false },
        { day: "Monday", open: "09:00", close: "17:00", isClosed: false },
        { day: "Tuesday", open: "09:00", close: "17:00", isClosed: false },
        { day: "Wednesday", open: "09:00", close: "17:00", isClosed: false },
        { day: "Thursday", open: "09:00", close: "17:00", isClosed: false },
        { day: "Friday", open: "09:00", close: "17:00", isClosed: false },
        { day: "Saturday", open: "09:00", close: "13:00", isClosed: false },
      ],
      holidays: [],
      receiptHeader: "Daraz Retail Pvt. Ltd.\nHeadquarters",
      receiptFooter: "Internal document — Headquarters",
      storageLocations: [
        { id: uid("loc"), name: "IT Storage", type: "back_office" },
        { id: uid("loc"), name: "Sample Room", type: "shelf" },
      ],
      isActive: true,
      createdAt: isoNow(),
    },
  ];
}

function loadState(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const branches = seedBranches();
      return { version: 1, branches, activeWorkspaceId: branches[0]?.id ?? null };
    }
    const parsed = JSON.parse(raw) as WorkspaceState;
    if (parsed?.version !== 1) {
      const branches = seedBranches();
      return { version: 1, branches, activeWorkspaceId: branches[0]?.id ?? null };
    }
    return parsed;
  } catch {
    const branches = seedBranches();
    return { version: 1, branches, activeWorkspaceId: branches[0]?.id ?? null };
  }
}

function saveState(state: WorkspaceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Branches / Workspaces ───────────────────────────────────────────────────

export async function getBranches(): Promise<Branch[]> {
  await delay(200);
  return loadState().branches;
}

export async function getBranchById(id: string): Promise<Branch | null> {
  await delay(100);
  return loadState().branches.find((b) => b.id === id) ?? null;
}

export async function getActiveWorkspaceId(): Promise<string | null> {
  await delay(50);
  return loadState().activeWorkspaceId;
}

export async function setActiveWorkspaceId(branchId: string) {
  await delay(200);
  const state = loadState();
  saveState({ ...state, activeWorkspaceId: branchId });
}

export async function createBranch(b: Omit<Branch, "id" | "createdAt">) {
  await delay(400);
  const state = loadState();
  const created: Branch = { ...b, id: uid("br"), createdAt: isoNow() };
  const next: WorkspaceState = {
    ...state,
    branches: [created, ...state.branches],
    activeWorkspaceId: state.activeWorkspaceId ?? created.id,
  };
  saveState(next);
  return created;
}

export async function updateBranch(id: string, patch: Partial<Omit<Branch, "id">>) {
  await delay(300);
  const state = loadState();
  const next: WorkspaceState = {
    ...state,
    branches: state.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  };
  saveState(next);
  return next.branches.find((b) => b.id === id)!;
}

export async function deleteBranch(id: string) {
  await delay(300);
  const state = loadState();
  const filtered = state.branches.filter((b) => b.id !== id);
  const nextActive = state.activeWorkspaceId === id ? (filtered[0]?.id ?? null) : state.activeWorkspaceId;
  const next: WorkspaceState = { ...state, branches: filtered, activeWorkspaceId: nextActive };
  saveState(next);
}

// ─── Full State ──────────────────────────────────────────────────────────────

export async function getWorkspaceState(): Promise<WorkspaceState> {
  await delay(100);
  return loadState();
}
