import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, FileText, Settings, Image, Loader2, Tag, Star } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatPrice } from '../../utils/format';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminPosts } from './AdminPosts';
import { AdminSettings } from './AdminSettings';
import { AdminVouchers } from './AdminVouchers';
import { AdminBanners } from './AdminBanners';
import { AdminReviews } from './AdminReviews';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'posts' | 'settings' | 'banners' | 'vouchers' | 'reviews'>('overview');
  const [metrics, setMetrics] = useState({ revenue: 0, totalOrders: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchMetrics();
    }
  }, [activeTab]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      let revenue = 0;
      let totalOrders = 0;
      let pendingOrders = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalOrders++;
        if (data.status === 'completed') {
          revenue += (data.finalTotal || 0);
        }
        if (data.status === 'pending') {
          pendingOrders++;
        }
      });

      setMetrics({ revenue, totalOrders, pendingOrders });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'banners', name: 'Banners', icon: Image },
    { id: 'products', name: 'Sản phẩm', icon: ShoppingBag },
    { id: 'orders', name: 'Đơn hàng', icon: ShoppingCart },
    { id: 'vouchers', name: 'Mã giảm giá', icon: Tag },
    { id: 'posts', name: 'Bài viết', icon: FileText },
    { id: 'reviews', name: 'Đánh giá', icon: Star },
    { id: 'settings', name: 'Cấu hình', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#FCE8ED] text-[#4A2C2C]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#F4B5C6]' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#4A2C2C]">Tổng quan</h2>
              {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#FCE8ED] p-6 rounded-2xl">
                <p className="text-sm font-medium text-gray-600 mb-2">Tổng doanh thu (Hoàn thành)</p>
                <p className="text-3xl font-bold text-[#4A2C2C]">
                  {loading ? '...' : formatPrice(metrics.revenue)}
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <p className="text-sm font-medium text-gray-600 mb-2">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-blue-900">
                  {loading ? '...' : metrics.totalOrders}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl">
                <p className="text-sm font-medium text-gray-600 mb-2">Đang chờ xử lý</p>
                <p className="text-3xl font-bold text-green-900">
                  {loading ? '...' : metrics.pendingOrders}
                </p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'banners' && <AdminBanners />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'vouchers' && <AdminVouchers />}
        {activeTab === 'posts' && <AdminPosts />}
        {activeTab === 'reviews' && <AdminReviews />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
};
