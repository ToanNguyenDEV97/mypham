import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Banner } from '../../types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    isActive: true
  });

  const fetchBanners = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'banners'));
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Banner[];
      // sort by created at or just keep it
      setBanners(fetched);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), formData);
      } else {
        await addDoc(collection(db, 'banners'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await deleteDoc(doc(db, 'banners', id));
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const openModal = (banner?: Banner | null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        imageUrl: banner.imageUrl || '',
        buttonText: banner.buttonText || '',
        buttonLink: banner.buttonLink || '',
        isActive: banner.isActive !== false
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý Banners</h2>
        <button
          onClick={() => openModal()}
          className="bg-[#F4B5C6] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#4A2C2C] transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Banner
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 items-center bg-gray-50">
            <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0">
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[#4A2C2C]">{banner.title || 'Không có tiêu đề'}</h3>
                {!banner.isActive && (
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">Đã ẩn</span>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{banner.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(banner)}
                className="p-2 hover:bg-white rounded-lg text-gray-500 transition-colors"
                title="Sửa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 hover:bg-white rounded-lg text-red-500 transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Chưa có banner nào. Hãy thêm banner đầu tiên!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4A2C2C]">
                {editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#4A2C2C]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-orange-500 mt-1 mt-1 font-medium">
                    * Kích thước đề xuất: 1920x600px để hiển thị đẹp nhất trên mọi thiết bị
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge (Nhãn phụ, vd: 30%)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề chính (Có thể dùng thẻ &lt;br/&gt; để xuống dòng)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả phụ</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chữ nút bấm (Tùy chọn)</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none"
                    placeholder="Mua Sắm Ngay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn nút (Link)</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={e => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#F4B5C6] focus:ring-1 focus:ring-[#F4B5C6] outline-none"
                    placeholder="/products"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#F4B5C6] rounded border-gray-300 focus:ring-[#F4B5C6]"
                    />
                    <span className="text-sm font-medium text-gray-700">Đang hoạt động (Hiển thị ngoài trang chủ)</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#F4B5C6] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#4A2C2C] transition-colors"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
