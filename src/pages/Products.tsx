import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, ChevronDown, Package, AlertTriangle, IndianRupee,
  MoreHorizontal, Eye, Barcode, RotateCcw, Trash2, X,
  Layers, Check, Pencil,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import AddProductModal from "../components/modals/AddProductModal";
import CreateBarcodeModal from "../components/modals/CreateBarcodeModal";
import MoveDamageReturnModal from "../components/modals/MoveDamageReturnModal";
import AddStockModal from "../components/modals/AddStockModal";
import { useStore } from "../context/StoreContext";
import type { Product } from "../data";

function stockStatus(qty: number): string {
  if (qty <= 0) return "Out of Stock";
  if (qty <= 10) return "Low Stock";
  return "In Stock";
}

export default function Products() {
  const { products, categories, importProductsCsv, adjustStock, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [barcodeTargets, setBarcodeTargets] = useState<Product[]>([]);
  const [moveTargets, setMoveTargets] = useState<Product[]>([]);
  const [bulkDropdown, setBulkDropdown] = useState(false);
  const [rowDropdown, setRowDropdown] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rowDropdownRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setBulkDropdown(false);
      if (rowDropdownRef.current && !rowDropdownRef.current.contains(e.target as Node)) setRowDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchStatus = statusFilter === "All" || stockStatus(p.availableQty) === statusFilter || statusFilter === p.status;
    const matchBranch = branchFilter === "All" || p.branch === branchFilter;
    return matchSearch && matchCategory && matchStatus && matchBranch;
  });

  const hasActiveFilters = search !== "" || categoryFilter !== "All Categories" || statusFilter !== "All" || branchFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setStatusFilter("All");
    setBranchFilter("All");
  };

  const toggleSelect = (id: string) => {
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
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openBarcode = (products: Product[]) => {
    setBarcodeTargets(products);
    setShowBarcode(true);
    setRowDropdown(null);
  };

  const openMove = (products: Product[]) => {
    setMoveTargets(products);
    setShowMove(true);
    setRowDropdown(null);
  };

  const openAddStock = (product: Product) => {
    setActiveProduct(product);
    setShowAddStock(true);
    setRowDropdown(null);
  };

  const onPickImport = () => {
    setImportStatus(null);
    importFileRef.current?.click();
  };

  const onImportFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const res = await importProductsCsv(text);
      if (!res.ok) {
        setImportStatus(res.error);
        return;
      }
      setImportStatus(
        `Imported ${res.added} products${res.errors.length ? ` (skipped ${res.errors.length} rows)` : ""}.`
      );
    } catch {
      setImportStatus("Failed to read file");
    } finally {
      if (importFileRef.current) importFileRef.current.value = "";
    }
  };

  const lowStockCount = products.filter(p => p.availableQty <= p.minStock).length;
  const totalValue = products.reduce((sum, p) => sum + p.costPrice * p.availableQty, 0);
  const stats = [
    { title: "Total Products", value: products.length.toString(), icon: Package, sub: "across all categories", color: "text-blue-700", bg: "bg-blue-50" },
    { title: "Low Stock Products", value: lowStockCount.toString(), icon: AlertTriangle, sub: "need restocking", color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Total Inventory Value", value: `Rs. ${(totalValue / 100000).toFixed(2)}L`, icon: IndianRupee, sub: "estimated at cost price", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Inventory / Products</p>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all inventory products and stock information.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={importFileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={onPickImport}
            className="h-10 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Import CSV
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>
      </div>
      {importStatus && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${importStatus.startsWith("Imported") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {importStatus}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500">
          <option>All Categories</option>
          {["All", ...categories].filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500">
          <option>All</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500">
          <option>All</option>
          <option>Main Branch</option>
          <option>Thamel Branch</option>
        </select>
        <button className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors">
          Filter
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="h-10 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            title="Reset all filters"
          >
            <X className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{s.title}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between min-h-[52px]">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{selectedIds.size} selected</span>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setBulkDropdown(!bulkDropdown)} className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors">
                  <Layers className="w-3.5 h-3.5" /> Bulk Actions <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {bulkDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-20 py-1">
                    {[
                      { label: "Add Stock", action: () => { openAddStock(products.find(p => selectedIds.has(p.id))!); } },
                      { label: "Create Barcode", action: () => openBarcode(products.filter(p => selectedIds.has(p.id))) },
                      { label: "Move to Damage / Return", action: () => openMove(products.filter(p => selectedIds.has(p.id))) },
                      { label: "Export Selected", action: () => setBulkDropdown(false) },
                    ].map((item) => (
                      <button key={item.label} onClick={item.action} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 my-1" />
                    <button onClick={() => {
                      if (window.confirm(`Delete ${selectedIds.size} selected product(s)?`)) {
                        selectedIds.forEach((id) => deleteProduct(id));
                        clearSelection();
                      }
                      setBulkDropdown(false);
                    }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => openBarcode(products.filter(p => selectedIds.has(p.id)))} className="h-8 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors">
                <Barcode className="w-3.5 h-3.5" /> Create Barcode
              </button>
              <button onClick={clearSelection} className="h-8 px-3 text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          ) : (
            <span className="text-sm text-slate-400">0 selected</span>
          )}
          <span className="text-xs text-slate-400">{filtered.length} products</span>
        </div>

        {/* Products Table — With Size, Color, Cost, Selling Price, Unit */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-14">Image</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">SKU / Barcode</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Color</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Cost Price</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Selling Price</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Qty</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className={`group hover:bg-slate-50 transition-colors ${selectedIds.has(product.id) ? "bg-blue-50/40" : ""}`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setDetailProduct(product)}
                      className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden hover:border-blue-300 transition-colors"
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="max-h-9 max-w-full object-contain" />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">{product.name.charAt(0)}</span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setDetailProduct(product)} className="text-left group/link">
                      <p className="text-sm font-semibold text-slate-900 group-hover/link:text-blue-600 transition-colors">{product.name}</p>
                      {product.hasVariants && (
                        <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-medium rounded-full">
                          <Layers className="w-3 h-3" />
                          {product.variantAttributes?.map((a) => a.name).join(" x ")} ({product.variants?.length})
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-xs font-mono font-medium text-slate-600">{product.sku}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{product.barcode}</p>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{product.category}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-slate-300"
                        style={{
                          backgroundColor:
                            product.color === "Black" ? "#1a1a2e"
                            : product.color === "Blue" ? "#2563eb"
                            : product.color === "Gray" ? "#9ca3af"
                            : product.color === "White" ? "#f8fafc"
                            : product.color === "Multi" ? "#e2e8f0"
                            : "#e2e8f0",
                        }}
                      />
                      <span className="text-sm text-slate-600">{product.color}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600 text-right">Rs. {product.costPrice.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-slate-900 text-right">Rs. {(product.salePrice ?? product.basePrice).toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{product.unit}</td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-slate-900 text-right">{product.availableQty}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={stockStatus(product.availableQty)} /></td>
                  <td className="px-3 py-2.5 relative">
                    <div ref={rowDropdownRef} data-product-id={product.id}>
                      <button
                        onClick={() => setRowDropdown(rowDropdown === product.id ? null : product.id)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                      {rowDropdown === product.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-30 py-1">
                          {[
                            { label: "View Details", icon: Eye, color: "text-slate-700", action: () => { setDetailProduct(product); setRowDropdown(null); } },
                            { label: "Edit", icon: Pencil, color: "text-blue-600", action: () => { setEditProduct(product); setRowDropdown(null); } },
                            { label: "Add Stock", icon: Plus, color: "text-blue-600", action: () => openAddStock(product) },
                            { label: "Create Barcode", icon: Barcode, color: "text-violet-600", action: () => openBarcode([product]) },
                            { label: "Move to Damage / Return", icon: RotateCcw, color: "text-amber-600", action: () => openMove([product]) },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className={`w-full text-left px-3 py-2 text-sm ${item.color} hover:bg-slate-50 transition-colors flex items-center gap-2`}
                            >
                              <item.icon className="w-3.5 h-3.5" /> {item.label}
                            </button>
                          ))}
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                              setRowDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-slate-500">Showing {filtered.length} items</span>
            <select className="h-8 px-2 rounded-lg border border-slate-300 text-xs bg-white cursor-pointer focus:outline-none">
              <option>10 per page</option>
              <option>25 per page</option>
              <option>50 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-[13px]">
            <button className="px-2 py-1 text-slate-400 hover:text-slate-600">Previous</button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${p === 1 ? "bg-blue-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
            ))}
            <button className="px-2 py-1 text-slate-500 hover:text-slate-700">Next</button>
          </div>
        </div>
      </div>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddStock={openAddStock}
        onCreateBarcode={(p) => { setBarcodeTargets([p]); setShowBarcode(true); }}
        onMoveDamage={(p) => { setMoveTargets([p]); setShowMove(true); }}
      />

      {/* Modals */}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} />}
      {showBarcode && barcodeTargets.length > 0 && <CreateBarcodeModal products={barcodeTargets} onClose={() => { setShowBarcode(false); setBarcodeTargets([]); }} />}
      {showMove && moveTargets.length > 0 && (
        <MoveDamageReturnModal
          products={moveTargets}
          onClose={() => { setShowMove(false); setMoveTargets([]); }}
          onMove={({ productId, sku, delta, reason, type }) => adjustStock({ productId, sku, delta, reason: `${type}: ${reason}` })}
        />
      )}
      {showAddStock && activeProduct && (
        <AddStockModal
          product={activeProduct}
          onClose={() => { setShowAddStock(false); setActiveProduct(null); }}
          onAddStock={(changes) => {
            changes.forEach(({ sku, delta, reason }) => {
              adjustStock({ productId: activeProduct.id, sku, delta, reason });
            });
          }}
        />
      )}
      {editProduct && (
        <AddProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
}
