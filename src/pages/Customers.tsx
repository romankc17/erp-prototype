import { useState } from "react";
import {
  Search, Plus, Trash2, X, Check, Pencil, Eye,
  Users, Store,
} from "lucide-react";

interface CustomerData {
  id: number;
  name: string;
  type: "Client" | "Vendor";
  phone: string;
  location: string;
  orders: number;
  totalSpent: number;
  creditBalance: number | null;
  returns: number;
  lastOrder: string;
  contactPerson?: string;
  email?: string;
  address?: string;
  panNumber?: string;
}

const allContacts: CustomerData[] = [
  { id: 1, name: "Kathmandu Handicrafts", type: "Client", phone: "98XXXXXXXX", location: "Kathmandu", orders: 42, totalSpent: 845000, creditBalance: 50000, returns: 3, lastOrder: "May 18, 2025", contactPerson: "Prakash Sharma", email: "prakash@khandicrafts.np", address: "Thamel Marg, Kathmandu", panNumber: "PAN-301245" },
  { id:  2, name: "Pokhara Outdoor Gear", type: "Client", phone: "97XXXXXXXX", location: "Pokhara", orders: 28, totalSpent: 520000, creditBalance: null, returns: 1, lastOrder: "May 18, 2025", contactPerson: "Sarita Gurung", email: "sarita@pokharaoutdoor.np", address: "Lakeside, Pokhara" },
  { id: 3, name: "Bhaktapur Pottery House", type: "Client", phone: "98XXXXXXXX", location: "Bhaktapur", orders: 35, totalSpent: 685000, creditBalance: 25000, returns: 0, lastOrder: "May 17, 2025", contactPerson: "Hari Manandhar" },
  { id: 4, name: "Lalitpur Textile Mills", type: "Client", phone: "96XXXXXXXX", location: "Lalitpur", orders: 18, totalSpent: 240000, creditBalance: 15000, returns: 2, lastOrder: "May 17, 2025", contactPerson: "Anita Shrestha" },
  { id: 5, name: "Birgunj Trading Co.", type: "Client", phone: "98XXXXXXXX", location: "Birgunj", orders: 56, totalSpent: 1250000, creditBalance: 100000, returns: 4, lastOrder: "May 16, 2025", contactPerson: "Dinesh Yadav" },
  { id: 6, name: "Nepalgunj Electronics", type: "Client", phone: "98XXXXXXXX", location: "Nepalgunj", orders: 31, totalSpent: 485000, creditBalance: 10000, returns: 1, lastOrder: "May 16, 2025" },
  { id: 7, name: "Dharan General Store", type: "Client", phone: "97XXXXXXXX", location: "Dharan", orders: 22, totalSpent: 380000, creditBalance: null, returns: 0, lastOrder: "May 15, 2025" },
  { id: 8, name: "Butwal Mart", type: "Client", phone: "98XXXXXXXX", location: "Butwal", orders: 15, totalSpent: 195000, creditBalance: 5000, returns: 1, lastOrder: "May 14, 2025" },
  { id: 9, name: "Annapurna Suppliers", type: "Vendor", phone: "98XXXXXXXX", location: "Kathmandu", orders: 0, totalSpent: 0, creditBalance: null, returns: 0, lastOrder: "-", contactPerson: "Ramesh Khadka", email: "ramesh@annapurna.np", address: "New Road, Kathmandu", panNumber: "PAN-302156" },
  { id: 10, name: "Himalayan Distributors", type: "Vendor", phone: "97XXXXXXXX", location: "Lalitpur", orders: 0, totalSpent: 0, creditBalance: null, returns: 0, lastOrder: "-", contactPerson: "Sunita Rai", email: "sunita@himalayandist.np", address: "Patan, Lalitpur" },
  { id: 11, name: "Pokhara Imports", type: "Vendor", phone: "98XXXXXXXX", location: "Pokhara", orders: 0, totalSpent: 0, creditBalance: null, returns: 0, lastOrder: "-", contactPerson: "Bikash Gurung", email: "bikash@pokharaimport.np", address: "Lakeside, Pokhara" },
  { id: 12, name: "Terai Wholesale", type: "Vendor", phone: "98XXXXXXXX", location: "Janakpur", orders: 0, totalSpent: 0, creditBalance: null, returns: 0, lastOrder: "-", contactPerson: "Mohan Thakur", email: "mohan@teraiw.np", address: "Janakpur, Dhanusa", panNumber: "PAN-303789" },
];

const typeBadge: Record<string, { bg: string; text: string }> = {
  "Client": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Vendor": { bg: "bg-amber-100", text: "text-amber-700" },
};

