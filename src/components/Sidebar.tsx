import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart2,
  Settings,
  Mountain,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  IndianRupee,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "POS", icon: Monitor, path: "/pos" },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Products", path: "/products" },
      { label: "Purchase Orders", path: "/purchase-orders" },
      { label: "Damage / Return", path: "/returns" },
    ],
  },
  {
    label: "Contacts",
    icon: Users,
    children: [
      { label: "Clients", path: "/customers" },
      { label: "Vendors", path: "/vendors" },
    ],
  },
  {
    label: "Accounting",
    icon: IndianRupee,
    children: [
      { label: "Invoices", path: "/accounting/invoices" },
      { label: "Bills", path: "/accounting/bills" },
      { label: "Expense Log", path: "/accounting/expenses" },
    ],
  },
  { label: "Report", icon: BarChart2, path: "/analytics" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Inventory: location.pathname.startsWith("/products") || location.pathname.startsWith("/purchase") || location.pathname.startsWith("/returns"),
    Contacts: location.pathname === "/customers" || location.pathname === "/vendors",
    Accounting: location.pathname.startsWith("/accounting"),
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (item: MenuItem) => {
    if (item.path) return location.pathname === item.path;
    if (item.children) return item.children.some((c) => location.pathname === c.path);
    return false;
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 flex flex-col z-50 transition-all duration-200 ${
          collapsed ? "w-[64px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-slate-800 ${collapsed ? "justify-center px-2 py-4" : "px-5 py-4 gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
            <Mountain className="w-5 h-5 text-cyan-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-slate-50 font-bold text-lg leading-tight">Daraz Retail</div>
              <div className="text-slate-500 text-[11px] leading-tight">Business Manager</div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center z-50 transition-colors shadow-md"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-3 h-3 text-slate-300" />
          ) : (
            <PanelLeftClose className="w-3 h-3 text-slate-300" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isExpanded = expandedMenus[item.label];
            const itemActive = isActive(item);

            if (collapsed && hasChildren) {
              return (
                <div key={item.label} className="relative group">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex items-center justify-center w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      itemActive
                        ? "bg-slate-800 text-slate-50 border-l-[3px] border-cyan-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-300 border-l-[3px] border-transparent"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg border border-slate-700">
                      {item.label}
                    </div>
                  </button>
                  {isExpanded && item.children && (
                    <div className="absolute left-full top-0 ml-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-lg py-1 z-50">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive: ia }) =>
                            `block px-4 py-2 text-sm transition-colors ${
                              ia ? "text-cyan-400 font-medium" : "text-slate-300 hover:text-white"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (hasChildren && item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      itemActive
                        ? "bg-slate-800 text-slate-50 border-l-[3px] border-cyan-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-300 border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-700 pl-2">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive: ia }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                              ia
                                ? "bg-slate-800 text-cyan-400 font-medium"
                                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === "/"}
                className={({ isActive: ia }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                    ia
                      ? "bg-slate-800 text-slate-50 border-l-[3px] border-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-300 border-l-[3px] border-transparent"
                  } ${collapsed ? "justify-center px-2" : ""}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg border border-slate-700">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className={`p-3 border-t border-slate-800 ${collapsed ? "px-2" : ""}`}>
          <NavLink
            to="/settings"
            className={({ isActive: ia }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                ia
                  ? "bg-slate-800 text-slate-50 border-l-[3px] border-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-300 border-l-[3px] border-transparent"
              } ${collapsed ? "justify-center px-2" : ""}`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg border border-slate-700">
                Settings
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Spacer div */}
      <div className={`flex-shrink-0 transition-all duration-200 ${collapsed ? "w-[64px]" : "w-[260px]"}`} />
    </>
  );
}
