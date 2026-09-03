import { Product, Banner, Post } from '../../types';
import { ArrowRight, Sparkles, Star, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Truck, CreditCard, Headphones, ShieldCheck, Instagram } from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';
import { products, bodyCareProducts, reviews, blogPosts, instagramPosts } from '../../data/mockData';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SEO } from '../ui/SEO';
import { motion, AnimatePresence } from 'framer-motion';

export const HomeView = ({ setSelectedProduct, addToCart, wishlist, toggleWishlist, onNavigateToBlog, onPostClick }: {
  setSelectedProduct: (p: Product) => void;
  addToCart: (p: Product) => void;
  wishlist: Product[];
  toggleWishlist: (p: Product) => void;
  onNavigateToBlog: () => void;
  onPostClick: (p: Post) => void;
}) => {
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>(blogPosts);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsSnap, bannersSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'banners'))
        ]);
        
        const fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const combinedMap = new Map();
        products.forEach(p => combinedMap.set(String(p.id), p));
        fetchedProducts.forEach(p => combinedMap.set(String(p.id), p));
        setHomeProducts(Array.from(combinedMap.values()).slice(0, 4));

        const fetchedBanners = bannersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Banner))
          .filter(b => b.isActive !== false);
        setBanners(fetchedBanners);
      } catch (error) {
        console.error('Error fetching home data', error);
        setHomeProducts(products.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const defaultBanner = {
    id: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1200',
    subtitle: '30%',
    title: 'Vẻ Đẹp Đích Thực<br/>Từ Thiên Nhiên',
    description: 'Tất cả các sản phẩm đều thuần chay, an toàn cho da, và được sản xuất bằng nguyên liệu chất lượng cao.',
    buttonText: 'Mua Sắm Ngay',
    buttonLink: ''
  };

  const displayBanners = banners.length > 0 ? banners : [defaultBanner];
  const activeBanner = displayBanners[currentBanner];

  if (loading) return <LoadingSpinner />;
  return (
    <>
      <SEO title="Trang Chủ - DS Tiên Cosmetics" />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-20">
        
        {/* Hero Section */}
        <section className="relative rounded-[2rem] overflow-hidden bg-[#FCE8ED] h-[400px] md:h-[500px] flex items-center group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={activeBanner.imageUrl} 
                alt="Hero background" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60"
              />
              <div className="relative z-10 px-8 md:px-16 max-w-2xl h-full flex flex-col justify-center">
                {activeBanner.subtitle && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#4A2C2C] text-white text-xs font-bold w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-lg shrink-0"
                  >
                    {activeBanner.subtitle}
                  </motion.div>
                )}
                
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-serif font-bold text-[#4A2C2C] mb-4 leading-tight"
                  dangerouslySetInnerHTML={{ __html: activeBanner.title || '' }}
                />
                
                {activeBanner.description && (
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm md:text-base text-[#4A2C2C]/80 mb-8 max-w-md line-clamp-3"
                  >
                    {activeBanner.description}
                  </motion.p>
                )}
                
                {activeBanner.buttonText && (
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => {
                       if (activeBanner.buttonLink) {
                         window.location.href = activeBanner.buttonLink;
                       }
                    }}
                    className="bg-[#F4B5C6] w-fit text-white hover:bg-[#4A2C2C] px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2"
                  >
                    {activeBanner.buttonText} <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-8 left-8 md:left-16 right-8 md:right-16 justify-between items-center text-[#4A2C2C]/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-20">
              <button 
                onClick={() => setCurrentBanner(prev => (prev - 1 + displayBanners.length) % displayBanners.length)}
                className="hover:text-[#4A2C2C] transition-colors p-2 bg-white/30 rounded-full hover:bg-white/50 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {displayBanners.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentBanner ? 'bg-[#4A2C2C] w-6' : 'bg-[#4A2C2C]/30 w-2'}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setCurrentBanner(prev => (prev + 1) % displayBanners.length)}
                className="hover:text-[#4A2C2C] transition-colors p-2 bg-white/30 rounded-full hover:bg-white/50 backdrop-blur-sm"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] mb-4">Chăm Sóc & Làm Đẹp Bạn Có Thể Tin Tưởng</h2>
          <p className="text-sm text-gray-500 mb-12">
            Các sản phẩm chăm sóc da và cơ thể được chọn lọc kỹ lưỡng, phù hợp với làn da nhạy cảm nhất. 
            An toàn, lành tính và mang lại hiệu quả cao.
          </p>
          <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
            {[
              { name: 'Nước Tẩy Trang', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200', count: '4+ Products' },
              { name: 'Dưỡng Thể', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200', count: '91+ Products' },
              { name: 'Bán Chạy Nhất', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200', count: '41+ Products' }
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center group cursor-pointer">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 border-4 border-transparent group-hover:border-[#FCE8ED] transition-all">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-semibold text-[#4A2C2C]">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Collections */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] flex items-center gap-2">
              Bộ Sưu Tập Nổi Bật <ArrowRight className="w-6 h-6 text-[#F4B5C6] hidden md:block" />
            </h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {homeProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)} 
                onAddToCart={addToCart} 
                isWishlisted={wishlist.some(w => w.id === product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </section>

        {/* Body Care Items */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] flex items-center gap-2">
              Chăm Sóc Cơ Thể <ArrowRight className="w-6 h-6 text-[#F4B5C6] hidden md:block" />
            </h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bodyCareProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)} 
                onAddToCart={addToCart} 
                isWishlisted={wishlist.some(w => w.id === product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] mb-8 flex items-center gap-2">
            Khách Hàng Nói Gì <ArrowRight className="w-6 h-6 text-[#F4B5C6] hidden md:block" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F4B5C6] text-[#F4B5C6]" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#FCE8ED] flex items-center justify-center text-[#4A2C2C] font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-[#4A2C2C] text-sm">{review.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#F4B5C6]" />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Promo Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large Banner */}
          <div className="bg-[#FCE8ED] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-end min-h-[300px] md:min-h-[500px]">
             <img 
               src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600" 
               alt="Silo Oil" 
               className="absolute right-0 top-0 bottom-0 w-2/3 object-cover opacity-60 mix-blend-multiply rounded-r-3xl"
             />
             <div className="relative z-10 w-2/3">
               <h3 className="text-3xl font-serif font-bold text-[#4A2C2C] mb-6">Combo Tiết Kiệm</h3>
               <button className="bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] px-6 py-2.5 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2">
                 Mua Ngay <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </div>
          
          {/* Small Banners Stack */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-100 rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col justify-center min-h-[200px]">
              <img src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400" alt="New" className="absolute right-0 top-0 bottom-0 w-1/2 object-cover opacity-70" />
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-[#4A2C2C] mb-4">Sản Phẩm Mới</h3>
                <button className="bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] px-6 py-2.5 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2">
                  Khám Phá <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-[#FDF2F5] rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col justify-center min-h-[200px]">
               <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" alt="New" className="absolute right-0 top-0 bottom-0 w-1/2 object-cover mix-blend-multiply opacity-50" />
               <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-[#4A2C2C] mb-4">Mặt Nạ Phục Hồi</h3>
                <button className="bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] px-6 py-2.5 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2">
                  Mua Ngay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-gray-100">
          {[
            { icon: <Truck className="w-8 h-8 text-[#4A2C2C]" strokeWidth={1.5} />, title: "Giao Hàng Nhanh", desc: "Thông tin vận chuyển chi tiết về các dịch vụ giao hàng." },
            { icon: <CreditCard className="w-8 h-8 text-[#4A2C2C]" strokeWidth={1.5} />, title: "Thanh Toán Online", desc: "Thanh toán trực tuyến an toàn và nhanh chóng qua nhiều kênh." },
            { icon: <Headphones className="w-8 h-8 text-[#4A2C2C]" strokeWidth={1.5} />, title: "Hỗ Trợ 24/7", desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải đáp thắc mắc." },
            { icon: <ShieldCheck className="w-8 h-8 text-[#4A2C2C]" strokeWidth={1.5} />, title: "100% An Toàn", desc: "Cam kết sản phẩm chính hãng, an toàn cho người sử dụng." }
          ].map((benefit, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FCE8ED] flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h4 className="font-bold text-[#4A2C2C] mb-2 text-sm">{benefit.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{benefit.desc}</p>
            </div>
          ))}
        </section>

        {/* Beauty Blog / Tips */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] flex items-center gap-2">
              Mẹo Làm Đẹp <ArrowRight className="w-6 h-6 text-[#F4B5C6] hidden md:block" />
            </h2>
            <button onClick={() => onNavigateToBlog?.()} className="text-sm font-bold text-[#F4B5C6] hover:text-[#4A2C2C] transition-colors uppercase tracking-wider">Xem Tất Cả</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.slice(0,3).map(post => (
              <div key={post.id} className="group cursor-pointer" onClick={() => onPostClick?.(post)}>
                <div className="rounded-2xl overflow-hidden mb-4 relative aspect-[4/3]">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#4A2C2C]">
                    {post.category}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2">{
  (() => {
    const d = post.createdAt || post.date;
    if (!d) return 'Đang cập nhật';
    if (typeof d === 'string') {
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : d;
    }
    if (d.toDate) return d.toDate().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return 'Đang cập nhật';
  })()
}</div>
                <h3 className="font-bold text-[#4A2C2C] group-hover:text-[#F4B5C6] transition-colors leading-relaxed line-clamp-2">{post.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Instagram Feed */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] mb-2">@dstiencosmetics</h2>
          <p className="text-sm text-gray-500 mb-8">Theo dõi chúng tôi trên Instagram để cập nhật những xu hướng mới nhất</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
            {instagramPosts.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                <img src={img} alt="Instagram post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#4A2C2C]/0 group-hover:bg-[#4A2C2C]/40 transition-colors flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Newsletter */}
      <section className="bg-[#FCE8ED] py-16 px-4 mt-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] mb-4">ĐỪNG BỎ LỠ ƯU ĐÃI LÀM ĐẸP</h2>
          <p className="text-sm font-bold text-[#4A2C2C] mb-6 uppercase tracking-widest">Đăng ký nhận bản tin</p>
          <div className="flex bg-white rounded-full overflow-hidden shadow-sm border border-[#F4B5C6]/30 max-w-xl mx-auto p-1">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              className="flex-grow px-6 py-3 text-sm focus:outline-none bg-transparent"
            />
            <button className="bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
