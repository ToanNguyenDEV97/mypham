import React, { useEffect } from 'react';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { Post} from '../../types';
import { SEO } from '../ui/SEO';
import DOMPurify from 'dompurify';

export const PostDetailView = ({ post, onBack }: { post: Post, onBack: () => void }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  if (!post) return null;

  const formatDate = (dateInput: import('../../types').TimestampType) => {
    if (!dateInput) return 'Đang cập nhật';
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
         return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return dateInput;
    }
    if (typeof dateInput === "object" && dateInput !== null && "toDate" in dateInput && typeof dateInput.toDate === "function") {
      return dateInput.toDate().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return 'Đang cập nhật';
  };

  return (
    <>
      <SEO title={`${post.title} | Góc Làm Đẹp`} description={post.title} />
      <div className="bg-[#FCFAFA] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-[#F4B5C6] transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Trở về
          </button>

          <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <div className="mb-6">
              <span className="bg-[#FCE8ED] text-[#F4B5C6] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {post.category || 'Tin tức'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#4A2C2C] leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt || post.date)}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                DS Tiên Cosmetics
              </div>
              <div className="flex items-center gap-2 ml-auto cursor-pointer hover:text-[#F4B5C6] transition-colors">
                <Share2 className="w-4 h-4" /> Chia sẻ
              </div>
            </div>

            {post.image && (
              <div className="rounded-2xl overflow-hidden mb-10">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            )}

            <div 
              className="prose prose-lg max-w-none text-gray-600 leading-relaxed prose-headings:text-[#4A2C2C] prose-a:text-[#F4B5C6] hover:prose-a:text-[#4A2C2C] prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '<p>Đang cập nhật nội dung...</p>') }}
            />
          </article>
        </div>
      </div>
    </>
  );
};
