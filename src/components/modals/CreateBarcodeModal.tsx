import { useState } from "react";
import { X, Barcode, Printer, Package } from "lucide-react";
import type { Product } from "../../data";

interface Props {
  products: Product[];
  onClose: () => void;
}

type BarcodeItem = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  variant: string;
  qty: number;
};

export default function CreateBarcodeModal({ products, onClose }: Props) {
  // Flatten products + variants into barcode items
  const initialItems: BarcodeItem[] = products.flatMap((p) => {
    if (p.hasVariants && p.variants.length > 0) {
      return p.variants.map((v) => ({
        id: v.id,
        name: p.name,
        sku: v.sku,
        barcode: v.barcode,
        variant: Object.entries(v.attributes).map(([, val]) => val).join(" / "),
        qty: 1,
      }));
    }
    return [{
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      variant: "",
      qty: 1,
    }];
  });

  const [items, setItems] = useState<BarcodeItem[]>(initialItems);

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, qty) } : it)));
  };

  const totalLabels = items.reduce((sum, it) => sum + it.qty, 0);

  const handlePrint = () => {
    const labels = items.flatMap((it) =>
      Array.from({ length: it.qty }, () => ({
        name: it.name,
        sku: it.sku,
        barcode: it.barcode,
        variant: it.variant,
      }))
    );

    if (labels.length === 0) return;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Barcode Labels</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e2e8f0;
    }
    .header h1 { font-size: 18px; color: #0f172a; }
    .header p { font-size: 12px; color: #64748b; margin-top: 4px; }
    .print-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      padding: 10px 20px;
      background: #0f172a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn:hover { background: #1e293b; }
    @media print {
      .print-btn { display: none; }
      body { background: white; padding: 0; }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .label {
      background: white;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 130px;
    }
    .label-name {
      font-size: 10px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 2px;
      line-height: 1.3;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .label-variant {
      font-size: 9px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .label svg {
      max-width: 170px;
      height: 44px;
    }
    .label-sku {
      font-size: 8px;
      color: #94a3b8;
      font-family: monospace;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <div class="header">
    <h1>Barcode Labels</h1>
    <p>${labels.length} label${labels.length > 1 ? "s" : ""} · ${products.map(p => p.name).join(", ")}</p>
  </div>
  <div class="grid">
    ${labels.map((item, i) => `
      <div class="label">
        <div class="label-name">${item.name}</div>
        ${item.variant ? `<div class="label-variant">${item.variant}</div>` : ""}
        <svg id="bc-${i}"></svg>
        <div class="label-sku">${item.sku}</div>
      </div>
    `).join("")}
  </div>
  <script>
    window.onload = function() {
      const labels = ${JSON.stringify(labels)};
      labels.forEach((item, i) => {
        try {
          JsBarcode("#bc-" + i, item.barcode, {
            format: "CODE128",
            width: 2,
            height: 38,
            displayValue: true,
            fontSize: 10,
            margin: 0
          });
        } catch(e) {
          console.error("Barcode error:", e);
        }
      });
    };
  </script>
</body>
</html>`;

    w.document.open();
    w.document.write(html);
    w.document.close();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <Barcode className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create Barcode Labels</h3>
              <p className="text-xs text-slate-500">{products.length} product{products.length > 1 ? "s" : ""} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.variant && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded">
                      {item.variant}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-xs text-slate-500">Qty</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={item.qty}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  className="w-14 h-9 px-2 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No items available for barcode printing.</p>
            </div>
          )}

          {/* Summary */}
          {totalLabels > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <span className="text-sm text-slate-500">Total labels</span>
              <span className="text-lg font-bold text-slate-900">{totalLabels}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={totalLabels === 0}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              totalLabels === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            <Printer className="w-4 h-4" /> Generate & Print
          </button>
        </div>
      </div>
    </div>
  );
}
