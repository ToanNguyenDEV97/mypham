const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  /) : \(\s*\{selectedOrderIds\.length > 0/g,
  ") : (<>{selectedOrderIds.length > 0"
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
