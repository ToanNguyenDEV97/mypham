import { ShoppingCart, X, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { parsePrice, formatPrice } from '../../utils/format';

export const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout }: { isOpen: boolean; onClose: () => void; cart: any[]; updateQuantity: (id: number, delta: number) => void; removeFromCart: (id: number) => void; onCheckout: () => void }) => {
  const totalPrice = cart.reduce((total, item) => total + parsePrice(item.newPrice || item.price) * item.quantity, 0);

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
            <ShoppingCart className="w-5 h-5 text-[#F4B5C6]" /> Giỏ Hàng
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#F4B5C6] transition-colors rounded-full hover:bg-[#FCE8ED]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <ShoppingCart className="w-16 h-16 text-gray-200" />
              <p>Giỏ hàng của bạn đang trống</p>
              <button onClick={onClose} className="text-[#F4B5C6] font-bold mt-4 hover:text-[#4A2C2C] transition-colors">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-2xl">
                <div className="w-20 h-24 bg-white rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-semibold text-[#4A2C2C] line-clamp-2">{item.name}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-bold text-[#F4B5C6] text-sm">{item.newPrice || item.price}</div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-500 hover:text-[#F4B5C6] transition-colors p-1"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#4A2C2C] w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-500 hover:text-[#F4B5C6] transition-colors p-1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#4A2C2C] font-semibold">Tổng Tiền</span>
              <span className="text-2xl font-bold text-[#F4B5C6]">{formatPrice(totalPrice)}</span>
            </div>
            <button 
              className="w-full bg-[#4A2C2C] text-white hover:bg-[#F4B5C6] font-bold py-4 rounded-full transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              Thanh Toán <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

