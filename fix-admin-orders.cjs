const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  '<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">\n        <div className="overflow-x-auto">',
  '<div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">'
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
