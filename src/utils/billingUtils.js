/**
 * Utility bill calculation helpers.
 */

/**
 * Calculate electricity bill using slab-based tariff.
 * @param {number} units - Units consumed
 * @param {Object} slabs - Array of {upTo, ratePerUnit} sorted ascending
 * @returns {number} bill amount in INR
 */
export function calculateElectricityBill(units, slabs) {
  let remaining = units;
  let total = 0;
  let prev = 0;

  for (const slab of slabs) {
    const slabUnits = slab.upTo === Infinity ? remaining : Math.min(remaining, slab.upTo - prev);
    total += slabUnits * slab.ratePerUnit;
    remaining -= slabUnits;
    prev = slab.upTo;
    if (remaining <= 0) break;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Default electricity slab tariff (Maharashtra MSEDCL-like).
 */
export const DEFAULT_ELECTRICITY_SLABS = [
  { upTo: 100, ratePerUnit: 2.8 },
  { upTo: 300, ratePerUnit: 5.45 },
  { upTo: 500, ratePerUnit: 8.15 },
  { upTo: Infinity, ratePerUnit: 9.7 },
];

/**
 * Calculate water bill (flat rate).
 * @param {number} kl - Kilolitres consumed
 * @param {number} ratePerKL
 */
export function calculateWaterBill(kl, ratePerKL) {
  return Math.round(kl * ratePerKL * 100) / 100;
}

/**
 * Format month string (YYYY-MM) to human-readable.
 */
export function formatMonth(yyyyMM) {
  const [year, month] = yyyyMM.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Get current month as YYYY-MM.
 */
export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Previous month as YYYY-MM.
 */
export function previousMonth(yyyyMM = currentMonth()) {
  const [y, m] = yyyyMM.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
