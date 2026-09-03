import React from "react";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2 } from 'lucide-react';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    storeName: 'DS Tiên',
    description: 'DS TIÊN Cosmetics tự hào là nhà phân phối mỹ phẩm uy tín. Chúng tôi mang đến vẻ đẹp tự nhiên và an toàn cho mọi làn da.',
    address: '123 Đường Mỹ Phẩm, Quận 1, TP. HCM',
    phone: '0901 234 567',
    email: 'contact@dstien.vn',
    facebook: '#',
    instagram: '#',
    zalo: 'https://zalo.me',
    messenger: 'https://m.me',
    tiktok: '#',
    bankAccountName: '',
    bankAccountNumber: '',
    bankId: '',
    topBarText: 'Miễn phí giao hàng đơn từ 500k',
    categories: ['Tất cả', 'Làm sạch', 'Chăm sóc da', 'Trang điểm', 'Chăm sóc cơ thể'],
    brands: ['DS Tiên', 'Rohto', 'Romand', 'Luminous']
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
    setSaving(false);
  };

  const handleArrayChange = (field: 'categories' | 'brands', index: number, value: string) => {
    const newArray = [...settings[field]];
    newArray[index] = value;
    setSettings({ ...settings, [field]: newArray });
  };

  const handleAddArrayItem = (field: 'categories' | 'brands') => {
    setSettings({ ...settings, [field]: [...settings[field], ''] });
  };

  const handleRemoveArrayItem = (field: 'categories' | 'brands', index: number) => {
    const newArray = settings[field].filter((_, i) => i !== index);
    setSettings({ ...settings, [field]: newArray });
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Cấu hình Website</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#F4B5C6] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#4A2C2C] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
          Lưu cấu hình thành công!
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSave}>
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-[#4A2C2C] border-b pb-2">Thông tin chung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input 
                type="text" 
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input 
                type="text" 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dòng chữ thông báo trên cùng (Top Bar)</label>
              <input 
                type="text" 
                value={settings.topBarText}
                onChange={(e) => setSettings({...settings, topBarText: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn (Footer)</label>
              <textarea 
                value={settings.description}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-[#4A2C2C] border-b pb-2">Mạng xã hội</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook</label>
              <input 
                type="text" 
                value={settings.facebook}
                onChange={(e) => setSettings({...settings, facebook: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Instagram</label>
              <input 
                type="text" 
                value={settings.instagram}
                onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Zalo</label>
              <input 
                type="text" 
                value={settings.zalo}
                onChange={(e) => setSettings({...settings, zalo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Messenger</label>
              <input 
                type="text" 
                value={settings.messenger}
                onChange={(e) => setSettings({...settings, messenger: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-[#4A2C2C] border-b pb-2">Thông tin Ngân hàng (Thanh toán chuyển khoản)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng (Mã định danh VD: MB, VCB...)</label>
              <input 
                type="text" 
                value={settings.bankId}
                onChange={(e) => setSettings({...settings, bankId: e.target.value})}
                placeholder="MB"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
              <input 
                type="text" 
                value={settings.bankAccountNumber}
                onChange={(e) => setSettings({...settings, bankAccountNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
              <input 
                type="text" 
                value={settings.bankAccountName}
                onChange={(e) => setSettings({...settings, bankAccountName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories & Brands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg text-[#4A2C2C]">Danh mục sản phẩm</h3>
              <button type="button" onClick={() => handleAddArrayItem('categories')} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {settings.categories.map((cat, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="text" 
                    value={cat}
                    onChange={(e) => handleArrayChange('categories', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  />
                  <button type="button" onClick={() => handleRemoveArrayItem('categories', index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg text-[#4A2C2C]">Thương hiệu</h3>
              <button type="button" onClick={() => handleAddArrayItem('brands')} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {settings.brands.map((brand, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="text" 
                    value={brand}
                    onChange={(e) => handleArrayChange('brands', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  />
                  <button type="button" onClick={() => handleRemoveArrayItem('brands', index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
