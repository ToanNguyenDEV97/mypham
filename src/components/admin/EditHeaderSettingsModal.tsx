import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { X, Save } from 'lucide-react';

interface EditHeaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditHeaderSettingsModal = ({ isOpen, onClose }: EditHeaderSettingsModalProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topBarText, setTopBarText] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setTopBarText(data.topBarText || '');
      }
    } catch (error) {
      console.error("Error fetching header settings:", error);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          phone,
          email,
          topBarText
        });
      } else {
        await setDoc(docRef, {
          phone,
          email,
          topBarText
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving header settings:", error);
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#4A2C2C]">Chỉnh sửa Header (Top Bar)</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải cấu hình...</div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (Hotline)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  placeholder="Ví dụ: 1900 1234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  placeholder="Ví dụ: cskh@ds-tien.vn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dòng chữ thông báo trên cùng</label>
                <input
                  type="text"
                  value={topBarText}
                  onChange={(e) => setTopBarText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  placeholder="Ví dụ: Miễn phí giao hàng đơn từ 500k"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-full transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="px-6 py-2 bg-[#4A2C2C] text-white font-medium rounded-full hover:bg-[#3A2222] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? 'Đang lưu...' : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
