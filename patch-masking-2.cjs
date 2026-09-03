const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(/\\$\\{selectedOrder\\.customerInfo\\?\\.name \\|\\| 'Khách hàng'\\}/g, "\\${maskName(selectedOrder.customerInfo?.name) || 'Khách hàng'}");
code = code.replace(/\\$\\{selectedOrder\\.customerInfo\\?\\.address \\|\\| 'Không có địa chỉ'\\}/g, "\\${maskAddress(selectedOrder.customerInfo?.address) || 'Không có địa chỉ'}");
code = code.replace(/\\$\\{selectedOrder\\.customerInfo\\?\\.phone \\|\\| 'Không có SĐT'\\}/g, "\\${maskPhone(selectedOrder.customerInfo?.phone) || 'Không có SĐT'}");

code = code.replace(/\\$\\{selectedOrder\\.customerInfo\\?\\.name \\|\\| ''\\}/g, "\\${maskName(selectedOrder.customerInfo?.name) || ''}");
code = code.replace(/\\$\\{selectedOrder\\.customerInfo\\?\\.address \\|\\| ''\\}/g, "\\${maskAddress(selectedOrder.customerInfo?.address) || ''}");
code = code.replace(/\\$\\{selectedOrder\\.customerInfo\\?\\.phone \\|\\| ''\\}/g, "\\${maskPhone(selectedOrder.customerInfo?.phone) || ''}");

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
