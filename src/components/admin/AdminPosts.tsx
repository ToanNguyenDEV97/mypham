import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Post } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { blogPosts as mockPosts } from '../../data/mockData';

export const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
    content: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const postData = {
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
      } else {
        await addDoc(collection(db, 'posts'), postData);
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      category: post.category || '',
      image: post.image || '',
      content: post.content || ''
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      category: '',
      image: '',
      content: ''
    });
    setIsModalOpen(true);
  };

  const displayPosts = posts.length > 0 ? posts : mockPosts;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý bài viết</h2>
        <button 
          onClick={openAddModal}
          className="bg-[#F4B5C6] text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-[#4A2C2C] transition-colors"
        >
          <Plus className="w-4 h-4" /> Viết bài mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Bài viết</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Danh mục</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Ngày đăng</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : (
              displayPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={post.image} alt={post.title} className="w-12 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-gray-900 line-clamp-1">{post.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{post.category || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : post.date}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(post)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative p-6">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#4A2C2C] p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-[#4A2C2C] mb-6">
              {editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Chăm Sóc Da">Chăm Sóc Da</option>
                    <option value="Làm Đẹp">Làm Đẹp</option>
                    <option value="Trang Điểm">Trang Điểm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh đại diện</label>
                  <input 
                    type="url" 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea 
                  rows={6}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none resize-none"
                  placeholder="Viết nội dung tại đây..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[#F4B5C6] text-white font-medium hover:bg-[#4A2C2C] rounded-full transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
