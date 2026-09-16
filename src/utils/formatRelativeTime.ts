import i18n from 'i18next';

export const formatRelativeTime = (
  dateInput?: string | Date | null,
  locale = i18n.language || 'en'
): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.round((d.getTime() - now.getTime()) / 1000);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const cutoffs: { unit: Intl.RelativeTimeFormatUnit; value: number }[] = [
      { unit: 'year', value: 31536000 },
      { unit: 'month', value: 2592000 },
      { unit: 'week', value: 604800 },
      { unit: 'day', value: 86400 },
      { unit: 'hour', value: 3600 },
      { unit: 'minute', value: 60 },
      { unit: 'second', value: 1 },
    ];

    for (const { unit, value } of cutoffs) {
      if (Math.abs(diffInSeconds) >= value || unit === 'second') {
        const delta = Math.round(diffInSeconds / value);
        return rtf.format(delta, unit);
      }
    }
  } catch {
    return d.toLocaleDateString();
  }

  return '';
};
