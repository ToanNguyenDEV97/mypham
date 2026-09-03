const fs = require('fs');

let orderFilters = `import { Search, Filter } from 'lucide-react';

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
}

export const OrderFilters = ({
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, dateFilter, setDateFilter
}: OrderFiltersProps) => {
  return (
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
  );
};
`;

fs.writeFileSync('src/components/admin/orders/OrderFilters.tsx', orderFilters);

let adminOrders = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const filtersRegex = /<div className="flex flex-wrap items-center gap-3 w-full md:w-auto">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

adminOrders = adminOrders.replace(filtersRegex, `<OrderFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </div>`);
      
// Add import
adminOrders = `import { OrderFilters } from './orders/OrderFilters';\n` + adminOrders;

fs.writeFileSync('src/components/admin/AdminOrders.tsx', adminOrders);
