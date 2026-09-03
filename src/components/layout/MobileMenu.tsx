import { X, ChevronDown } from 'lucide-react';
import { Settings, ViewType } from '../../types';

interface MobileMenuProps {
  settings: Settings;
  setCurrentView: (view: ViewType) => void;
  setSearchQuery: (q: string) => void;
  setProductsKey: (cb: (k: number) => number) => void;
  setIsMenuOpen: (open: boolean) => void;
}

export const MobileMenu = ({
  settings, setCurrentView, setSearchQuery, setProductsKey, setIsMenuOpen
}: MobileMenuProps) => {
  return (
    
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#4A2C2C]/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-[80%] max-w-sm h-full bg-[#FDF2F5] border-r border-[#F4B5C6]/50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-[#F4B5C6]/30 flex justify-between items-center bg-[#FCE8ED]">
              <div className="font-serif font-bold tracking-[0.2em] text-[#4A2C2C] uppercase text-xl">DS TIÊN</div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#F4B5C6]/20 rounded-full transition-colors text-[#4A2C2C]">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-8">
              <nav className="flex flex-col gap-6 text-sm font-semibold tracking-widest uppercase text-[#4A2C2C]">
                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('home'); setIsMenuOpen(false); }}>Trang Chủ</a>
                
                <div className="flex flex-col gap-4">
                  <a href="#" className="hover:text-[#F4B5C6] transition-colors flex items-center gap-2" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); setIsMenuOpen(false); }}>
                    Sản Phẩm <ChevronDown className="w-4 h-4" />
                  </a>
                  <div className="pl-4 flex flex-col gap-3 text-gray-500 font-medium text-xs">
                    {settings.categories.filter(c => c !== 'Tất cả').map(category => (
                      <a key={category} href="#" onClick={(e) => { e.preventDefault(); setSearchQuery(category); setCurrentView('products'); setIsMenuOpen(false); }} className="hover:text-[#F4B5C6] transition-colors">{category}</a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="flex items-center gap-2 hover:text-[#F4B5C6] transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); setIsMenuOpen(false); }}>
                    Thương Hiệu <ChevronDown className="w-4 h-4" />
                  </span>
                  <div className="pl-4 flex flex-col gap-3 text-gray-500 font-medium text-xs">
                    {settings.brands.map(brand => (
                      <a key={brand} href="#" onClick={(e) => { e.preventDefault(); setSearchQuery(brand); setCurrentView('products'); setIsMenuOpen(false); }} className="hover:text-[#F4B5C6] transition-colors">{brand}</a>
                    ))}
                  </div>
                </div>

                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setSearchQuery('Khuyến mãi'); setCurrentView('products'); setProductsKey(k => k + 1); setIsMenuOpen(false); }}>Khuyến Mãi</a>

                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>
                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('blog'); }}>Góc Làm Đẹp</a>
              </nav>
            </div>
          </div>
        </div>
      
  );
};
