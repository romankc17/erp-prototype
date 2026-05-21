import { useState } from "react";
import { Shield, Users, Building2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { rolesData, settingsUsers, modulePermissions, departments } from "../../data";

export default function SettingsRoles() {
  const [selectedRoleId, setSelectedRoleId] = useState(1);
  const [attachTab, setAttachTab] = useState<"users" | "departments">("users");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    Admin: ["View Dashboard", "View Analytics", "Export Reports", "View Products", "Add Product", "Edit Product", "Delete Product", "Manage Stock", "Create PO", "Approve PO", "Receive Stock", "View Clients", "Add Client", "View Vendors", "Add Vendor", "View Sales Orders", "Create Sales Order", "Open Session", "Process Sale", "Apply Discount", "View Invoices", "Create Invoice", "View Bills", "Record Payment", "View Expenses", "Add Expense", "Approve Expense", "Manage Users", "Manage Roles", "Configure Modules", "Company Settings"],
    "Purchase Manager": ["View Dashboard", "View Products", "Create PO", "Approve PO", "Receive Stock", "View Vendors", "Add Vendor", "View Bills", "Record Payment", "View Expenses"],
    Manager: ["View Dashboard", "View Analytics", "View Products", "Manage Stock", "View Clients", "Add Client", "View Sales Orders", "Create Sales Order", "Open Session", "Process Sale", "View Expenses", "Add Expense", "Approve Expense"],
    Cashier: ["View Dashboard", "Open Session", "Process Sale", "Apply Discount", "Hold Bill", "View Sales History"],
    "Inventory Clerk": ["View Products", "Add Product", "Edit Product", "Manage Stock", "Receive Stock", "View Vendors"],
    Accountant: ["View Dashboard", "View Analytics", "View Invoices", "Create Invoice", "View Bills", "Record Payment", "View Expenses", "Add Expense", "View Sales Reports", "View Financial Reports"],
    Sales: ["View Dashboard", "View Clients", "Add Client", "View Sales Orders", "Create Sales Order", "Open Session", "Process Sale"],
    Viewer: ["View Dashboard", "View Analytics"],
  });

  const selectedRole = rolesData.find((r) => r.id === selectedRoleId) || rolesData[0];
  const roleUsers = settingsUsers.filter((u) => u.role === selectedRole.name);
  const roleDepts = departments.filter((d) => selectedRole.departments.includes(d.name));

  const toggleModule = (mod: string) => {
    setExpandedModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  const currentPerms = rolePermissions[selectedRole.name] || [];
  const allModules = Object.entries(modulePermissions);

  const togglePerm = (perm: string) => {
    setRolePermissions((prev) => {
      const existing = prev[selectedRole.name] || [];
      if (existing.includes(perm)) {
        return { ...prev, [selectedRole.name]: existing.filter((p) => p !== perm) };
      }
      return { ...prev, [selectedRole.name]: [...existing, perm] };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Roles & Permissions</h2>
        <p className="text-sm text-slate-500 mt-0.5">Define roles and manage access permissions across modules</p>
      </div>

      {/* Three Panel Layout */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left: Roles List */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Roles</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {rolesData.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-slate-50 ${
                    selectedRoleId === role.id ? "bg-blue-50 border-r-[3px] border-blue-500" : ""
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${selectedRoleId === role.id ? "text-blue-700" : "text-slate-900"}`}>
                      {role.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{role.userCount} user{role.userCount !== 1 ? "s" : ""}</p>
                  </div>
                  {selectedRoleId === role.id && <Check className="w-4 h-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Role Information */}
        <div className="col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-violet-500" />
                <h3 className="text-base font-semibold text-slate-900">{selectedRole.name}</h3>
              </div>
              <p className="text-sm text-slate-500">{selectedRole.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Users Assigned</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{selectedRole.userCount}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Departments</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{selectedRole.departments.length}</p>
              </div>
            </div>

            {/* Attach to User/Department */}
            <div className="border border-slate-200 rounded-lg">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setAttachTab("users")}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    attachTab === "users" ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setAttachTab("departments")}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    attachTab === "departments" ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Departments
                </button>
              </div>
              <div className="p-3 max-h-48 overflow-y-auto">
                {attachTab === "users" ? (
                  roleUsers.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No users assigned to this role</p>
                  ) : (
                    <div className="space-y-1">
                      {roleUsers.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  roleDepts.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No departments linked</p>
                  ) : (
                    <div className="space-y-1">
                      {roleDepts.map((d) => (
                        <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{d.name}</p>
                            <p className="text-xs text-slate-500">{d.nameNepali}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Role Info Panel (placeholder for assignment) */}
        <div className="col-span-4">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Actions</h4>
            <p className="text-xs text-blue-700 mb-4">Manage role assignment and permissions</p>
            <div className="space-y-2">
              <button className="w-full h-9 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Users className="w-3.5 h-3.5" /> Assign Users
              </button>
              <button className="w-full h-9 bg-white hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-300 transition-colors flex items-center justify-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> Link Departments
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Permissions</h3>
        <div className="space-y-3">
          {allModules.map(([module, perms]) => {
            const isExpanded = expandedModules[module];
            const granted = perms.filter((p) => currentPerms.includes(p));
            return (
              <div key={module} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">{module}</span>
                    <span className="text-xs text-slate-500">
                      {granted.length}/{perms.length} permissions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${granted.length === perms.length ? "bg-emerald-500" : granted.length > 0 ? "bg-amber-500" : "bg-slate-300"}`}
                        style={{ width: `${(granted.length / perms.length) * 100}%` }}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {perms.map((perm) => {
                      const isGranted = currentPerms.includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            isGranted
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => togglePerm(perm)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className={`text-xs font-medium ${isGranted ? "text-emerald-800" : "text-slate-600"}`}>
                            {perm}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
