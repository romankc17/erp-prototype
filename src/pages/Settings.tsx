import { useState } from "react";
import { Store, User, CreditCard, Sliders, Bell, Users, Shield, Save, Camera } from "lucide-react";

const tabs = [
  { id: "store", label: "Store Settings", icon: Store },
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "users", label: "Users & Roles", icon: Users },
];

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${on ? "translate-x-5.5" : "translate-x-0.5"}`} />
    </button>
  );
}

// Users data
const users = [
  { id: 1, name: "Prashanna Shrestha", email: "prashanna@darazretail.np", role: "Admin", status: "Active" },
  { id: 2, name: "Sita Gurung", email: "sita@darazretail.np", role: "Manager", status: "Active" },
  { id: 3, name: "Ram Bahadur", email: "ram@darazretail.np", role: "Cashier", status: "Active" },
  { id: 4, name: "Hari Sharma", email: "hari@darazretail.np", role: "Inventory Clerk", status: "Inactive" },
];

const rolePermissions: Record<string, string[]> = {
  "Admin": ["Dashboard", "POS", "Products", "Sales", "Purchases", "Customers", "Analytics", "Damage/Return", "Settings"],
  "Manager": ["Dashboard", "POS", "Products", "Sales", "Purchases", "Customers", "Analytics", "Damage/Return"],
  "Cashier": ["POS", "Products (view only)", "Sales (view only)", "Customers"],
  "Inventory Clerk": ["Products", "Damage/Return", "Purchases (view only)"],
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("store");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tabs */}
      <div className="inline-flex bg-white rounded-xl border border-slate-200 p-1 gap-1 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Store Settings */}
      {activeTab === "store" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Store Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="Daraz Retail — Kathmandu" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <textarea rows={3} defaultValue="Thamel Marg, Ward 29, Kathmandu, Nepal" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">+977</span>
                  <input type="text" defaultValue="1-4XXXXXX" className="w-full h-10 pl-12 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" defaultValue="contact@darazretail.np" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                <input type="text" defaultValue="302415678" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">VAT Registration Number</label>
                <input type="text" defaultValue="VAT-2023-0015" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Business Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select defaultValue="NPR" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"><option>NPR (Nepalese Rupee)</option><option>INR</option><option>USD</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year Start</label>
                <select defaultValue="Shrawan" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"><option>Shrawan (Mid-July)</option><option>January</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default VAT Rate (%)</label>
                <input type="number" defaultValue="13" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg flex items-center gap-2 hover:bg-blue-600"><Save className="w-4 h-4" /> Save Changes</button>
          </div>
        </div>
      )}

      {/* Account */}
      {activeTab === "account" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img src="/images/avatar.jpg" alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white"><Camera className="w-3.5 h-3.5" /></button>
              </div>
              <div><button className="text-sm text-blue-500 hover:underline font-medium">Change Photo</button><p className="text-xs text-slate-400">JPG, PNG. Max 2MB</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label><input type="text" defaultValue="Prashanna Shrestha" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" defaultValue="prashanna@darazretail.np" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="text" defaultValue="98XXXXXXXX" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Change Password</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label><input type="password" placeholder="Enter current password" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              <div />
              <div><label className="block text-sm font-medium text-slate-700 mb-1">New Password</label><input type="password" placeholder="Enter new password" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label><input type="password" placeholder="Confirm new password" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" /></div>
            </div>
          </div>
          <div className="border-t border-red-200 bg-red-50 rounded-lg p-4 mt-6">
            <h3 className="text-base font-semibold text-red-500 mb-1">Delete Account</h3>
            <p className="text-sm text-slate-600 mb-4">This will permanently delete your account and all data.</p>
            <button className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">Delete Account</button>
          </div>
        </div>
      )}

      {/* Billing */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Current Plan</h3>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="flex items-center gap-2"><span className="text-lg font-semibold text-slate-900">Professional</span><span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Active</span></div>
                <p className="text-sm text-slate-600 mt-1">Rs. 2,999 / month</p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">Upgrade Plan</button>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Billing History</h3>
            <table className="w-full">
              <thead><tr className="text-left">{["Date", "Description", "Amount", "Status"].map((h) => <th key={h} className="pb-2 text-xs font-medium text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {[{ date: "May 15, 2025", desc: "Professional Plan - Monthly", amount: "2,999", status: "Paid" }, { date: "Apr 15, 2025", desc: "Professional Plan - Monthly", amount: "2,999", status: "Paid" }].map((bill, i) => (
                  <tr key={i} className="hover:bg-slate-50"><td className="py-2.5 text-sm text-slate-600">{bill.date}</td><td className="py-2.5 text-sm text-slate-900">{bill.desc}</td><td className="py-2.5 text-sm font-semibold">Rs. {bill.amount}</td><td className="py-2.5"><span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{bill.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preferences */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div><h3 className="text-base font-semibold text-slate-900 mb-4">General</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-900">Language</p><p className="text-xs text-slate-500">Preferred language</p></div><select defaultValue="en" className="h-9 px-3 rounded-lg border border-slate-300 text-sm bg-white"><option>English</option><option>Nepali</option></select></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-900">Theme</p></div><div className="flex gap-2">{["Light", "Dark", "System"].map((t) => <button key={t} className={`px-3 py-1.5 text-xs rounded-lg ${t === "Light" ? "bg-blue-500 text-white" : "border border-slate-300 text-slate-600"}`}>{t}</button>)}</div></div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Dashboard</h3>
            <div className="space-y-3">
              {[{ label: "Compact view for tables", on: false }].map((item) => <div key={item.label} className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-900">{item.label}</p></div><ToggleSwitch defaultOn={item.on} /></div>)}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div><h3 className="text-base font-semibold text-slate-900 mb-4">Push Notifications</h3><div className="space-y-3">{["New order alerts", "Low stock alerts", "Payment received"].map((l) => <div key={l} className="flex items-center justify-between"><p className="text-sm font-medium text-slate-900">{l}</p><ToggleSwitch defaultOn={true} /></div>)}</div></div>
          <div className="border-t border-slate-200 pt-6"><h3 className="text-base font-semibold text-slate-900 mb-4">Email Notifications</h3><div className="space-y-3">{[{ label: "Daily summary", on: true }, { label: "Weekly report", on: false }, { label: "PO updates", on: true }].map((item) => <div key={item.label} className="flex items-center justify-between"><p className="text-sm font-medium text-slate-900">{item.label}</p><ToggleSwitch defaultOn={item.on} /></div>)}</div></div>
        </div>
      )}

      {/* Users & Roles */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-base font-semibold text-slate-900">Team Members</h3><p className="text-xs text-slate-500">Manage users and their access levels</p></div>
              <button className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"><Users className="w-4 h-4" /> Add User</button>
            </div>
            <table className="w-full">
              <thead><tr className="bg-slate-50 text-left">{["User", "Email", "Role", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">{u.name.charAt(0)}</div><span className="text-sm font-semibold text-slate-900">{u.name}</span></div></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{u.status}</span></td>
                    <td className="px-4 py-3"><button className="text-sm text-blue-500 hover:underline">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permissions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-violet-500" />
              <h3 className="text-base font-semibold text-slate-900">Role Permissions</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">{role}</h4>
                    <span className="text-xs text-slate-500">{permissions.length} permissions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {permissions.map((perm) => (
                      <span key={perm} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded-full">{perm}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
