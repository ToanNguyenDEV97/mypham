const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/\./g, '').replace('đ', ''), 10);
};
console.log(parsePrice(299000));
console.log(parsePrice("299.000đ"));
