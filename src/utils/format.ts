export const parsePrice = (priceStr: string | number) => {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/\./g, '').replace('đ', ''), 10);
};

export const formatPrice = (priceNum: number) => {
  return new Intl.NumberFormat('vi-VN').format(priceNum) + 'đ';
};

