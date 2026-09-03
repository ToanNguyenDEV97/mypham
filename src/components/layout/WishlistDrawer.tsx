import { Heart, X, Trash2 } from 'lucide-react';

export const WishlistDrawer = ({ isOpen, onClose, wishlist, onRemove, onAddToCart }: { isOpen: boolean; onClose: () => void; wishlist: any[]; onRemove: (id: number) => void; onAddToCart: (product: any) => void }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif font-bold text-[#4A2C2C] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#F4B5C6]" /> Yêu Thích
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#F4B5C6] transition-colors rounded-full hover:bg-[#FCE8ED]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <Heart className="w-16 h-16 text-gray-200" />
              <p>Danh sách yêu thích trống</p>
              <button onClick={onClose} className="text-[#F4B5C6] font-bold mt-4 hover:text-[#4A2C2C] transition-colors">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            wishlist.map(item => (
              <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-2xl">
                <div className="w-20 h-24 bg-white rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-semibold text-[#4A2C2C] line-clamp-2">{item.name}</h4>
                    <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-bold text-[#F4B5C6] text-sm">{item.newPrice}</div>
                  
                  <div className="mt-2">
                    <button 
                      onClick={() => onAddToCart(item)}
                      className="text-xs bg-[#4A2C2C] text-white px-3 py-1.5 rounded-full hover:bg-[#F4B5C6] transition-colors font-bold"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

