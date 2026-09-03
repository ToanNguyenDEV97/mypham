const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const targetStr = ") : (";
const nextStr = "{selectedOrderIds.length > 0 && (";
const index = code.lastIndexOf(nextStr);

if (index !== -1) {
  code = code.substring(0, index) + "<>\n            " + code.substring(index);
}

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
