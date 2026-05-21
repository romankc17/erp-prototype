import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Branch, Workspace } from "@/domain/workspace/types";
import * as workspaceService from "@/services/workspaceService";

export type WorkspaceLock = {
  docType: string;
  docId: string;
  branchId: string;
} | null;

interface WorkspaceCtx {
  loading: boolean;
  branches: Branch[];
  activeWorkspace: Workspace | null;
  activeBranch: Branch | null;
  availableWorkspaces: Workspace[];

  setActiveWorkspace: (branchId: string) => Promise<void>;
  canSwitchWorkspace: () => boolean;
  workspaceLock: WorkspaceLock;
  lockWorkspace: (docType: string, docId: string) => void;
  unlockWorkspace: () => void;

  addBranch: (b: Omit<Branch, "id" | "createdAt">) => Promise<Branch>;
  updateBranch: (id: string, patch: Partial<Omit<Branch, "id">>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  getBranchTypeColor: (type: Branch["type"]) => string;
  getBranchTypeLabel: (type: Branch["type"]) => string;

  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceCtx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaceLock, setWorkspaceLock] = useState<WorkspaceLock>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [b, activeId] = await Promise.all([
      workspaceService.getBranches(),
      workspaceService.getActiveWorkspaceId(),
    ]);
    setBranches(b);
    setActiveWorkspaceId(activeId);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [b, activeId] = await Promise.all([
        workspaceService.getBranches(),
        workspaceService.getActiveWorkspaceId(),
      ]);
      if (mounted) {
        setBranches(b);
        setActiveWorkspaceId(activeId);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const activeBranch = useMemo(() => {
    if (!activeWorkspaceId || !branches) return null;
    return branches.find((b) => b.id === activeWorkspaceId) ?? null;
  }, [activeWorkspaceId, branches]);

  const activeWorkspace = useMemo<Workspace | null>(() => {
    if (!activeBranch) return null;
    return {
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      branchCode: activeBranch.code,
      branchType: activeBranch.type,
    };
  }, [activeBranch]);

  const availableWorkspaces = useMemo<Workspace[]>(() => {
    if (!branches) return [];
    return branches
      .filter((b) => b.isActive)
      .map((b) => ({
        branchId: b.id,
        branchName: b.name,
        branchCode: b.code,
        branchType: b.type,
      }));
  }, [branches]);

  const setActiveWorkspace = useCallback(async (branchId: string) => {
    await workspaceService.setActiveWorkspaceId(branchId);
    setActiveWorkspaceId(branchId);
  }, []);

  const canSwitchWorkspace = useCallback(() => {
    return workspaceLock === null;
  }, [workspaceLock]);

  const lockWorkspace = useCallback((docType: string, docId: string) => {
    if (!activeBranch) return;
    setWorkspaceLock({ docType, docId, branchId: activeBranch.id });
  }, [activeBranch]);

  const unlockWorkspace = useCallback(() => {
    setWorkspaceLock(null);
  }, []);

  const addBranch: WorkspaceCtx["addBranch"] = async (b) => {
    const created = await workspaceService.createBranch(b);
    await refresh();
    return created;
  };

  const updateBranch: WorkspaceCtx["updateBranch"] = async (id, patch) => {
    await workspaceService.updateBranch(id, patch);
    await refresh();
  };

  const deleteBranch: WorkspaceCtx["deleteBranch"] = async (id) => {
    await workspaceService.deleteBranch(id);
    await refresh();
  };

  const getBranchTypeColor = useCallback((type: Branch["type"]) => {
    switch (type) {
      case "retail_store": return "border-l-blue-500";
      case "warehouse": return "border-l-amber-500";
      case "corporate_office": return "border-l-slate-500";
      case "franchise": return "border-l-purple-500";
      default: return "border-l-slate-500";
    }
  }, []);

  const getBranchTypeLabel = useCallback((type: Branch["type"]) => {
    switch (type) {
      case "retail_store": return "Retail Store";
      case "warehouse": return "Warehouse";
      case "corporate_office": return "Corporate Office";
      case "franchise": return "Franchise";
      default: return type;
    }
  }, []);

  const value: WorkspaceCtx = {
    loading,
    branches: branches ?? [],
    activeWorkspace,
    activeBranch,
    availableWorkspaces,
    setActiveWorkspace,
    canSwitchWorkspace,
    workspaceLock,
    lockWorkspace,
    unlockWorkspace,
    addBranch,
    updateBranch,
    deleteBranch,
    getBranchTypeColor,
    getBranchTypeLabel,
    refresh,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
