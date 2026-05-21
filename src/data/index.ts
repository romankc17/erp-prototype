// ============ DASHBOARD DATA ============

export const kpiCards = [
  { title: "Total Products", value: "1,247", label: "Total Products", trend: "+5.2%", trendUp: true, icon: "Package", color: "blue" as const },
  { title: "Today's Sales", value: "Rs. 45,230", label: "Today's Sales", trend: "+12.8%", trendUp: true, icon: "IndianRupee", color: "emerald" as const },
  { title: "Low Stock Items", value: "23", label: "Low Stock Items", trend: "-2", trendUp: true, icon: "AlertTriangle", color: "amber" as const },
  { title: "Pending Orders", value: "18", label: "Pending Orders", trend: "+3", trendUp: false, icon: "Clock", color: "orange" as const },
];

export const revenueData = [
  { month: "Jan", revenue: 285000 },
  { month: "Feb", revenue: 320000 },
  { month: "Mar", revenue: 375000 },
  { month: "Apr", revenue: 410000 },
  { month: "May", revenue: 465000 },
  { month: "Jun", revenue: 520000 },
];

export const orderDistribution = [
  { name: "Completed", value: 142, color: "#10b981" },
  { name: "Pending", value: 28, color: "#f59e0b" },
  { name: "Processing", value: 22, color: "#3b82f6" },
  { name: "Cancelled", value: 14, color: "#ef4444" },
];

export const recentOrders = [
  { id: "#ORD-2025-0042", customer: "Sita Devi Sharma", date: "May 21, 2025", amount: 4850, status: "Completed" as const },
  { id: "#ORD-2025-0041", customer: "Hari Prasad Gurung", date: "May 21, 2025", amount: 7200, status: "Completed" as const },
  { id: "#ORD-2025-0040", customer: "Maya Kumari", date: "May 20, 2025", amount: 3150, status: "Processing" as const },
  { id: "#ORD-2025-0039", customer: "Ramesh Thapa", date: "May 20, 2025", amount: 5600, status: "Completed" as const },
  { id: "#ORD-2025-0038", customer: "Laxmi Adhikari", date: "May 19, 2025", amount: 1899, status: "Completed" as const },
];

export const activityFeed = [
  { id: 1, type: "Stock Added", message: "Added 30 units of 'Crew Neck Cotton T-Shirt (Black, M)' to inventory", time: "14:23, today", color: "#3b82f6" },
  { id: 2, type: "Sale Completed", message: "Receipt #REC-2025-0101 completed — Rs. 7,566", time: "13:45, today", color: "#10b981" },
  { id: 3, type: "Low Stock Alert", message: "'Formal Trousers' is running low (8 Grey/32 left)", time: "11:20, today", color: "#f59e0b" },
  { id: 4, type: "Purchase Order", message: "PO #PO-2025-0024 sent to Annapurna Suppliers", time: "10:05, today", color: "#06b6d4" },
  { id: 5, type: "Expense", message: "Shop rent paid — Rs. 35,000", time: "Yesterday", color: "#ef4444" },
  { id: 6, type: "Bargain Sale", message: "Bargain price applied to Slim Fit Chinos — Rs. 850", time: "Yesterday", color: "#8b5cf6" },
  { id: 7, type: "Return", message: "Return processed — Kurta Pyjama Set, Size issue — Rs. 1,799", time: "May 20", color: "#f97316" },
];

// ============ PRODUCTS DATA ============

export const productCategories = ["All", "Electronics", "Groceries", "Clothing", "Home & Kitchen", "Personal Care", "Beverages", "Stationery", "Furniture"];

export const productStatuses = ["All", "In Stock", "Low Stock", "Out of Stock", "Damaged", "Returned"];

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  attributes: Record<string, string>;
  stock: number;
  price?: number;
}

export interface VariantAttribute {
  name: string;
  values: string[];
}

export interface InventoryProduct {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  color: string;
  location: string;
  branch: string;
  availableQty: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Damaged" | "Returned";
  image: string;
  hasVariants: boolean;
  variantAttributes?: VariantAttribute[];
  variants?: ProductVariant[];
}

