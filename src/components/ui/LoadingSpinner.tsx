import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
      <Loader2 className="w-12 h-12 text-[#F4B5C6] animate-spin mb-4" />
      <p className="text-[#4A2C2C] font-medium text-lg">Đang tải dữ liệu...</p>
    </div>
  );
};
