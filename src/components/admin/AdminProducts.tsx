import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Product, Settings } from '../../types';
import { Plus, Edit2, Trash2, X, Search, Filter, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { products as mockProducts, bodyCareProducts } from '../../data/mockData';

import { RichTextEditor } from '../ui/RichTextEditor';

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;
  
  const [settings, setSettings] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    price: '',
    discount: '',
    category: '',
    brand: '',
    image: '',
    images: [] as string[],
    stock: '',
    origin: '',
    volume: '',
    skinType: ''
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
        image: formData.images.length > 0 ? formData.images[0] : formData.image,
        price: Number(formData.price) || 0,
        newPrice: Number(formData.price) || 0,
        discount: Number(formData.discount) || 0,
        stock: Number(formData.stock) || 0,
        details: {
          brand: formData.brand,
          origin: formData.origin,
          volume: formData.volume,
          skinType: formData.skinType
        }
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteDoc(doc(db, 'products', String(id)));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const productImages = product.images || (product.image ? [product.image] : []);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      price: product.newPrice || '',
      discount: product.discount || '',
      category: product.category || '',
      brand: product.brand || product.details?.brand || '',
      image: product.image || '',
      images: productImages,
      stock: product.stock || '100',
      origin: product.details?.origin || '',
      volume: product.details?.volume || '',
      skinType: product.details?.skinType || ''
    });
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      ingredients: '',
      price: '',
      discount: '',
      category: '',
      brand: '',
      image: '',
      images: [],
      stock: '100',
      origin: '',
      volume: '',
      skinType: ''
    });
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    setUploadProgress(0);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 2 * 1024 * 1024) {
        alert(`Kích thước file ${file.name} vượt quá 2MB.`);
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`Chỉ hỗ trợ định dạng JPG, PNG hoặc WebP (${file.name}).`);
        continue;
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((i * 100 + progress) / files.length);
          },
          (error) => {
            console.error("Lỗi upload ảnh:", error);
            resolve();
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            uploadedUrls.push(downloadURL);
            resolve();
          }
        );
      });
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    }
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isUsingMockData = !loading && products.length === 0;
  const displayProducts = isUsingMockData ? [...mockProducts, ...bodyCareProducts] : products;

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

      {isUsingMockData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-6">
          <p className="text-sm font-medium">Lưu ý: Hiện chưa có sản phẩm nào trong hệ thống. Đang hiển thị dữ liệu mẫu để minh họa. Vui lòng thêm sản phẩm thật của bạn.</p>
        </div>
      )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-[#4A2C2C]">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#4A2C2C] p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Cột trái (4 col) - Thông tin cơ bản & Ảnh */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-[#4A2C2C] border-b border-gray-100 pb-2">Hình ảnh sản phẩm</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.images.map((url, idx) => (
                          <div key={idx} className="relative aspect-square group border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain" />
                            <button 
                              type="button"
                              onClick={(e) => { 
                                e.preventDefault();
                                setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}));
                              }}
                              className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <label className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-[#F4B5C6] transition-colors cursor-pointer overflow-hidden group">
                          <div className="text-center p-2 group-hover:scale-105 transition-transform">
                            <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-[#F4B5C6]" />
                            <span className="text-[10px] text-gray-500 block">Thêm ảnh</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/jpeg, image/png, image/webp"
                            multiple
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadProgress !== null}
                          />
                          {uploadProgress !== null && (
                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center">
                              <div className="text-[#F4B5C6] font-bold text-sm mb-1">{Math.round(uploadProgress)}%</div>
                              <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#F4B5C6]" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-[#4A2C2C] border-b border-gray-100 pb-2">Giá & Kho</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Giá bán *</label>
                          <input 
                            type="text" 
                            required
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                            placeholder="VD: 150000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Giảm giá</label>
                          <input 
                            type="text" 
                            value={formData.discount}
                            onChange={e => setFormData({...formData, discount: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                            placeholder="VD: -20%"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Tồn kho</label>
                          <input 
                            type="number" 
                            value={formData.stock}
                            onChange={e => setFormData({...formData, stock: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-[#4A2C2C] border-b border-gray-100 pb-2">Phân loại & Thuộc tính</h3>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
                        <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                        >
                          <option value="">Chọn danh mục</option>
                          {settings?.categories?.filter((c: string) => c !== 'Tất cả').map((cat: string) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Thương hiệu</label>
                          <select 
                            value={formData.brand}
                            onChange={e => setFormData({...formData, brand: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                          >
                            <option value="">Chọn...</option>
                            {settings?.brands?.map((brand: string) => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Xuất xứ</label>
                          <input 
                            type="text" 
                            value={formData.origin}
                            onChange={e => setFormData({...formData, origin: e.target.value})}
                            placeholder="VD: Hàn Quốc"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Dung tích</label>
                          <input 
                            type="text" 
                            value={formData.volume}
                            onChange={e => setFormData({...formData, volume: e.target.value})}
                            placeholder="VD: 50ml"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Loại da</label>
                          <input 
                            type="text" 
                            value={formData.skinType}
                            onChange={e => setFormData({...formData, skinType: e.target.value})}
                            placeholder="Mọi loại da"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải (8 col) - Nội dung chi tiết */}
                  <div className="lg:col-span-8 space-y-5">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none text-base font-medium transition-all"
                          placeholder="Nhập tên sản phẩm..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-end">
                          <span>Mô tả chi tiết</span>
                        </label>
                        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                          <RichTextEditor 
                            content={formData.description}
                            onChange={content => setFormData({...formData, description: content})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thành phần</label>
                        <textarea 
                          rows={4}
                          value={formData.ingredients}
                          onChange={e => setFormData({...formData, ingredients: e.target.value})}
                          placeholder="Danh sách thành phần (ví dụ: Aqua, Niacinamide...)"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none resize-none custom-scrollbar transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0 bg-white z-10">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-[#F4B5C6] text-white font-bold hover:bg-[#4A2C2C] rounded-full transition-colors shadow-sm"
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
