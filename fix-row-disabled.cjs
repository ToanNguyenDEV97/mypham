const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); updateOrderStatus\(([^)]+)\); \}\}/g,
  "onClick={(e) => { e.stopPropagation(); updateOrderStatus($1); }}\n                            disabled={updating}"
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
