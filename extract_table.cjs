const fs = require('fs');

let orderTable = `import { Order } from '../../../types';
import { Eye, Package, Printer, X } from 'lucide-react';
import { formatPrice } from '../../../utils/format';
import { maskName, maskPhone } from '../../../utils/mask';
import { getStatusBadge, getStatusLabel, getStatusIcon } from '../../../utils/orderStatus';

interface OrderTableProps {
  orders: Order[];
  selectedOrderIds: string[];
  setSelectedOrderIds: (ids: string[]) => void;
  openOrderDetails: (order: Order) => void;
  handleBulkStatusUpdate: (status: string) => void;
  handleBulkCancel: () => void;
  handlePrintBulkWaybills: () => void;
  handlePrintBulkInvoices: () => void;
}

export const OrderTable = ({
  orders, selectedOrderIds, setSelectedOrderIds, openOrderDetails,
  handleBulkStatusUpdate, handleBulkCancel, handlePrintBulkWaybills, handlePrintBulkInvoices
}: OrderTableProps) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {selectedOrderIds.length > 0 && (
        <div className="bg-[#FCE8ED]/50 border border-[#F4B5C6]/30 p-3 mb-4 rounded-xl flex items-center justify-between">
          <span className="text-sm font-bold text-[#4A2C2C]">
            Đã chọn {selectedOrderIds.length} đơn hàng
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatusUpdate('processing')} className="px-4 py-2 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-100 transition-colors">
              Đánh dấu Đang giao
            </button>
            <button onClick={() => handleBulkStatusUpdate('completed')} className="px-4 py-2 bg-green-50 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100 transition-colors">
              Đánh dấu Hoàn thành
            </button>
            <button onClick={handleBulkCancel} className="px-4 py-2 bg-white text-gray-700 hover:text-red-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
              <X className="w-4 h-4 inline-block mr-1" /> Hủy
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
                checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                onChange={(e) => {
                  if (e.target.checked) setSelectedOrderIds(orders.map(o => o.id));
                  else setSelectedOrderIds([]);
                }}
              />
            </th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Mã đơn hàng</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Khách hàng</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Thanh toán</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Tổng tiền</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Ngày đặt</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={8} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào</td></tr>
          ) : (
            orders.map((order) => (
              <tr 
                key={order.id} 
                className={\`border-b border-gray-100 transition-colors cursor-pointer \${selectedOrderIds.includes(order.id) ? 'bg-[#FCE8ED]/30' : 'hover:bg-gray-50'}\`}
                onClick={() => openOrderDetails(order)}
              >
                <td className="py-3 px-4 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#F4B5C6] rounded border-gray-300 focus:ring-[#F4B5C6]"
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                      else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="py-3 px-4 text-sm font-medium text-[#4A2C2C]" title={order.id}>
                  #{order.id.substring(0, 8).toUpperCase()}
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm font-medium text-gray-900">{maskName(order.customerInfo?.name || '')}</p>
                  <p className="text-xs text-gray-500">{maskPhone(order.customerInfo?.phone || '')}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-bold text-[#F4B5C6]">
                  {formatPrice(order.finalTotal)}
                </td>
                <td className="py-3 px-4">
                  <div className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold \${getStatusBadge(order.status)}\`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('vi-VN') : ''}
                </td>
                <td className="py-3 px-4 text-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openOrderDetails(order); }}
                    className="p-1.5 text-gray-400 hover:text-[#4A2C2C] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
`;

fs.writeFileSync('src/components/admin/orders/OrderTable.tsx', orderTable);

let adminOrders = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');
const tableRegex = /<div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

adminOrders = adminOrders.replace(tableRegex, `<OrderTable 
        orders={currentOrders}
        selectedOrderIds={selectedOrderIds}
        setSelectedOrderIds={setSelectedOrderIds}
        openOrderDetails={openOrderDetails}
        handleBulkStatusUpdate={handleBulkStatusUpdate}
        handleBulkCancel={handleBulkCancel}
        handlePrintBulkWaybills={handlePrintBulkWaybills}
        handlePrintBulkInvoices={handlePrintBulkInvoices}
      />\n`);

adminOrders = `import { OrderTable } from './orders/OrderTable';\n` + adminOrders;

fs.writeFileSync('src/components/admin/AdminOrders.tsx', adminOrders);
