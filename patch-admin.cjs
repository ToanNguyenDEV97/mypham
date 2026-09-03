const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  /selectedOrder\.totalAmount/g,
  '(selectedOrder.totalAmount || selectedOrder.totalPrice)'
);

code = code.replace(
  /selectedOrder\.discount/g,
  '(selectedOrder.discount || selectedOrder.discountAmount || 0)'
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
