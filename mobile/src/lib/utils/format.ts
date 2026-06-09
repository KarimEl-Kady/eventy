/**
 * Format a date string to a long readable format
 * @example formatDate('2025-09-15') → 'Monday, September 15, 2025'
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Auto-format date input with dashes (YYYY-MM-DD)
 */
export function formatDateInput(text: string): string {
  const cleaned = text.replace(/[^\d-]/g, '');
  const digits = cleaned.replace(/-/g, '');
  let formatted = cleaned;

  if (digits.length >= 4 && !cleaned.includes('-')) {
    formatted = digits.slice(0, 4) + '-' + digits.slice(4);
  }
  if (digits.length >= 6 && cleaned.split('-').length < 3) {
    const parts = formatted.split('-');
    if (parts.length === 2 && parts[1].length > 2) {
      formatted = parts[0] + '-' + parts[1].slice(0, 2) + '-' + parts[1].slice(2);
    }
  }

  return formatted.slice(0, 10);
}

/**
 * Auto-format time input with colon (HH:MM)
 */
export function formatTimeInput(text: string): string {
  const cleaned = text.replace(/[^\d:]/g, '');
  const digits = cleaned.replace(/:/g, '');
  let formatted = cleaned;

  if (digits.length >= 2 && !cleaned.includes(':')) {
    formatted = digits.slice(0, 2) + ':' + digits.slice(2);
  }

  return formatted.slice(0, 5);
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return !isNaN(new Date(date).getTime());
}

/**
 * Validate time string format (HH:MM)
 */
export function isValidTime(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}
