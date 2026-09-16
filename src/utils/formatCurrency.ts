import i18n from 'i18next';

export const formatCurrency = (
  amount: number | null | undefined,
  currency = 'INR',
  locale = i18n.language || 'en-IN'
): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '';
  }
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
};
