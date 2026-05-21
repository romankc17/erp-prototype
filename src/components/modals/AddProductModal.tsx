import { useState } from "react";
import { X, Upload, Plus, Trash2, Layers, Check, RefreshCw } from "lucide-react";
import type { ProductVariant, VariantAttribute } from "../../data";
import { useStore } from "../../context/StoreContext";

interface Props {
  onClose: () => void;
}

function generateBarcode() {
  return "8901207" + Math.floor(100000 + Math.random() * 899999).toString();
}

const CATEGORY_ABBREVS: Record<string, string> = {
  Clothing: "CLO",
  Electronics: "ELE",
  Groceries: "GRO",
  "Personal Care": "PCR",
  "Home & Kitchen": "HMK",
  Beverages: "BEV",
  Stationery: "STA",
  Furniture: "FUR",
};

function buildSKU(category: string, name: string): string {
  if (!category || !name) return "";
  const catKey = Object.keys(CATEGORY_ABBREVS).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );
  const catPart = catKey
    ? CATEGORY_ABBREVS[catKey]
    : category.replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase();
  const namePart = name
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 4)
    .toUpperCase();
  const rand = Math.floor(10000 + Math.random() * 90000).toString();
  return `${catPart}-${namePart}-${rand}`;
}

export default function AddProductModal({ onClose }: Props) {
  const { categories, addProduct, addCategory } = useStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttrs, setVariantAttrs] = useState<VariantAttribute[]>([]);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");
  const [generatedVariants, setGeneratedVariants] = useState<ProductVariant[]>([]);
  const [baseSku, setBaseSku] = useState("");
  const [skuAutoMode, setSkuAutoMode] = useState(true);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [description, setDescription] = useState("");
  const [initialStock, setInitialStock] = useState("0");
  const [location, setLocation] = useState("Rack A1");
  const [branch, setBranch] = useState("Main Branch");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [step, setStep] = useState<"basic" | "variants" | "stock">("basic");

  const addVariantAttribute = () => {
    if (!newAttrName.trim() || !newAttrValues.trim()) return;
    const values = newAttrValues.split(",").map((v) => v.trim()).filter(Boolean);
    if (values.length === 0) return;
    const newAttr: VariantAttribute = { name: newAttrName.trim(), values };
    const next = [...variantAttrs, newAttr];
    setVariantAttrs(next);
    setNewAttrName("");
    setNewAttrValues("");
    autoGenerateVariants(next);
  };

  const removeAttr = (index: number) => {
    const next = variantAttrs.filter((_, i) => i !== index);
    setVariantAttrs(next);
    autoGenerateVariants(next);
  };

  const autoGenerateVariants = (attrs: VariantAttribute[]) => {
    if (attrs.length === 0) {
      setGeneratedVariants([]);
      return;
    }
    const combinations: Record<string, string>[] = [];
    const recurse = (idx: number, current: Record<string, string>) => {
      if (idx === attrs.length) {
        combinations.push({ ...current });
        return;
      }
      for (const val of attrs[idx].values) {
        current[attrs[idx].name] = val;
        recurse(idx + 1, current);
      }
    };
    recurse(0, {});

    const variants: ProductVariant[] = combinations.map((combo) => {
      const suffix = Object.values(combo).join("-");
      return {
        id: Math.random().toString(36).substring(2, 8),
        sku: baseSku ? `${baseSku}-${suffix}` : `SKU-${suffix}`,
        barcode: generateBarcode(),
        attributes: combo,
        stock: 0,
        price: 0,
      };
    });
    setGeneratedVariants(variants);
  };

  const updateVariantStock = (id: string, stock: number) => {
    setGeneratedVariants((prev) => prev.map((v) => v.id === id ? { ...v, stock } : v));
  };

  const updateVariantBarcode = (id: string, barcode: string) => {
    setGeneratedVariants((prev) => prev.map((v) => v.id === id ? { ...v, barcode } : v));
  };

  const handleBaseSkuChange = (val: string) => {
    setSkuAutoMode(false);
    setBaseSku(val);
    if (hasVariants && variantAttrs.length > 0) {
      const next = generatedVariants.map((v) => ({
        ...v,
        sku: val ? `${val}-${Object.values(v.attributes).join("-")}` : v.sku,
      }));
      setGeneratedVariants(next);
    }
  };

  const handleProductNameChange = (val: string) => {
    setProductName(val);
    if (skuAutoMode) {
      const newSku = buildSKU(category, val);
      setBaseSku(newSku);
      if (hasVariants && variantAttrs.length > 0) {
        const next = generatedVariants.map((v) => ({
          ...v,
          sku: newSku ? `${newSku}-${Object.values(v.attributes).join("-")}` : v.sku,
        }));
        setGeneratedVariants(next);
      }
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (skuAutoMode) {
      const newSku = buildSKU(val, productName);
      setBaseSku(newSku);
      if (hasVariants && variantAttrs.length > 0) {
        const next = generatedVariants.map((v) => ({
          ...v,
          sku: newSku ? `${newSku}-${Object.values(v.attributes).join("-")}` : v.sku,
        }));
        setGeneratedVariants(next);
      }
    }
  };

  const resetSkuToAuto = () => {
    setSkuAutoMode(true);
    const newSku = buildSKU(category, productName);
    setBaseSku(newSku);
  };

  const totalVariantStock = generatedVariants.reduce((sum, v) => sum + v.stock, 0);

  const handleAddNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setCategory(trimmed);
    setNewCategoryInput("");
    setShowNewCategory(false);
    if (skuAutoMode) {
      const newSku = buildSKU(trimmed, productName);
      setBaseSku(newSku);
    }
  };

  const handleSave = () => {
    if (!productName.trim()) return;
    const qty = hasVariants ? totalVariantStock : Number(initialStock);
    addProduct({
      id: `P${Date.now()}`,
      name: productName.trim(),
      sku: baseSku || buildSKU(category, productName),
      barcode: generateBarcode(),
      category: category || "Uncategorized",
      subCategory: "",
      brand: "",
      description,
      costPrice: Number(costPrice) || 0,
      basePrice: Number(sellingPrice) || 0,
      salePrice: null,
      unit,
      color: "Multi",
      size: "Multi",
      hsnCode: "",
      taxSlab: "13%",
      availableQty: qty,
      reorderLevel: 10,
      minStock: 5,
      location,
      branch,
      status: "Active",
      image: imagePreview || "",
      hasVariants,
      variantAttributes: variantAttrs.map((a) => ({ name: a.name, options: a.values })),
      variants: generatedVariants.map((v) => ({ ...v, price: Number(sellingPrice) || 0 })),
      bargainEnabled: false,
      seasonalDiscount: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[680px] max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Add New Product</h3>
            <p className="text-xs text-slate-500">Create a new product with optional variants</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5">
          {[
            { id: "basic", label: "Basic Info", desc: "Name, pricing, image" },
            { id: "variants", label: "Variants", desc: "Color, size, combinations" },
            { id: "stock", label: "Stock", desc: "Initial quantities" },
          ].map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id as typeof step)}
              className={`flex-1 py-3 text-left px-2 border-b-2 transition-all ${
                step === s.id ? "border-blue-500 bg-white" : "border-transparent hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === s.id ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
                }`}>{i + 1}</span>
                <div>
                  <p className={`text-sm font-medium ${step === s.id ? "text-slate-900" : "text-slate-500"}`}>{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* ========== BASIC INFO STEP ========== */}
          {step === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                    onClick={() => document.getElementById("product-image")?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <p className="text-[10px] text-slate-400 text-center px-2">Click to upload</p>
                      </>
                    )}
                    <input id="product-image" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImagePreview(URL.createObjectURL(f)); }} />
                  </div>
                </div>
                <div className="col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => handleProductNameChange(e.target.value)}
                      placeholder="e.g., Premium Cotton T-Shirt"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-slate-700">SKU</label>
                        {skuAutoMode ? (
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Auto</span>
                        ) : (
                          <button
                            onClick={resetSkuToAuto}
                            className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            title="Reset to auto-generated SKU"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Reset
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={baseSku}
                        onChange={(e) => handleBaseSkuChange(e.target.value)}
                        placeholder="Auto-generated from category & name"
                        className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono ${skuAutoMode ? "border-emerald-300 bg-emerald-50/30" : "border-slate-300"}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      {showNewCategory ? (
                        <div className="flex gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddNewCategory(); if (e.key === "Escape") setShowNewCategory(false); }}
                            placeholder="New category name"
                            className="flex-1 h-10 px-3 rounded-lg border border-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button onClick={handleAddNewCategory} className="h-10 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">Add</button>
                          <button onClick={() => setShowNewCategory(false)} className="h-10 px-2 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <select
                          value={category}
                          onChange={(e) => {
                            if (e.target.value === "__new__") { setShowNewCategory(true); return; }
                            handleCategoryChange(e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">Select category</option>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                          <option value="__new__">+ Add new category</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white">
                        <option>pcs</option>
                        <option>kg</option>
                        <option>box</option>
                        <option>set</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (NPR)</label>
                  <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (NPR)</label>
                  <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" />
              </div>

              {/* Variant Toggle */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                      <Layers className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">This product has variants</p>
                      <p className="text-xs text-slate-500">Each variant gets its own barcode and SKU</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setHasVariants(!hasVariants); if (!hasVariants) setStep("variants"); }}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasVariants ? "bg-blue-500" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${hasVariants ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========== VARIANTS STEP ========== */}
          {step === "variants" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700">Define variant attributes like Color and Size. All combinations will be auto-generated with unique SKUs and barcodes.</p>
              </div>

              {/* Add Attribute */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Attribute Name</label>
                  <input
                    type="text"
                    value={newAttrName}
                    onChange={(e) => setNewAttrName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariantAttribute(); } }}
                    placeholder="e.g., Color, Size, Material"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Values (comma-separated)</label>
                  <input
                    type="text"
                    value={newAttrValues}
                    onChange={(e) => setNewAttrValues(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariantAttribute(); } }}
                    placeholder="e.g., Red, Blue, Black or S, M, L, XL"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button onClick={addVariantAttribute} className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Quick presets */}
              {variantAttrs.length === 0 && (
                <div className="flex gap-2">
                  <button onClick={() => { setNewAttrName("Color"); setNewAttrValues("Red, Blue, Black"); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition-colors">
                    + Color preset
                  </button>
                  <button onClick={() => { setNewAttrName("Size"); setNewAttrValues("S, M, L, XL"); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition-colors">
                    + Size preset
                  </button>
                </div>
              )}

              {/* Defined Attributes */}
              {variantAttrs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Defined Attributes ({variantAttrs.length})</p>
                  {variantAttrs.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                        {attr.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-900">{attr.name}</span>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {attr.values.map((val) => (
                            <span key={val} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{val}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => removeAttr(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Generated Variants */}
              {generatedVariants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Generated Variants ({generatedVariants.length})
                    </p>
                    <p className="text-xs text-slate-500">Total stock: <span className="font-semibold text-slate-900">{totalVariantStock}</span></p>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">Variant</th>
                          <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">SKU</th>
                          <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">Barcode</th>
                          <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generatedVariants.map((v) => (
                          <tr key={v.id}>
                            <td className="px-3 py-2">
                              <div className="flex gap-1.5">
                                {Object.entries(v.attributes).map(([key, val]) => (
                                  <span key={key} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded">
                                    {val}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs text-slate-600">{v.sku}</td>
                            <td className="px-3 py-2">
                              <input type="text" value={v.barcode} onChange={(e) => updateVariantBarcode(v.id, e.target.value)} className="w-full text-xs font-mono border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" min={0} value={v.stock} onChange={(e) => updateVariantStock(v.id, Number(e.target.value))} className="w-16 text-right text-xs font-semibold border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 ml-auto block" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {variantAttrs.length === 0 && (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Add attributes (Color, Size) to generate variant combinations</p>
                  <p className="text-xs mt-1">Each variant gets its own barcode and SKU</p>
                </div>
              )}
            </div>
          )}

          {/* ========== STOCK STEP ========== */}
          {step === "stock" && (
            <div className="space-y-4">
              {!hasVariants ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input type="number" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              ) : generatedVariants.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Stock per Variant</label>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                      Total: {totalVariantStock}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">Variant</th>
                          <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">SKU</th>
                          <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">Barcode</th>
                          <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generatedVariants.map((v) => (
                          <tr key={v.id}>
                            <td className="px-3 py-2">
                              <div className="flex gap-1.5">
                                {Object.entries(v.attributes).map(([key, val]) => (
                                  <span key={key} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded">{val}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs text-slate-600">{v.sku}</td>
                            <td className="px-3 py-2 font-mono text-xs text-slate-400">{v.barcode}</td>
                            <td className="px-3 py-2">
                              <input type="number" min={0} value={v.stock} onChange={(e) => updateVariantStock(v.id, Number(e.target.value))} className="w-16 text-right text-xs font-semibold border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 ml-auto block" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No variants defined yet.</p>
                  <button onClick={() => setStep("variants")} className="text-blue-500 text-sm hover:underline mt-1">Go to Variants tab</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option>Rack A1</option>
                    <option>Rack A2</option>
                    <option>Shelf B2</option>
                    <option>Warehouse 1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option>Main Branch</option>
                    <option>Thamel Branch</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex gap-2">
            {step !== "basic" && (
              <button onClick={() => setStep(step === "variants" ? "basic" : "variants")} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
              Cancel
            </button>
            {step !== "stock" ? (
              <button onClick={() => setStep(step === "basic" ? "variants" : "stock")} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                Next <Check className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                <Check className="w-4 h-4" /> Save Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