export const inventoryProducts: InventoryProduct[] = [
  {
    id: 1, name: "Premium Cotton T-Shirt", sku: "TSHIRT-PREM", barcode: "8901207001000", category: "Clothing", color: "Multi", location: "Rack A1", branch: "Main Branch",
    availableQty: 285, unit: "pcs", costPrice: 450, sellingPrice: 890, status: "In Stock", image: "/images/products/tshirt.jpg",
    hasVariants: true,
    variantAttributes: [
      { name: "Color", values: ["Red", "Blue", "Black"] },
      { name: "Size", values: ["S", "M", "L", "XL"] },
    ],
    variants: [
      { id: "v1", sku: "TSHIRT-RED-S", barcode: "8901207001101", attributes: { Color: "Red", Size: "S" }, stock: 12 },
      { id: "v2", sku: "TSHIRT-BLU-S", barcode: "8901207001102", attributes: { Color: "Blue", Size: "S" }, stock: 8 },
      { id: "v3", sku: "TSHIRT-BLK-S", barcode: "8901207001103", attributes: { Color: "Black", Size: "S" }, stock: 15 },
      { id: "v4", sku: "TSHIRT-RED-M", barcode: "8901207001201", attributes: { Color: "Red", Size: "M" }, stock: 20 },
      { id: "v5", sku: "TSHIRT-BLU-M", barcode: "8901207001202", attributes: { Color: "Blue", Size: "M" }, stock: 25 },
      { id: "v6", sku: "TSHIRT-BLK-M", barcode: "8901207001203", attributes: { Color: "Black", Size: "M" }, stock: 30 },
      { id: "v7", sku: "TSHIRT-RED-L", barcode: "8901207001301", attributes: { Color: "Red", Size: "L" }, stock: 18 },
      { id: "v8", sku: "TSHIRT-BLU-L", barcode: "8901207001302", attributes: { Color: "Blue", Size: "L" }, stock: 22 },
      { id: "v9", sku: "TSHIRT-BLK-L", barcode: "8901207001303", attributes: { Color: "Black", Size: "L" }, stock: 35 },
      { id: "v10", sku: "TSHIRT-RED-XL", barcode: "8901207001401", attributes: { Color: "Red", Size: "XL" }, stock: 10 },
      { id: "v11", sku: "TSHIRT-BLU-XL", barcode: "8901207001402", attributes: { Color: "Blue", Size: "XL" }, stock: 14 },
      { id: "v12", sku: "TSHIRT-BLK-XL", barcode: "8901207001403", attributes: { Color: "Black", Size: "XL" }, stock: 28 },
    ],
  },
  { id: 2, name: "Cotton T-Shirt", sku: "TSHIRT-BLU-M", barcode: "8901207001002", category: "Clothing", color: "Blue", location: "Rack A1", branch: "Main Branch", availableQty: 85, unit: "pcs", costPrice: 450, sellingPrice: 890, status: "In Stock", image: "/images/products/tshirt.jpg", hasVariants: false },
  { id: 3, name: "Denim Jeans", sku: "JEANS-BLU-32", barcode: "8901207002001", category: "Clothing", color: "Blue", location: "Shelf B2", branch: "Main Branch", availableQty: 15, unit: "pcs", costPrice: 1200, sellingPrice: 2490, status: "Low Stock", image: "", hasVariants: false },
  { id: 4, name: "Hoodie", sku: "HOODIE-GRY-L", barcode: "8901207003001", category: "Clothing", color: "Gray", location: "Warehouse 1", branch: "Main Branch", availableQty: 48, unit: "pcs", costPrice: 850, sellingPrice: 1890, status: "In Stock", image: "", hasVariants: false },
  { id: 5, name: "Winter Jacket", sku: "JACKET-BLK-L", barcode: "8901207004001", category: "Clothing", color: "Black", location: "Warehouse 1", branch: "Main Branch", availableQty: 0, unit: "pcs", costPrice: 2500, sellingPrice: 4990, status: "Out of Stock", image: "", hasVariants: false },
  { id: 6, name: "Formal Shirt", sku: "SHIRT-WHT-M", barcode: "8901207005001", category: "Clothing", color: "White", location: "Rack A2", branch: "Main Branch", availableQty: 8, unit: "pcs", costPrice: 600, sellingPrice: 1290, status: "Low Stock", image: "", hasVariants: false },
  { id: 7, name: "Dabur Chyawanprash 1kg", sku: "DZ-2025-0017", barcode: "8901207045123", category: "Groceries", color: "-", location: "Shelf C1", branch: "Main Branch", availableQty: 84, unit: "pcs", costPrice: 380, sellingPrice: 450, status: "In Stock", image: "/images/products/chyawanprash.jpg", hasVariants: false },
  { id: 8, name: "Samsung Galaxy A14", sku: "DZ-2025-0002", barcode: "8901207076543", category: "Electronics", color: "Black", location: "Display D1", branch: "Thamel Branch", availableQty: 23, unit: "pcs", costPrice: 19500, sellingPrice: 22999, status: "In Stock", image: "/images/products/galaxy-a14.jpg", hasVariants: false },
  { id: 9, name: "Wai Wai Instant Noodles (Pack of 30)", sku: "DZ-2025-0003", barcode: "8901207034567", category: "Groceries", color: "-", location: "Shelf C2", branch: "Main Branch", availableQty: 12, unit: "pcs", costPrice: 290, sellingPrice: 350, status: "Low Stock", image: "/images/products/wai-wai.jpg", hasVariants: false },
  { id: 10, name: "Everest Masala Box Set", sku: "DZ-2025-0004", barcode: "8901207023456", category: "Groceries", color: "-", location: "Shelf C1", branch: "Main Branch", availableQty: 156, unit: "pcs", costPrice: 550, sellingPrice: 680, status: "In Stock", image: "/images/products/everest-masala.jpg", hasVariants: false },
];

// Legacy for backward compat
export const products = [
  { id: 1, name: "Dabur Chyawanprash 1kg", sku: "DZ-2025-0017", category: "Groceries", price: 450, stock: 84, status: "In Stock" as const, image: "/images/products/chyawanprash.jpg" },
  { id: 2, name: "Samsung Galaxy A14", sku: "DZ-2025-0002", category: "Electronics", price: 22999, stock: 23, status: "In Stock" as const, image: "/images/products/galaxy-a14.jpg" },
  { id: 3, name: "Wai Wai Instant Noodles (Pack of 30)", sku: "DZ-2025-0003", category: "Groceries", price: 350, stock: 12, status: "Low Stock" as const, image: "/images/products/wai-wai.jpg" },
  { id: 4, name: "Everest Masala Box Set", sku: "DZ-2025-0004", category: "Groceries", price: 680, stock: 156, status: "In Stock" as const, image: "/images/products/everest-masala.jpg" },
  { id: 5, name: "Philips LED Bulb 9W", sku: "DZ-2025-0005", category: "Electronics", price: 185, stock: 240, status: "In Stock" as const, image: "/images/products/led-bulb.jpg" },
  { id: 6, name: "Kathmandu Cotton T-Shirt", sku: "DZ-2025-0006", category: "Clothing", price: 1200, stock: 45, status: "In Stock" as const, image: "/images/products/tshirt.jpg" },
  { id: 7, name: "Dettol Handwash Refill", sku: "DZ-2025-0007", category: "Personal Care", price: 295, stock: 78, status: "In Stock" as const, image: "/images/products/dettol.jpg" },
  { id: 8, name: "Basmati Rice 5kg (Royal)", sku: "DZ-2025-0008", category: "Groceries", price: 850, stock: 8, status: "Low Stock" as const, image: "/images/products/basmati-rice.jpg" },
];

// ============ INVENTORY DATA ============

export const inventoryItems = [
  { sku: "DZ-2025-0001", name: "Dabur Chyawanprash 1kg", category: "Groceries", location: "Main Store", stockQty: 84, minQty: 20, status: "In Stock" as const, lastUpdated: "May 18, 2025" },
  { sku: "DZ-2025-0002", name: "Samsung Galaxy A14", category: "Electronics", location: "Main Store", stockQty: 23, minQty: 10, status: "In Stock" as const, lastUpdated: "May 17, 2025" },
  { sku: "DZ-2025-0003", name: "Wai Wai Instant Noodles", category: "Groceries", location: "Warehouse", stockQty: 12, minQty: 25, status: "Low Stock" as const, lastUpdated: "May 18, 2025" },
  { sku: "DZ-2025-0004", name: "Everest Masala Box Set", category: "Groceries", location: "Main Store", stockQty: 156, minQty: 30, status: "In Stock" as const, lastUpdated: "May 16, 2025" },
  { sku: "DZ-2025-0005", name: "Philips LED Bulb 9W", category: "Electronics", location: "Thamel Branch", stockQty: 240, minQty: 50, status: "In Stock" as const, lastUpdated: "May 15, 2025" },
  { sku: "DZ-2025-0006", name: "Kathmandu Cotton T-Shirt", category: "Clothing", location: "Main Store", stockQty: 45, minQty: 15, status: "In Stock" as const, lastUpdated: "May 18, 2025" },
  { sku: "DZ-2025-0007", name: "Dettol Handwash Refill", category: "Personal Care", location: "Main Store", stockQty: 78, minQty: 20, status: "In Stock" as const, lastUpdated: "May 17, 2025" },
  { sku: "DZ-2025-0008", name: "Basmati Rice 5kg (Royal)", category: "Groceries", location: "Warehouse", stockQty: 8, minQty: 15, status: "Low Stock" as const, lastUpdated: "May 18, 2025" },
];

