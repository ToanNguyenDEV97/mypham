const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const modalRegex = /\{isModalOpen && selectedOrder && \([\s\S]*?\}\s*\{\/\* Cancel Confirmation Modal \*\/\}/;
code = code.replace(modalRegex, `{isModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={updateOrderStatus}
          updating={updating}
          onCancelClick={() => setIsCancelModalOpen(true)}
        />
      )}
      {/* Cancel Confirmation Modal */}`);

const cancelRegex = /\{\/\* Cancel Confirmation Modal \*\/\}\s*\{isCancelModalOpen && selectedOrder && \([\s\S]*?\)\}/;
code = code.replace(cancelRegex, `{/* Cancel Confirmation Modal */}
      {isCancelModalOpen && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={(reason) => { setCancelReason(reason); cancelOrder(); }}
          updating={updating}
        />
      )}`);

// Need to pass setCancelReason before calling cancelOrder?
// Actually cancelOrder in AdminOrders.tsx uses the cancelReason state.
// So onConfirm should probably just set the state and then we should refactor it.
// Let's check cancelOrder function in AdminOrders.tsx.
