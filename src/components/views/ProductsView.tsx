import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';
import { products, bodyCareProducts } from '../../data/mockData';
import { parsePrice } from '../../utils/format';
import { useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SEO } from '../ui/SEO';

export const ProductsView = ({ onProductClick, onAddToCart, wishlist, onToggleWishlist, searchQuery = '', settings, onClearSearch }: { onProductClick: (product: any) => void; onAddToCart: (product: any) => void; wishlist: any[]; onToggleWishlist: (product: any) => void; searchQuery?: string; settings?: any; onClearSearch?: () => void; key?: any; }) => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const combinedMap = new Map();
        [...products, ...bodyCareProducts].forEach(p => combinedMap.set(String(p.id), p));
        fetchedProducts.forEach(p => combinedMap.set(String(p.id), p));
        setAllProducts(Array.from(combinedMap.values()));
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([...products, ...bodyCareProducts]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = settings?.categories || ['Tất cả', 'Làm sạch', 'Chăm sóc da', 'Trang điểm', 'Chăm sóc cơ thể'];
  const brandsList = settings?.brands || ['DS Tiên', 'Rohto', 'Romand', 'Luminous'];
  
  const [activeCat, setActiveCatState] = useState('Tất cả');
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [brandFilters, setBrandFilters] = useState<string[]>([]);

  const setActiveCat = (cat: string) => {
    setActiveCatState(cat);
    if (searchQuery && (categories.includes(searchQuery) || brandsList.includes(searchQuery))) {
      onClearSearch?.();
    }
  };

  useEffect(() => {
    if (searchQuery) {
      if (categories.includes(searchQuery) && searchQuery !== 'Tất cả') {
        setActiveCatState(searchQuery);
        setBrandFilters([]);
      } else if (brandsList.includes(searchQuery)) {
        setBrandFilters([searchQuery]);
        setActiveCatState('Tất cả');
      }
    }
  }, [searchQuery]);

  const [sortOrder, setSortOrder] = useState('default');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const togglePriceFilter = (range: string) => {
    setPriceFilters(prev => 
      prev.includes(range) ? prev.filter(p => p !== range) : [...prev, range]
    );
  };

  const toggleBrandFilter = (brand: string) => {
    setBrandFilters(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    if (searchQuery && (categories.includes(searchQuery) || brandsList.includes(searchQuery))) {
      onClearSearch?.();
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by Search Query
    if (searchQuery.trim() !== '' && !categories.includes(searchQuery) && !brandsList.includes(searchQuery)) {
      if (searchQuery === 'Khuyến mãi') {
        result = result.filter(p => !!p.discount);
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(lowerQuery));
      }
    }

    // Filter by Category
    if (activeCat !== 'Tất cả') {
      result = result.filter(p => p.category === activeCat);
    }

    // Filter by Brand
    if (brandFilters.length > 0) {
      result = result.filter(p => p.brand && brandFilters.includes(p.brand));
    }

    // Filter by Price
    if (priceFilters.length > 0) {
      result = result.filter(p => {
        const price = parsePrice(p.newPrice || p.price);
        return priceFilters.some(range => {
          if (range === 'under_100') return price < 100000;
          if (range === '100_300') return price >= 100000 && price <= 300000;
          if (range === '300_500') return price > 300000 && price <= 500000;
          if (range === 'over_500') return price > 500000;
          return false;
        });
      });
    }

    // Sort
    switch (sortOrder) {
      case 'price_asc':
        result.sort((a, b) => parsePrice(a.newPrice || a.price) - parsePrice(b.newPrice || b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => parsePrice(b.newPrice || b.price) - parsePrice(a.newPrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, activeCat, priceFilters, brandFilters, sortOrder]);

  const SidebarContent = () => (
    <>
      <h3 className="font-bold text-[#4A2C2C] mb-4 text-lg border-b border-gray-200 pb-2">Danh Mục</h3>
      <ul className="space-y-3">
        {categories.map(cat => (
          <li key={cat}>
            <button 
              className={`text-sm w-full text-left transition-colors ${activeCat === cat ? 'text-[#F4B5C6] font-bold' : 'text-gray-600 hover:text-[#F4B5C6]'}`}
              onClick={() => {
                setActiveCat(cat);
                setIsMobileFiltersOpen(false);
              }}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>

      <h3 className="font-bold text-[#4A2C2C] mt-8 mb-4 text-lg border-b border-gray-200 pb-2">Giá</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <label className="flex items-center gap-2 cursor-pointer hover:text-[#F4B5C6]">
          <input type="checkbox" checked={priceFilters.includes('under_100')} onChange={() => togglePriceFilter('under_100')} className="rounded border-gray-300 text-[#F4B5C6] focus:ring-[#F4B5C6] w-4 h-4" /> 
          Dưới 100.000đ
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-[#F4B5C6]">
          <input type="checkbox" checked={priceFilters.includes('100_300')} onChange={() => togglePriceFilter('100_300')} className="rounded border-gray-300 text-[#F4B5C6] focus:ring-[#F4B5C6] w-4 h-4" /> 
          100.000đ - 300.000đ
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-[#F4B5C6]">
          <input type="checkbox" checked={priceFilters.includes('300_500')} onChange={() => togglePriceFilter('300_500')} className="rounded border-gray-300 text-[#F4B5C6] focus:ring-[#F4B5C6] w-4 h-4" /> 
          300.000đ - 500.000đ
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-[#F4B5C6]">
          <input type="checkbox" checked={priceFilters.includes('over_500')} onChange={() => togglePriceFilter('over_500')} className="rounded border-gray-300 text-[#F4B5C6] focus:ring-[#F4B5C6] w-4 h-4" /> 
          Trên 500.000đ
        </label>
      </div>
      
      <h3 className="font-bold text-[#4A2C2C] mt-8 mb-4 text-lg border-b border-gray-200 pb-2">Thương Hiệu</h3>
      <div className="space-y-3 text-sm text-gray-600">
        {brandsList.map(brand => (
          <label key={brand} className="flex items-center gap-2 cursor-pointer hover:text-[#F4B5C6]">
            <input type="checkbox" checked={brandFilters.includes(brand)} onChange={() => toggleBrandFilter(brand)} className="rounded border-gray-300 text-[#F4B5C6] focus:ring-[#F4B5C6] w-4 h-4" /> 
            {brand}
          </label>
        ))}
      </div>
    </>
  );

  if (loading) return <LoadingSpinner />;

  const isPromo = searchQuery === 'Khuyến mãi';
  const pageTitle = isPromo ? 'Khuyến Mãi Nổi Bật' : 'Sản Phẩm Của Chúng Tôi';
  const pageDesc = isPromo 
    ? 'Khám phá các ưu đãi và khuyến mãi hấp dẫn nhất từ DS Tiên Cosmetics. Đừng bỏ lỡ cơ hội sở hữu sản phẩm làm đẹp với giá tốt nhất.' 
    : 'Khám phá bộ sưu tập các sản phẩm làm đẹp an toàn, tự nhiên và hiệu quả. Chọn lựa sản phẩm phù hợp với làn da của bạn.';

  return (
    <>
      <SEO title={`${isPromo ? 'Khuyến Mãi' : 'Sản Phẩm'} - DS Tiên Cosmetics`} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 animate-in fade-in duration-300">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4A2C2C] mb-4">{pageTitle}</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">{pageDesc}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
           <span className="text-sm text-gray-500 font-medium"><span className="text-[#4A2C2C] font-bold">{filteredAndSortedProducts.length}</span> sản phẩm</span>
           <button 
             onClick={() => setIsMobileFiltersOpen(true)}
             className="flex items-center gap-2 text-sm font-bold text-[#4A2C2C] bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
           >
             <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
           </button>
        </div>

        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-full md:w-64 shrink-0">
          <div className="bg-gray-50 p-6 rounded-2xl sticky top-24 border border-gray-100">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="relative w-[80%] max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-left duration-200">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#4A2C2C]"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="font-serif font-bold text-2xl text-[#4A2C2C] mb-6 border-b pb-4">Bộ Lọc</h2>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-6">
            <span className="text-sm text-gray-500 font-medium">Hiển thị <span className="text-[#4A2C2C] font-bold">{filteredAndSortedProducts.length}</span> sản phẩm</span>
            <select 
              className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#F4B5C6] bg-white shadow-sm cursor-pointer"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="popularity">Bán chạy nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>

          {/* Mobile Sort Select */}
          <div className="md:hidden mb-6">
            <select 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:border-[#F4B5C6] bg-white shadow-sm cursor-pointer"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="popularity">Bán chạy nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>

          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredAndSortedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => onProductClick(product)} 
                  onAddToCart={onAddToCart} 
                  isWishlisted={wishlist.some(w => w.id === product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <p className="text-gray-500 mb-2">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
              <button 
                onClick={() => {
                  setActiveCat('Tất cả');
                  setPriceFilters([]);
                  setBrandFilters([]);
                  if (onClearSearch) onClearSearch();
                }}
                className="text-[#F4B5C6] font-bold hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
          
          {filteredAndSortedProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
               <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                 <button className="w-10 h-10 rounded-full bg-[#F4B5C6] text-white flex items-center justify-center font-bold shadow-md">1</button>
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors font-bold text-gray-600">2</button>
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors"><ChevronRight className="w-5 h-5" /></button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
