const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  `  const handleBulkApprove = async () => {
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
  };`,
  `  const handleBulkApprove = async () => {
    if (!window.confirm(\`Bạn có chắc chắn muốn XÁC NHẬN \${selectedOrderIds.length} đơn hàng này?\`)) return;
    setUpdating(true);
    try {
      await Promise.all(
        selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { status: 'processing' }))
      );
      await fetchOrders();
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Có lỗi xảy ra khi cập nhật hàng loạt.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkCancel = async () => {
    if (!window.confirm(\`Bạn có chắc chắn muốn HỦY \${selectedOrderIds.length} đơn hàng này?\`)) return;
    setUpdating(true);
    try {
      await Promise.all(
        selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { status: 'cancelled' }))
      );
      await fetchOrders();
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Có lỗi xảy ra khi cập nhật hàng loạt.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkComplete = async () => {
    if (!window.confirm(\`Bạn có chắc chắn muốn HOÀN THÀNH \${selectedOrderIds.length} đơn hàng này?\`)) return;
    setUpdating(true);
    try {
      await Promise.all(
        selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { status: 'completed' }))
      );
      await fetchOrders();
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Có lỗi xảy ra khi cập nhật hàng loạt.");
    } finally {
      setUpdating(false);
    }
  };`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
