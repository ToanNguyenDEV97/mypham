const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const invoiceFuncTarget = `  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup để in hóa đơn.");
      return;
    }`;

const handlePrintWaybill = `  const handlePrintWaybill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup để in vận đơn.");
      return;
    }

    const htmlContent = \`
      <html>
        <head>
          <title>In Vận Đơn #\${selectedOrder.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; background: #fff; color: #000; }
            .waybill { width: 100%; max-width: 100mm; margin: 0 auto; border: 2px dashed #000; padding: 15px; box-sizing: border-box; }
            .waybill-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .logo { font-size: 24px; font-weight: bold; }
            .barcode { font-size: 40px; font-family: 'Libre Barcode 39 Text', monospace; letter-spacing: 2px; text-align: center; margin: 15px 0; }
            .section { border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .address-box { padding: 10px; background: #f9f9f9; border: 1px solid #ddd; margin-bottom: 10px; }
            .address-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            h4 { margin: 0 0 5px 0; font-size: 14px; }
            p { margin: 0 0 5px 0; font-size: 13px; line-height: 1.4; }
            .cod-box { text-align: center; border: 2px solid #000; padding: 10px; margin: 15px 0; }
            .cod-amount { font-size: 24px; font-weight: bold; }
            .table-items { width: 100%; font-size: 12px; margin-top: 10px; border-collapse: collapse; }
            .table-items th, .table-items td { border: 1px solid #ddd; padding: 5px; text-align: left; }
            .footer-note { text-align: center; font-size: 11px; font-style: italic; margin-top: 15px; }
            @media print {
              body { padding: 0; }
              .waybill { border: none; max-width: 100%; padding: 0; }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="waybill">
            <div class="waybill-header">
              <div class="logo">DS TIEN</div>
              <div>Giao Hàng Nhanh</div>
            </div>
            
            <div class="barcode">
              *\${selectedOrder.id.substring(0, 8).toUpperCase()}*
            </div>
            <div style="text-align: center; font-size: 12px; margin-top: -10px; margin-bottom: 15px; font-weight: bold;">
              Mã ĐH: \${selectedOrder.id.toUpperCase()}
            </div>

            <div class="row">
              <div style="width: 48%;" class="address-box">
                <div class="address-title">Từ: DS Tiên Cosmetics</div>
                <p>123 Đường Mỹ Phẩm, Quận 1, TP. HCM</p>
                <p>SĐT: 0901 234 567</p>
              </div>
              <div style="width: 48%;" class="address-box">
                <div class="address-title">Đến: \${selectedOrder.customerInfo?.name || 'Khách hàng'}</div>
                <p>\${selectedOrder.customerInfo?.address || 'Không có địa chỉ'}</p>
                <p>SĐT: \${selectedOrder.customerInfo?.phone || 'Không có SĐT'}</p>
              </div>
            </div>

            <div class="cod-box">
              <p style="font-size: 14px; margin-bottom: 5px;">Tiền thu người nhận (COD)</p>
              <div class="cod-amount">
                \${selectedOrder.paymentMethod === 'bank' ? '0 ₫' : formatPrice(selectedOrder.finalTotal || selectedOrder.totalAmount || selectedOrder.totalPrice || 0)}
              </div>
              <p style="font-size: 12px; margin-top: 5px;">\${selectedOrder.paymentMethod === 'bank' ? '(Khách đã thanh toán trước)' : '(Đã bao gồm phí Giao hàng)'}</p>
            </div>

            <div class="section">
              <h4>Nội dung hàng (Tổng SL: \${selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0})</h4>
              <table class="table-items">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center; width: 40px;">SL</th>
                  </tr>
                </thead>
                <tbody>
                  \${(selectedOrder.items || []).map((item) => \`
                    <tr>
                      <td>\${item.name}</td>
                      <td style="text-align: center;">\${item.quantity}</td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>

            <div class="row">
              <div style="width: 60%; font-size: 12px;">
                <p><strong>Ghi chú:</strong> \${selectedOrder.customerInfo?.note || 'Không có'}</p>
              </div>
              <div style="width: 35%; text-align: right; font-size: 12px;">
                <p><strong>Khối lượng:</strong> 500g</p>
              </div>
            </div>

            <div class="footer-note">
              ** Chỉ dẫn giao hàng: Cho xem hàng, không thử. Khách hàng vui lòng quay video khi mở kiện hàng. **
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    \`;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup để in hóa đơn.");
      return;
    }`;

code = code.replace(invoiceFuncTarget, handlePrintWaybill);

const buttonTarget = `<button 
                      onClick={handlePrintInvoice}
                      className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      In hóa đơn
                    </button>`;
const buttonReplacement = `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button 
                        onClick={handlePrintWaybill}
                        className="flex items-center justify-center gap-2 bg-[#F4B5C6] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#4A2C2C] transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        In vận đơn
                      </button>
                      <button 
                        onClick={handlePrintInvoice}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        In hóa đơn
                      </button>
                    </div>`;

code = code.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
