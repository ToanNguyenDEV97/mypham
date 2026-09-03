const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// 1. Add state for selectedOrderIds
code = code.replace(
  `const [selectedOrder, setSelectedOrder] = useState<any>(null);`,
  `const [selectedOrder, setSelectedOrder] = useState<any>(null);\n  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);`
);

// 2. Add bulk action functions above fetchOrders
const bulkActions = `  const handleBulkApprove = async () => {
    if (!window.confirm(\`Bạn có chắc chắn muốn xác nhận \${selectedOrderIds.length} đơn hàng này?\`)) return;
    setUpdating(true);
    try {
      await Promise.all(
        selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { status: 'processing' }))
      );
      await fetchOrders();
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Error bulk updating:", error);
    } finally {
      setUpdating(false);
    }
  };

  const generateWaybillHtml = (ordersToPrint: any[]) => {
    return \`
      <html>
        <head>
          <title>In Vận Đơn (\${ordersToPrint.length} đơn)</title>
          <style>
            @page { size: 100mm 150mm; margin: 0; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
            .page { width: 100mm; height: 150mm; padding: 5mm; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; }
            .waybill { width: 100%; height: 100%; border: 2px dashed #000; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; }
            .waybill-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
            .logo { font-size: 20px; font-weight: bold; }
            .barcode { font-size: 36px; font-family: 'Libre Barcode 39 Text', monospace; letter-spacing: 2px; text-align: center; margin: 5px 0; }
            .section { border-bottom: 1px dashed #ccc; padding-bottom: 5px; margin-bottom: 5px; flex-shrink: 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .address-box { padding: 5px; background: #f9f9f9; border: 1px solid #ddd; font-size: 11px; }
            .address-title { font-weight: bold; font-size: 12px; margin-bottom: 2px; }
            h4 { margin: 0 0 3px 0; font-size: 12px; }
            p { margin: 0 0 3px 0; font-size: 11px; line-height: 1.3; }
            .cod-box { text-align: center; border: 2px solid #000; padding: 5px; margin: 5px 0; }
            .cod-amount { font-size: 20px; font-weight: bold; }
            .table-items { width: 100%; font-size: 10px; margin-top: 5px; border-collapse: collapse; }
            .table-items th, .table-items td { border: 1px solid #ddd; padding: 3px; text-align: left; }
            .footer-note { text-align: center; font-size: 10px; font-style: italic; margin-top: auto; }
            @media print {
              body { padding: 0; }
              .page { margin: 0; border: none; }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
        </head>
        <body>
          \${ordersToPrint.map(order => \`
          <div class="page">
            <div class="waybill">
              <div class="waybill-header">
                <div class="logo">DS TIEN</div>
                <div>Giao Hàng Nhanh</div>
              </div>
              
              <div class="barcode">
                *\${order.id.substring(0, 8).toUpperCase()}*
              </div>
              <div style="text-align: center; font-size: 11px; margin-top: -5px; margin-bottom: 5px; font-weight: bold;">
                Mã ĐH: \${order.id.toUpperCase()}
              </div>

              <div class="row">
                <div style="width: 48%;" class="address-box">
                  <div class="address-title">Từ: DS Tiên Cosmetics</div>
                  <p>123 Đường Mỹ Phẩm, Quận 1, TP. HCM</p>
                  <p>SĐT: 0901 234 567</p>
                </div>
                <div style="width: 48%;" class="address-box">
                  <div class="address-title">Đến: \${maskName(order.customerInfo?.name) || 'Khách hàng'}</div>
                  <p>\${maskAddress(order.customerInfo?.address) || 'Không có địa chỉ'}</p>
                  <p>SĐT: \${maskPhone(order.customerInfo?.phone) || 'Không có SĐT'}</p>
                </div>
              </div>

              <div class="cod-box">
                <p style="font-size: 12px; margin-bottom: 2px;">Tiền thu người nhận (COD)</p>
                <div class="cod-amount">
                  \${order.paymentMethod === 'bank' ? '0 ₫' : formatPrice(order.finalTotal || order.totalAmount || order.totalPrice || 0)}
                </div>
                <p style="font-size: 10px; margin-top: 2px;">\${order.paymentMethod === 'bank' ? '(Khách đã thanh toán)' : '(Bao gồm phí GH)'}</p>
              </div>

              <div class="section" style="flex-grow: 1; overflow: hidden;">
                <h4>Nội dung (SL: \${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0})</h4>
                <table class="table-items">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style="text-align: center; width: 30px;">SL</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${(order.items || []).map((item) => \`
                      <tr>
                        <td>\${item.name}</td>
                        <td style="text-align: center;">\${item.quantity}</td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>

              <div class="row" style="margin-top: 5px;">
                <div style="width: 65%; font-size: 10px;">
                  <p><strong>Ghi chú:</strong> \${order.customerInfo?.note || 'Không'}</p>
                </div>
                <div style="width: 30%; text-align: right; font-size: 10px;">
                  <p><strong>KL:</strong> 500g</p>
                </div>
              </div>

              <div class="footer-note">
                ** Chỉ dẫn giao hàng: Cho xem hàng, không thử. Quay video khi mở kiện. **
              </div>
            </div>
          </div>
          \`).join('')}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            }
          </script>
        </body>
      </html>
    \`;
  };

  const generateInvoiceHtml = (ordersToPrint: any[]) => {
    return \`
      <html>
        <head>
          <title>In Hóa Đơn (\${ordersToPrint.length} đơn)</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; width: 80mm; }
            .page { width: 80mm; padding: 5mm; box-sizing: border-box; page-break-after: always; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .header h1 { font-size: 16px; margin: 0 0 5px 0; }
            .header p { margin: 0; font-size: 12px; }
            .info-section { font-size: 12px; margin-bottom: 10px; }
            .info-box { margin-bottom: 8px; }
            h3 { font-size: 13px; margin: 0 0 3px 0; border-bottom: 1px solid #eee; padding-bottom: 2px; }
            p { margin: 0 0 3px 0; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
            th { border-bottom: 1px solid #000; padding: 4px 0; text-align: left; }
            td { padding: 4px 0; border-bottom: 1px dashed #eee; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary { border-top: 1px solid #000; padding-top: 5px; font-size: 12px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .total { font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; }
            .footer { text-align: center; font-size: 11px; margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          \${ordersToPrint.map(order => \`
          <div class="page">
            <div class="header">
              <h1>DS TIÊN COSMETICS</h1>
              <p>HÓA ĐƠN MUA HÀNG</p>
              <p>Mã đơn: #\${order.id.toUpperCase()}</p>
            </div>
            
            <div class="info-section">
              <div class="info-box">
                <h3>Khách hàng</h3>
                <p><strong>Tên:</strong> \${maskName(order.customerInfo?.name) || ''}</p>
                <p><strong>ĐT:</strong> \${maskPhone(order.customerInfo?.phone) || ''}</p>
                <p><strong>Đ/c:</strong> \${maskAddress(order.customerInfo?.address) || ''}</p>
              </div>
              <div class="info-box">
                <p><strong>Ngày:</strong> \${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('vi-VN') : ''}</p>
                <p><strong>TT:</strong> \${order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>SP</th>
                  <th class="text-center">SL</th>
                  <th class="text-right">T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                \${(order.items || []).map((item) => \`
                  <tr>
                    <td>\${item.name.substring(0, 20)}\${item.name.length > 20 ? '...' : ''}</td>
                    <td class="text-center">\${item.quantity}</td>
                    <td class="text-right">\${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Tạm tính:</span>
                <span>\${formatPrice((order.totalAmount || order.totalPrice) || 0)}</span>
              </div>
              \${(order.discount || order.discountAmount || 0) > 0 ? \`
              <div class="summary-row">
                <span>Giảm giá:</span>
                <span>-\${formatPrice((order.discount || order.discountAmount || 0))}</span>
              </div>
              \` : ''}
              <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span>\${formatPrice(order.finalTotal || (order.totalAmount || order.totalPrice) || 0)}</span>
              </div>
            </div>
            <div class="footer">
              Cảm ơn quý khách!<br/>Chúc quý khách một ngày tốt lành.
            </div>
          </div>
          \`).join('')}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            }
          </script>
        </body>
      </html>
    \`;
  };

  const handlePrintBulkWaybills = () => {
    const ordersToPrint = orders.filter(o => selectedOrderIds.includes(o.id));
    if (ordersToPrint.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Trình duyệt chặn popup.");
    printWindow.document.write(generateWaybillHtml(ordersToPrint));
    printWindow.document.close();
  };

  const handlePrintBulkInvoices = () => {
    const ordersToPrint = orders.filter(o => selectedOrderIds.includes(o.id));
    if (ordersToPrint.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Trình duyệt chặn popup.");
    printWindow.document.write(generateInvoiceHtml(ordersToPrint));
    printWindow.document.close();
  };
`;

