import { HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { ProcurementProvider } from "./context/ProcurementContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LockOverlay from "./components/LockOverlay";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Returns from "./pages/Returns";
import POS from "./pages/POS";
import Login from "./pages/Login";
import PurchaseOrders from "./pages/PurchaseOrders";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import SendPurchaseOrder from "./pages/SendPurchaseOrder";
import POReceiving from "./pages/POReceiving";
import Vendors from "./pages/Vendors";
import VendorDetail from "./pages/VendorDetail";
import SettingsLayout from "./pages/settings/SettingsLayout";
import AccountingLayout from "./pages/accounting/AccountingLayout";
import { useEffect } from "react";
import { useStore } from "./context/StoreContext";
import { useIdleLock } from "./hooks/useIdleLock";

function AppLayout() {
  const location = useLocation();
  const { currentUser, requireRole } = useStore();
  useIdleLock({ idleMs: 5 * 60 * 1000 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (currentUser?.role === "cashier" && !location.pathname.startsWith("/pos")) {
    return <Navigate to="/pos" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <LockOverlay />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/pos" element={<POS />} />
            {/* Purchase Orders */}
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/create" element={<CreatePurchaseOrder />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="/purchase-orders/:id/send" element={<SendPurchaseOrder />} />
            <Route path="/purchase-orders/:id/receive" element={<POReceiving />} />
            {/* Accounting */}
            <Route path="/accounting/*" element={requireRole(["admin", "manager"]) ? <AccountingLayout /> : <Navigate to="/" replace />} />
            {/* Settings */}
            <Route path="/settings/*" element={requireRole(["admin"]) ? <SettingsLayout /> : <Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RequireLogin({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
function App() {
  return (
    <StoreProvider>
      <ProcurementProvider>
        <WorkspaceProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<RequireLogin><AppLayout /></RequireLogin>} />
            </Routes>
          </HashRouter>
        </WorkspaceProvider>
      </ProcurementProvider>
    </StoreProvider>
  );
}

export default App;
