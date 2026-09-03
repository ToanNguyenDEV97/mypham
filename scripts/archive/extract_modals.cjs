const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const orderModalStart = content.indexOf('{isModalOpen && selectedOrder && (');
const cancelModalStart = content.indexOf('{cancelModalOpen && (');

if (orderModalStart !== -1 && cancelModalStart !== -1) {
  const orderModalStr = content.substring(orderModalStart, cancelModalStart);
  
  // It ends with `      )}\n\n`
  const orderModalContent = orderModalStr.replace(/\{isModalOpen && selectedOrder && \(/, '').trim().replace(/\)\}\s*$/, '');
  
  const orderDetailComponent = `import { Order, CartItem } from '../../../types';
import { X, Package, MapPin, Phone, User, FileText } from 'lucide-react';
import { formatPrice } from '../../../utils/format';
import { maskName, maskPhone, maskAddress } from '../../../utils/mask';
import { getStatusBadge, getStatusLabel, getStatusIcon } from '../../../utils/orderStatus';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, current: string) => void;
  updating: boolean;
  onCancelClick: () => void;
}

export const OrderDetailModal = ({
  order: selectedOrder,
  onClose,
  onUpdateStatus,
  updating,
  onCancelClick
}: OrderDetailModalProps) => {
  return (
    ${orderModalContent.replace(/setIsModalOpen\(false\)/g, 'onClose()').replace(/setCancelModalOpen\(true\);\s*setCancellingOrderId\(selectedOrder.id\);/g, 'onCancelClick()').replace(/updateOrderStatus/g, 'onUpdateStatus')}
  );
};
`;
  fs.writeFileSync('src/components/admin/orders/OrderDetailModal.tsx', orderDetailComponent);
  
  let cancelModalEnd = content.lastIndexOf(')}');
  // Need to find the end of cancelModal properly
  const rest = content.substring(cancelModalStart);
  let cancelModalContent = rest.replace(/\{cancelModalOpen && \(/, '').trim();
  // It should end before the `</div>` of the AdminOrders component.
  // Actually, let's just match the parentheses properly.
  let open = 0;
  let close = 0;
  let endIndex = 0;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '(') open++;
    if (rest[i] === ')') close++;
    if (open > 0 && open === close) {
      endIndex = i;
      break;
    }
  }
  
  const exactCancelModalStr = rest.substring(0, endIndex + 1);
  const innerCancelModal = exactCancelModalStr.replace(/\{cancelModalOpen && \(/, '').trim().replace(/\)$/, '');

  const cancelComponent = `import { useState } from 'react';

interface CancelOrderModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  updating: boolean;
  cancelReason: string;
  setCancelReason: (r: string) => void;
}

export const CancelOrderModal = ({
  onClose,
  onConfirm,
  updating,
  cancelReason,
  setCancelReason
}: CancelOrderModalProps) => {
  return (
    ${innerCancelModal.replace(/setCancelModalOpen\(false\)/g, 'onClose()').replace(/handleCancelConfirm\(\)/g, 'onConfirm(cancelReason)')}
  );
};
`;
  fs.writeFileSync('src/components/admin/orders/CancelOrderModal.tsx', cancelComponent);
  
  // Replace in AdminOrders.tsx
  const beforeModals = content.substring(0, orderModalStart);
  const afterModals = rest.substring(endIndex + 1);
  
  const replacements = `{isModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={updateOrderStatus}
          updating={updating}
          onCancelClick={() => { setCancelModalOpen(true); setCancellingOrderId(selectedOrder.id); setIsBulkCancel(false); }}
        />
      )}
      
      {cancelModalOpen && (
        <CancelOrderModal
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelConfirm}
          updating={updating}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
        />
      )}
`;
  let newContent = beforeModals + replacements + afterModals;
  
  // Also add imports for the Modals
  newContent = `import { OrderDetailModal } from './orders/OrderDetailModal';\nimport { CancelOrderModal } from './orders/CancelOrderModal';\n` + newContent;
  
  fs.writeFileSync('src/components/admin/AdminOrders.tsx', newContent);
}

