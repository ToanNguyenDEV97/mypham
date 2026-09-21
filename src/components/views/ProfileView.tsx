import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { MapPin, User, LogOut, Package, ShieldCheck, Clock, CheckCircle2, Truck, XCircle, Search } from 'lucide-react';
import { Order, CartItem} from '../../types';
import { SEO } from '../ui/SEO';
import { formatPrice, parseDate } from '../../utils/format';

export const ProfileView = ({ onLogout, onAdminClick }: { onLogout: () => void; onAdminClick?: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            if (docSnap.data().isAdmin) {
              setIsAdmin(true);
            }
                    if (docSnap.data().shippingProfile) {
                      const data = docSnap.data().shippingProfile;
                      setProfile({
                        name: data.name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        city: data.city || ''
                      });
                    } else {
              setProfile(prev => ({ ...prev, name: auth.currentUser?.displayName || '' }));
            }
          } else {
            setProfile(prev => ({ ...prev, name: auth.currentUser?.displayName || '' }));
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab === 'orders' && auth.currentUser) {
        setLoadingOrders(true);
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Order[];
          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    fetchOrders();
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        shippingProfile: profile
      }, { merge: true });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error) {
      console.error("Error saving profile", error);
      /* Error */
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center">Đang tải...</div>;

  return (
    <>
      <SEO title="Tài Khoản - DS Tiên Cosmetics" />
      <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
          <div className="bg-[#FCE8ED] p-6 rounded-2xl mb-4 text-center">
            <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-[#F4B5C6]" />
            </div>
            <h3 className="font-bold text-[#4A2C2C]">{auth.currentUser?.displayName || 'Người dùng'}</h3>
            <p className="text-sm text-gray-500">{auth.currentUser?.email}</p>
          </div>
          
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-[#F4B5C6] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MapPin className="w-5 h-5" /> Thông tin giao hàng
          </button>
          
          {/* Example placeholder for orders */}
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-[#F4B5C6] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Package className="w-5 h-5" /> Đơn hàng của tôi
          </button>

          {isAdmin && onAdminClick && (
            <button 
              onClick={onAdminClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[#4A2C2C] bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 mt-2"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Trang quản trị (Admin)
            </button>
          )}

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-8"
          >
            <LogOut className="w-5 h-5" /> Đăng xuất
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          {activeTab === 'profile' ? (
            <>
              <h2 className="text-2xl font-serif font-bold text-[#4A2C2C] mb-6">Thông tin giao hàng mặc định</h2>
              {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">Lưu thông tin thành công!</div>}
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input 
                      type="text" 
                      value={profile.name || ''}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={profile.phone || ''}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                      required
                      pattern="^0[0-9]{9}$"
                      title="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ (Số nhà, tên đường)</label>
                  <input 
                    type="text" 
                    value={profile.address || ''}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                    required
                    minLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                  <input 
                    type="text" 
                    value={profile.city || ''}
                    onChange={e => setProfile({...profile, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                    required
                    minLength={2}
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-[#F4B5C6] text-white font-bold rounded-full hover:bg-[#4A2C2C] transition-colors shadow-md disabled:opacity-70"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-serif font-bold text-[#4A2C2C] mb-6">Đơn hàng của tôi</h2>
              {loadingOrders ? (
                <div className="text-center py-12 text-gray-500">Đang tải đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => {
                    let statusInfo = { label: 'Đang xử lý', color: 'text-orange-500', bg: 'bg-orange-50' };
                    if (order.status === 'processing') statusInfo = { label: 'Đang chuẩn bị', color: 'text-blue-500', bg: 'bg-blue-50' };
                    if (order.status === 'shipped') statusInfo = { label: 'Đang giao', color: 'text-indigo-500', bg: 'bg-indigo-50' };
                    if (order.status === 'delivered') statusInfo = { label: 'Đã giao', color: 'text-green-500', bg: 'bg-green-50' };
                    if (order.status === 'cancelled') statusInfo = { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-50' };
                    
                    return (
                      <div key={order.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                          <div>
                            <p className="font-mono font-bold text-[#4A2C2C]">#{order.id}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {order.createdAt ? parseDate(order.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color} shrink-0 w-fit`}>
                            {statusInfo.label}
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {order.items?.map((item: CartItem, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#4A2C2C] truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">x{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                          <span className="text-sm text-gray-500">Tổng cộng:</span>
                          <span className="font-bold text-[#F4B5C6] text-lg">{formatPrice(order.finalTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
