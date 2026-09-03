import { X, Star, ShoppingCart, Heart, Sparkles, ShieldCheck, MessageCircle } from 'lucide-react';
import { reviews } from '../../data/mockData';

export const ProductModal = ({ product, onClose, onAddToCart, isWishlisted, onToggleWishlist }: { product: any; onClose: () => void; onAddToCart?: (product: any) => void; isWishlisted?: boolean; onToggleWishlist?: (product: any) => void }) => {
  if (!product) return null;

  // Use the global reviews or product specific reviews if available
  const productReviews = product.reviews || reviews;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur text-[#4A2C2C] hover:text-[#F4B5C6] p-2 rounded-full transition-colors shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="w-full md:w-1/2 lg:w-2/5 aspect-square md:aspect-auto relative bg-[#FCE8ED]">
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        
        <div className="w-full md:w-1/2 lg:w-3/5 p-6 md:p-10 flex flex-col h-[80vh] md:h-[85vh]">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4A2C2C] mb-2 leading-tight">{product.name}</h2>
              
              <div className="flex gap-1 mb-4 items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} />
                ))}
                <span className="text-sm text-gray-500 ml-2 font-medium">{product.rating}.0/5 Đánh giá ({productReviews.length})</span>
              </div>

              <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                <span className="font-bold text-[#F4B5C6] text-3xl">{product.newPrice}</span>
                {product.oldPrice && <span className="text-lg text-gray-400 line-through mb-1">{product.oldPrice}</span>}
                {product.discount && (
                  <span className="bg-[#FCE8ED] text-[#F4B5C6] text-xs font-bold px-2 py-1 rounded mb-1">{product.discount}</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#4A2C2C] mb-3 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-[#F4B5C6]" /> Mô Tả Chi Tiết
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || "Đang cập nhật mô tả cho sản phẩm này. Xin vui lòng quay lại sau."}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-[#4A2C2C] mb-3 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-[#F4B5C6]" /> Thành Phần Chính
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.ingredients || "Đang cập nhật thành phần cho sản phẩm này."}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-lg font-bold text-[#4A2C2C] mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#F4B5C6]" /> Đánh Giá Từ Khách Hàng
              </h4>
              <div className="space-y-4">
                {productReviews.map((review: any) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#4A2C2C] text-sm">{review.name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4 shrink-0">
            <button 
              className="flex-1 bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] font-bold py-3.5 rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                if (onAddToCart) onAddToCart(product);
                onClose();
              }}
            >
              <ShoppingCart className="w-5 h-5" /> Thêm Vào Giỏ
            </button>
            <button 
              className={`w-14 h-14 border rounded-full flex items-center justify-center transition-colors shrink-0 ${isWishlisted ? 'border-[#F4B5C6] text-[#F4B5C6]' : 'border-gray-200 text-gray-400 hover:border-[#F4B5C6] hover:text-[#F4B5C6]'}`}
              onClick={() => {
                if (onToggleWishlist) onToggleWishlist(product);
              }}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-[#F4B5C6]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

