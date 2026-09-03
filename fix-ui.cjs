const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const targetRow = `<tr key={order.id} className={\`border-b border-gray-100 transition-colors \${selectedOrderIds.includes(order.id) ? 'bg-[#FCE8ED]/30' : 'hover:bg-gray-50'}\`}>`;
const replacementRow = `<tr 
                    key={order.id} 
                    className={\`border-b border-gray-100 transition-colors cursor-pointer \${selectedOrderIds.includes(order.id) ? 'bg-[#FCE8ED]/30' : 'hover:bg-gray-50'}\`}
                    onClick={() => openOrderDetails(order)}
                  >`;
code = code.replace(targetRow, replacementRow);

const checkboxInputTarget = `onChange={(e) => {
                          if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                          else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                        }}`;
const checkboxInputReplace = `onChange={(e) => {
                          if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                          else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                        }}
                        onClick={(e) => e.stopPropagation()}`;
code = code.replace(checkboxInputTarget, checkboxInputReplace);

const actionsTarget = `<td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(!order.status || order.status === 'pending') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'processing', 'pending'); }}
                            disabled={updating}
                            className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xác nhận & Giao hàng"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'completed', 'processing'); }}
                            disabled={updating}
                            className="p-2 text-gray-400 hover:text-green-600 bg-white hover:bg-green-50 rounded-lg transition-colors"
                            title="Hoàn thành đơn"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {(!order.status || order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'cancelled', order.status || 'pending'); }}
                            disabled={updating}
                            className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors"
                            title="Hủy đơn"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => openOrderDetails(order)}
                          className="p-2 text-gray-400 hover:text-[#F4B5C6] bg-white hover:bg-[#FCE8ED] rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>`;
const actionsReplace = `<td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order);
                          }}
                          className="p-2 text-gray-400 hover:text-[#F4B5C6] bg-white hover:bg-[#FCE8ED] rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>`;
code = code.replace(actionsTarget, actionsReplace);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
