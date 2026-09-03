import React from "react";
import { ArrowLeft, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { parsePrice, formatPrice, parseDate } from '../../utils/format';
import { useState, useEffect } from 'react';
import { auth, db, functions } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { CartItem, Voucher, Order, Settings } from '../../types';
import { SEO } from '../ui/SEO';

export const CheckoutView = ({ cart, onBack, onComplete, onClearCart, settings, onLoginRequest }: { cart: CartItem[]; onBack: () => void; onComplete: () => void; onClearCart?: () => void; settings?: Settings; onLoginRequest?: () => void }) => {
  const totalPrice = cart.reduce((total, item) => total + parsePrice(item.newPrice || item.price) * item.quantity, 0);
  const shippingFee = totalPrice > 500000 ? 0 : 30000;
  
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', address: '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Calculate discount
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      discountAmount = (totalPrice * appliedVoucher.discountValue) / 100;
    } else {
      discountAmount = appliedVoucher.discountValue;
    }
    // ensure discount doesn't exceed total
    if (discountAmount > totalPrice) discountAmount = totalPrice;
  }

  const finalTotal = totalPrice + shippingFee - discountAmount;

  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
      if (!currentUser && onLoginRequest) {
        onLoginRequest();
      }
    });
    return () => unsubscribe();
  }, [onLoginRequest]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().shippingProfile) {
            const data = docSnap.data().shippingProfile;
            setProfile({ 
              name: data.name || user.displayName || '', 
              phone: data.phone || '', 
              email: user.email || '',
              address: data.address ? (data.address + (data.city ? ', ' + data.city : '')) : '',
              note: ''
            });
          } else {
            setProfile(prev => ({ ...prev, name: user.displayName || '', email: user.email || '' }));
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleApplyVoucher = async () => {
    // PRE-CHECK VOUCHER TẠI CLIENT
    // Lưu ý: Đây chỉ là bước kiểm tra nhanh để nâng cao trải nghiệm UX (báo lỗi ngay không cần chờ submit).
    // Nguồn sự thật (Source of Truth) và nghiệp vụ trừ lượt sử dụng thực tế sẽ được xử lý bảo mật trên Server/Cloud Function.
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setIsApplyingVoucher(true);
    setVoucherError('');
    
    try {
      const q = query(collection(db, 'vouchers'), where('code', '==', voucherCode.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setVoucherError('Mã giảm giá không tồn tại');
        setAppliedVoucher(null);
        return;
      }
      
      const docData = querySnapshot.docs[0];
      const voucher = { id: docData.id, ...docData.data() } as Voucher;
      
      if (!voucher.isActive) {
        setVoucherError('Mã giảm giá không hoạt động');
        setAppliedVoucher(null);
        return;
      }
      
      if (voucher.expiresAt && parseDate(voucher.expiresAt) < new Date()) {
        setVoucherError('Mã giảm giá đã hết hạn');
        setAppliedVoucher(null);
        return;
      }
      
      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        setVoucherError('Mã giảm giá đã hết lượt sử dụng');
        setAppliedVoucher(null);
        return;
      }
      
      if (voucher.minOrderValue > totalPrice) {
        setVoucherError(`Đơn hàng phải từ ${formatPrice(voucher.minOrderValue)} để áp dụng mã này`);
        setAppliedVoucher(null);
        return;
      }
      
      setAppliedVoucher(voucher);
      setVoucherCode('');
    } catch (error) {
      console.error("Error applying voucher:", error);
      setVoucherError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setIsSubmitting(true);
    try {
      const createOrder = httpsCallable(functions, 'createOrder');
      const result = await createOrder({
        items: cart,
        profile,
        paymentMethod,
        voucherCode: appliedVoucher?.code
      });
      
      const data = result.data as { orderId?: string };
      if (data && data.orderId) {
        setSuccessOrderId(data.orderId);
        if (onClearCart) onClearCart();
      } else {
        throw new Error('Không lấy được mã đơn hàng từ server');
      }
    } catch (error: unknown) {
      console.error('Error saving order:', error);
      setCheckoutError(error instanceof Error ? error.message : "Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrderId) {
    return (
      <>
        <SEO title="Đặt Hàng Thành Công - DS Tiên Cosmetics" />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#4A2C2C] mb-4">Đặt Hàng Thành Công!</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Cảm ơn bạn đã mua sắm tại DS Tiên Cosmetics. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-md mx-auto mb-8">
            <p className="text-sm text-gray-500 mb-2">Mã đơn hàng của bạn là:</p>
            <p className="font-mono text-2xl font-bold text-[#4A2C2C] bg-white py-3 rounded-xl border border-gray-200">
              {successOrderId}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              *Vui lòng lưu lại mã này để tra cứu trạng thái đơn hàng.
            </p>
          </div>

          <button onClick={onComplete} className="bg-[#4A2C2C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#F4B5C6] hover:text-[#4A2C2C] transition-colors w-full sm:w-auto">
            Tiếp tục mua sắm
          </button>
        </div>
      </>
    );
  }

  if (authInitialized && !user) {
    return (
      <>
        <SEO title="Thanh Toán - DS Tiên Cosmetics" />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#4A2C2C] mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Bạn cần đăng nhập hoặc tạo tài khoản để có thể tiếp tục tiến hành thanh toán đơn hàng.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={onBack} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition-colors">
              Quay lại giỏ hàng
            </button>
            <button onClick={onLoginRequest} className="bg-[#4A2C2C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#F4B5C6] hover:text-[#4A2C2C] transition-colors">
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Thanh Toán - DS Tiên Cosmetics" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <button onClick={onBack} className="text-[#4A2C2C] hover:text-[#F4B5C6] font-medium flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4A2C2C] mb-4">Thanh Toán</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">Vui lòng điền thông tin giao hàng để hoàn tất đơn hàng.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Shipping Form */}
        <div className="flex-1 space-y-8">
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-bold text-[#4A2C2C] mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F4B5C6]" /> Thông Tin Giao Hàng
            </h3>
            
            <form className="space-y-4" onSubmit={handleCompleteOrder}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                  <input required minLength={2} type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all bg-white" placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                  <input required pattern="^0[0-9]{9}$" title="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0" type="tel" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all bg-white" placeholder="0901234567" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email (Tùy chọn)</label>
                <input 
                  type="email" 
                  value={profile.email || ''} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                  pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                  title="Vui lòng nhập đúng định dạng email (VD: email@example.com)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all bg-white" 
                  placeholder="email@example.com" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Địa chỉ cụ thể *</label>
                <input required minLength={5} type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all bg-white" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ghi chú (Tùy chọn)</label>
                <textarea value={profile.note || ''} onChange={e => setProfile({...profile, note: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none transition-all bg-white resize-none" rows={3} placeholder="Ghi chú thêm cho đơn hàng..." />
              </div>

              <div className="pt-6">
                <h3 className="text-xl font-bold text-[#4A2C2C] mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#F4B5C6]" /> Phương Thức Thanh Toán
                </h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors relative overflow-hidden ${paymentMethod === 'cod' ? 'border-[#F4B5C6] bg-white' : 'border-gray-200 bg-white grayscale hover:grayscale-0'}`}>
                    {paymentMethod === 'cod' && <div className="absolute inset-0 bg-[#FCE8ED] opacity-20"></div>}
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#F4B5C6] focus:ring-[#F4B5C6] border-gray-300" />
                    <span className={`font-medium relative z-10 ${paymentMethod === 'cod' ? 'text-[#4A2C2C]' : 'text-gray-600'}`}>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors relative overflow-hidden ${paymentMethod === 'bank' ? 'border-[#F4B5C6] bg-white' : 'border-gray-200 bg-white grayscale hover:grayscale-0'}`}>
                    {paymentMethod === 'bank' && <div className="absolute inset-0 bg-[#FCE8ED] opacity-20"></div>}
                    <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#F4B5C6] focus:ring-[#F4B5C6] border-gray-300" />
                    <span className={`font-medium relative z-10 ${paymentMethod === 'bank' ? 'text-[#4A2C2C]' : 'text-gray-600'}`}>Chuyển khoản ngân hàng</span>
                  </label>
                </div>

                {paymentMethod === 'bank' && (
                  <div className="mt-6 p-6 bg-white border border-[#F4B5C6] rounded-xl text-center animate-in fade-in duration-300 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#F4B5C6]"></div>
                    <h4 className="font-bold text-[#4A2C2C] text-lg mb-2 mt-2">Quét mã QR để thanh toán</h4>
                    <p className="text-sm text-gray-600 mb-6">Mở app Ngân hàng và quét mã để thanh toán tự động.</p>
                    
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white border-2 border-dashed border-[#F4B5C6] rounded-xl">
                        <img 
                          src={`https://img.vietqr.io/image/${settings?.bankId || ''}-${settings?.bankAccountNumber || ''}-compact2.png?amount=${finalTotal}&addInfo=DH ${profile.phone || 'ONLINE'}&accountName=${encodeURIComponent(settings?.bankAccountName || '')}`} 
                          alt="VietQR" 
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 border border-gray-100">
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Ngân hàng:</span>
                        <span className="font-bold text-[#4A2C2C]">{settings?.bankId || ''}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 py-2">
                        <span className="text-gray-500">Số tài khoản:</span>
                        <span className="font-bold text-[#4A2C2C] flex items-center gap-2">
                          {settings?.bankAccountNumber || ''} 
                          <button type="button" onClick={() => navigator.clipboard.writeText(settings?.bankAccountNumber || '')} className="text-[#F4B5C6] hover:text-[#4A2C2C] text-xs underline">Copy</button>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 py-2">
                        <span className="text-gray-500">Chủ tài khoản:</span>
                        <span className="font-bold text-[#4A2C2C]">{settings?.bankAccountName || ''}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-gray-500">Số tiền:</span>
                        <span className="font-bold text-[#F4B5C6]">{formatPrice(finalTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-gray-500">Nội dung:</span>
                        <span className="font-bold text-[#4A2C2C] flex items-center gap-2">
                          DH {profile.phone || 'ONLINE'}
                          <button type="button" onClick={() => navigator.clipboard.writeText(`DH ${profile.phone || 'ONLINE'}`)} className="text-[#F4B5C6] hover:text-[#4A2C2C] text-xs underline">Copy</button>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {checkoutError && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                  {checkoutError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full mt-8 bg-[#4A2C2C] text-white hover:bg-[#F4B5C6] disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5" /> 
                {isSubmitting ? 'Đang Xử Lý...' : 'Hoàn Tất Đặt Hàng'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl sticky top-24 border border-gray-100">
            <h3 className="text-xl font-bold text-[#4A2C2C] mb-6 border-b border-gray-200 pb-4">Tóm Tắt Đơn Hàng</h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-[#4A2C2C] line-clamp-2 mb-1">{item.name}</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">SL: {item.quantity}</span>
                      <span className="font-bold text-[#F4B5C6]">{formatPrice(parsePrice(item.newPrice || item.price) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={!!appliedVoucher || isApplyingVoucher}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4B5C6] uppercase text-sm"
                />
                {!appliedVoucher ? (
                  <button 
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                    className="px-4 py-2 bg-[#4A2C2C] text-white rounded-xl text-sm font-bold hover:bg-[#3A2222] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {isApplyingVoucher ? 'Đang...' : 'Áp dụng'}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Hủy
                  </button>
                )}
              </div>
              {voucherError && <p className="text-red-500 text-xs mt-2">{voucherError}</p>}
              {appliedVoucher && (
                <p className="text-green-600 text-xs mt-2">
                  Đã áp dụng mã <strong>{appliedVoucher.code}</strong> (Giảm {appliedVoucher.discountType === 'percentage' ? `${appliedVoucher.discountValue}%` : formatPrice(appliedVoucher.discountValue)})
                </p>
              )}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#4A2C2C]">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-[#4A2C2C]">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-semibold">- {formatPrice(discountAmount)}</span>
                </div>
              )}
              {shippingFee > 0 && (
                <div className="text-xs text-[#F4B5C6] bg-[#FCE8ED] p-2 rounded-lg text-center mt-2">
                  Mua thêm {formatPrice(500000 - totalPrice)} để được miễn phí giao hàng!
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <span className="text-lg font-bold text-[#4A2C2C]">Tổng cộng</span>
              <span className="text-2xl font-bold text-[#F4B5C6]">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
