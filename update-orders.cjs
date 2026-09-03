const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// 1. Add state variables
code = code.replace(
  "const [isModalOpen, setIsModalOpen] = useState(false);",
  `const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isBulkCancel, setIsBulkCancel] = useState(false);`
);

// 2. Modify handleBulkCancel
code = code.replace(
  /const handleBulkCancel = async \(\) => \{[\s\S]*?  \};\n/,
  `const handleBulkCancel = () => {
    handleCancelInitiate('', true);
  };\n\n`
);

// 3. Add handleCancelInitiate and confirmCancel
const cancelFunctions = `
  const handleCancelInitiate = (orderId: string, isBulk: boolean = false) => {
    setCancellingOrderId(orderId);
    setIsBulkCancel(isBulk);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      return;
    }
    setUpdating(true);
    try {
      if (isBulkCancel) {
        await Promise.all(
          selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { 
            status: 'cancelled', 
            cancelReason: cancelReason.trim(),
            cancelledAt: new Date()
          }))
        );
        setSelectedOrderIds([]);
      } else if (cancellingOrderId) {
        await updateDoc(doc(db, 'orders', cancellingOrderId), { 
          status: 'cancelled',
          cancelReason: cancelReason.trim(),
          cancelledAt: new Date()
        });
        if (selectedOrder && selectedOrder.id === cancellingOrderId) {
          setSelectedOrder({ 
            ...selectedOrder, 
            status: 'cancelled', 
            cancelReason: cancelReason.trim()
          });
        }
      }
      await fetchOrders();
      setCancelModalOpen(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setUpdating(false);
    }
  };
`;
code = code.replace("const handleBulkApprove", cancelFunctions + "  const handleBulkApprove");

// 4. Update generateInvoiceHtml to include item price
code = code.replace(
  `<th>SP</th>
                  <th class="text-center">SL</th>
                  <th class="text-right">T.Tiền</th>`,
  `<th>SP</th>
                  <th class="text-center">SL</th>
                  <th class="text-right">Đ.Giá</th>
                  <th class="text-right">T.Tiền</th>`
);

code = code.replace(
  /<td>\$\{item\.name\.substring\(0, 20\)\}\$\{item\.name\.length > 20 \? '\.\.\.' : ''\}<\/td>\s*<td class="text-center">\$\{item\.quantity\}<\/td>\s*<td class="text-right">\$\{formatPrice\(item\.price \* item\.quantity\)\}<\/td>/g,
  `<td>\${item.name.substring(0, 15)}\${item.name.length > 15 ? '...' : ''}</td>
                    <td class="text-center">\${item.quantity}</td>
                    <td class="text-right">\${formatPrice(item.price || 0)}</td>
                    <td class="text-right">\${formatPrice((item.price || 0) * item.quantity)}</td>`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
