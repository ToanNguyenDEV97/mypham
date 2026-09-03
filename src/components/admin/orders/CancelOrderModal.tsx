import { useState } from 'react';

interface CancelOrderModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  updating: boolean;
}

export const CancelOrderModal = ({
  onClose,
  onConfirm,
  updating
}: CancelOrderModalProps) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-red-600">Lý do hủy đơn</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
            {/* icon X */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn (tùy chọn)..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-32 text-sm"
          ></textarea>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={updating} className="px-5 py-2 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            Đóng
          </button>
          <button onClick={() => onConfirm(reason)} disabled={updating} className="px-5 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2">
            {updating ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
};
