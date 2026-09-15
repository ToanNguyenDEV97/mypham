import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  
  // Advanced pagination logic: always show first, last, and pages around current page
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex gap-2">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {startPage > 1 && (
        <>
          <button 
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors font-bold text-gray-600"
          >
            1
          </button>
          {startPage > 2 && <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>}
        </>
      )}

      {pages.map(page => (
        <button 
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
            currentPage === page 
              ? 'bg-[#F4B5C6] text-white shadow-md' 
              : 'border border-gray-200 hover:border-[#F4B5C6] hover:text-[#F4B5C6] text-gray-600'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>}
          <button 
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors font-bold text-gray-600"
          >
            {totalPages}
          </button>
        </>
      )}

      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
