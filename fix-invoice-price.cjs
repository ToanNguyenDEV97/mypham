const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// Replace item.price with parsePrice(item.newPrice || item.price)
code = code.replace(
  /\$\{formatPrice\(item\.price \|\| 0\)\}/g,
  `\${formatPrice(parsePrice(item.newPrice || item.price || 0))}`
);
code = code.replace(
  /\$\{formatPrice\(\(item\.price \|\| 0\) \* item\.quantity\)\}/g,
  `\${formatPrice(parsePrice(item.newPrice || item.price || 0) * item.quantity)}`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
