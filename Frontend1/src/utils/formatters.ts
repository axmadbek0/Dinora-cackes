/**
 * Format numbers into standard DINORA UZS price format, e.g., "250,000 UZS"
 */
export const formatUZS = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 UZS';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${new Intl.NumberFormat('fr-FR').format(numeric).replace(/\s/g, ',')} UZS`;
};

/**
 * Format Uzbek phone numbers nicely
 */
export const formatPhoneNumber = (input: string): string => {
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }
  if (cleaned.length === 9) {
    return `+998 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  return input;
};

/**
 * Short date formatter for order history, e.g. "15-avgust, 18:43"
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const months = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
    ];
    const monthName = months[date.getMonth()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${monthName}, ${hours}:${minutes}`;
  } catch (e) {
    return dateString;
  }
};

