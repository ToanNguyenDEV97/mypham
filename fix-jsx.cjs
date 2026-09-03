const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  `        ) : (
            {selectedOrderIds.length > 0 && (`,
  `        ) : (
          <>
            {selectedOrderIds.length > 0 && (`
);

code = code.replace(
  `        ) : (
                      {selectedOrderIds.length > 0 && (`,
  `        ) : (
          <>
            {selectedOrderIds.length > 0 && (`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
