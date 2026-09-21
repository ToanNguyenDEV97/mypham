import { Review } from '../../types';
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash2, Star, Loader2, MessageSquare } from 'lucide-react';


export const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Review[];
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await deleteDoc(doc(db, 'reviews', String(id)));
        setReviews(reviews.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error deleting review:", error);
        alert('Có lỗi xảy ra khi xóa đánh giá');
      }
    }
  };

  const formatDate = (timestamp: import('../../types').TimestampType) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp as string | number);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý Đánh giá</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Sản phẩm ID</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Đánh giá</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Nội dung</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Ngày tạo</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Chưa có đánh giá nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{review.name || 'Khách hàng'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 max-w-[150px] truncate" title={String(review.productId)}>
                        {review.productId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 max-w-xs line-clamp-2" title={review.text}>
                        {review.text}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa đánh giá"
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
    </div>
  );
};
