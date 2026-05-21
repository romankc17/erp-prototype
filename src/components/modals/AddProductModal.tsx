import { useState } from "react";
import { X, Upload, Plus, Trash2, Layers, Check, RefreshCw, Zap } from "lucide-react";
import type { ProductVariant, VariantAttribute } from "../../data";
import { useStore } from "../../context/StoreContext";
import { useProcurement } from "../../context/ProcurementContext";

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
  const { settings } = useProcurement();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttrs, setVariantAttrs] = useState<VariantAttribute[]>([]);
  const [selectedPresetValues, setSelectedPresetValues] = useState<Record<string, string[]>>({});
  const [activePresets, setActivePresets] = useState<string[]>([]);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");
  const [generatedVariants, setGeneratedVariants] = useState<ProductVariant[]>([]);
  const [quickStockValue, setQuickStockValue] = useState("");
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

  const togglePreset = (presetId: string) => {
    setActivePresets((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
    );
  };

  const togglePresetValue = (presetName: string, value: string) => {
    setSelectedPresetValues((prev) => {
      const current = prev[presetName] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [presetName]: next };
    });
  };

  const generateFromPresets = () => {
    const attrs: VariantAttribute[] = [];
    for (const preset of settings.variantAttributePresets) {
      if (!activePresets.includes(preset.id)) continue;
      const selected = selectedPresetValues[preset.name] ?? [];
      if (selected.length > 0) {
        attrs.push({ name: preset.name, values: selected });
      }
    }
    // Also include manual attributes
    const manualAttrs = variantAttrs.filter(
      (a) => !settings.variantAttributePresets.some((p) => p.name === a.name)
    );
    const next = [...manualAttrs, ...attrs];
    setVariantAttrs(next);
    autoGenerateVariants(next);
  };

  const removePresetAttr = (presetId: string) => {
    const preset = settings.variantAttributePresets.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresets((prev) => prev.filter((id) => id !== presetId));
    setSelectedPresetValues((prev) => {
      const copy = { ...prev };
      delete copy[preset.name];
      return copy;
    });
    const next = variantAttrs.filter((a) => a.name !== preset.name);
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

  const applyQuickStock = () => {
    const val = Number(quickStockValue);
    if (!Number.isFinite(val) || val < 0) return;
    setGeneratedVariants((prev) => prev.map((v) => ({ ...v, stock: val })));
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 overflow-x-auto">
          {[
            { id: "basic", label: "Basic Info", desc: "Name, pricing, image" },
            { id: "variants", label: "Variants", desc: "Color, size, combinations" },
            { id: "stock", label: "Stock", desc: "Initial quantities" },
          ].map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id as typeof step)}
              className={`min-w-[170px] flex-1 py-3 text-left px-2 border-b-2 transition-all ${
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
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* ========== BASIC INFO STEP ========== */}
          {step === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-4">
                <div>
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
                <div className="min-w-0 space-y-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      {showNewCategory ? (
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddNewCategory(); if (e.key === "Escape") setShowNewCategory(false); }}
                            placeholder="New category name"
                            className="min-w-0 h-10 px-3 rounded-lg border border-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button onClick={handleAddNewCategory} className="h-10 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">Add</button>
                          <button onClick={() => setShowNewCategory(false)} className="h-10 w-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"><X className="w-4 h-4" /></button>
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
                    <div className="min-w-0">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${hasVariants ? "translate-x-5" : "translate-x-0.5"}`} />
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
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-3 items-end">
                <div className="min-w-0">
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
                <div className="min-w-0">
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
                <button onClick={addVariantAttribute} className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Global Presets with Checkboxes */}
              {settings.variantAttributePresets.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Global Presets — Select Values</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {settings.variantAttributePresets.map((preset) => {
                      const isActive = activePresets.includes(preset.id);
                      return (
                        <div
                          key={preset.id}
                          className={`rounded-xl border p-3 transition-all ${
                            isActive ? "border-violet-300 bg-violet-50/50" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`preset-${preset.id}`}
                                checked={isActive}
                                onChange={() => togglePreset(preset.id)}
                                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                              />
                              <label htmlFor={`preset-${preset.id}`} className="text-sm font-semibold text-slate-900 cursor-pointer">
                                {preset.name}
                              </label>
                            </div>
                            {isActive && (
                              <span className="text-[10px] font-medium text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">
                                {(selectedPresetValues[preset.name] ?? []).length} selected
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <div className="flex flex-wrap gap-1.5 pl-6">
                              {preset.values.map((val) => {
                                const checked = (selectedPresetValues[preset.name] ?? []).includes(val);
                                return (
                                  <label
                                    key={val}
                                    className={`cursor-pointer px-2 py-1 text-xs rounded-lg border transition-all ${
                                      checked
                                        ? "bg-violet-500 text-white border-violet-500"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={checked}
                                      onChange={() => togglePresetValue(preset.name, val)}
                                    />
                                    {val}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {activePresets.length > 0 && (
                    <button
                      onClick={generateFromPresets}
                      className="w-full h-10 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      Generate Variants from Selected
                    </button>
                  )}
                </div>
              )}

              {/* Defined Attributes */}
              {variantAttrs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Defined Attributes ({variantAttrs.length})</p>
                  {variantAttrs.map((attr, idx) => {
                    const preset = settings.variantAttributePresets.find((p) => p.name === attr.name);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                          {attr.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{attr.name}</span>
                            {preset && (
                              <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">Preset</span>
                            )}
                          </div>
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            {attr.values.map((val) => (
                              <span key={val} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{val}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => preset ? removePresetAttr(preset.id) : removeAttr(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
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
                  <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
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

                  {/* Quick stock fill */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <input
                        type="number"
                        min={0}
                        value={quickStockValue}
                        onChange={(e) => setQuickStockValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") applyQuickStock(); }}
                        placeholder="Set all variant stock to..."
                        className="flex-1 bg-transparent text-sm text-amber-900 placeholder:text-amber-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={applyQuickStock}
                      disabled={!quickStockValue || Number(quickStockValue) < 0}
                      className="h-9 px-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Apply All
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex justify-end gap-2">
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
