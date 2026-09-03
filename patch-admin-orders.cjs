const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// Add states for filtering and pagination
const stateTarget = `  const [updating, setUpdating] = useState(false);`;
const stateReplacement = `  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;

code = code.replace(stateTarget, stateReplacement);

// Add lucide imports for filters
const importTarget = `import { Eye, X, Package, Clock, Truck, CheckCircle2, XCircle, MapPin, Phone, User, FileText, Printer } from 'lucide-react';`;
const importReplacement = `import { Eye, X, Package, Clock, Truck, CheckCircle2, XCircle, MapPin, Phone, User, FileText, Printer, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';`;

code = code.replace(importTarget, importReplacement);

// Add filtering logic before return
const returnTarget = `  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A2C2C] mb-6">Quản lý đơn hàng</h2>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">`;

const returnReplacement = `  // Filter and pagination logic
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(query);
      const matchName = order.customerInfo?.name?.toLowerCase().includes(query);
      const matchPhone = order.customerInfo?.phone?.includes(query);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    
    // Date filter
    if (dateFilter !== 'all' && order.createdAt) {
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'this_week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        if (orderDate < startOfWeek) return false;
      } else if (dateFilter === 'this_month') {
        if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchQuery]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý đơn hàng</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên, sđt..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            >
              <option value="all">Mọi thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="this_week">Tuần này</option>
              <option value="this_month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="overflow-x-auto">`;

code = code.replace(returnTarget, returnReplacement);

const mapTarget = `{orders.map(order => (`;
const mapReplacement = `{currentOrders.map(order => (`;
code = code.replace(mapTarget, mapReplacement);

const noDataTarget = `{orders.length === 0 ? (`;
const noDataReplacement = `{currentOrders.length === 0 ? (`;
code = code.replace(noDataTarget, noDataReplacement);

const emptyStateTarget = `<td colSpan={7} className="py-8 text-center text-gray-500">
                  Chưa có đơn hàng nào
                </td>`;
const emptyStateReplacement = `<td colSpan={7} className="py-8 text-center text-gray-500">
                  {orders.length === 0 ? 'Chưa có đơn hàng nào' : 'Không tìm thấy đơn hàng phù hợp'}
                </td>`;
code = code.replace(emptyStateTarget, emptyStateReplacement);

const tableEndTarget = `            </tbody>
          </table>
        )}`;
const tableEndReplacement = `            </tbody>
          </table>
        )}
        
        {/* Pagination */
        !loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> trong số <span className="font-medium">{filteredOrders.length}</span> đơn hàng
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={\`w-8 h-8 rounded-lg text-sm font-medium transition-colors \${
                    currentPage === page 
                      ? 'bg-[#F4B5C6] text-[#4A2C2C]' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }\`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}`;
code = code.replace(tableEndTarget, tableEndReplacement);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
