import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { products as mockProducts, bodyCareProducts } from '../../data/mockData';

export const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [settings, setSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: '',
    category: '',
    brand: '',
    image: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'global'));
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // If empty, let's just use mock data for display for now, or just show empty
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        newPrice: formData.price,
      };
      if (editingProduct) {
        await setDoc(doc(db, 'products', String(editingProduct.id)), dataToSave);
      } else {
        await addDoc(collection(db, 'products'), dataToSave);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteDoc(doc(db, 'products', String(id)));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.newPrice || '',
      discount: product.discount || '',
      category: product.category || '',
      brand: product.brand || '',
      image: product.image || '',
      stock: product.stock || '100'
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      discount: '',
      category: '',
      brand: '',
      image: '',
      stock: '100'
    });
    setIsModalOpen(true);
  };

  const displayProducts = (() => {
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

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Sản phẩm</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Danh mục</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Thương hiệu</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Giá</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Tồn kho</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : (
              currentProducts.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp</td></tr>
              ) : currentProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.category || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.brand || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{product.newPrice || product.price}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.stock || 'Còn hàng'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative p-6">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#4A2C2C] p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-[#4A2C2C] mb-6">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                  <input 
                    type="text" 
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                    placeholder="VD: 150.000đ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá</label>
                  <input 
                    type="text" 
                    value={formData.discount}
                    onChange={e => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                    placeholder="VD: -20%"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    {settings?.categories?.filter((c: string) => c !== 'Tất cả').map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                  <select 
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {settings?.brands?.map((brand: string) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input 
                    type="number" 
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh</label>
                  <input 
                    type="url" 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[#F4B5C6] text-white font-medium hover:bg-[#4A2C2C] rounded-full transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
