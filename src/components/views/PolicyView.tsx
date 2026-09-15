import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Policy } from '../../types';
import { SEO } from '../ui/SEO';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const PolicyView = ({ slug, onBack }: { slug: string; onBack: () => void }) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'policies'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setPolicy({ id: docSnap.id, ...docSnap.data() } as Policy);
        } else {
          setError('Không tìm thấy nội dung chính sách này.');
        }
      } catch (err) {
        console.error('Error fetching policy:', err);
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPolicy();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <SEO title={`${policy ? policy.title : 'Chính sách'} - DS Tiên Cosmetics`} />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-300">
        <button 
          onClick={onBack}
          className="text-gray-500 hover:text-[#4A2C2C] mb-8 font-medium flex items-center gap-2"
        >
          &larr; Quay lại trang chủ
        </button>

        {error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
            <h2 className="text-xl font-bold mb-2">Lỗi tải trang</h2>
            <p>{error}</p>
          </div>
        ) : policy ? (
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4A2C2C] mb-8 pb-6 border-b border-gray-100">
              {policy.title}
            </h1>
            <div 
              className="prose prose-pink max-w-none text-gray-700
                prose-headings:text-[#4A2C2C] prose-headings:font-serif
                prose-a:text-[#F4B5C6] hover:prose-a:text-[#4A2C2C]
                prose-img:rounded-xl prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
