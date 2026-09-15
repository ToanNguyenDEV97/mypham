import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore';
import { Policy } from '../../types';
import { Edit2, X, AlertCircle } from 'lucide-react';
import { RichTextEditor } from '../ui/RichTextEditor';

const POLICY_SLUGS = [
  { slug: 'chinh-sach-bao-mat', title: 'Chính sách bảo mật' },
  { slug: 'chinh-sach-van-chuyen', title: 'Chính sách vận chuyển' },
  { slug: 'chinh-sach-doi-tra', title: 'Chính sách đổi trả' },
  { slug: 'dieu-khoan-dich-vu', title: 'Điều khoản dịch vụ' },
  { slug: 'hinh-thuc-thanh-toan', title: 'Hình thức thanh toán' }
];

export const AdminPolicies = () => {
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchPolicies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'policies'));
      const fetched: Record<string, Policy> = {};
      querySnapshot.docs.forEach(doc => {
        const data = doc.data() as Policy;
        fetched[data.slug] = { id: doc.id, ...data };
      });
      setPolicies(fetched);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      for (const p of POLICY_SLUGS) {
        if (!policies[p.slug]) {
          const docRef = doc(collection(db, 'policies'));
          await setDoc(docRef, {
            slug: p.slug,
            title: p.title,
            content: '<p>Nội dung đang được cập nhật...</p>',
            updatedAt: Timestamp.now()
          });
        }
      }
      await fetchPolicies();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (slug: string, currentTitle: string) => {
    const existing = policies[slug];
    setFormData({
      title: existing ? existing.title : currentTitle,
      content: existing ? existing.content : '<p>Chưa có nội dung...</p>'
    });
    setEditingSlug(slug);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlug) return;
    
    try {
      const existing = policies[editingSlug];
      const docRef = existing && existing.id 
        ? doc(db, 'policies', existing.id) 
        : doc(collection(db, 'policies'));
        
      const payload = {
        slug: editingSlug,
        title: formData.title,
        content: formData.content,
        updatedAt: Timestamp.now()
      };
      
      await setDoc(docRef, payload);
      await fetchPolicies();
      setEditingSlug(null);
    } catch (error) {
      console.error('Error saving policy:', error);
      alert('Đã có lỗi xảy ra khi lưu.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý Chính sách</h2>
        <button 
          onClick={handleSeed}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Tạo trang chưa có
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Tên chính sách</th>
                <th className="py-4 px-6 font-medium">Đường dẫn (Slug)</th>
                <th className="py-4 px-6 font-medium">Trạng thái</th>
                <th className="py-4 px-6 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {POLICY_SLUGS.map(({ slug, title }) => {
                const isConfigured = !!policies[slug];
                
                return (
                  <tr key={slug} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-[#4A2C2C]">{title}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isConfigured ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          Đã cập nhật
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          <AlertCircle className="w-3 h-3" />
                          Chưa có nội dung
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleEdit(slug, title)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Soạn thảo
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editingSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#4A2C2C]">Soạn thảo: {POLICY_SLUGS.find(p => p.slug === editingSlug)?.title}</h3>
              <button 
                onClick={() => setEditingSlug(null)}
                className="text-gray-400 hover:text-[#4A2C2C] p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề chính thức</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4B5C6]/20 focus:border-[#F4B5C6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung (HTML/Rich Text)</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[300px]">
                    <RichTextEditor 
                      content={formData.content}
                      onChange={content => setFormData({...formData, content})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button 
                  type="button"
                  onClick={() => setEditingSlug(null)}
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#F4B5C6] text-white font-bold hover:bg-[#4A2C2C] rounded-xl transition-colors shadow-sm"
                >
                  Lưu chính sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