// ============ SALES DATA ============

export const salesStats = [
  { title: "Today's Sales", value: "Rs. 45,230", subtext: "24 orders", icon: "IndianRupee", color: "emerald" as const },
  { title: "This Week", value: "Rs. 2,84,500", subtext: "142 orders", icon: "Calendar", color: "blue" as const },
  { title: "This Month", value: "Rs. 12,45,000", subtext: "+18% vs last month", icon: "TrendingUp", color: "violet" as const },
  { title: "Pending Orders", value: "18", subtext: "", icon: "Clock", color: "amber" as const },
];

export const salesOrders = [
  { id: "#ORD-2025-0042", customer: "Himalayan Traders", date: "May 18, 2025", items: "12 items", amount: 12500, payment: "Cash", status: "Completed" as const },
  { id: "#ORD-2025-0041", customer: "Kathmandu Crafts", date: "May 18, 2025", items: "8 items", amount: 8750, payment: "UPI", status: "Processing" as const },
  { id: "#ORD-2025-0040", customer: "Pokhara Outdoor", date: "May 17, 2025", items: "23 items", amount: 23400, payment: "Cash", status: "Pending" as const },
  { id: "#ORD-2025-0039", customer: "Bhaktapur Ceramics", date: "May 17, 2025", items: "5 items", amount: 5600, payment: "Card", status: "Completed" as const },
  { id: "#ORD-2025-0038", customer: "Lalitpur Fabrics", date: "May 16, 2025", items: "18 items", amount: 15200, payment: "UPI", status: "Cancelled" as const },
  { id: "#ORD-2025-0037", customer: "Everest Groceries", date: "May 16, 2025", items: "34 items", amount: 31500, payment: "Cash", status: "Completed" as const },
  { id: "#ORD-2025-0036", customer: "Thamel Souvenirs", date: "May 15, 2025", items: "9 items", amount: 9800, payment: "Card", status: "Processing" as const },
  { id: "#ORD-2025-0035", customer: "Patan Foods", date: "May 15, 2025", items: "42 items", amount: 38200, payment: "Cash", status: "Completed" as const },
  { id: "#ORD-2025-0034", customer: "Nagarkot Tea House", date: "May 14, 2025", items: "7 items", amount: 7450, payment: "UPI", status: "Pending" as const },
  { id: "#ORD-2025-0033", customer: "Birgunj Electronics", date: "May 14, 2025", items: "15 items", amount: 18900, payment: "Cash", status: "Completed" as const },
];

// ============ PURCHASES DATA ============

export const purchaseStats = [
  { title: "Total POs", value: "84", label: "Total POs", icon: "ClipboardList", color: "blue" as const },
  { title: "Total Purchased", value: "Rs. 35,20,000", label: "Total Purchased", subtext: "FY 2024-25", icon: "IndianRupee", color: "emerald" as const },
  { title: "Pending Delivery", value: "12", label: "Pending Delivery", icon: "Truck", color: "amber" as const },
  { title: "Overdue", value: "3", label: "Overdue", icon: "AlertCircle", color: "red" as const },
];

export const purchaseOrders = [
  { id: "#PO-2025-0024", supplier: "Annapurna Suppliers", orderDate: "May 15, 2025", expectedDelivery: "May 22, 2025", items: "45 items", amount: 185000, status: "Sent" as const },
  { id: "#PO-2025-0023", supplier: "Himalayan Distributors", orderDate: "May 12, 2025", expectedDelivery: "May 20, 2025", items: "32 items", amount: 240000, status: "Acknowledged" as const },
  { id: "#PO-2025-0022", supplier: "Kathmandu Wholesalers", orderDate: "May 10, 2025", expectedDelivery: "May 18, 2025", items: "78 items", amount: 385000, status: "Partially Received" as const },
  { id: "#PO-2025-0021", supplier: "Pokhara Imports", orderDate: "May 8, 2025", expectedDelivery: "May 15, 2025", items: "24 items", amount: 95000, status: "Received" as const },
  { id: "#PO-2025-0020", supplier: "Birgunj Traders", orderDate: "May 5, 2025", expectedDelivery: "May 12, 2025", items: "56 items", amount: 145000, status: "Sent" as const },
  { id: "#PO-2025-0019", supplier: "Annapurna Suppliers", orderDate: "May 3, 2025", expectedDelivery: "May 10, 2025", items: "18 items", amount: 72000, status: "Overdue" as const },
  { id: "#PO-2025-0018", supplier: "Himalayan Distributors", orderDate: "Apr 28, 2025", expectedDelivery: "May 5, 2025", items: "92 items", amount: 420000, status: "Received" as const },
  { id: "#PO-2025-0017", supplier: "Kathmandu Wholesalers", orderDate: "Apr 25, 2025", expectedDelivery: "May 2, 2025", items: "38 items", amount: 165000, status: "Cancelled" as const },
];

// ============ CUSTOMERS DATA ============

export const customerStats = [
  { title: "Total Customers", value: "156", label: "Total Customers", icon: "Users", color: "blue" as const },
  { title: "New This Month", value: "24", label: "New This Month", subtext: "+8 vs last month", icon: "UserPlus", color: "emerald" as const },
  { title: "Total Revenue", value: "Rs. 48,25,000", label: "Total Revenue", icon: "IndianRupee", color: "violet" as const },
];