code = code.replace(`  useEffect(() => {`, bulkActions + `\n  useEffect(() => {`);

// 3. Replace single print functions to use the generators
const oldPrintFuncsRegex = /const handlePrintWaybill = \(\) => \{[\s\S]*?printWindow\.document\.close\(\);\n  \};\n\n  const handlePrintInvoice = \(\) => \{[\s\S]*?printWindow\.document\.close\(\);\n  \};/m;

const newPrintFuncs = `const handlePrintWaybill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Trình duyệt chặn popup.");
    printWindow.document.write(generateWaybillHtml([selectedOrder]));
    printWindow.document.close();
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Trình duyệt chặn popup.");
    printWindow.document.write(generateInvoiceHtml([selectedOrder]));
    printWindow.document.close();
  };`;

code = code.replace(oldPrintFuncsRegex, newPrintFuncs);

// 4. Update the Table layout to include bulk actions and checkboxes
const tableHeaderTarget = `<table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Mã đơn hàng</th>`;

const tableHeaderReplacement = `
            {selectedOrderIds.length > 0 && (
              <div className="bg-[#FCE8ED] p-3 md:p-4 mb-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-[#F4B5C6]/30">
                <div className="text-sm font-bold text-[#4A2C2C]">
                  Đã chọn {selectedOrderIds.length} đơn hàng
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleBulkApprove} className="px-4 py-2 bg-white text-gray-700 hover:text-green-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Duyệt hàng loạt
                  </button>
                  <button onClick={handlePrintBulkWaybills} className="px-4 py-2 bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] font-medium text-sm rounded-lg shadow-sm transition-colors">
                    <Package className="w-4 h-4 inline-block mr-1" /> In Vận đơn (A6)
                  </button>
                  <button onClick={handlePrintBulkInvoices} className="px-4 py-2 bg-white text-gray-700 font-medium text-sm rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Printer className="w-4 h-4 inline-block mr-1" /> In Hóa đơn (80mm)
                  </button>
                </div>
              </div>
            )}
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-500 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#F4B5C6] rounded border-gray-300 focus:ring-[#F4B5C6]"
                    checked={currentOrders.length > 0 && selectedOrderIds.length === currentOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrderIds(currentOrders.map(o => o.id));
                      else setSelectedOrderIds([]);
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Mã đơn hàng</th>`;
code = code.replace(tableHeaderTarget, tableHeaderReplacement);

const tableRowTarget = `<tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-[#4A2C2C]" title={order.id}>`;
const tableRowReplacement = `<tr key={order.id} className={\`border-b border-gray-100 transition-colors \${selectedOrderIds.includes(order.id) ? 'bg-[#FCE8ED]/30' : 'hover:bg-gray-50'}\`}>
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#F4B5C6] rounded border-gray-300 focus:ring-[#F4B5C6]"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                          else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#4A2C2C]" title={order.id}>`;
code = code.replace(tableRowTarget, tableRowReplacement);

const colspanTarget = `<td colSpan={7} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào</td>`;
const colspanReplacement = `<td colSpan={8} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào</td>`;
code = code.replace(colspanTarget, colspanReplacement);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
