export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isoNow() {
  return new Date().toISOString();
}

export function formatReceiptNumber(opts: {
  prefix: string;
  includeDate: boolean;
  sequenceDigits: number;
  sequence: number;
  date?: Date;
}) {
  const d = opts.date ?? new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(opts.sequence).padStart(opts.sequenceDigits, "0");
  const datePart = opts.includeDate ? `${yyyy}${mm}${dd}` : "";
  return [opts.prefix, datePart, seq].filter(Boolean).join("-");
}