export const customers = [
  { id: 1, name: "Himalayan Traders", phone: "98XXXXXXXX", location: "Kathmandu", orders: 42, spent: 845000, lastOrder: "May 18, 2025" },
  { id: 2, name: "Kathmandu Crafts", phone: "97XXXXXXXX", location: "Kathmandu", orders: 28, spent: 520000, lastOrder: "May 18, 2025" },
  { id: 3, name: "Pokhara Outdoor", phone: "98XXXXXXXX", location: "Pokhara", orders: 35, spent: 685000, lastOrder: "May 17, 2025" },
  { id: 4, name: "Bhaktapur Ceramics", phone: "96XXXXXXXX", location: "Bhaktapur", orders: 18, spent: 240000, lastOrder: "May 17, 2025" },
  { id: 5, name: "Lalitpur Fabrics", phone: "98XXXXXXXX", location: "Lalitpur", orders: 31, spent: 485000, lastOrder: "May 16, 2025" },
  { id: 6, name: "Everest Groceries", phone: "97XXXXXXXX", location: "Kathmandu", orders: 56, spent: 1250000, lastOrder: "May 16, 2025" },
  { id: 7, name: "Thamel Souvenirs", phone: "98XXXXXXXX", location: "Kathmandu", orders: 22, spent: 380000, lastOrder: "May 15, 2025" },
  { id: 8, name: "Patan Foods", phone: "96XXXXXXXX", location: "Lalitpur", orders: 48, spent: 920000, lastOrder: "May 15, 2025" },
];

// ============ ANALYTICS DATA ============

export const analyticsStats = [
  { title: "Total Revenue", value: "Rs. 8,45,000", trend: "+15.2%", icon: "IndianRupee", color: "emerald" as const },
  { title: "Total Orders", value: "186", trend: "+18", icon: "ShoppingCart", color: "blue" as const },
  { title: "Avg. Order Value", value: "Rs. 4,543", trend: "+3.8%", icon: "BarChart2", color: "violet" as const },
  { title: "Returning Rate", value: "62%", trend: "+5%", icon: "Users", color: "amber" as const },
];

export const dailySalesData = [
  { date: "1 May", revenue: 22400, orders: 6 },
  { date: "2 May", revenue: 18900, orders: 5 },
  { date: "3 May", revenue: 28200, orders: 7 },
  { date: "4 May", revenue: 35600, orders: 9 },
  { date: "5 May", revenue: 31200, orders: 8 },
  { date: "6 May", revenue: 28500, orders: 7 },
  { date: "7 May", revenue: 39800, orders: 10 },
  { date: "8 May", revenue: 44200, orders: 11 },
  { date: "9 May", revenue: 37600, orders: 9 },
  { date: "10 May", revenue: 52300, orders: 13 },
  { date: "11 May", revenue: 48900, orders: 12 },
  { date: "12 May", revenue: 58400, orders: 15 },
  { date: "13 May", revenue: 42100, orders: 10 },
  { date: "14 May", revenue: 33800, orders: 8 },
  { date: "15 May", revenue: 48000, orders: 11 },
  { date: "16 May", revenue: 36700, orders: 9 },
  { date: "17 May", revenue: 29000, orders: 7 },
  { date: "18 May", revenue: 45230, orders: 10 },
];

export const topProducts = [
  { rank: 1, name: "Crew Neck Cotton T-Shirt", category: "T-Shirt", unitsSold: 312, revenue: 108888 },
  { rank: 2, name: "Men's Regular Fit Jeans", category: "Pant", unitsSold: 186, revenue: 260214 },
  { rank: 3, name: "Cotton Straight Kurta", category: "Kurta", unitsSold: 156, revenue: 124644 },
  { rank: 4, name: "Crew Ankle Socks (3 Pair Pack)", category: "Accessories", unitsSold: 445, revenue: 44055 },
  { rank: 5, name: "Slim Fit Chinos", category: "Pant", unitsSold: 128, revenue: 127872 },
];

export const topCustomers = [
  { name: "Sita Devi Sharma", revenue: 84500 },
  { name: "Hari Prasad Gurung", revenue: 62300 },
  { name: "Maya Kumari", revenue: 58700 },
  { name: "Ramesh Thapa", revenue: 45200 },
  { name: "Laxmi Adhikari", revenue: 38900 },
];

export const salesByCategory = [
  { category: "Pant", amount: 485000 },
  { category: "T-Shirt", amount: 356000 },
  { category: "Kurta", amount: 245000 },
  { category: "Accessories", amount: 128000 },
];

export const paymentMethods = [
  { name: "Cash", value: 55, color: "#10b981" },
  { name: "E-Pay", value: 30, color: "#3b82f6" },
  { name: "Card", value: 12, color: "#8b5cf6" },
  { name: "Other", value: 3, color: "#94a3b8" },
];

// ============ RETURNS & DAMAGE DATA ============

export const returnsDamageStats = [
  { title: "Total Damaged", value: "28", label: "Items damaged", icon: "AlertTriangle", color: "red" as const },
  { title: "Total Returns", value: "37", label: "Customer returns", icon: "RotateCcw", color: "blue" as const },
  { title: "Missing Items", value: "16", label: "From POs", icon: "PackageX", color: "amber" as const },
  { title: "Est. Value", value: "Rs. 1,25,000", label: "Across all tabs", icon: "IndianRupee", color: "violet" as const },
];

