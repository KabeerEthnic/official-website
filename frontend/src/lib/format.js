/**
 * Display helpers. The API speaks in paise; everything a shopper reads is
 * formatted here so currency and dates look the same on every page.
 */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrWithPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

/** 1499900 -> "₹14,999" (and "₹14,999.50" when the paise are meaningful). */
export function formatPrice(paise) {
  if (paise === null || paise === undefined) return '';
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? inr.format(rupees) : inrWithPaise.format(rupees);
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

/** "PENDING" -> "Pending", "FEW_PIECES" -> "Few pieces". */
export function titleCase(value) {
  if (!value) return '';
  const words = String(value).toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
