// ============ CLOTHING PRODUCT DATA ============

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  attributes: Record<string, string>;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subCategory: string;
  brand: string;
  description: string;
  costPrice: number;
  basePrice: number;
  salePrice: number | null;
  unit: string;
  color: string;
  size: string;
  hsnCode: string;
  taxSlab: string;
  availableQty: number;
  reorderLevel: number;
  minStock: number;
  location: string;
  branch: string;
  status: "Active" | "Inactive";
  image: string;
  hasVariants: boolean;
  variantAttributes: { name: string; options: string[] }[];
  variants: ProductVariant[];
  bargainEnabled: boolean;
  seasonalDiscount: number; // percentage
}

const SIZES_ALL = ["S", "M", "L", "XL", "XXL"];
const SIZES_PANT = ["28", "30", "32", "34", "36", "38"];
const SIZES_KURTA = ["38", "40", "42", "44", "46"];
const COLORS_TSHIRT = ["Black", "White", "Navy", "Grey", "Red", "Blue", "Green"];
const COLORS_KURTA = ["White", "Maroon", "Black", "Beige", "Olive"];
const COLORS_PANT = ["Black", "Navy", "Grey", "Brown"];

function makeVariants(skuBase: string, barcodeBase: string, sizes: string[], colors: string[], price: number, stockFn: () => number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  let idx = 0;
  for (const color of colors) {
    for (const size of sizes) {
      variants.push({
        id: `${skuBase}-v${idx}`,
        sku: `${skuBase}-${size}-${color.charAt(0)}`,
        barcode: `${barcodeBase}${idx.toString().padStart(3, "0")}`,
        attributes: { Color: color, Size: size },
        stock: stockFn(),
        price,
      });
      idx++;
    }
  }
  return variants;
}

function stockRandom() { return Math.floor(Math.random() * 30) + 5; }
function stockHigh() { return Math.floor(Math.random() * 50) + 20; }

