const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const stateTarget = `  const [editingProduct, setEditingProduct] = useState<any>(null);`;
const stateReplacement = `  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;`;
code = code.replace(stateTarget, stateReplacement);

const importTarget = `import { Plus, Edit2, Trash2, X } from 'lucide-react';`;
const importReplacement = `import { Plus, Edit2, Trash2, X, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';`;
code = code.replace(importTarget, importReplacement);

const returnTarget = `  const displayProducts = (() => {
    const combinedMap = new Map();
    [...mockProducts, ...bodyCareProducts].forEach(p => combinedMap.set(String(p.id), p));
    products.forEach(p => combinedMap.set(String(p.id), p));
    return Array.from(combinedMap.values());
  })();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý sản phẩm</h2>
        <button 
          onClick={openAddModal}
          className="bg-[#F4B5C6] text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-[#4A2C2C] transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      <div className="overflow-x-auto">`;

const returnReplacement = `  const displayProducts = (() => {
    const combinedMap = new Map();
    [...mockProducts, ...bodyCareProducts].forEach(p => combinedMap.set(String(p.id), p));
    products.forEach(p => combinedMap.set(String(p.id), p));
    return Array.from(combinedMap.values());
  })();

  const filteredProducts = displayProducts.filter(product => {
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = product.name?.toLowerCase().includes(query);
      const matchBrand = product.brand?.toLowerCase().includes(query);
      if (!matchName && !matchBrand) return false;
    }
    
    // Category Filter
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    
    // Stock Filter
    if (stockFilter !== 'all') {
      const stock = parseInt(product.stock) || 0;
      if (stockFilter === 'in_stock' && stock <= 0) return false;
      if (stockFilter === 'out_of_stock' && stock > 0) return false;
      if (stockFilter === 'low_stock' && (stock > 10 || stock <= 0)) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter]);

  // Categories list for filter
  const categories = Array.from(new Set(displayProducts.map(p => p.category).filter(Boolean)));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý sản phẩm</h2>
        <button 
          onClick={openAddModal}
          className="bg-[#F4B5C6] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-[#4A2C2C] transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full mb-6">
        <div className="relative flex-1 md:w-64 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm tên sản phẩm, thương hiệu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
          >
            <option value="all">Mọi trạng thái kho</option>
            <option value="in_stock">Còn hàng</option>
            <option value="low_stock">Sắp hết (&lt; 10)</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="overflow-x-auto">`;
code = code.replace(returnTarget, returnReplacement);

const mapTarget = `{displayProducts.map((product: any) => (`;
const mapReplacement = `{currentProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {displayProducts.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm phù hợp'}
                </td>
              </tr>
            ) : currentProducts.map((product: any) => (`;
code = code.replace(mapTarget, mapReplacement);

const tableEndTarget = `            ))}
          </tbody>
        </table>
      </div>`;
const tableEndReplacement = `            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> trong số <span className="font-medium">{filteredProducts.length}</span> sản phẩm
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

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
