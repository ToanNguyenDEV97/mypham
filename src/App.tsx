import { useUrlSync } from './hooks/useUrlSync';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Search, ShoppingCart, Heart, User, ArrowRight,
  Truck, CreditCard, Headphones, ShieldCheck, Mail, Phone, MapPin,
  Facebook, Instagram, Twitter, X, Sparkles, MessageCircle, ChevronDown
} from 'lucide-react';

import { CartDrawer } from './components/layout/CartDrawer';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileMenu } from './components/layout/MobileMenu';
import { WishlistDrawer } from './components/layout/WishlistDrawer';
import { Product, Post, CartItem, UserData} from './types';
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'checkout' | 'product_detail' | 'admin' | 'profile' | 'order_tracking' | 'blog' | 'post_detail'>('home');
  const [selectedPost, setSelectedPost] = useState<Product | null>(null);
  const [productsKey, setProductsKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useUrlSync(
    currentView, setCurrentView,
    searchQuery, setSearchQuery,
    selectedProduct, setSelectedProduct,
    selectedPost, setSelectedPost
  );


  const [settings, setSettings] = useState({
    storeName: 'DS Tiên',
    description: 'DS TIÊN Cosmetics tự hào là nhà phân phối mỹ phẩm uy tín. Chúng tôi mang đến vẻ đẹp tự nhiên và an toàn cho mọi làn da.',
    address: '123 Đường Mỹ Phẩm, Quận 1, TP. HCM',
    phone: '0901 234 567',
    email: 'contact@dstien.vn',
    facebook: '#',
    instagram: '#',
    zalo: 'https://zalo.me',
    messenger: 'https://m.me',
    tiktok: '#',
    bankAccountName: 'NGUYEN VAN A',
    bankAccountNumber: '0901234567',
    bankId: 'MB',
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

  const toggleWishlist = async (product: Product) => {
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


  const addToCart = (product: Product) => {
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

  const handleProductClick = (product: Product) => {
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
        onRemove={(id) => toggleWishlist(wishlist.find(w => w.id === id) as Product)}
        onAddToCart={addToCart}
      />
      <Header 
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentView={setCurrentView}
        setIsCartOpen={setIsCartOpen}
        cartItemsCount={cartItemsCount}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlistCount={wishlist.length}
        user={user as unknown as UserData}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsMenuOpen={setIsMenuOpen}
        currentView={currentView}
        setProductsKey={setProductsKey}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView === 'product_detail' ? `product_detail_${selectedProduct?.id}` : currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'home' ? (
            <HomeView setSelectedProduct={handleProductClick} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} onNavigateToBlog={() => setCurrentView('blog')} onPostClick={(post: Post) => { setSelectedPost(post); setCurrentView('post_detail'); }} />
          ) : currentView === 'checkout' ? (
            <CheckoutView 
              cart={cart} 
              settings={settings}
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
      <Footer 
        settings={settings}
        setCurrentView={setCurrentView}
        setSearchQuery={setSearchQuery}
        setProductsKey={setProductsKey}
        setIsMenuOpen={setIsMenuOpen}
      />

      {isMenuOpen && (
        <MobileMenu 
          settings={settings}
          setCurrentView={setCurrentView}
          setSearchQuery={setSearchQuery}
          setProductsKey={setProductsKey}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}

      {/* Floating Contact Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a href={settings.zalo || "https://zalo.me"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0068FF] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-xs" aria-label="Zalo">
          Zalo
        </a>
        <a href={settings.messenger || "https://m.me"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0084FF] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Messenger">
          <MessageCircle className="w-6 h-6 fill-white" />
        </a>
        <a href={`tel:${settings.phone ? settings.phone.replace(/\D/g, '') : '+840901234567'}`} className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Phone">
          <Phone className="w-6 h-6 fill-white" />
        </a>
      </div>
    </div>
  );
}
