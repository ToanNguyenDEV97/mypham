const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// Update generateWaybillHtml COD amount
code = code.replace(
  /\$\{order\.paymentMethod === 'bank' \? '0 ₫' : formatPrice\(order\.finalTotal \|\| order\.totalAmount \|\| order\.totalPrice \|\| 0\)\}/g,
  `\${order.paymentMethod === 'bank' ? '0 ₫' : formatPrice(parsePrice(order.finalTotal || order.totalAmount || order.totalPrice || 0))}`
);

// We need to rewrite the whole summary div in generateInvoiceHtml to be smart about subTotal, shipping, discount.
// Let's use a regex to replace the summary div
const summaryRegex = /<div class="summary">[\s\S]*?<\/div>\s*<div class="footer">/;

const newSummary = `
            <div class="summary">
              <div class="summary-row">
                <span>Tạm tính:</span>
                <span>\${formatPrice(parsePrice(order.totalAmount || order.totalPrice || 0))}</span>
              </div>
              \${parsePrice(order.shippingFee || 0) > 0 ? \`
              <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <span>\${formatPrice(parsePrice(order.shippingFee))}</span>
              </div>
              \` : ''}
              \${parsePrice(order.discount || order.discountAmount || 0) > 0 ? \`
              <div class="summary-row">
                <span>Giảm giá:</span>
                <span>-\${formatPrice(parsePrice(order.discount || order.discountAmount || 0))}</span>
              </div>
              \` : ''}
              <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span>\${formatPrice(parsePrice(order.finalTotal || order.totalAmount || order.totalPrice || 0))}</span>
              </div>
            </div>
            <div class="footer">`;

code = code.replace(summaryRegex, newSummary);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
