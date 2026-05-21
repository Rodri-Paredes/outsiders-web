/**
 * Formatting utilities for Bolivian currency and numbers.
 * Uses Bolivia locale (es-BO): "." as thousands separator, "," as decimal separator.
 *
 * formatCurrency(1500)      → "Bs. 1.500"
 * formatCurrency(1599.99)   → "Bs. 1.599,99"
 * formatNumber(2500000)     → "2.500.000"
 */

const BO_LOCALE = 'es-BO';

/**
 * Format a monetary amount with Boliviano symbol.
 * Omits trailing decimals when the amount is a whole number.
 * Supports future multi-currency via optional symbol param.
 */
export function formatCurrency(amount: number, symbol = 'Bs.'): string {
  const formatted = new Intl.NumberFormat(BO_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbol} ${formatted}`;
}

/**
 * Format a plain number with thousand separators (no currency symbol).
 * formatNumber(2500000) → "2.500.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(BO_LOCALE).format(value);
}
