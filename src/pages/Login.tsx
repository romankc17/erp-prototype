import { useState } from "react";
import { Mountain, Eye, EyeOff, User, Building2, Store, Warehouse, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useWorkspace } from "../context/WorkspaceContext";
import type { BranchType } from "../domain/workspace/types";

const typeIcons: Record<BranchType, typeof Store> = {
  retail_store: Store,
  warehouse: Warehouse,
  corporate_office: Briefcase,
  franchise: Building2,
};

const typeColors: Record<BranchType, string> = {
  retail_store: "bg-blue-50 text-blue-600 border-blue-200",
  warehouse: "bg-amber-50 text-amber-600 border-amber-200",
  corporate_office: "bg-slate-50 text-slate-600 border-slate-200",
  franchise: "bg-purple-50 text-purple-600 border-purple-200",
};

const typeLabels: Record<BranchType, string> = {
  retail_store: "Retail Store",
  warehouse: "Warehouse",
  corporate_office: "Corporate Office",
  franchise: "Franchise",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"login" | "workspace">("login");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, users, currentUser } = useStore();
  const { branches, availableWorkspaces, setActiveWorkspace } = useWorkspace();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    const res = await login({ email, pin: password });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");

    // Find the user that just logged in
    const user = users.find((u) => u.active && u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;

    // For demo: assign all active branches to all users
    const allBranchIds = availableWorkspaces.map((w) => w.branchId);
    const assigned = user.assignedBranches.length > 0 ? user.assignedBranches : allBranchIds;
    const primary = user.primaryBranchId ?? assigned[0] ?? null;

    if (assigned.length <= 1 || !user.canSwitchWorkspaces) {
      // Auto-select if only one branch or can't switch
      if (primary) {
        await setActiveWorkspace(primary);
      }
      navigate(user.role === "cashier" ? "/pos" : "/");
      return;
    }

    // Show workspace picker
    setSelectedWorkspace(primary);
    setStep("workspace");
  };

  const handleWorkspaceSelect = async () => {
    if (selectedWorkspace) {
      await setActiveWorkspace(selectedWorkspace);
    }
    const user = currentUser;
    navigate(user?.role === "cashier" ? "/pos" : "/");
  };

  const filteredWorkspaces = availableWorkspaces.filter((w) => {
    const user = users.find((u) => u.active && u.email.toLowerCase() === email.toLowerCase());
    if (!user) return true; // demo fallback
    if (user.assignedBranches.length === 0) return true; // demo fallback
    return user.assignedBranches.includes(w.branchId);
  });

  if (step === "workspace") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mountain className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Select Your Workspace</h1>
            <p className="text-sm text-slate-500 mt-1">
              Choose the branch you want to work in today. You can switch later from the header.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="space-y-3">
              {filteredWorkspaces.map((ws) => {
                const branch = branches.find((b) => b.id === ws.branchId);
                const Icon = typeIcons[ws.branchType];
                const isSelected = selectedWorkspace === ws.branchId;
                return (
                  <button
                    key={ws.branchId}
                    onClick={() => setSelectedWorkspace(ws.branchId)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${typeColors[ws.branchType]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{ws.branchName}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          {ws.branchCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{typeLabels[ws.branchType]}</p>
                      {branch && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{branch.address}</p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleWorkspaceSelect}
                disabled={!selectedWorkspace}
                className="w-full h-11 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Enter Workspace
              </button>
              <button
                onClick={() => setStep("login")}
                className="w-full mt-2 h-10 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mountain className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daraz Retail</h1>
          <p className="text-sm text-slate-500 mt-1">Business Manager</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the dashboard</p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your PIN"
                  className="w-full h-11 px-4 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-500 hover:underline">Forgot password?</button>
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500 mb-2 text-center">Demo accounts — click to auto-fill</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: "Admin", email: "admin@demo.local", pin: "1234" },
                { name: "Manager", email: "manager@demo.local", pin: "2345" },
                { name: "Cashier", email: "cashier@demo.local", pin: "1111" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => { setEmail(demo.email); setPassword(demo.pin); setError(""); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  <User className="w-3 h-3" />
                  <span className="font-medium">{demo.name}</span>
                  <span className="text-slate-400">·</span>
                  <span>{demo.pin}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Daraz Retail Business Manager — Multi-Branch Workspace Edition
        </p>
      </div>
    </div>
  );
}
