const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// Replace bulk confirm
code = code.replace(
  /if \(!window\.confirm\(`Bạn có chắc chắn muốn XÁC NHẬN \$\{selectedOrderIds\.length\} đơn hàng này\?`\)\) return;/g,
  ''
);
code = code.replace(
  /if \(!window\.confirm\(`Bạn có chắc chắn muốn HỦY \$\{selectedOrderIds\.length\} đơn hàng này\?`\)\) return;/g,
  ''
);
code = code.replace(
  /if \(!window\.confirm\(`Bạn có chắc chắn muốn HOÀN THÀNH \$\{selectedOrderIds\.length\} đơn hàng này\?`\)\) return;/g,
  ''
);

// Replace individual confirm
const individualConfirmStr = `    if (!window.confirm(\`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng thành "\${statusLabels[newStatus]}" không?\`)) {
      return;
    }`;
code = code.replace(individualConfirmStr, '');

// Replace alerts
code = code.replace(/alert\(/g, 'console.error(');

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
