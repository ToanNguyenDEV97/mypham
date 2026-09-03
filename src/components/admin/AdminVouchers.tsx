import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Voucher } from '../../types';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: 0,
    minOrderValue: 0,
    isActive: true,
    expiresAt: '',
    usageLimit: 0
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'vouchers'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVouchers(data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (voucher: Voucher | null = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code || '',
        discountType: voucher.discountType || 'percentage',
        discountValue: voucher.discountValue || 0,
        minOrderValue: voucher.minOrderValue || 0,
        isActive: voucher.isActive !== undefined ? voucher.isActive : true,
        expiresAt: voucher.expiresAt || '',
        usageLimit: voucher.usageLimit || 0
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        isActive: true,
        expiresAt: '',
        usageLimit: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await deleteDoc(doc(db, 'vouchers', id));
        setVouchers(vouchers.filter(v => v.id !== id));
      } catch (error) {
        console.error("Error deleting voucher:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        usedCount: editingVoucher?.usedCount || 0
      };

      if (editingVoucher) {
        await updateDoc(doc(db, 'vouchers', editingVoucher.id), payload);
      } else {
        await addDoc(collection(db, 'vouchers'), payload);
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error) {
      console.error("Error saving voucher:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải mã giảm giá...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Mã giảm giá</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#F4B5C6] text-[#4A2C2C] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#F2A3B8] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm mã
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Mã (Code)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Giảm giá</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Đơn tối thiểu</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Hạn sử dụng</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Lượt dùng</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Chưa có mã giảm giá nào</td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#4A2C2C] bg-[#FCE8ED] px-3 py-1 rounded-full">{voucher.code}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {voucher.discountType === 'percentage' 
                        ? `${voucher.discountValue}%` 
                        : formatPrice(voucher.discountValue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPrice(voucher.minOrderValue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString('vi-VN') : 'Không có hạn'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">
                      {voucher.usedCount || 0} {voucher.usageLimit ? `/ ${voucher.usageLimit}` : ''}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${voucher.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {voucher.isActive ? 'Hoạt động' : 'Đã tắt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(voucher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(voucher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-[#4A2C2C]">
                {editingVoucher ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mã code <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="VD: KHUYENMAI20"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4B5C6] uppercase"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Loại giảm giá</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền trực tiếp (VNĐ)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mức giảm {formData.discountType === 'percentage' ? '(%)' : '(VNĐ)'} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : ""}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Giá trị đơn tối thiểu (VNĐ)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Hạn sử dụng</label>
                  <input 
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Giới hạn lượt dùng (0 = không giới hạn)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 text-[#F4B5C6] rounded focus:ring-[#F4B5C6]"
                />
                <label htmlFor="isActive" className="font-medium text-gray-700 cursor-pointer">Kích hoạt mã giảm giá này</label>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="bg-[#F4B5C6] text-[#4A2C2C] px-6 py-3 rounded-xl font-bold hover:bg-[#F2A3B8] transition-colors"
                >
                  {editingVoucher ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
