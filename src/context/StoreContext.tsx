import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data/clothingData";
import type {
  AppState,
  AuditEvent,
  DiscountPolicy,
  HardwarePreferences,
  ReceiptNumbering,
  Role,
  StoreProfile,
  Transaction,
  Shift,
  HeldCart,
  User,
} from "@/lib/pos/types";
import * as storeService from "@/services/storeService";

export type PosProduct = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  branch?: string;
  price: number;
  basePrice: number;
  salePrice: number | null;
  unit: string;
  color: string;
  size: string;
  availableQty: number;
  image: string;
  hasVariants: boolean;
  variantAttributes: { name: string; options: string[] }[];
  variants: Product["variants"];
  bargainEnabled: boolean;
  seasonalDiscount: number;
  taxSlab: string;
};

function computePosProducts(products: Product[]): PosProduct[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    category: p.category,
    branch: p.branch,
    price: p.salePrice ?? p.basePrice,
    basePrice: p.basePrice,
    salePrice: p.salePrice,
    unit: p.unit,
    color: p.color,
    size: p.size,
    availableQty: p.availableQty,
    image: p.image,
    hasVariants: p.hasVariants,
    variantAttributes: p.variantAttributes,
    variants: p.variants,
    bargainEnabled: p.bargainEnabled,
    seasonalDiscount: p.seasonalDiscount,
    taxSlab: p.taxSlab,
  }));
}

interface StoreCtx {
  // loading
  loading: boolean;

  // catalog
  products: Product[];
  categories: string[];
  posProducts: PosProduct[];

  // setup/config
  storeProfile: StoreProfile;
  hardware: HardwarePreferences;
  receipt: ReceiptNumbering;
  discountPolicy: DiscountPolicy;

