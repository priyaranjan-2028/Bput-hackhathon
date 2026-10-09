export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(date: string): boolean {
  return date === getTodayISO();
}

export function validateDataEntryDate(date: string): string | undefined {
  if (!date) return 'Select today’s data entry date to continue.';
  if (!isToday(date)) return 'Data can only be entered for today. Select today’s date and try again.';
  return undefined;
}

export function formatDisplayDate(date: string): string {
  if (!date) return '—';
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}
