const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  "{/* Pagination */\n        !loading",
  "{/* Pagination */}\n        {!loading"
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