export const clothingProducts: Product[] = [
  // === PANTS ===
  {
    id: "P001", name: "Men's Regular Fit Jeans", sku: "DZ-JEANS-REG", barcode: "8901234567000",
    category: "Pant", subCategory: "Jeans", brand: "Daraz Denim",
    description: "Regular fit denim jeans with stretch comfort",
    costPrice: 650, basePrice: 1399, salePrice: null, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620462", taxSlab: "13%",
    availableQty: 186, reorderLevel: 30, minStock: 10,
    location: "Rack P1", branch: "Main Branch", status: "Active", image: "/images/products/jeans.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: COLORS_PANT }, { name: "Size", options: SIZES_PANT }],
    variants: makeVariants("DZ-JEANS-REG", "890123456700", SIZES_PANT, COLORS_PANT, 1399, stockRandom),
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "P002", name: "Slim Fit Chinos", sku: "DZ-CHINO-SLM", barcode: "8901234567010",
    category: "Pant", subCategory: "Chinos", brand: "Urban Style",
    description: "Slim fit cotton chinos for casual wear",
    costPrice: 480, basePrice: 999, salePrice: null, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620462", taxSlab: "13%",
    availableQty: 142, reorderLevel: 25, minStock: 8,
    location: "Rack P2", branch: "Main Branch", status: "Active", image: "/images/products/chinos.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: COLORS_PANT.slice(0, 3) }, { name: "Size", options: SIZES_PANT }],
    variants: makeVariants("DZ-CHINO-SLM", "890123456701", SIZES_PANT, COLORS_PANT.slice(0, 3), 999, stockRandom),
    bargainEnabled: true, seasonalDiscount: 10,
  },
  {
    id: "P003", name: "Formal Trousers", sku: "DZ-FORMAL-TR", barcode: "8901234567020",
    category: "Pant", subCategory: "Formal", brand: "Office Wear",
    description: "Premium formal trousers for office and events",
    costPrice: 550, basePrice: 1199, salePrice: 999, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620342", taxSlab: "13%",
    availableQty: 98, reorderLevel: 20, minStock: 5,
    location: "Rack P3", branch: "Main Branch", status: "Active", image: "/images/products/formal.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Black", "Grey", "Navy"] }, { name: "Size", options: SIZES_PANT }],
    variants: makeVariants("DZ-FORMAL-TR", "890123456702", SIZES_PANT, ["Black", "Grey", "Navy"], 999, stockRandom),
    bargainEnabled: false, seasonalDiscount: 15,
  },
  {
    id: "P004", name: "Cargo Pants", sku: "DZ-CARGO-MLT", barcode: "8901234567030",
    category: "Pant", subCategory: "Cargo", brand: "Trail Blazer",
    description: "Multi-pocket cargo pants for outdoor adventures",
    costPrice: 520, basePrice: 1299, salePrice: null, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620462", taxSlab: "13%",
    availableQty: 76, reorderLevel: 15, minStock: 5,
    location: "Rack P4", branch: "Main Branch", status: "Active", image: "/images/products/cargo.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Olive", "Black", "Beige"] }, { name: "Size", options: SIZES_PANT }],
    variants: makeVariants("DZ-CARGO-MLT", "890123456703", SIZES_PANT, ["Olive", "Black", "Beige"], 1299, stockRandom),
    bargainEnabled: true, seasonalDiscount: 0,
  },
  // === T-SHIRTS ===
  {
    id: "T001", name: "Crew Neck Cotton T-Shirt", sku: "DZ-TSHIRT-CR", barcode: "8901234567100",
    category: "T-Shirt", subCategory: "Cotton", brand: "Basic Wear",
    description: "100% cotton crew neck t-shirt",
    costPrice: 180, basePrice: 399, salePrice: 349, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "610910", taxSlab: "13%",
    availableQty: 320, reorderLevel: 50, minStock: 20,
    location: "Rack T1", branch: "Main Branch", status: "Active", image: "/images/products/tshirt.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: COLORS_TSHIRT }, { name: "Size", options: SIZES_ALL }],
    variants: makeVariants("DZ-TSHIRT-CR", "890123456710", SIZES_ALL, COLORS_TSHIRT, 349, stockHigh),
    bargainEnabled: true, seasonalDiscount: 10,
  },
  {
    id: "T002", name: "Polo T-Shirt", sku: "DZ-POLO-CL", barcode: "8901234567110",
    category: "T-Shirt", subCategory: "Polo", brand: "Classic Polo",
    description: "Premium polo t-shirt with collar",
    costPrice: 280, basePrice: 699, salePrice: null, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "610910", taxSlab: "13%",
    availableQty: 215, reorderLevel: 40, minStock: 15,
    location: "Rack T2", branch: "Main Branch", status: "Active", image: "/images/products/polo.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Black", "White", "Navy", "Red", "Blue", "Green"] }, { name: "Size", options: SIZES_ALL }],
    variants: makeVariants("DZ-POLO-CL", "890123456711", SIZES_ALL, ["Black", "White", "Navy", "Red", "Blue", "Green"], 699, stockRandom),
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "T003", name: "V-Neck Printed T-Shirt", sku: "DZ-VNECK-PR", barcode: "8901234567120",
    category: "T-Shirt", subCategory: "Printed", brand: "Street Wear",
    description: "Trendy v-neck printed t-shirt",
    costPrice: 220, basePrice: 549, salePrice: 449, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "610910", taxSlab: "13%",
    availableQty: 178, reorderLevel: 30, minStock: 10,
    location: "Rack T3", branch: "Main Branch", status: "Active", image: "/images/products/vneck.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Black", "White", "Navy", "Grey", "Maroon"] }, { name: "Size", options: SIZES_ALL }],
    variants: makeVariants("DZ-VNECK-PR", "890123456712", SIZES_ALL, ["Black", "White", "Navy", "Grey", "Maroon"], 449, stockRandom),
    bargainEnabled: true, seasonalDiscount: 15,
  },
  {
    id: "T004", name: "Full Sleeve Henley T-Shirt", sku: "DZ-HENLEY-FS", barcode: "8901234567130",
    category: "T-Shirt", subCategory: "Henley", brand: "Winter Wear",
    description: "Full sleeve henley style t-shirt",
    costPrice: 260, basePrice: 649, salePrice: null, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "610910", taxSlab: "13%",
    availableQty: 145, reorderLevel: 25, minStock: 8,
    location: "Rack T4", branch: "Main Branch", status: "Active", image: "/images/products/henley.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Black", "Navy", "Grey", "Olive", "Maroon"] }, { name: "Size", options: SIZES_ALL }],
    variants: makeVariants("DZ-HENLEY-FS", "890123456713", SIZES_ALL, ["Black", "Navy", "Grey", "Olive", "Maroon"], 649, stockRandom),
    bargainEnabled: true, seasonalDiscount: 0,
  },
  // === KURTA ===
  {
    id: "K001", name: "Cotton Straight Kurta", sku: "DZ-KURTA-ST", barcode: "8901234567200",
    category: "Kurta", subCategory: "Cotton", brand: "Desi Style",
    description: "Traditional cotton straight kurta for daily wear",
    costPrice: 350, basePrice: 799, salePrice: null, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620630", taxSlab: "5%",
    availableQty: 198, reorderLevel: 35, minStock: 12,
    location: "Rack K1", branch: "Main Branch", status: "Active", image: "/images/products/kurta.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: COLORS_KURTA }, { name: "Size", options: SIZES_KURTA }],
    variants: makeVariants("DZ-KURTA-ST", "890123456720", SIZES_KURTA, COLORS_KURTA, 799, stockRandom),
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "K002", name: "Embroidered Party Kurta", sku: "DZ-KURTA-EM", barcode: "8901234567210",
    category: "Kurta", subCategory: "Party Wear", brand: "Festive Wear",
    description: "Embroidered party wear kurta for special occasions",
    costPrice: 680, basePrice: 1599, salePrice: 1299, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620630", taxSlab: "5%",
    availableQty: 85, reorderLevel: 15, minStock: 5,
    location: "Rack K2", branch: "Main Branch", status: "Active", image: "/images/products/partykurta.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Maroon", "Black", "White", "Gold", "Navy"] }, { name: "Size", options: SIZES_KURTA }],
    variants: makeVariants("DZ-KURTA-EM", "890123456721", SIZES_KURTA, ["Maroon", "Black", "White", "Gold", "Navy"], 1299, stockRandom),
    bargainEnabled: true, seasonalDiscount: 20,
  },
  {
    id: "K003", name: "Kurta Pyjama Set", sku: "DZ-KURTA-PY", barcode: "8901234567220",
    category: "Kurta", subCategory: "Set", brand: "Ethnic Wear",
    description: "Complete kurta pyjama set with matching bottom",
    costPrice: 750, basePrice: 1799, salePrice: null, unit: "Set",
    color: "Multi", size: "Multi", hsnCode: "620630", taxSlab: "5%",
    availableQty: 67, reorderLevel: 12, minStock: 4,
    location: "Rack K3", branch: "Main Branch", status: "Active", image: "/images/products/kurtaset.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["White", "Beige", "Olive", "Maroon"] }, { name: "Size", options: SIZES_KURTA }],
    variants: makeVariants("DZ-KURTA-PY", "890123456722", SIZES_KURTA, ["White", "Beige", "Olive", "Maroon"], 1799, stockRandom),
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "K004", name: "Embroidered Kurti", sku: "DZ-KURTI-EM", barcode: "8901234567230",
    category: "Kurta", subCategory: "Kurti", brand: "Ladies Wear",
    description: "Women's embroidered kurti for casual and festive wear",
    costPrice: 420, basePrice: 999, salePrice: 849, unit: "Piece",
    color: "Multi", size: "Multi", hsnCode: "620630", taxSlab: "5%",
    availableQty: 156, reorderLevel: 25, minStock: 8,
    location: "Rack K4", branch: "Main Branch", status: "Active", image: "/images/products/kurti.jpg",
    hasVariants: true,
    variantAttributes: [{ name: "Color", options: ["Pink", "Blue", "Green", "Yellow", "Purple", "Red", "White", "Black"] }, { name: "Size", options: SIZES_ALL }],
    variants: makeVariants("DZ-KURTI-EM", "890123456723", SIZES_ALL, ["Pink", "Blue", "Green", "Yellow", "Purple", "Red", "White", "Black"], 849, stockRandom),
    bargainEnabled: true, seasonalDiscount: 10,
  },
  // === ACCESSORIES (No Variants) ===
  {
    id: "A001", name: "Crew Ankle Socks (3 Pair Pack)", sku: "DZ-SOCKS-3P", barcode: "8901234567300",
    category: "Accessories", subCategory: "Socks", brand: "Comfort Feet",
    description: "Pack of 3 cotton crew ankle socks",
    costPrice: 45, basePrice: 129, salePrice: 99, unit: "Pack",
    color: "Multi", size: "Free", hsnCode: "611596", taxSlab: "5%",
    availableQty: 450, reorderLevel: 80, minStock: 30,
    location: "Rack A1", branch: "Main Branch", status: "Active", image: "/images/products/socks.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: false, seasonalDiscount: 20,
  },
  {
    id: "A002", name: "Sports Ankle Socks", sku: "DZ-SOCKS-SP", barcode: "8901234567310",
    category: "Accessories", subCategory: "Socks", brand: "Fit Gear",
    description: "Cushioned sports ankle socks, single pair",
    costPrice: 60, basePrice: 149, salePrice: null, unit: "Piece",
    color: "White", size: "Free", hsnCode: "611596", taxSlab: "5%",
    availableQty: 380, reorderLevel: 60, minStock: 20,
    location: "Rack A1", branch: "Main Branch", status: "Active", image: "/images/products/sportssocks.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "A003", name: "Leather Belt", sku: "DZ-BELT-LTH", barcode: "8901234567320",
    category: "Accessories", subCategory: "Belt", brand: "Leather Craft",
    description: "Genuine leather belt with metal buckle",
    costPrice: 150, basePrice: 399, salePrice: null, unit: "Piece",
    color: "Brown", size: "Free", hsnCode: "911390", taxSlab: "18%",
    availableQty: 120, reorderLevel: 20, minStock: 5,
    location: "Rack A2", branch: "Main Branch", status: "Active", image: "/images/products/belt.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: true, seasonalDiscount: 0,
  },
  {
    id: "A004", name: "Canvas Belt", sku: "DZ-BELT-CAN", barcode: "8901234567330",
    category: "Accessories", subCategory: "Belt", brand: "Casual Wear",
    description: "Casual canvas belt with fabric buckle",
    costPrice: 80, basePrice: 199, salePrice: 149, unit: "Piece",
    color: "Black", size: "Free", hsnCode: "911390", taxSlab: "18%",
    availableQty: 200, reorderLevel: 35, minStock: 10,
    location: "Rack A2", branch: "Main Branch", status: "Active", image: "/images/products/canvasbelt.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: true, seasonalDiscount: 25,
  },
  {
    id: "A005", name: "Baseball Cap", sku: "DZ-CAP-BBL", barcode: "8901234567340",
    category: "Accessories", subCategory: "Cap", brand: "Head Gear",
    description: "Classic baseball cap with adjustable strap",
    costPrice: 120, basePrice: 299, salePrice: null, unit: "Piece",
    color: "Navy", size: "Free", hsnCode: "650500", taxSlab: "18%",
    availableQty: 95, reorderLevel: 15, minStock: 5,
    location: "Rack A3", branch: "Main Branch", status: "Active", image: "/images/products/cap.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "A006", name: "Winter Beanie Cap", sku: "DZ-CAP-BNN", barcode: "8901234567350",
    category: "Accessories", subCategory: "Cap", brand: "Warm Wear",
    description: "Knitted winter beanie cap",
    costPrice: 90, basePrice: 249, salePrice: 199, unit: "Piece",
    color: "Black", size: "Free", hsnCode: "650500", taxSlab: "18%",
    availableQty: 130, reorderLevel: 20, minStock: 8,
    location: "Rack A3", branch: "Main Branch", status: "Active", image: "/images/products/beanie.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: true, seasonalDiscount: 15,
  },
  {
    id: "A007", name: "Handkerchief Set (6 Pcs)", sku: "DZ-HANKY-6P", barcode: "8901234567360",
    category: "Accessories", subCategory: "Handkerchief", brand: "Cotton Co",
    description: "Set of 6 cotton handkerchiefs",
    costPrice: 55, basePrice: 149, salePrice: null, unit: "Set",
    color: "Multi", size: "Free", hsnCode: "621710", taxSlab: "5%",
    availableQty: 280, reorderLevel: 50, minStock: 15,
    location: "Rack A4", branch: "Main Branch", status: "Active", image: "/images/products/hanky.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: false, seasonalDiscount: 0,
  },
  {
    id: "A008", name: "Wrist Watch Band", sku: "DZ-WBAND-SL", barcode: "8901234567370",
    category: "Accessories", subCategory: "Watch Band", brand: "Time Style",
    description: "Silicone watch band, universal fit",
    costPrice: 70, basePrice: 199, salePrice: 149, unit: "Piece",
    color: "Black", size: "Free", hsnCode: "911390", taxSlab: "18%",
    availableQty: 85, reorderLevel: 15, minStock: 5,
    location: "Rack A5", branch: "Main Branch", status: "Active", image: "/images/products/watchband.jpg",
    hasVariants: false, variantAttributes: [], variants: [],
    bargainEnabled: false, seasonalDiscount: 20,
  },
];

