const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// Replace modal cancel buttons
code = code.replace(
  /onClick=\{\(\) => updateOrderStatus\(selectedOrder\.id, 'cancelled', 'pending'\)\}/g,
  `onClick={() => handleCancelInitiate(selectedOrder.id)}`
);
code = code.replace(
  /onClick=\{\(\) => updateOrderStatus\(selectedOrder\.id, 'cancelled', 'processing'\)\}/g,
  `onClick={() => handleCancelInitiate(selectedOrder.id)}`
);

// We need to hide print buttons for pending orders and show a message
const printButtonsTarget = `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
const printButtonsReplace = `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {(!selectedOrder.status || selectedOrder.status === 'pending') ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                          Xác nhận đơn trước khi in
                        </span>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>`;
code = code.replace(printButtonsTarget, printButtonsReplace);

// Display cancelReason if cancelled
const actionStepsTarget = `{/* Action Steps */}`;
const actionStepsReplace = `{selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                      <p className="text-sm font-bold text-red-800 mb-1">Lý do hủy đơn:</p>
                      <p className="text-sm text-red-600">{selectedOrder.cancelReason}</p>
                    </div>
                  )}
                  {/* Action Steps */}`;
code = code.replace(actionStepsTarget, actionStepsReplace);

// Add the Cancel Modal to the JSX
const cancelModalJSX = `
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-red-600">Lý do hủy đơn</h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-gray-400 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Vui lòng cung cấp lý do hủy {isBulkCancel ? \`\${selectedOrderIds.length} đơn hàng\` : 'đơn hàng này'}. 
                Điều này giúp lưu trữ lịch sử xử lý tốt hơn.
              </p>
              <textarea
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4B5C6] focus:border-transparent resize-none text-sm"
                rows={4}
                placeholder="Ví dụ: Khách đổi ý, Hết hàng, Sai thông tin..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={confirmCancel}
                disabled={!cancelReason.trim() || updating}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? 'Đang xử lý...' : 'Xác nhận Hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace("</div>\n    </div>\n  );\n}", cancelModalJSX + "    </div>\n    </div>\n  );\n}");

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