export default function Customers() {
  const [activeTab, setActiveTab] = useState<"All" | "Client" | "Vendor">("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [detailContact, setDetailContact] = useState<CustomerData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<"Client" | "Vendor">("Client");

  const filtered = allContacts.filter((c) => {
    const matchTab = activeTab === "All" || c.type === activeTab;
    const matchSearch = search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalClients = allContacts.filter((c) => c.type !== "Vendor").length;
  const totalVendors = allContacts.filter((c) => c.type === "Vendor").length;
  const totalRevenue = allContacts.filter((c) => c.type !== "Vendor").reduce((s, c) => s + c.totalSpent, 0);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDeleteSelected = () => {
    clearSelection();
  };

  const tabConfig = [
    { key: "All" as const, label: "All", count: allContacts.length },
    { key: "Client" as const, label: "Clients", count: totalClients },
    { key: "Vendor" as const, label: "Vendors", count: totalVendors },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Customers / Directory</p>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage clients and vendors in your business network.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAddType("Client"); setShowAddDialog(true); }}
            className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
          <button
            onClick={() => { setAddType("Vendor"); setShowAddDialog(true); }}
            className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{allContacts.length}</p>
            <p className="text-xs text-slate-500">Total Contacts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalClients}</p>
            <p className="text-xs text-slate-500">Total Clients</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Store className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalVendors}</p>
            <p className="text-xs text-slate-500">Total Vendors</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <span className="text-lg font-bold text-violet-600">Rs.</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Rs. {totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); clearSelection(); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between min-h-[52px]">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
              </div>
              <button
                onClick={handleDeleteSelected}
                className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
              </button>
              <button onClick={clearSelection} className="h-8 px-3 text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          ) : (
            <span className="text-sm text-slate-400">0 selected</span>
          )}
          <span className="text-xs text-slate-400">{filtered.length} contacts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Orders</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Total Spent</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Credit Balance</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Returns</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Last Order</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((contact) => {
                const badge = typeBadge[contact.type] || typeBadge["Walk-in"];
                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedIds.has(contact.id) ? "bg-blue-50/40" : ""}`}
                    onClick={() => setDetailContact(contact)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                          {contact.name.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 ${badge.bg} ${badge.text} text-xs font-medium rounded-full`}>
                        {contact.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.location}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">{contact.orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                      {contact.totalSpent > 0 ? `Rs. ${contact.totalSpent.toLocaleString("en-IN")}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {contact.creditBalance !== null ? `Rs. ${contact.creditBalance.toLocaleString("en-IN")}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">{contact.returns}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.lastOrder}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 flex items-center gap-1">
                        <button
                          onClick={() => setDetailContact(contact)}
                          className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing 1-{filtered.length} of {filtered.length} contacts
        </div>
      </div>

      {/* Contact Detail Dialog */}
      {detailContact && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDetailContact(null)}>
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-600">
                  {detailContact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{detailContact.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 ${typeBadge[detailContact.type]?.bg} ${typeBadge[detailContact.type]?.text} text-xs font-medium rounded-full`}>
                    {detailContact.type}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetailContact(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-700">{detailContact.phone}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-400">Location</p>
                  <p className="text-sm font-medium text-slate-700">{detailContact.location}</p>
                </div>
                {detailContact.email && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Email</p>
                    <p className="text-sm text-slate-700">{detailContact.email}</p>
                  </div>
                )}
                {detailContact.contactPerson && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Contact Person</p>
                    <p className="text-sm text-slate-700">{detailContact.contactPerson}</p>
                  </div>
                )}
                {detailContact.panNumber && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">PAN Number</p>
                    <p className="text-sm text-slate-700">{detailContact.panNumber}</p>
                  </div>
                )}
                {detailContact.address && (
                  <div className="col-span-2 bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400">Address</p>
                    <p className="text-sm text-slate-700">{detailContact.address}</p>
                  </div>
                )}
              </div>
              {detailContact.type !== "Vendor" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-blue-500">Orders</p>
                    <p className="text-xl font-bold text-blue-700">{detailContact.orders}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-emerald-600">Total Spent</p>
                    <p className="text-lg font-bold text-emerald-700">Rs. {detailContact.totalSpent.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-amber-600">Returns</p>
                    <p className="text-xl font-bold text-amber-700">{detailContact.returns}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setDetailContact(null)} className="h-9 px-4 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button className="h-9 px-4 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client/Vendor Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAddDialog(false)}>
          <div className="bg-white rounded-xl shadow-xl w-[420px]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New {addType}</h3>
              <p className="text-sm text-slate-500">Create a new {addType.toLowerCase()} in your contacts</p>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder={`Enter ${addType.toLowerCase()} name`} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                <input type="text" placeholder="Enter contact person name" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" placeholder="98XXXXXXXX" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" placeholder="email@example.com" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea rows={2} placeholder="Enter address" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              {addType === "Vendor" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                  <input type="text" placeholder="Enter PAN number" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setShowAddDialog(false)} className="h-9 px-4 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowAddDialog(false)} className="h-9 px-4 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                Save {addType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
