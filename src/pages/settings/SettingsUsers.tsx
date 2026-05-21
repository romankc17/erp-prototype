import { useState } from "react";
import { Search, Plus, ChevronDown, ChevronUp, Pencil, Trash2, Building2 } from "lucide-react";
import { settingsUsers, departments } from "../../data";

export default function SettingsUsers() {
  const [search, setSearch] = useState("");
  const [deptExpanded, setDeptExpanded] = useState(true);

  const filtered = settingsUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage users and their access levels</p>
        </div>
        <button className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Accounts</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Branches</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Can Approve</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.status}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{user.department}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-center">{user.accounts}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{user.branches.join(", ")}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {user.canApprove.length === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : user.canApprove[0] === "All" ? (
                      <span className="text-emerald-600 font-medium">All</span>
                    ) : (
                      user.canApprove.join(", ")
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {settingsUsers.length} users
        </div>
      </div>

      {/* Departments Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setDeptExpanded(!deptExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-semibold text-slate-900">Departments</h3>
            <span className="text-xs text-slate-400">({departments.length})</span>
          </div>
          {deptExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {deptExpanded && (
          <div className="border-t border-slate-100">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name (Nepali)</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Users</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900">{dept.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 font-mono">{dept.nameNepali}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 text-center">{dept.users}</td>
                    <td className="px-5 py-3">
                      <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
