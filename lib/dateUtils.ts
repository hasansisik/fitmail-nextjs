/**
 * Format a date to show relative time in Turkish
 * @param date - The date to format
 * @returns Formatted relative time string in Turkish
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'Az önce';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  } else if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  } else if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  } else {
    return `${diffInYears} yıl önce`;
  }
}

/**
 * Format a date to show full date in Turkish format
 * @param date - The date to format
 * @returns Formatted date string in Turkish
 */
export function formatFullDate(date: string | Date): string {
  const targetDate = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return targetDate.toLocaleDateString('tr-TR', options);
}
