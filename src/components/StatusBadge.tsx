const statusStyles: Record<string, { bg: string; text: string }> = {
  "In Stock": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Low Stock": { bg: "bg-amber-100", text: "text-amber-700" },
  "Out of Stock": { bg: "bg-red-100", text: "text-red-700" },
  Active: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Inactive: { bg: "bg-slate-100", text: "text-slate-500" },
  Completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Processing: { bg: "bg-blue-100", text: "text-blue-700" },
  Pending: { bg: "bg-amber-100", text: "text-amber-700" },
  Cancelled: { bg: "bg-red-100", text: "text-red-700" },
  Sent: { bg: "bg-blue-100", text: "text-blue-700" },
  Acknowledged: { bg: "bg-cyan-100", text: "text-cyan-700" },
  "Partially Received": { bg: "bg-amber-100", text: "text-amber-700" },
  Received: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Overdue: { bg: "bg-red-100", text: "text-red-700" },
  Draft: { bg: "bg-slate-100", text: "text-slate-600" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || { bg: "bg-slate-100", text: "text-slate-600" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  );
}