// POS-compatible products (with price field)
export const posProducts = clothingProducts.map((p) => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  barcode: p.barcode,
  category: p.category,
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

// Categories
export const clothingCategories = ["All", "Pant", "T-Shirt", "Kurta", "Accessories"];

// Brands
export const clothingBrands = ["All Brands", ...Array.from(new Set(clothingProducts.map((p) => p.brand)))];

// Sales history records
export const posSalesHistory = [
  { id: "REC-2025-0101", customer: "Walk-in", date: "May 21, 2025", time: "14:23", items: 3, amount: 7566, payment: "Cash", cashier: "Ram Bahadur", status: "Completed" },
  { id: "REC-2025-0100", customer: "Sita Devi", date: "May 21, 2025", time: "13:45", items: 5, amount: 4250, payment: "E-Pay", cashier: "Ram Bahadur", status: "Completed" },
  { id: "REC-2025-0099", customer: "Walk-in", date: "May 21, 2025", time: "12:10", items: 2, amount: 1899, payment: "Split", cashier: "Gita Sharma", status: "Completed" },
  { id: "REC-2025-0098", customer: "Hari Prasad", date: "May 21, 2025", time: "11:30", items: 4, amount: 5675, payment: "Cash", cashier: "Gita Sharma", status: "Completed" },
  { id: "REC-2025-0097", customer: "Walk-in", date: "May 21, 2025", time: "10:15", items: 1, amount: 799, payment: "E-Pay", cashier: "Ram Bahadur", status: "Completed" },
  { id: "REC-2025-0096", customer: "Maya Kumari", date: "May 20, 2025", time: "16:45", items: 6, amount: 8945, payment: "Cash", cashier: "Gita Sharma", status: "Completed" },
  { id: "REC-2025-0095", customer: "Walk-in", date: "May 20, 2025", time: "15:20", items: 2, amount: 2198, payment: "E-Pay", cashier: "Ram Bahadur", status: "Completed" },
  { id: "REC-2025-0094", customer: "Ramesh Thapa", date: "May 20, 2025", time: "14:00", items: 3, amount: 3450, payment: "Cash", cashier: "Gita Sharma", status: "Completed" },
  { id: "REC-2025-0093", customer: "Walk-in", date: "May 20, 2025", time: "11:30", items: 8, amount: 12560, payment: "Split", cashier: "Ram Bahadur", status: "Completed" },
  { id: "REC-2025-0092", customer: "Laxmi Gurung", date: "May 19, 2025", time: "17:00", items: 4, amount: 4899, payment: "Cash", cashier: "Gita Sharma", status: "Completed" },
];

// Held bills
export interface HeldBill {
  id: string;
  items: { name: string; qty: number; price: number; variant?: string }[];
  total: number;
  note: string;
  timestamp: string;
  cashier: string;
}

export const heldBills: HeldBill[] = [];

// Denominations
export const DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1] as const;