export const damageItems = [
  { id: 1, date: "10/05/2025", type: "Damage (From PO)", source: "PO Receive", product: "Cotton T-Shirt (Black)", sku: "TSHIRT-BLK-M", poNumber: "PO-2024-0018", vendor: "Fashion Hub Pvt. Ltd.", orderedQty: 50, affectedQty: 2, reason: "Stitch Issue", branch: "Main Branch" },
  { id: 2, date: "10/05/2025", type: "Damage (From PO)", source: "PO Receive", product: "Hoodie (Grey)", sku: "HOODIE-GRY-L", poNumber: "PO-2024-0016", vendor: "Fashion Hub Pvt. Ltd.", orderedQty: 30, affectedQty: 1, reason: "Fabric Tear", branch: "Main Branch" },
  { id: 3, date: "10/05/2025", type: "Return (Customer)", source: "Sales Return", product: "Denim Jeans (Blue)", sku: "JEANS-BLU-32", poNumber: "-", vendor: "Ramesh Store", orderedQty: 0, affectedQty: 4, reason: "Size Issue", branch: "Main Branch" },
  { id: 4, date: "10/05/2025", type: "Missing (From PO)", source: "PO Receive", product: "Winter Jacket (Black)", sku: "JACKET-BLK-L", poNumber: "PO-2024-0017", vendor: "Trendy Wear", orderedQty: 15, affectedQty: 2, reason: "Not Delivered", branch: "Main Branch" },
  { id: 5, date: "09/05/2025", type: "Damage (Inventory)", source: "Inventory", product: "Formal Shirt (White)", sku: "SHIRT-WHT-M", poNumber: "-", vendor: "-", orderedQty: 0, affectedQty: 3, reason: "Button Broken", branch: "Main Branch" },
  { id: 6, date: "08/05/2025", type: "Return (Customer)", source: "Sales Return", product: "Running Shoes", sku: "SHOE-RUN-42", poNumber: "-", vendor: "Pokhara Sports", orderedQty: 0, affectedQty: 1, reason: "Defective", branch: "Thamel Branch" },
  { id: 7, date: "07/05/2025", type: "Damage (From PO)", source: "PO Receive", product: "Wool Sweater", sku: "SWTR-WOL-M", poNumber: "PO-2024-0015", vendor: "Himalayan Wool", orderedQty: 20, affectedQty: 5, reason: "Moth Damage", branch: "Main Branch" },
  { id: 8, date: "06/05/2025", type: "Missing (From PO)", source: "PO Receive", product: "Leather Belt", sku: "BELT-LTH-36", poNumber: "PO-2024-0014", vendor: "Kathmandu Leather", orderedQty: 25, affectedQty: 3, reason: "Short Delivered", branch: "Main Branch" },
];

// ============ VENDORS DATA ============

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  panNumber?: string;
  status: "Active" | "Inactive";
}

export const vendors: Vendor[] = [
  { id: 1, name: "Annapurna Suppliers", contactPerson: "Ramesh Gupta", email: "ramesh@annapurna.np", phone: "98XXXXXXXX", address: "New Road, Kathmandu", status: "Active" },
  { id: 2, name: "Himalayan Distributors", contactPerson: "Sita Sharma", email: "sita@himalayandist.np", phone: "97XXXXXXXX", address: "Patan, Lalitpur", status: "Active" },
  { id: 3, name: "Kathmandu Wholesalers", contactPerson: "Hari Bahadur", email: "hari@kwholesale.np", phone: "96XXXXXXXX", address: "Thamel, Kathmandu", status: "Active" },
  { id: 4, name: "Pokhara Imports", contactPerson: "Maya Gurung", email: "maya@pokharaimport.np", phone: "98XXXXXXXX", address: "Lakeside, Pokhara", status: "Active" },
  { id: 5, name: "Birgunj Traders", contactPerson: "Prakash Patel", email: "prakash@birgunjtrade.np", phone: "97XXXXXXXX", address: "Birgunj, Parsa", status: "Inactive" },
];

// ============ PURCHASE ORDERS DETAILED DATA ============

export type POStatus = "Draft" | "Approval Pending" | "Approved" | "Ready to Send" | "Sent" | "Partially Received" | "Received" | "Closed" | "Cancelled" | "Overdue";

export interface POLineItem {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  category: string;
  fabricType: string;
  qty: number;
  unit: string;
  unitAmount: number;
  subtotal: number;
  receivedQty: number;
}

export interface POApprovalStep {
  status: string;
  label: string;
  date?: string;
  user?: string;
  role?: string;
  notes?: string;
}

export interface PurchaseOrderDetailed {
  id: string;
  poNumber: string;
  vendorId: number;
  vendorName: string;
  vendorAddress: string;
  vendorContact: string;
  vendorEmail: string;
  storeBranch: string;
  deliveryLocation: string;
  poDate: string;
  expectedDelivery: string;
  paymentTerms: string;
  currency: string;
  notes: string;
  lineItems: POLineItem[];
  totalAmount: number;
  status: POStatus;
  createdBy: string;
  approvalSteps: POApprovalStep[];
  approvalRequired: boolean;
}

