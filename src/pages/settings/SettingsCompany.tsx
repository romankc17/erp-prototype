import { useState } from "react";
import { Building2, Save, Camera, User, Lock, Globe, Moon, Bell } from "lucide-react";
import { useStore } from "../../context/StoreContext";

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          on ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsCompany() {
  const [activeTab, setActiveTab] = useState<"company" | "account">("company");
  const { storeProfile, updateStoreProfile } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Company Info</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage business information and account preferences</p>
      </div>

      {/* Sub-tabs */}
      <div className="inline-flex bg-white rounded-xl border border-slate-200 p-1 gap-1">
        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "company" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" /> Company Info
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "account" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <User className="w-4 h-4" /> Account Settings
        </button>
      </div>

      {activeTab === "company" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={storeProfile.businessName}
                  onChange={(e) => updateStoreProfile({ businessName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <textarea
                  rows={3}
                  value={storeProfile.location}
                  onChange={(e) => updateStoreProfile({ location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">+977</span>
                  <input
                    type="text"
                    defaultValue="1-4XXXXXX"
                    className="w-full h-10 pl-12 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="contact@darazretail.np"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  defaultValue="302415678"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">VAT Registration Number</label>
                <input
                  type="text"
                  defaultValue="VAT-2023-0015"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Business Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select
                  value={storeProfile.currency.code}
                  onChange={(e) => {
                    const code = e.target.value;
                    const next =
                      code === "USD"
                        ? { code: "USD", symbol: "$", locale: "en-US" }
                        : code === "INR"
                          ? { code: "INR", symbol: "₹", locale: "en-IN" }
                          : { code: "NPR", symbol: "Rs.", locale: "en-IN" };
                    updateStoreProfile({ currency: next });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="NPR">NPR (Nepalese Rupee)</option>
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year Start</label>
                <select defaultValue="Shrawan" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500">
                  <option>Shrawan (Mid-July)</option>
                  <option>January</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default VAT Rate (%)</label>
                <input
                  type="number"
                  value={Math.round((storeProfile.taxRules.find((t) => t.id === "vat13")?.rate ?? 0.13) * 100)}
                  onChange={(e) => {
                    const rate = Number(e.target.value) / 100;
                    updateStoreProfile({
                      taxRules: storeProfile.taxRules.map((t) => (t.id === "vat13" ? { ...t, rate: Number.isFinite(rate) ? rate : t.rate } : t)),
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Footer Message</label>
                <textarea
                  rows={2}
                  value={storeProfile.receiptFooter}
                  onChange={(e) => updateStoreProfile({ receiptFooter: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="e.g. Thank you for shopping with us!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                <select defaultValue="en" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500">
                  <option>English</option>
                  <option>Nepali</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Profile</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img src="/images/avatar.jpg" alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <button className="text-sm text-blue-500 hover:underline font-medium">Change Photo</button>
                  <p className="text-xs text-slate-400">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" defaultValue="Amit Desai" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" defaultValue="amit@darazretail.np" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" defaultValue="98XXXXXXXX" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input type="text" defaultValue="Admin" disabled className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input type="password" placeholder="Enter current password" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input type="password" placeholder="Enter new password" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input type="password" placeholder="Confirm new password" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                Update Password
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Language</p>
                    <p className="text-xs text-slate-500">Preferred language for the interface</p>
                  </div>
                </div>
                <select defaultValue="en" className="h-9 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500">
                  <option>English</option>
                  <option>Nepali</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Theme</p>
                    <p className="text-xs text-slate-500">Choose your preferred theme</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["Light", "Dark", "System"].map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        t === "Light" ? "bg-blue-500 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                    <p className="text-xs text-slate-500">Receive daily summary emails</p>
                  </div>
                </div>
                <ToggleSwitch defaultOn={true} />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <h3 className="text-base font-semibold text-red-600 mb-1">Delete Account</h3>
            <p className="text-sm text-slate-600 mb-4">This will permanently delete your account and all associated data. This action cannot be undone.</p>
            <button className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