  // access
  users: User[];
  currentUser: User | null;
  authLocked: boolean;
  login: (args: { email: string; pin: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  lock: (reason: "idle" | "manual") => Promise<void>;
  unlock: (pin: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  touchActivity: () => Promise<void>;
  requireRole: (roles: Role[]) => boolean;

  // shifts & cash
  activeShift: Shift | null;
  openShift: (openingCash: number) => Promise<{ ok: true } | { ok: false; error: string }>;
  closeShift: (countedCash: number) => Promise<{ ok: true } | { ok: false; error: string }>;
  recordCashMovement: (args: { type: "paid_in" | "paid_out"; amount: number; reason: string }) => Promise<void>;

  // transactions
  transactions: Transaction[];
  createTransaction: (input: storeService.CreateSaleInput) => Promise<{ ok: true; tx: Transaction } | { ok: false; error: string }>;
  getTransactionByReceipt: (receiptNumber: string) => Transaction | null;

  // held carts
  heldCarts: HeldCart[];
  holdCart: (cart: Omit<HeldCart, "id" | "createdAt" | "staffId">) => Promise<{ ok: true } | { ok: false; error: string }>;
  recallCart: (id: string) => HeldCart | null;
  deleteHeldCart: (id: string) => Promise<void>;

  // inventory
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  importProductsCsv: (csvText: string) => Promise<{ ok: true; added: number; errors: string[] } | { ok: false; error: string }>;
  adjustStock: (args: { productId: string; sku?: string; delta: number; reason?: string }) => Promise<void>;

  // settings
  updateStoreProfile: (profile: Partial<StoreProfile>) => Promise<void>;
  updateHardware: (hardware: Partial<HardwarePreferences>) => Promise<void>;
  updateReceipt: (receipt: Partial<ReceiptNumbering>) => Promise<void>;

  // audit
  audit: AuditEvent[];

  // direct state refresh (for advanced use)
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const s = await storeService.getAppState();
    setState(s);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const s = await storeService.getAppState();
      if (mounted) {
        setState(s);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const products = state?.products ?? [];
  const categories = state?.categories ?? [];
  const posProducts = useMemo(() => computePosProducts(products), [products]);

  const currentUser = useMemo(() => {
    if (!state?.auth.userId) return null;
    return state.users.find((u) => u.id === state.auth.userId) ?? null;
  }, [state?.auth.userId, state?.users]);

  const activeShift = useMemo(() => {
    if (!state?.activeShiftId) return null;
    return state.shifts.find((s) => s.id === state.activeShiftId) ?? null;
  }, [state?.activeShiftId, state?.shifts]);

  const requireRole = (roles: Role[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const login: StoreCtx["login"] = async ({ email, pin }) => {
    const res = await storeService.login({ email, pin });
    if (res.ok) {
      await refresh();
      return { ok: true };
    }
    return res;
  };

  const logout = async () => {
    await storeService.logout();
    await refresh();
  };

  const lock = async (reason: "idle" | "manual") => {
    await storeService.lock(reason);
    await refresh();
  };

  const unlock: StoreCtx["unlock"] = async (pin) => {
    const res = await storeService.unlock(pin);
    if (res.ok) await refresh();
    return res;
  };

  const touchActivity = async () => {
    await storeService.touchActivity();
    await refresh();
  };

  const openShift: StoreCtx["openShift"] = async (openingCash) => {
    if (!currentUser) return { ok: false, error: "Login required" };
    const res = await storeService.openShift(openingCash, currentUser.id);
    if (res.ok) await refresh();
    return res;
  };

  const closeShift: StoreCtx["closeShift"] = async (countedCash) => {
    if (!currentUser) return { ok: false, error: "Login required" };
    if (!activeShift) return { ok: false, error: "No active shift" };
    const res = await storeService.closeShift(countedCash, currentUser.id, activeShift.id);
    if (res.ok) await refresh();
    return res;
  };

  const recordCashMovement: StoreCtx["recordCashMovement"] = async (args) => {
    if (!currentUser || !activeShift) return;
    await storeService.recordCashMovement({ ...args, currentUserId: currentUser.id, activeShiftId: activeShift.id });
    await refresh();
  };

  const createTransaction: StoreCtx["createTransaction"] = async (input) => {
    if (!currentUser) return { ok: false, error: "Login required" };
    if (!activeShift) return { ok: false, error: "Open a shift first" };
    const res = await storeService.createTransaction(input, currentUser.id, activeShift.id);
    if (res.ok) await refresh();
    return res;
  };

  const getTransactionByReceipt: StoreCtx["getTransactionByReceipt"] = (receiptNumber) => {
    return state?.transactions.find((t) => t.receiptNumber === receiptNumber) ?? null;
  };

  const addProduct: StoreCtx["addProduct"] = async (p) => {
    await storeService.createProduct(p);
    await refresh();
  };

  const updateProduct: StoreCtx["updateProduct"] = async (id, updates) => {
    await storeService.updateProduct(id, updates);
    await refresh();
  };

  const deleteProduct: StoreCtx["deleteProduct"] = async (id) => {
    await storeService.deleteProduct(id);
    await refresh();
  };

  const addCategory: StoreCtx["addCategory"] = async (name) => {
    await storeService.addCategory(name);
    await refresh();
  };

  const importProductsCsv: StoreCtx["importProductsCsv"] = async (csvText) => {
    const res = await storeService.importProductsCsv(csvText);
    if (res.ok) await refresh();
    return res;
  };

  const adjustStock: StoreCtx["adjustStock"] = async (args) => {
    await storeService.adjustStock(args);
    await refresh();
  };

  const holdCart: StoreCtx["holdCart"] = async (cart) => {
    if (!currentUser) return { ok: false, error: "Login required" };
    const res = await storeService.holdCart(cart, currentUser.id);
    if (res.ok) await refresh();
    return res;
  };

  const recallCart: StoreCtx["recallCart"] = (id) => {
    return state?.heldCarts.find((c) => c.id === id) ?? null;
  };

  const deleteHeldCart: StoreCtx["deleteHeldCart"] = async (id) => {
    await storeService.deleteHeldCart(id);
    await refresh();
  };

  const updateStoreProfile = async (profile: Partial<StoreProfile>) => {
    await storeService.updateStoreProfile(profile);
    await refresh();
  };

  const updateHardware = async (hardware: Partial<HardwarePreferences>) => {
    await storeService.updateHardware(hardware);
    await refresh();
  };

  const updateReceipt = async (receipt: Partial<ReceiptNumbering>) => {
    await storeService.updateReceipt(receipt);
    await refresh();
  };

  const value: StoreCtx = {
    loading,
    products,
    categories,
    posProducts,

    storeProfile: state?.store ?? seedStoreProfile(),
    hardware: state?.hardware ?? seedHardware(),
    receipt: state?.receipt ?? seedReceipt(),
    discountPolicy: state?.discountPolicy ?? seedDiscountPolicy(),

    users: state?.users ?? [],
    currentUser,
    authLocked: state?.auth.locked ?? false,
    login,
    logout,
    lock,
    unlock,
    touchActivity,
    requireRole,

    activeShift,
    openShift,
    closeShift,
    recordCashMovement,

    transactions: state?.transactions ?? [],
    createTransaction,
    getTransactionByReceipt,

    heldCarts: state?.heldCarts ?? [],
    holdCart,
    recallCart,
    deleteHeldCart,

    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    importProductsCsv,
    adjustStock,

    updateStoreProfile,
    updateHardware,
    updateReceipt,

    audit: state?.audit ?? [],
    refresh,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function seedStoreProfile(): StoreProfile {
  return {
    businessName: "Demo Store",
    location: "Kathmandu, Nepal",
    receiptFooter: "Thank you for shopping with us!",
    currency: { code: "NPR", symbol: "Rs.", locale: "en-IN" },
    taxRules: [
      { id: "vat13", name: "VAT 13%", rate: 0.13, enabled: true },
      { id: "vat5", name: "VAT 5%", rate: 0.05, enabled: true },
      { id: "vat18", name: "VAT 18%", rate: 0.18, enabled: true },
    ],
  };
}

function seedHardware(): HardwarePreferences {
  return {
    receiptPrinterEnabled: true,
    barcodeScannerEnabled: true,
    cashDrawerEnabled: true,
    paymentTerminalEnabled: true,
    autoOpenCashDrawerOnCashSale: true,
  };
}

function seedReceipt(): ReceiptNumbering {
  return { prefix: "REC", includeDate: true, sequenceDigits: 4, nextSequence: 1 };
}

function seedDiscountPolicy(): DiscountPolicy {
  return { managerOverridePercentThreshold: 15, managerOverrideFixedThreshold: 500 };
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
