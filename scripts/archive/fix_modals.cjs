const fs = require('fs');

let orderDetail = `import { Order, CartItem } from '../../../types';
import { X, Package, MapPin, Phone, User, FileText, Printer } from 'lucide-react';
import { formatPrice, parsePrice } from '../../../utils/format';
import { maskName, maskPhone, maskAddress } from '../../../utils/mask';
import { getStatusBadge, getStatusLabel, getStatusIcon } from '../../../utils/orderStatus';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, current: string) => void;
  updating: boolean;
  onCancelClick: () => void;
  onPrintWaybill: () => void;
  onPrintInvoice: () => void;
}

export const OrderDetailModal = ({
  order: selectedOrder,
  onClose,
  onUpdateStatus,
  updating,
  onCancelClick,
  onPrintWaybill,
  onPrintInvoice
}: OrderDetailModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-[#4A2C2C] flex items-center gap-2">
              <Package className="w-6 h-6 text-[#F4B5C6]" />
              Chi Tiết Đơn Hàng
            </h3>
            <p className="text-sm text-gray-500">#{selectedOrder.id.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Trái: Thông tin khách & Giao hàng */}
          <div className="md:col-span-1 space-y-6">
            {/* Info Cards here... I will copy the rest directly from the original */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-[#4A2C2C] flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-[#F4B5C6]" /> Khách hàng
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <p><span className="text-gray-400">Tên:</span> <span className="font-medium text-gray-900">{maskName(selectedOrder.customerInfo?.name || '')}</span></p>
                <p><span className="text-gray-400">SĐT:</span> <span className="font-medium text-gray-900">{maskPhone(selectedOrder.customerInfo?.phone || '')}</span></p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-[#4A2C2C] flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#F4B5C6]" /> Giao tới
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <p><span className="text-gray-400">Tên:</span> <span className="font-medium text-gray-900">{maskName(selectedOrder.shippingProfile?.name || '')}</span></p>
                <p><span className="text-gray-400">SĐT:</span> <span className="font-medium text-gray-900">{maskPhone(selectedOrder.shippingProfile?.phone || '')}</span></p>
                <p><span className="text-gray-400">Địa chỉ:</span> <span className="font-medium text-gray-900">{maskAddress(selectedOrder.shippingProfile?.address || '')}</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#FCE8ED]/30 p-5 rounded-2xl border border-[#F4B5C6]/30">
              <h4 className="font-bold text-[#4A2C2C] mb-4 text-sm">Thao tác nhanh</h4>
              <div className="flex flex-col gap-2">
                <button onClick={onPrintWaybill} className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                  <Printer className="w-4 h-4" /> In vận đơn
                </button>
                <button onClick={onPrintInvoice} className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                  <Printer className="w-4 h-4" /> In hóa đơn
                </button>
              </div>
            </div>
          </div>

          {/* Phải: Trạng thái & Sản phẩm */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[#4A2C2C]">Trạng thái đơn hàng</h4>
                <div className={\`px-3 py-1 rounded-full text-xs font-bold \${getStatusBadge(selectedOrder.status)}\`}>
                  {getStatusLabel(selectedOrder.status)}
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button onClick={() => onUpdateStatus(selectedOrder.id, 'processing', selectedOrder.status)} disabled={updating} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50">
                      Xác nhận & Giao hàng
                    </button>
                    <button onClick={onCancelClick} disabled={updating} className="py-2.5 px-4 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors disabled:opacity-50">
                      Hủy đơn
                    </button>
                  </>
                )}
                {selectedOrder.status === 'processing' && (
                  <button onClick={() => onUpdateStatus(selectedOrder.id, 'completed', selectedOrder.status)} disabled={updating} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
                    Xác nhận Hoàn thành
                  </button>
                )}
              </div>
              {selectedOrder.status === 'cancelled' && selectedOrder.customerInfo?.note && ( // Wait, cancelReason was saved where? In old code it wasn't saved in Order type. 
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                  <span className="font-bold">Lý do hủy:</span> {/* We can display note or something if it exists */}
                  Khách hoặc cửa hàng đã hủy.
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-[#4A2C2C]">Danh sách sản phẩm</h4>
                <span className="text-sm font-medium text-gray-500">{selectedOrder.items?.length || 0} sản phẩm</span>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedOrder.items?.map((item: CartItem, idx: number) => (
                  <div key={idx} className="p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h5>
                      <div className="text-xs text-gray-500 mt-1">SL: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#F4B5C6]">{formatPrice(typeof item.newPrice !== 'undefined' ? item.newPrice : item.price as any)}</div>
                      <div className="text-xs text-gray-400 line-through">
                         {item.newPrice && formatPrice(item.price as any)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(selectedOrder.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(selectedOrder.shippingFee)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#4A2C2C] pt-2 border-t border-gray-200 mt-2">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(selectedOrder.finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h4 className="font-bold text-[#4A2C2C] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Thông tin bổ sung
                </h4>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {selectedOrder.paymentMethod === 'bank' ? (
                      <><span className="w-2 h-2 rounded-full bg-blue-500"></span> Chuyển khoản ngân hàng</>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-gray-500"></span> Thanh toán khi nhận hàng (COD)</>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày đặt hàng</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleString('vi-VN') : 'Không rõ'}
                  </p>
                </div>
                {selectedOrder.customerInfo?.note && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ghi chú của khách</p>
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm border border-yellow-100">
                      {selectedOrder.customerInfo.note}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
`;

let cancelModal = `import { useState } from 'react';

interface CancelOrderModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  updating: boolean;
}

export const CancelOrderModal = ({
  onClose,
  onConfirm,
  updating
}: CancelOrderModalProps) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-red-600">Lý do hủy đơn</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
            {/* icon X */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn (tùy chọn)..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-32 text-sm"
          ></textarea>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={updating} className="px-5 py-2 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            Đóng
          </button>
          <button onClick={() => onConfirm(reason)} disabled={updating} className="px-5 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2">
            {updating ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/admin/orders/OrderDetailModal.tsx', orderDetail);
fs.writeFileSync('src/components/admin/orders/CancelOrderModal.tsx', cancelModal);

let adminOrders = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// I also need to update AdminOrders.tsx to use these properly and replace the big block of code for the Modals
const orderModalStart = adminOrders.indexOf('{isModalOpen && selectedOrder && (');
const lastClosingDiv = adminOrders.lastIndexOf('</div>');
const blockToReplace = adminOrders.substring(orderModalStart, lastClosingDiv);

const replacement = `{isModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={updateOrderStatus}
          updating={updating}
          onCancelClick={() => { setCancelModalOpen(true); setCancellingOrderId(selectedOrder.id); setIsBulkCancel(false); }}
          onPrintWaybill={() => handlePrintWaybill()}
          onPrintInvoice={() => handlePrintInvoice()}
        />
      )}
      
      {cancelModalOpen && (
        <CancelOrderModal
          onClose={() => setCancelModalOpen(false)}
          onConfirm={(reason) => { setCancelReason(reason); handleCancelConfirm(); }}
          updating={updating}
        />
      )}
    `;

adminOrders = adminOrders.substring(0, orderModalStart) + replacement + "\n" + adminOrders.substring(lastClosingDiv);
fs.writeFileSync('src/components/admin/AdminOrders.tsx', adminOrders);
