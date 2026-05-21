import { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, LogOut, Store, Warehouse, Briefcase, Building2, ChevronDown, AlertTriangle, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useWorkspace } from "../context/WorkspaceContext";
import type { BranchType } from "../domain/workspace/types";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/purchases": "Purchases",
  "/purchase-orders": "Purchase Orders",
  "/purchase-orders/create": "Create Purchase Order",
  "/customers": "Clients",
  "/vendors": "Vendors",
  "/analytics": "Report",
  "/returns": "Damage / Return / Missing",
  "/pos": "POS Terminal",
  "/accounting/invoices": "Invoices",
  "/accounting/bills": "Bills",
  "/accounting/expenses": "Expense Log",
  "/settings": "Settings",
  "/settings/users": "Settings",
  "/settings/roles": "Settings",
  "/settings/modules": "Settings",
  "/settings/company": "Settings",
  "/settings/branches": "Settings",
  "/settings/categories": "Settings",
  "/settings/procurement": "Settings",
};

const breadcrumbs: Record<string, string> = {
  "/": "Dashboard / Overview",
  "/products": "Inventory / Products",
  "/purchases": "Purchases / Overview",
  "/purchase-orders": "Inventory / Purchase Orders",
  "/purchase-orders/create": "Inventory / Purchase Orders / Create",
  "/customers": "Contacts / Clients",
  "/vendors": "Contacts / Vendors",
  "/analytics": "Report / Overview",
  "/report": "Report / Overview",
  "/returns": "Inventory / Damage / Return",
  "/pos": "POS / Terminal",
  "/accounting/invoices": "Accounting / Invoices",
  "/accounting/bills": "Accounting / Bills",
  "/accounting/expenses": "Accounting / Expense Log",
  "/settings": "Settings / Company Info",
  "/settings/users": "Settings / Users",
  "/settings/roles": "Settings / Roles & Permissions",
  "/settings/modules": "Settings / Module Settings",
  "/settings/company": "Settings / Company Info",
  "/settings/branches": "Settings / Branches",
  "/settings/categories": "Settings / Product Categories",
  "/settings/procurement": "Settings / Procurement",
};

const typeIcons: Record<BranchType, typeof Store> = {
  retail_store: Store,
  warehouse: Warehouse,
  corporate_office: Briefcase,
  franchise: Building2,
};

const typeColors: Record<BranchType, { bg: string; text: string; border: string; dot: string }> = {
  retail_store: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  warehouse: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  corporate_office: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-500" },
  franchise: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
};

export default function Header() {
  const [showProfile, setShowProfile] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useStore();
  const { activeWorkspace, activeBranch, availableWorkspaces, setActiveWorkspace, canSwitchWorkspace, workspaceLock } = useWorkspace();

  const title = pageTitles[location.pathname] || "Dashboard";
  const breadcrumb = breadcrumbs[location.pathname] || "Dashboard";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowProfile(false);
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) setShowWorkspace(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleWorkspaceSwitch = (branchId: string) => {
    if (!canSwitchWorkspace()) {
      setShowLockWarning(true);
      return;
    }
    setActiveWorkspace(branchId);
    setShowWorkspace(false);
  };

  const WorkspaceIcon = activeWorkspace ? typeIcons[activeWorkspace.branchType] : Store;
  const colors = activeWorkspace ? typeColors[activeWorkspace.branchType] : typeColors.retail_store;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-400">{breadcrumb}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Workspace Selector */}
          <div className="relative" ref={workspaceRef}>
            <button
              onClick={() => setShowWorkspace(!showWorkspace)}
              className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border transition-all duration-150 ${colors.bg} ${colors.border} hover:shadow-sm`}
            >
              <div className={`w-7 h-7 rounded-md ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                <WorkspaceIcon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${colors.text}`}>
                    {activeWorkspace?.branchName ?? "No Workspace"}
                  </span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 text-slate-500 font-medium border border-slate-200">
                    {activeWorkspace?.branchCode ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  <span className="text-[10px] text-slate-500">
                    {activeBranch?.type.replace("_", " ") ?? "Branch"}
                  </span>
                </div>
              </div>
              {workspaceLock ? (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showWorkspace ? "rotate-180" : ""}`} />
              )}
            </button>

            {showWorkspace && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Switch Workspace</p>
                  <p className="text-[10px] text-slate-500">Select a different branch to work in</p>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {availableWorkspaces.map((ws) => {
                    const branch = availableWorkspaces.find((b) => b.branchId === ws.branchId);
                    const fullBranch = activeBranch && activeBranch.id === ws.branchId ? activeBranch : undefined;
                    const Icon = typeIcons[ws.branchType];
                    const wsColors = typeColors[ws.branchType];
                    const isActive = activeWorkspace?.branchId === ws.branchId;
                    const isLocked = workspaceLock?.branchId === ws.branchId;
                    return (
                      <button
                        key={ws.branchId}
                        onClick={() => handleWorkspaceSwitch(ws.branchId)}
                        disabled={isActive || !!workspaceLock}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-blue-50"
                            : workspaceLock
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg ${wsColors.bg} border ${wsColors.border} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${wsColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isActive ? "font-semibold text-blue-700" : "font-medium text-slate-700"}`}>
                              {ws.branchName}
                            </span>
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                                Active
                              </span>
                            )}
                            {isLocked && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {ws.branchCode} · {fullBranch?.address ?? branch?.branchType.replace("_", " ")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-slate-100">
                  <button
                    onClick={() => { navigate("/settings/branches"); setShowWorkspace(false); }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Manage Branches →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-slate-200" />

          {/* Search */}
          <button className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors duration-150">
            <Search className="w-4 h-4 text-slate-500" />
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors duration-150">
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1 pr-2 transition-colors"
            >
              <img
                src="/images/avatar.jpg"
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-slate-200 object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{currentUser?.name ?? "User"}</p>
                <p className="text-[10px] text-slate-500 capitalize leading-tight">{currentUser?.role ?? ""}</p>
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{currentUser?.name ?? "User"}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email ?? ""}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{currentUser?.role ?? ""}</p>
                </div>
                <button
                  onClick={() => { navigate("/settings/company"); setShowProfile(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => { logout(); navigate("/login"); setShowProfile(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Workspace Lock Warning Modal */}
      {showLockWarning && (
        <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center" onClick={() => setShowLockWarning(false)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-[400px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Workspace Locked</h3>
                <p className="text-xs text-slate-500">You cannot switch branches right now</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              You have an active transaction in progress in this workspace. Please complete or cancel the current
              transaction before switching to a different branch.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowLockWarning(false)}
                className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
