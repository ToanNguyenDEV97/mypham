import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { blogPosts as mockPosts } from '../../data/mockData';
import { Post } from '../../types';
import { SEO } from '../ui/SEO';

export const BlogView = ({ onPostClick, onBack }: { onPostClick: (post: Post) => void, onBack: () => void }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
        } else {
          setPosts(mockPosts); // Fallback
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts(mockPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ['Tất cả', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter(post => {
    const matchCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    const matchSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatDate = (dateInput: import('../../types').TimestampType) => {
    if (!dateInput) return 'Đang cập nhật';
    if (typeof dateInput === 'string') {
      // Check if it's ISO string or just text
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
         return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return dateInput; // Return as is from mock data
    }
    if (typeof dateInput === "object" && dateInput !== null && "toDate" in dateInput && typeof dateInput.toDate === "function") {
      return dateInput.toDate().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return 'Đang cập nhật';
  };

  return (
    <>
      <SEO title="Góc Làm Đẹp - Mẹo & Kiến Thức | DS Tiên" description="Khám phá các mẹo làm đẹp, kiến thức chăm sóc da và xu hướng trang điểm mới nhất từ DS Tiên." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4A2C2C] mb-4">Góc Làm Đẹp</h1>
          <p className="text-gray-600">Những bí quyết chăm sóc da, xu hướng làm đẹp và cập nhật kiến thức mới nhất dành cho bạn.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#F4B5C6] text-white'
                    : 'bg-white text-gray-600 hover:bg-[#FCE8ED] hover:text-[#F4B5C6]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm bài viết..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.length > 0 ? filteredPosts.map(post => (
              <div 
                key={post.id} 
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
                onClick={() => onPostClick(post)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={post.image || 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=600'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#4A2C2C] shadow-sm">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-gray-400 mb-3 gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.createdAt || post.date)}
                  </div>
                  <h3 className="font-bold text-lg text-[#4A2C2C] group-hover:text-[#F4B5C6] transition-colors leading-relaxed line-clamp-2 mb-3">
                    {post.title}
                  </h3>
                  <div className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                    {post.content ? (
                      <div dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }} />
                    ) : 'Không có mô tả...'}
                  </div>
                  <div className="flex items-center text-[#F4B5C6] font-bold text-sm mt-auto group-hover:gap-2 transition-all">
                    Đọc tiếp <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                Không tìm thấy bài viết nào.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
