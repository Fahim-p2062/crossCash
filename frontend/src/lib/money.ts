/**
 * Single source of truth for all currency formatting in the application.
 * Currently formats floating-point BDT amounts with 2 decimal places and the ৳ symbol.
 * When backend moves to integer paisa in later stages, this helper will be updated here.
 */
export function formatMoney(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) {
    return '৳0.00';
  }

  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) {
    return '৳0.00';
  }

  const formatted = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `৳${formatted}`;
}