export const purchaseOrdersDetailed: PurchaseOrderDetailed[] = [
  {
    id: "po-1",
    poNumber: "PO-2025-0024",
    vendorId: 1,
    vendorName: "Annapurna Suppliers",
    vendorAddress: "New Road, Kathmandu",
    vendorContact: "98XXXXXXXX",
    vendorEmail: "ramesh@annapurna.np",
    storeBranch: "Main Branch",
    deliveryLocation: "Main Store, Kathmandu",
    poDate: "May 15, 2025",
    expectedDelivery: "May 22, 2025",
    paymentTerms: "Net 30",
    currency: "NPR",
    notes: "Please deliver during business hours",
    lineItems: [
      { id: "li1", inventoryId: "DZ-2025-0017", sku: "DZ-2025-0017", productName: "Dabur Chyawanprash 1kg", category: "Groceries", fabricType: "N/A", qty: 50, unit: "pcs", unitAmount: 380, subtotal: 19000, receivedQty: 0 },
      { id: "li2", inventoryId: "DZ-2025-0002", sku: "DZ-2025-0002", productName: "Samsung Galaxy A14", category: "Electronics", fabricType: "N/A", qty: 10, unit: "pcs", unitAmount: 19500, subtotal: 195000, receivedQty: 0 },
    ],
    totalAmount: 214000,
    status: "Sent",
    createdBy: "Amit Desai",
    approvalRequired: true,
    approvalSteps: [
      { status: "draft", label: "Draft", date: "May 15, 2025", user: "Amit Desai", role: "Admin" },
      { status: "pending", label: "Approval Pending", date: "May 15, 2025", user: "Amit Desai", role: "Admin" },
      { status: "approved", label: "Approved", date: "May 16, 2025", user: "Neha Joshi", role: "Purchase Manager" },
      { status: "ready", label: "Ready to Send", date: "May 16, 2025" },
      { status: "sent", label: "Sent", date: "May 16, 2025" },
    ],
  },
  {
    id: "po-2",
    poNumber: "PO-2025-0023",
    vendorId: 2,
    vendorName: "Himalayan Distributors",
    vendorAddress: "Patan, Lalitpur",
    vendorContact: "97XXXXXXXX",
    vendorEmail: "sita@himalayandist.np",
    storeBranch: "Main Branch",
    deliveryLocation: "Main Store, Kathmandu",
    poDate: "May 12, 2025",
    expectedDelivery: "May 20, 2025",
    paymentTerms: "50% Advance, 50% on Delivery",
    currency: "NPR",
    notes: "",
    lineItems: [
      { id: "li3", inventoryId: "DZ-2025-0003", sku: "DZ-2025-0003", productName: "Wai Wai Instant Noodles (30 Pack)", category: "Groceries", fabricType: "N/A", qty: 100, unit: "pcs", unitAmount: 290, subtotal: 29000, receivedQty: 0 },
      { id: "li4", inventoryId: "DZ-2025-0004", sku: "DZ-2025-0004", productName: "Everest Masala Box Set", category: "Groceries", fabricType: "N/A", qty: 40, unit: "pcs", unitAmount: 550, subtotal: 22000, receivedQty: 0 },
    ],
    totalAmount: 51000,
    status: "Approved",
    createdBy: "Amit Desai",
    approvalRequired: true,
    approvalSteps: [
      { status: "draft", label: "Draft", date: "May 12, 2025", user: "Amit Desai", role: "Admin" },
      { status: "pending", label: "Approval Pending", date: "May 12, 2025", user: "Amit Desai", role: "Admin" },
      { status: "approved", label: "Approved", date: "May 13, 2025", user: "Neha Joshi", role: "Purchase Manager" },
    ],
  },
  {
    id: "po-3",
    poNumber: "PO-2025-0022",
    vendorId: 3,
    vendorName: "Kathmandu Wholesalers",
    vendorAddress: "Thamel, Kathmandu",
    vendorContact: "96XXXXXXXX",
    vendorEmail: "hari@kwholesale.np",
    storeBranch: "Thamel Branch",
    deliveryLocation: "Thamel Branch Store",
    poDate: "May 10, 2025",
    expectedDelivery: "May 18, 2025",
    paymentTerms: "Net 15",
    currency: "NPR",
    notes: "",
    lineItems: [
      { id: "li5", inventoryId: "TSHIRT-PREM", sku: "TSHIRT-PREM", productName: "Premium Cotton T-Shirt", category: "Clothing", fabricType: "100% Cotton", qty: 200, unit: "pcs", unitAmount: 450, subtotal: 90000, receivedQty: 150 },
      { id: "li6", inventoryId: "JEANS-BLU-32", sku: "JEANS-BLU-32", productName: "Denim Jeans", category: "Clothing", fabricType: "Denim", qty: 50, unit: "pcs", unitAmount: 1200, subtotal: 60000, receivedQty: 40 },
    ],
    totalAmount: 150000,
    status: "Partially Received",
    createdBy: "Sita Gurung",
    approvalRequired: true,
    approvalSteps: [
      { status: "draft", label: "Draft", date: "May 10, 2025", user: "Sita Gurung", role: "Manager" },
      { status: "pending", label: "Approval Pending", date: "May 10, 2025" },
      { status: "approved", label: "Approved", date: "May 10, 2025", user: "Amit Desai", role: "Admin" },
      { status: "ready", label: "Ready to Send", date: "May 10, 2025" },
      { status: "sent", label: "Sent", date: "May 10, 2025" },
    ],
  },
  {
    id: "po-4",
    poNumber: "PO-2025-0021",
    vendorId: 4,
    vendorName: "Pokhara Imports",
    vendorAddress: "Lakeside, Pokhara",
    vendorContact: "98XXXXXXXX",
    vendorEmail: "maya@pokharaimport.np",
    storeBranch: "Main Branch",
    deliveryLocation: "Main Store, Kathmandu",
    poDate: "May 8, 2025",
    expectedDelivery: "May 15, 2025",
    paymentTerms: "100% Advance",
    currency: "NPR",
    notes: "",
    lineItems: [
      { id: "li7", inventoryId: "DZ-2025-0005", sku: "DZ-2025-0005", productName: "Philips LED Bulb 9W", category: "Electronics", fabricType: "N/A", qty: 500, unit: "pcs", unitAmount: 120, subtotal: 60000, receivedQty: 500 },
    ],
    totalAmount: 60000,
    status: "Received",
    createdBy: "Amit Desai",
    approvalRequired: false,
    approvalSteps: [
      { status: "draft", label: "Draft", date: "May 8, 2025", user: "Amit Desai", role: "Admin" },
      { status: "ready", label: "Ready to Send", date: "May 8, 2025" },
      { status: "sent", label: "Sent", date: "May 8, 2025" },
    ],
  },
];

// ============ SETTINGS / USERS DATA ============

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  accounts: number;
  branches: string[];
  canApprove: string[];
  status: "Active" | "Inactive";
  avatar?: string;
}

export interface Department {
  id: number;
  name: string;
  nameNepali: string;
  users: number;
}

export interface RoleData {
  id: number;
  name: string;
  description: string;
  userCount: number;
  departments: string[];
}

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  subModules?: { id: string; name: string; enabled: boolean }[];
}

export const settingsUsers: UserData[] = [
  { id: 1, name: "Amit Desai", email: "amit@darazretail.np", role: "Admin", department: "Management", accounts: 1, branches: ["Main Branch", "Thamel Branch"], canApprove: ["All"], status: "Active" },
  { id: 2, name: "Neha Joshi", email: "neha@darazretail.np", role: "Purchase Manager", department: "Procurement", accounts: 1, branches: ["Main Branch"], canApprove: ["Purchase Orders", "Bills"], status: "Active" },
  { id: 3, name: "Sita Gurung", email: "sita@darazretail.np", role: "Manager", department: "Management", accounts: 1, branches: ["Main Branch", "Thamel Branch"], canApprove: ["Expenses"], status: "Active" },
  { id: 4, name: "Ram Bahadur", email: "ram@darazretail.np", role: "Cashier", department: "Sales", accounts: 1, branches: ["Main Branch"], canApprove: [], status: "Active" },
  { id: 5, name: "Hari Sharma", email: "hari@darazretail.np", role: "Inventory Clerk", department: "Warehouse", accounts: 1, branches: ["Main Branch"], canApprove: [], status: "Active" },
  { id: 6, name: "Pooja Mehta", email: "pooja@darazretail.np", role: "Accountant", department: "Finance", accounts: 1, branches: ["Main Branch"], canApprove: ["Invoices"], status: "Active" },
  { id: 7, name: "Ramesh Patil", email: "ramesh@darazretail.np", role: "Sales", department: "Sales", accounts: 1, branches: ["Thamel Branch"], canApprove: [], status: "Active" },
  { id: 8, name: "Maya Gurung", email: "maya@darazretail.np", role: "Viewer", department: "Operations", accounts: 1, branches: ["Main Branch"], canApprove: [], status: "Inactive" },
];

