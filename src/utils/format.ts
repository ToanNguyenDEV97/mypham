export const parsePrice = (priceStr: string | number) => {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/\./g, '').replace('đ', ''), 10);
};

export const formatPrice = (priceNum: number | string) => {
  return new Intl.NumberFormat('vi-VN').format(typeof priceNum === "string" ? parseInt(priceNum.replace(/\D/g, "") || "0") : priceNum) + 'đ';
};

export const maskName = (str: string) => {
  if (!str) return '';
  const words = str.trim().split(' ');
  if (words.length <= 1) return str.substring(0, 1) + '***';
  return words[0] + ' *** ' + words[words.length - 1];
};

export const maskPhone = (str: string) => {
  if (!str) return '';
  return str.length >= 8 ? str.substring(0, 3) + '****' + str.substring(str.length - 3) : '***';
};

export const maskAddress = (str: string) => {
  if (!str) return '';
  if (str.length < 15) return '***' + str.substring(Math.floor(str.length / 2));
  return str.substring(0, 5) + '***' + str.substring(str.length - 15);
};

export const parseDate = (timestamp: import('../types').TimestampType): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date(timestamp as string | number);
};

export const formatDateStr = (timestamp: import('../types').TimestampType): string => {
  if (!timestamp) return 'N/A';
  return parseDate(timestamp).toLocaleDateString('vi-VN');
};
