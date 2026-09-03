import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, Sparkles, ShieldCheck, MessageCircle, ArrowLeft, Truck, RefreshCw, Send } from 'lucide-react';
import { reviews as mockReviews, products, bodyCareProducts } from '../../data/mockData';
import { ProductCard } from '../ui/ProductCard';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { Product, Review } from '../../types';
import { SEO } from '../ui/SEO';

export const ProductDetailView = ({ product, onBack, onAddToCart, wishlist, onToggleWishlist, onProductClick }: { product: Product; onBack: () => void; onAddToCart: (p: Product) => void; wishlist: Product[]; onToggleWishlist: (p: Product) => void; onProductClick: (p: Product) => void; }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>('description');
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const isWishlisted = wishlist.some((w: Product) => w.id === product.id);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('productId', '==', product.id), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbReviews(fetchedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    if (product.id) {
      fetchReviews();
    }
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        productId: product.id,
        userId: auth.currentUser.uid,
        name: auth.currentUser.displayName || 'Khách hàng',
        text: newReviewText,
        rating: newReviewRating,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      setDbReviews([{ id: docRef.id, ...reviewData, createdAt: new Date() }, ...dbReviews]);
      setNewReviewText('');
      setNewReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayReviews = dbReviews.length > 0 ? dbReviews : (product.reviews || mockReviews);
  const averageRating = displayReviews.length > 0 
    ? Math.round(displayReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / displayReviews.length) 
    : product.rating || 5;

  // Get related products (just picking 4 random or from same category)
  const allProducts = [...products, ...bodyCareProducts];
  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <>
      <SEO 
        title={`${product.name} - DS Tiên Cosmetics`} 
        description={product.description || `Mua ${product.name} tại DS Tiên Cosmetics với giá ${product.newPrice || product.price}`}
        image={product.image}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-300">
        <button onClick={onBack} className="text-[#4A2C2C] hover:text-[#F4B5C6] font-medium flex items-center gap-2 transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Product Image */}
        <div className="lg:w-1/2">
          <div className="bg-[#FCE8ED] rounded-3xl overflow-hidden aspect-square relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover absolute inset-0" />
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2 flex flex-col">
          {product.discount && (
            <span className="bg-[#FCE8ED] text-[#F4B5C6] text-sm font-bold px-3 py-1 rounded-full w-max mb-4">{product.discount}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4A2C2C] mb-4 leading-tight">{product.name}</h1>
          
          <div className="flex gap-4 items-center mb-6 pb-6 border-b border-gray-100">
            <div className="flex gap-1 items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < averageRating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} />
              ))}
              <span className="text-gray-500 ml-2 font-medium">{averageRating}.0/5</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{displayReviews.length} Đánh giá</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">Đã bán 1.2k</span>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <span className="font-bold text-[#F4B5C6] text-4xl">{product.newPrice || product.price}</span>
            {product.oldPrice && <span className="text-xl text-gray-400 line-through mb-1">{product.oldPrice}</span>}
          </div>

          <div className="space-y-4 mb-8 text-sm text-gray-600">
             <div className="flex items-center gap-3"><Truck className="w-5 h-5 text-[#F4B5C6]" /> Miễn phí vận chuyển cho đơn hàng từ 500.000đ</div>
             <div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-[#F4B5C6]" /> Đổi trả miễn phí trong 7 ngày</div>
             <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#F4B5C6]" /> Cam kết chính hãng 100%</div>
          </div>

          <div className="mt-auto flex gap-4">
            <button 
              className="flex-1 bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] font-bold py-4 rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 text-lg"
              onClick={() => onAddToCart(product)}
            >
              <ShoppingCart className="w-6 h-6" /> Thêm Vào Giỏ
            </button>
            <button 
              className={`w-16 h-16 border-2 rounded-full flex items-center justify-center transition-colors shrink-0 ${isWishlisted ? 'border-[#F4B5C6] text-[#F4B5C6]' : 'border-gray-200 text-gray-400 hover:border-[#F4B5C6] hover:text-[#F4B5C6]'}`}
              onClick={() => onToggleWishlist(product)}
            >
              <Heart className={`w-7 h-7 ${isWishlisted ? 'fill-[#F4B5C6]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button 
            className={`pb-4 font-bold text-lg transition-colors border-b-2 ${activeTab === 'description' ? 'border-[#F4B5C6] text-[#4A2C2C]' : 'border-transparent text-gray-400 hover:text-[#F4B5C6]'}`}
            onClick={() => setActiveTab('description')}
          >
            Mô Tả Chi Tiết
          </button>
          <button 
            className={`pb-4 font-bold text-lg transition-colors border-b-2 ${activeTab === 'ingredients' ? 'border-[#F4B5C6] text-[#4A2C2C]' : 'border-transparent text-gray-400 hover:text-[#F4B5C6]'}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Thành Phần
          </button>
          <button 
            className={`pb-4 font-bold text-lg transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-[#F4B5C6] text-[#4A2C2C]' : 'border-transparent text-gray-400 hover:text-[#F4B5C6]'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh Giá ({displayReviews.length})
          </button>
        </div>

        <div className="min-h-[200px]">
          {activeTab === 'description' && (
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <p>{product.description || "Đang cập nhật mô tả cho sản phẩm này. Xin vui lòng quay lại sau. Sản phẩm mang đến trải nghiệm tuyệt vời cho làn da của bạn, được nghiên cứu và phát triển với công thức độc quyền..."}</p>
            </div>
          )}
          
          {activeTab === 'ingredients' && (
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <p>{product.ingredients || "Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Panthenol, Ceramide NP... Đang cập nhật thành phần chi tiết."}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-4xl">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-[#4A2C2C] mb-4">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">Đánh giá:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newReviewText.trim()}
                      className="bg-[#4A2C2C] text-white px-6 py-2 rounded-full font-medium hover:bg-[#F4B5C6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                {displayReviews.map((review: import("../../types").Review) => (
                  <div key={review.id} className="bg-gray-50 p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#4A2C2C]">{review.name}</span>
                        {review.createdAt && (
                          <span className="text-xs text-gray-400">
                            {typeof review.createdAt === 'object' && review.createdAt !== null && 'toDate' in review.createdAt && typeof review.createdAt.toDate === 'function' ? review.createdAt.toDate().toLocaleDateString('vi-VN') : new Date(review.createdAt as string | number | Date).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.text || review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] mb-8 text-center">Sản Phẩm Liên Quan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {relatedProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onClick={() => onProductClick(p)} 
              onAddToCart={() => onAddToCart(p)}
              isWishlisted={wishlist.some((w: Product) => w.id === p.id)}
              onToggleWishlist={() => onToggleWishlist(p)}
            />
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