export const departments: Department[] = [
  { id: 1, name: "Management", nameNepali: "व्यवस्थापन", users: 2 },
  { id: 2, name: "Procurement", nameNepali: "खरिद", users: 1 },
  { id: 3, name: "Sales", nameNepali: "बिक्री", users: 2 },
  { id: 4, name: "Warehouse", nameNepali: "गोदाम", users: 1 },
  { id: 5, name: "Finance", nameNepali: "वित्त", users: 1 },
  { id: 6, name: "Operations", nameNepali: "सञ्चालन", users: 1 },
];

export const rolesData: RoleData[] = [
  { id: 1, name: "Admin", description: "Full access to all modules and settings", userCount: 1, departments: ["Management"] },
  { id: 2, name: "Purchase Manager", description: "Can approve purchase orders and vendor bills", userCount: 1, departments: ["Procurement"] },
  { id: 3, name: "Manager", description: "Can manage sales, inventory, and approve expenses", userCount: 1, departments: ["Management"] },
  { id: 4, name: "Cashier", description: "POS access and basic sales operations", userCount: 1, departments: ["Sales"] },
  { id: 5, name: "Inventory Clerk", description: "Manage inventory, stock, and damage/returns", userCount: 1, departments: ["Warehouse"] },
  { id: 6, name: "Accountant", description: "Access to accounting modules and reports", userCount: 1, departments: ["Finance"] },
  { id: 7, name: "Sales", description: "Sales order management and customer handling", userCount: 1, departments: ["Sales"] },
  { id: 8, name: "Viewer", description: "Read-only access to dashboard and reports", userCount: 1, departments: ["Operations"] },
];

export const moduleConfigurations: ModuleConfig[] = [
  { id: "dashboard", name: "Dashboard", enabled: true },
  {
    id: "inventory",
    name: "Inventory",
    enabled: true,
    subModules: [
      { id: "products", name: "Products", enabled: true },
      { id: "purchase_orders", name: "Purchase Orders", enabled: true },
      { id: "stock", name: "Stock Management", enabled: true },
    ],
  },
  {
    id: "contacts",
    name: "Contacts",
    enabled: true,
    subModules: [
      { id: "clients", name: "Clients", enabled: true },
      { id: "vendors", name: "Vendors", enabled: true },
    ],
  },
  { id: "production", name: "Production", enabled: false },
  { id: "sales_orders", name: "Sales Orders", enabled: true },
  { id: "dispatch", name: "Dispatch", enabled: false },
  { id: "pos", name: "POS", enabled: true },
  {
    id: "accounting",
    name: "Accounting",
    enabled: true,
    subModules: [
      { id: "invoices", name: "Invoices", enabled: true },
      { id: "bills", name: "Bills", enabled: true },
      { id: "expenses", name: "Expense Log", enabled: true },
    ],
  },
  { id: "reports", name: "Reports", enabled: true },
  {
    id: "settings",
    name: "Settings",
    enabled: true,
    subModules: [
      { id: "users", name: "Users", enabled: true },
      { id: "roles", name: "Roles & Permissions", enabled: true },
    ],
  },
];

// ============ CLOTHING DATA ============
export {
  clothingProducts,
  posProducts,
  clothingCategories,
  clothingBrands,
  posSalesHistory,
  heldBills,
  DENOMINATIONS,
} from "./clothingData";
export type { Product, HeldBill } from "./clothingData";

// Permissions data for each module
export const modulePermissions: Record<string, string[]> = {
  Dashboard: ["View Dashboard", "View Analytics", "Export Reports"],
  Inventory: ["View Products", "Add Product", "Edit Product", "Delete Product", "Manage Stock", "Create PO", "Approve PO", "Receive Stock"],
  Contacts: ["View Clients", "Add Client", "Edit Client", "View Vendors", "Add Vendor", "Edit Vendor"],
  Production: ["View Production", "Create Production Order", "Edit Production Order"],
  "Sales Orders": ["View Sales Orders", "Create Sales Order", "Edit Sales Order", "Cancel Sales Order"],
  Dispatch: ["View Dispatch", "Create Dispatch", "Track Shipment"],
  POS: ["Open Session", "Process Sale", "Apply Discount", "Hold Bill", "View Sales History"],
  Accounting: ["View Invoices", "Create Invoice", "View Bills", "Record Payment", "View Expenses", "Add Expense", "Approve Expense"],
  Reports: ["View Sales Reports", "View Inventory Reports", "View Financial Reports", "Export Data"],
  Settings: ["Manage Users", "Manage Roles", "Configure Modules", "Company Settings"],
};

// ============ ACCOUNTING / INVOICES DATA ============

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  receivedSoFar: number;
  remainingBalance: number;
  status: "Draft" | "Sent" | "Partially Settled" | "Closed";
  paymentTerms: string;
  items: { name: string; qty: number; unitPrice: number; amount: number }[];
  paymentRequests: PaymentRequest[];
}

export interface PaymentRequest {
  id: string;
  term: string;
  type: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue";
  requestedAmount: number;
  received: number;
}

export const invoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-00102",
    customerName: "NK Textile Mills Pvt. Ltd.",
    customerAddress: "Surat, Gujarat",
    invoiceDate: "10 May 2026",
    dueDate: "20 May 2026",
    totalAmount: 1250000,
    receivedSoFar: 375000,
    remainingBalance: 875000,
    status: "Partially Settled",
    paymentTerms: "30% Advance | 50% Mid-Production | 20% Final",
    items: [
      { name: "Cotton Fabric (100m)", qty: 100, unitPrice: 8500, amount: 850000 },
      { name: "Silk Blend (50m)", qty: 50, unitPrice: 8000, amount: 400000 },
    ],
    paymentRequests: [
      { id: "pr1", term: "Advance (30%)", type: "Advance", amount: 375000, dueDate: "10 May 2026", status: "Paid", requestedAmount: 375000, received: 375000 },
      { id: "pr2", term: "Mid-Production (50%)", type: "Mid-Production", amount: 625000, dueDate: "15 May 2026", status: "Pending", requestedAmount: 625000, received: 0 },
      { id: "pr3", term: "Final Payment (20%)", type: "Final", amount: 250000, dueDate: "20 May 2026", status: "Pending", requestedAmount: 250000, received: 0 },
    ],
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-00103",
    customerName: "Everest Garments",
    customerAddress: "Kathmandu, Nepal",
    invoiceDate: "12 May 2026",
    dueDate: "22 May 2026",
    totalAmount: 450000,
    receivedSoFar: 0,
    remainingBalance: 450000,
    status: "Sent",
    paymentTerms: "Net 10",
    items: [
      { name: "Denim Fabric (200m)", qty: 200, unitPrice: 2250, amount: 450000 },
    ],
    paymentRequests: [
      { id: "pr4", term: "Full Payment", type: "Full", amount: 450000, dueDate: "22 May 2026", status: "Pending", requestedAmount: 450000, received: 0 },
    ],
  },
];

