const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const helpers = `
const maskName = (str) => {
  if (!str) return '';
  const words = str.trim().split(' ');
  if (words.length <= 1) return str.substring(0, 1) + '***';
  return words[0] + ' *** ' + words[words.length - 1];
};

const maskPhone = (str) => {
  if (!str) return '';
  return str.length >= 8 ? str.substring(0, 3) + '****' + str.substring(str.length - 3) : '***';
};

const maskAddress = (str) => {
  if (!str) return '';
  if (str.length < 15) return '***' + str.substring(Math.floor(str.length / 2));
  return str.substring(0, 5) + '***' + str.substring(str.length - 15);
};

export const AdminOrders = () => {`;

code = code.replace(`export const AdminOrders = () => {`, helpers);

// Replace Waybill Info
const waybillTarget = `<div style="width: 48%;" class="address-box">
                <div class="address-title">Đến: \\$\\{selectedOrder.customerInfo?.name || 'Khách hàng'\\}</div>
                <p>\\$\\{selectedOrder.customerInfo?.address || 'Không có địa chỉ'\\}</p>
                <p>SĐT: \\$\\{selectedOrder.customerInfo?.phone || 'Không có SĐT'\\}</p>
              </div>`;
const waybillReplacement = `<div style="width: 48%;" class="address-box">
                <div class="address-title">Đến: \\$\\{maskName(selectedOrder.customerInfo?.name) || 'Khách hàng'\\}</div>
                <p>\\$\\{maskAddress(selectedOrder.customerInfo?.address) || 'Không có địa chỉ'\\}</p>
                <p>SĐT: \\$\\{maskPhone(selectedOrder.customerInfo?.phone) || 'Không có SĐT'\\}</p>
              </div>`;
code = code.replace(waybillTarget, waybillReplacement);

// Replace Invoice Info
const invoiceTarget = `<div class="info-box">
              <h3>Thông tin khách hàng</h3>
              <p><strong>Người nhận:</strong> \\$\\{selectedOrder.customerInfo?.name || ''\\}</p>
              <p><strong>Điện thoại:</strong> \\$\\{selectedOrder.customerInfo?.phone || ''\\}</p>
              <p><strong>Địa chỉ:</strong> \\$\\{selectedOrder.customerInfo?.address || ''\\}</p>
            </div>`;
const invoiceReplacement = `<div class="info-box">
              <h3>Thông tin khách hàng</h3>
              <p><strong>Người nhận:</strong> \\$\\{maskName(selectedOrder.customerInfo?.name) || ''\\}</p>
              <p><strong>Điện thoại:</strong> \\$\\{maskPhone(selectedOrder.customerInfo?.phone) || ''\\}</p>
              <p><strong>Địa chỉ:</strong> \\$\\{maskAddress(selectedOrder.customerInfo?.address) || ''\\}</p>
            </div>`;
code = code.replace(invoiceTarget, invoiceReplacement);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
