const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert Latin digits inside a string to Persian digits (UI display layer). */
export function faDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format a number with Persian digits for counters, scores and metadata. */
export function faNum(value: number): string {
  return faDigits(String(value));
}

/**
 * Remove a leading ordinal («۱. »، «3.») from a lesson title — position is
 * already conveyed by the kicker and the rail badge, and duplicate numerals
 * in headings read as clutter.
 */
export function stripLessonNumber(title: string): string {
  return title.replace(/^\s*[۰-۹0-9]+\s*[.)ـ]\s*/, '');
}
