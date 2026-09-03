const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  `                  <button onClick={handleBulkApprove} className="px-4 py-2 bg-white text-gray-700 hover:text-green-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Duyệt hàng loạt
                  </button>`,
  `                  <button onClick={handleBulkApprove} className="px-4 py-2 bg-white text-gray-700 hover:text-blue-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Xác nhận
                  </button>
                  <button onClick={handleBulkComplete} className="px-4 py-2 bg-white text-gray-700 hover:text-green-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Hoàn thành
                  </button>
                  <button onClick={handleBulkCancel} className="px-4 py-2 bg-white text-gray-700 hover:text-red-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <X className="w-4 h-4 inline-block mr-1" /> Hủy
                  </button>`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
