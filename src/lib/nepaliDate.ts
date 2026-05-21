// Bikram Sambat (BS) calendar utility
// Reference: BS 2075 Baishakh 1 = AD 2018 April 14

const BS_MONTHS_EN = [
  "Baishakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin",
  "Kartik","Mangsir","Poush","Magh","Falgun","Chaitra",
];

// Days per month per BS year [Baishakh … Chaitra]
const BS_DATA: Record<number, number[]> = {
  2075: [31,31,32,32,31,30,30,29,30,29,30,30],
  2076: [31,32,31,32,31,30,30,30,29,30,29,31],
  2077: [30,32,31,32,31,30,30,30,29,30,29,31],
  2078: [31,31,31,32,31,31,30,29,30,29,30,30],
  2079: [31,31,32,31,31,30,30,30,29,30,30,30],
  2080: [31,31,32,32,31,30,30,29,30,29,30,30],
  2081: [31,32,31,32,31,30,30,29,30,29,30,30],
  2082: [31,32,31,32,31,30,30,30,29,30,29,31],
  2083: [31,31,31,32,31,31,30,29,30,29,30,30],
  2084: [31,31,32,31,31,30,30,30,29,30,30,30],
  2085: [31,32,31,32,31,30,30,29,30,29,30,30],
  2086: [31,32,31,32,31,30,30,30,29,30,29,31],
};

// Baishakh 1 start dates in AD (April 13 or 14 each year)
const BS_START: Record<number, [number, number, number]> = {
  // [year, month (0-indexed), day]
  2075: [2018, 3, 14],
  2076: [2019, 3, 14],
  2077: [2020, 3, 13],
  2078: [2021, 3, 14],
  2079: [2022, 3, 14],
  2080: [2023, 3, 14],
  2081: [2024, 3, 13],
  2082: [2025, 3, 14],
  2083: [2026, 3, 14],
  2084: [2027, 3, 14],
  2085: [2028, 3, 13],
  2086: [2029, 3, 14],
};

export interface BSDate {
  year: number;
  month: number; // 1-indexed
  day: number;
  monthName: string;
}

export function adToBS(ad: Date): BSDate {
  // Find which BS year we're in
  const years = Object.keys(BS_START).map(Number).sort((a, b) => a - b);

  let bsYear = years[0];
  for (const y of years) {
    const [sy, sm, sd] = BS_START[y];
    const start = new Date(sy, sm, sd);
    if (ad >= start) bsYear = y;
    else break;
  }

  const [sy, sm, sd] = BS_START[bsYear];
  const yearStart = new Date(sy, sm, sd);
  const diffMs = ad.getTime() - yearStart.getTime();
  let dayOfYear = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 0-indexed days since Baishakh 1

  const months = BS_DATA[bsYear] ?? BS_DATA[2082];
  let month = 1;
  for (let m = 0; m < 12; m++) {
    if (dayOfYear < months[m]) {
      month = m + 1;
      break;
    }
    dayOfYear -= months[m];
  }

  return {
    year: bsYear,
    month,
    day: dayOfYear + 1,
    monthName: BS_MONTHS_EN[month - 1],
  };
}

export function formatBS(ad: Date): string {
  const bs = adToBS(ad);
  return `${bs.year} ${bs.monthName} ${bs.day}`;
}

export function formatBSShort(ad: Date): string {
  const bs = adToBS(ad);
  return `${bs.day} ${bs.monthName} ${bs.year} BS`;
}
