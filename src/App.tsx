import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Search, ShoppingCart, Heart, User, ArrowRight,
  Truck, CreditCard, Headphones, ShieldCheck, Mail, Phone, MapPin,
  Facebook, Instagram, Twitter, X, Sparkles, MessageCircle, ChevronDown
} from 'lucide-react';

import { CartDrawer } from './components/layout/CartDrawer';
import { WishlistDrawer } from './components/layout/WishlistDrawer';
import { HomeView } from './components/views/HomeView';
import { ProductsView } from './components/views/ProductsView';
import { CheckoutView } from './components/views/CheckoutView';
import { ProductDetailView } from './components/views/ProductDetailView';
import { AdminView } from './components/views/AdminView';
import { AuthModal } from './components/ui/AuthModal';
import { ProfileView } from './components/views/ProfileView';
import { OrderTrackingView } from './components/views/OrderTrackingView';
import { BlogView } from './components/views/BlogView';
import { PostDetailView } from './components/views/PostDetailView';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'checkout' | 'product_detail' | 'admin' | 'profile' | 'order_tracking' | 'blog' | 'post_detail'>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [productsKey, setProductsKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'DS Tiên',
    description: 'DS TIÊN Cosmetics tự hào là nhà phân phối mỹ phẩm uy tín. Chúng tôi mang đến vẻ đẹp tự nhiên và an toàn cho mọi làn da.',
    address: '123 Đường Mỹ Phẩm, Quận 1, TP. HCM',
    phone: '0901 234 567',
    email: 'contact@dstien.vn',
    facebook: '#',
    instagram: '#',
    topBarText: 'Miễn phí giao hàng đơn từ 500k',
    categories: ['Tất cả', 'Làm sạch', 'Chăm sóc da', 'Trang điểm', 'Chăm sóc cơ thể'],
    brands: ['DS Tiên', 'Rohto', 'Romand', 'Luminous']
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().wishlist) {
            setWishlist(docSnap.data().wishlist);
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      } else {
        setWishlist([]); // Clear wishlist on logout or keep local? Let's clear.
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleWishlist = async (product: any) => {
    setWishlist(prev => {
      let newList;
      if (prev.find(item => item.id === product.id)) {
        newList = prev.filter(item => item.id !== product.id);
      } else {
        newList = [...prev, product];
      }
      
      // Sync to firebase if logged in
      if (user) {
        updateDoc(doc(db, 'users', user.uid), { wishlist: newList }).catch(console.error);
      }
      
      return newList;
    });
  };


  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentView('product_detail');
    window.scrollTo(0, 0);
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (currentView === 'admin') return <AdminView onBackToStore={() => setCurrentView('home')} />;

  return (
    <div className="min-h-screen bg-white font-sans text-[#4A2C2C] selection:bg-[#F4B5C6] selection:text-[#4A2C2C]">
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#4A2C2C] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <ShieldCheck className="w-5 h-5 text-[#F4B5C6]" />
          <span>Cảm ơn bạn đã đặt hàng thành công!</span>
        </div>
      )}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemove={(id) => toggleWishlist({ id })}
        onAddToCart={addToCart}
      />
      {/* Top Bar */}
      <div className="bg-[#FCE8ED] text-[#4A2C2C] py-2 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[11px] md:text-xs">
        <div className="flex gap-4 mb-2 md:mb-0">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {settings.phone}</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {settings.email}</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 font-bold"><Sparkles className="w-3 h-3 text-[#F4B5C6]" /> {settings.topBarText}</span>
        </div>
      </div>

      {/* Header */}
      <header className="px-4 md:px-8 py-5 border-b border-[#FCE8ED] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-10 h-10 border-2 border-[#F4B5C6] rounded-full flex items-center justify-center p-0.5">
              <div className="w-full h-full border border-[#4A2C2C] rounded-full flex items-center justify-center bg-[#FCE8ED]">
                <Sparkles className="w-5 h-5 text-[#4A2C2C]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="font-serif">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#4A2C2C] leading-none uppercase">{settings.storeName}</h1>
              <p className="text-[9px] md:text-[10px] tracking-widest text-[#F4B5C6] font-bold uppercase mt-1">Cosmetics</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); setCurrentView('products'); }} className="hidden md:flex flex-1 max-w-2xl relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm yêu thích..." 
              className="w-full px-6 py-3 rounded-full border border-[#FCE8ED] bg-gray-50 focus:bg-white focus:border-[#F4B5C6] focus:ring-2 focus:ring-[#FCE8ED] outline-none transition-all placeholder:text-gray-400 text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#F4B5C6] text-white rounded-full hover:bg-[#4A2C2C] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <button className="text-[#4A2C2C] hover:text-[#F4B5C6] transition-colors relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4B5C6] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemsCount}</span>
              )}
            </button>
            <button className="text-[#4A2C2C] hover:text-[#F4B5C6] transition-colors relative hidden md:block" onClick={() => setIsWishlistOpen(true)}>
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4B5C6] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>
              )}
            </button>
            <button className="text-[#4A2C2C] hover:text-[#F4B5C6] transition-colors hidden md:block" onClick={() => user ? setCurrentView('profile') : setIsAuthModalOpen(true)}>
              <User className="w-5 h-5" />
            </button>
            <button 
              className="md:hidden text-[#4A2C2C]"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={(e) => { e.preventDefault(); setCurrentView('products'); }} className="md:hidden mt-4 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..." 
            className="w-full px-4 py-2.5 rounded-full border border-[#FCE8ED] bg-gray-50 outline-none text-sm"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </button>
        </form>
      </header>

      {/* Navigation */}
      <nav className="hidden md:flex justify-center items-center py-4 gap-8 font-medium text-sm text-[#4A2C2C]">
        <a href="#" className={`hover:text-[#F4B5C6] transition-colors ${currentView === 'home' ? 'text-[#F4B5C6]' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Trang Chủ</a>
        
        {/* Sản Phẩm Dropdown */}
        <div className="relative group cursor-pointer h-full flex items-center py-2">
          <div className={`flex items-center gap-1 hover:text-[#F4B5C6] transition-colors ${currentView === 'products' ? 'text-[#F4B5C6]' : ''}`} onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); }}>
            Sản Phẩm <ChevronDown className="w-4 h-4" />
          </div>
          <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-3">
            {settings.categories.filter(c => c !== 'Tất cả').map(category => (
              <a key={category} href="#" className="px-5 py-2.5 hover:bg-[#FCE8ED] hover:text-[#F4B5C6] transition-colors text-sm" onClick={(e) => { e.preventDefault(); setSearchQuery(category); setCurrentView('products'); }}>{category}</a>
            ))}
          </div>
        </div>

        {/* Thương Hiệu Dropdown */}
        <div className="relative group cursor-pointer h-full flex items-center py-2">
          <div className="flex items-center gap-1 hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); }}>
            Thương Hiệu <ChevronDown className="w-4 h-4" />
          </div>
          <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-3">
            {settings.brands.map(brand => (
              <a key={brand} href="#" className="px-5 py-2.5 hover:bg-[#FCE8ED] hover:text-[#F4B5C6] transition-colors text-sm" onClick={(e) => { e.preventDefault(); setSearchQuery(brand); setCurrentView('products'); }}>{brand}</a>
            ))}
          </div>
        </div>

        <a href="#" className="hover:text-[#F4B5C6] transition-colors py-2" onClick={(e) => { e.preventDefault(); setSearchQuery('Khuyến mãi'); setCurrentView('products'); setProductsKey(k => k + 1); }}>Khuyến Mãi</a>

        <a href="#" className="hover:text-[#F4B5C6] transition-colors py-2" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>
            <a href="#" className={`hover:text-[#F4B5C6] transition-colors py-2 ${currentView === 'blog' || currentView === 'post_detail' ? 'text-[#F4B5C6]' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('blog'); }}>Góc Làm Đẹp</a>
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView === 'product_detail' ? `product_detail_${selectedProduct?.id}` : currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'home' ? (
            <HomeView setSelectedProduct={handleProductClick} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} onNavigateToBlog={() => setCurrentView('blog')} onPostClick={(post: any) => { setSelectedPost(post); setCurrentView('post_detail'); }} />
          ) : currentView === 'checkout' ? (
            <CheckoutView 
              cart={cart} 
              onBack={() => setCurrentView('home')} 
              onClearCart={() => setCart([])}
              onComplete={() => {
                setCurrentView('home');
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
              }} 
            />
          ) : currentView === 'product_detail' && selectedProduct ? (
            <ProductDetailView 
              product={selectedProduct} 
              onBack={() => setCurrentView('products')} 
              onAddToCart={addToCart} 
              wishlist={wishlist} 
              onToggleWishlist={toggleWishlist} 
              onProductClick={handleProductClick} 
            />
          ) : currentView === 'order_tracking' ? (
            <OrderTrackingView onBack={() => setCurrentView('home')} />
          ) : currentView === 'profile' ? (
            <ProfileView onLogout={() => { auth.signOut(); setCurrentView('home'); }} onAdminClick={() => setCurrentView('admin')} />
          ) : currentView === 'blog' ? (
            <BlogView onPostClick={(post) => { setSelectedPost(post); setCurrentView('post_detail'); }} onBack={() => setCurrentView('home')} />
          ) : currentView === 'post_detail' && selectedPost ? (
            <PostDetailView post={selectedPost} onBack={() => setCurrentView('blog')} />
          ) : (
            <ProductsView key={`products_${productsKey}`} 
              onProductClick={handleProductClick} 
              onAddToCart={addToCart} 
              wishlist={wishlist} 
              onToggleWishlist={toggleWishlist} 
              searchQuery={searchQuery}
              settings={settings}
              onClearSearch={() => setSearchQuery('')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 border-2 border-[#F4B5C6] rounded-full flex items-center justify-center p-0.5">
                <div className="w-full h-full border border-[#4A2C2C] rounded-full flex items-center justify-center bg-[#FCE8ED]">
                  <Sparkles className="w-4 h-4 text-[#4A2C2C]" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-lg font-bold tracking-[0.1em] text-[#4A2C2C] uppercase font-serif">{settings.storeName}</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {settings.description}
            </p>
            <div className="flex gap-3">
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#4A2C2C] text-white flex items-center justify-center hover:bg-[#F4B5C6] transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#4A2C2C] text-white flex items-center justify-center hover:bg-[#F4B5C6] transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#4A2C2C] text-white flex items-center justify-center hover:bg-[#F4B5C6] transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Công ty</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Trang chủ</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Sản phẩm</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Hỏi đáp</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo dõi đơn hàng</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('blog'); setIsMenuOpen(false); }}>Góc làm đẹp</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Về chúng tôi</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Chính sách</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chính sách vận chuyển</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Hình thức thanh toán</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Danh mục nổi bật</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chăm sóc cơ thể</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Sản phẩm nhập khẩu</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Bán chạy nhất</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setSearchQuery('Khuyến mãi'); setCurrentView('products'); setProductsKey(k => k + 1); }}>Khuyến mãi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#F4B5C6] shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-[#F4B5C6] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#F4B5C6] transition-colors">{settings.email}</a>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-[#F4B5C6] shrink-0" />
                <span>{settings.phone}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>Copyright © {new Date().getFullYear()} {settings.storeName} | All rights reserved</p>
          <div className="flex gap-4">
             <span className="font-bold text-gray-500">VISA</span>
             <span className="font-bold text-gray-500">MasterCard</span>
             <span className="font-bold text-gray-500">PayPal</span>
             <span className="font-bold text-gray-500">MoMo</span>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#4A2C2C]/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-[80%] max-w-sm h-full bg-[#FDF2F5] border-r border-[#F4B5C6]/50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-[#F4B5C6]/30 flex justify-between items-center bg-[#FCE8ED]">
              <div className="font-serif font-bold tracking-[0.2em] text-[#4A2C2C] uppercase text-xl">DS TIÊN</div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#F4B5C6]/20 rounded-full transition-colors text-[#4A2C2C]">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-8">
              <nav className="flex flex-col gap-6 text-sm font-semibold tracking-widest uppercase text-[#4A2C2C]">
                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('home'); setIsMenuOpen(false); }}>Trang Chủ</a>
                
                <div className="flex flex-col gap-4">
                  <a href="#" className="hover:text-[#F4B5C6] transition-colors flex items-center gap-2" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); setIsMenuOpen(false); }}>
                    Sản Phẩm <ChevronDown className="w-4 h-4" />
                  </a>
                  <div className="pl-4 flex flex-col gap-3 text-gray-500 font-medium text-xs">
                    {settings.categories.filter(c => c !== 'Tất cả').map(category => (
                      <a key={category} href="#" onClick={(e) => { e.preventDefault(); setSearchQuery(category); setCurrentView('products'); setIsMenuOpen(false); }} className="hover:text-[#F4B5C6] transition-colors">{category}</a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="flex items-center gap-2 hover:text-[#F4B5C6] transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); setIsMenuOpen(false); }}>
                    Thương Hiệu <ChevronDown className="w-4 h-4" />
                  </span>
                  <div className="pl-4 flex flex-col gap-3 text-gray-500 font-medium text-xs">
                    {settings.brands.map(brand => (
                      <a key={brand} href="#" onClick={(e) => { e.preventDefault(); setSearchQuery(brand); setCurrentView('products'); setIsMenuOpen(false); }} className="hover:text-[#F4B5C6] transition-colors">{brand}</a>
                    ))}
                  </div>
                </div>

                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setSearchQuery('Khuyến mãi'); setCurrentView('products'); setProductsKey(k => k + 1); setIsMenuOpen(false); }}>Khuyến Mãi</a>

                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>
                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('blog'); }}>Góc Làm Đẹp</a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Floating Contact Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0068FF] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-xs" aria-label="Zalo">
          Zalo
        </a>
        <a href="https://m.me" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0084FF] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Messenger">
          <MessageCircle className="w-6 h-6 fill-white" />
        </a>
        <a href="tel:+840901234567" className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Phone">
          <Phone className="w-6 h-6 fill-white" />
        </a>
      </div>
    </div>
  );
}