// ============ ACCOUNTING / BILLS DATA ============

export type BillStatus = "Queue" | "Partially Paid" | "Paid" | "Closed" | "Cancelled";

export interface Bill {
  id: string;
  billId: string;
  linkedPO: string;
  supplier: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentTerms: string;
  dueDate: string;
  status: BillStatus;
  paymentSchedule: BillPaymentSchedule[];
  paymentHistory: BillPaymentHistory[];
}

export interface BillPaymentSchedule {
  id: string;
  description: string;
  type: string;
  percentage: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  remaining: number;
  status: string;
}

export interface BillPaymentHistory {
  date: string;
  description: string;
  method: string;
  amount: number;
}

export const bills: Bill[] = [
  {
    id: "b-1",
    billId: "BIL-2026-0046",
    linkedPO: "PO-2025-0021",
    supplier: "Pokhara Imports",
    totalAmount: 60000,
    paidAmount: 60000,
    balance: 0,
    paymentTerms: "100% Advance",
    dueDate: "15 May 2026",
    status: "Paid",
    paymentSchedule: [
      { id: "bps1", description: "Full Amount", type: "Full", percentage: "100%", amount: 60000, dueDate: "15 May 2026", paidAmount: 60000, remaining: 0, status: "Paid" },
    ],
    paymentHistory: [
      { date: "08 May 2026", description: "Full payment", method: "Bank Transfer", amount: 60000 },
    ],
  },
  {
    id: "b-2",
    billId: "BIL-2026-0045",
    linkedPO: "PO-2025-0024",
    supplier: "Annapurna Suppliers",
    totalAmount: 214000,
    paidAmount: 107000,
    balance: 107000,
    paymentTerms: "50% Advance | 50% on Delivery",
    dueDate: "22 May 2026",
    status: "Partially Paid",
    paymentSchedule: [
      { id: "bps2", description: "Advance (50%)", type: "Advance", percentage: "50%", amount: 107000, dueDate: "15 May 2026", paidAmount: 107000, remaining: 0, status: "Paid" },
      { id: "bps3", description: "On Delivery (50%)", type: "Delivery", percentage: "50%", amount: 107000, dueDate: "22 May 2026", paidAmount: 0, remaining: 107000, status: "Pending" },
    ],
    paymentHistory: [
      { date: "15 May 2026", description: "Advance payment", method: "Bank Transfer", amount: 107000 },
    ],
  },
  {
    id: "b-3",
    billId: "BIL-2026-0044",
    linkedPO: "PO-2025-0023",
    supplier: "Himalayan Distributors",
    totalAmount: 51000,
    paidAmount: 0,
    balance: 51000,
    paymentTerms: "Net 30",
    dueDate: "20 Jun 2026",
    status: "Queue",
    paymentSchedule: [
      { id: "bps4", description: "Full Amount", type: "Full", percentage: "100%", amount: 51000, dueDate: "20 Jun 2026", paidAmount: 0, remaining: 51000, status: "Unpaid" },
    ],
    paymentHistory: [],
  },
];

// ============ ACCOUNTING / EXPENSE DATA ============

export interface Expense {
  id: string;
  expenseId: string;
  date: string;
  category: string;
  description: string;
  qty: number;
  unitCost: number;
  totalAmount: number;
  addedBy: string;
  status: "Approved" | "Pending Approval" | "Rejected";
}

export const expenseCategories = ["All", "Salary", "Repair", "Utilities", "Packaging", "Rent", "Transport", "Miscellaneous"];

export const expenses: Expense[] = [
  { id: "e1", expenseId: "EXP-2024-0056", date: "20 May 2026", category: "Repair", description: "Nail Gun Repair", qty: 1, unitCost: 2800, totalAmount: 2800, addedBy: "Arjan Shah", status: "Approved" },
  { id: "e2", expenseId: "EXP-2024-0055", date: "20 May 2026", category: "Repair", description: "Counter Light Repair", qty: 2, unitCost: 650, totalAmount: 1300, addedBy: "Ramesh Patil", status: "Approved" },
  { id: "e3", expenseId: "EXP-2024-0054", date: "19 May 2026", category: "Packaging", description: "Small Packaging Purchase", qty: 50, unitCost: 12, totalAmount: 600, addedBy: "Pooja Mehta", status: "Approved" },
  { id: "e4", expenseId: "EXP-2024-0053", date: "18 May 2026", category: "Miscellaneous", description: "Tea / Snacks for Staff", qty: 1, unitCost: 320, totalAmount: 320, addedBy: "Arjan Shah", status: "Approved" },
  { id: "e5", expenseId: "EXP-2024-0052", date: "18 May 2026", category: "Salary", description: "Employee Salary - May 2026", qty: 1, unitCost: 120000, totalAmount: 120000, addedBy: "Payroll System", status: "Approved" },
  { id: "e6", expenseId: "EXP-2024-0051", date: "17 May 2026", category: "Utilities", description: "Electricity Bill - Apr 2026", qty: 1, unitCost: 8750, totalAmount: 8750, addedBy: "Ramesh Patil", status: "Pending Approval" },
  { id: "e7", expenseId: "EXP-2024-0050", date: "16 May 2026", category: "Rent", description: "Shop Rent - May 2026", qty: 1, unitCost: 35000, totalAmount: 35000, addedBy: "Amit Desai", status: "Approved" },
  { id: "e8", expenseId: "EXP-2024-0049", date: "15 May 2026", category: "Transport", description: "Delivery Vehicle Fuel", qty: 1, unitCost: 5000, totalAmount: 5000, addedBy: "Hari Sharma", status: "Approved" },
];

// POS products are now exported from clothingData.ts (see CLOTHING DATA section above)
