import React, { useState } from 'react';
import { auth, db, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Package, Clock, Truck, CheckCircle2, XCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { Order, CartItem } from '../../types';
import { SEO } from '../ui/SEO';
import { formatPrice, parsePrice } from '../../utils/format';

export const OrderTrackingView = ({ onBack }: { onBack: () => void }) => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      const trackOrderFunction = httpsCallable(functions, 'trackOrder');
      const result = await trackOrderFunction({ orderId: orderId.trim() });
      
      if (result.data) {
        setOrder(result.data);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'not-found') {
        setError('Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã xảy ra lỗi khi tìm kiếm đơn hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  
  
  

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Đang chờ xử lý', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'processing': return { label: 'Đang chuẩn bị hàng', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'shipped': return { label: 'Đang giao hàng', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' };
      case 'delivered': return { label: 'Đã giao hàng', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      case 'cancelled': return { label: 'Đã hủy', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      default: return { label: 'Không xác định', icon: Package, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

  return (
    <>
      <SEO title="Theo Dõi Đơn Hàng - DS Tiên Cosmetics" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-300 min-h-[60vh]">
        <button onClick={onBack} className="text-[#4A2C2C] hover:text-[#F4B5C6] font-medium flex items-center gap-2 transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" /> Trở về
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-[#4A2C2C] mb-4">Tra Cứu Đơn Hàng</h1>
          <p className="text-gray-500 text-sm">Nhập mã đơn hàng của bạn để kiểm tra tình trạng hiện tại</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Nhập mã đơn hàng (VD: 8xA9...)"
              className="w-full pl-12 pr-32 py-4 rounded-full border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#4A2C2C] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#F4B5C6] hover:text-[#4A2C2C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </form>

        {order && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="font-mono font-bold text-[#4A2C2C] text-lg">#{order.id}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Đặt ngày: {order.createdAt?.toDate ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(order.createdAt.toDate()) : 'Không xác định'}
                </p>
              </div>
              
              {(() => {
                const info = getStatusInfo(order.status);
                const Icon = info.icon;
                return (
                  <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${info.bg} ${info.border} ${info.color}`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{info.label}</span>
                  </div>
                );
              })()}
            </div>

            {/* Tracking Steps */}
            {order.status !== 'cancelled' && (
              <div className="mb-10 px-2">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                  
                  {statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.indexOf(order.status);
                    const isCompleted = currentIndex >= index;
                    const isCurrent = currentIndex === index;
                    const stepInfo = getStatusInfo(step);
                    const StepIcon = stepInfo.icon;
                    
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-[#4A2C2C] border-[#4A2C2C] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                          {isCompleted && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs md:text-sm font-medium hidden md:block ${isCurrent ? 'text-[#4A2C2C]' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                          {stepInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Items */}
              <div>
                <h3 className="font-bold text-[#4A2C2C] mb-4">Chi Tiết Sản Phẩm</h3>
                <div className="space-y-4">
                  {order.items?.map((item: CartItem, index: number) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#4A2C2C] truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatPrice(parsePrice(item.newPrice || item.price))} x {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-[#4A2C2C]">{formatPrice(parsePrice(item.newPrice || item.price) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển:</span>
                    <span className="font-medium">{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#4A2C2C] pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-[#F4B5C6] text-xl">{formatPrice(order.finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-[#4A2C2C] mb-4">Thông Tin Giao Hàng</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Người nhận</p>
                    <p className="font-medium text-[#4A2C2C]">{order.customerInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Số điện thoại</p>
                    <p className="font-medium text-[#4A2C2C]">{order.customerInfo?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Địa chỉ giao hàng</p>
                    <p className="font-medium text-[#4A2C2C] leading-relaxed">{order.customerInfo?.address}</p>
                  </div>
                  {order.customerInfo?.note && (
                    <div>
                      <p className="text-gray-500 mb-1">Ghi chú</p>
                      <p className="font-medium text-[#4A2C2C]">***</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 mb-1">Phương thức thanh toán</p>
                    <p className="font-medium text-[#4A2C2C]">
                      {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / Thẻ tín dụng'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
