/**
 * Money helpers. Everything the API stores or returns is an integer number of
 * paise; rupee values only exist at the edges (admin forms, display strings).
 */

export const rupeesToPaise = (rupees) => Math.round(Number(rupees) * 100);

export const paiseToRupees = (paise) => paise / 100;

/** Percentage of an amount, rounded to the nearest paise. */
export const percentOf = (paise, percent) => Math.round((paise * percent) / 100);

export const clampPositive = (n) => (n > 0 ? n : 0);
