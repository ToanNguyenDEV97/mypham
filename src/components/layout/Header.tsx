import { Search, ShoppingCart, Heart, User, Menu, Phone, Mail, Sparkles, ChevronDown } from 'lucide-react';
import { Settings, UserData } from '../../types';

interface HeaderProps {
  settings: Settings;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentView: (view: any) => void;
  setIsCartOpen: (open: boolean) => void;
  cartItemsCount: number;
  setIsWishlistOpen: (open: boolean) => void;
  wishlistCount: number;
  user: UserData | null;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsMenuOpen: (open: boolean) => void;
  currentView: string;
  setProductsKey: (cb: (k: number) => number) => void;
}

export const Header = ({
  settings, searchQuery, setSearchQuery, setCurrentView, setIsCartOpen,
  cartItemsCount, setIsWishlistOpen, wishlistCount, user, setIsAuthModalOpen, setIsMenuOpen, currentView, setProductsKey
}: HeaderProps) => {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#FCE8ED] text-[#4A2C2C] py-2 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[11px] md:text-xs">
        <div className="flex gap-4 mb-2 md:mb-0">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {settings.phone}</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {settings.email}</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 font-bold"><Sparkles className="w-3 h-3 text-[#F4B5C6]" /> {settings.topBarText}</span>
        </div>
      </div>

      {/* Header */}
      <header className="px-4 md:px-8 py-5 border-b border-[#FCE8ED] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-10 h-10 border-2 border-[#F4B5C6] rounded-full flex items-center justify-center p-0.5">
              <div className="w-full h-full border border-[#4A2C2C] rounded-full flex items-center justify-center bg-[#FCE8ED]">
                <Sparkles className="w-5 h-5 text-[#4A2C2C]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="font-serif">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#4A2C2C] leading-none uppercase">{settings.storeName}</h1>
              <p className="text-[9px] md:text-[10px] tracking-widest text-[#F4B5C6] font-bold uppercase mt-1">Cosmetics</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); setCurrentView('products'); }} className="hidden md:flex flex-1 max-w-2xl relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm yêu thích..." 
              className="w-full px-6 py-3 rounded-full border border-[#FCE8ED] bg-gray-50 focus:bg-white focus:border-[#F4B5C6] focus:ring-2 focus:ring-[#FCE8ED] outline-none transition-all placeholder:text-gray-400 text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#F4B5C6] text-white rounded-full hover:bg-[#4A2C2C] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <button className="text-[#4A2C2C] hover:text-[#F4B5C6] transition-colors relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4B5C6] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemsCount}</span>
              )}
            </button>
            <button className="text-[#4A2C2C] hover:text-[#F4B5C6] transition-colors relative hidden md:block" onClick={() => setIsWishlistOpen(true)}>
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4B5C6] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
              )}
            </button>
            <button className="text-[#4A2C2C] hover:text-[#F4B5C6] transition-colors hidden md:block" onClick={() => user ? setCurrentView('profile') : setIsAuthModalOpen(true)}>
              <User className="w-5 h-5" />
            </button>
            <button 
              className="md:hidden text-[#4A2C2C]"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={(e) => { e.preventDefault(); setCurrentView('products'); }} className="md:hidden mt-4 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..." 
            className="w-full px-4 py-2.5 rounded-full border border-[#FCE8ED] bg-gray-50 outline-none text-sm"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </button>
        </form>
      </header>

      {/* Navigation */}
      <nav className="hidden md:flex justify-center items-center py-4 gap-8 font-medium text-sm text-[#4A2C2C]">
        <a href="#" className={`hover:text-[#F4B5C6] transition-colors ${currentView === 'home' ? 'text-[#F4B5C6]' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Trang Chủ</a>
        
        {/* Sản Phẩm Dropdown */}
        <div className="relative group cursor-pointer h-full flex items-center py-2">
          <div className={`flex items-center gap-1 hover:text-[#F4B5C6] transition-colors ${currentView === 'products' ? 'text-[#F4B5C6]' : ''}`} onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); }}>
            Sản Phẩm <ChevronDown className="w-4 h-4" />
          </div>
          <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-3">
            {settings.categories.filter(c => c !== 'Tất cả').map(category => (
              <a key={category} href="#" className="px-5 py-2.5 hover:bg-[#FCE8ED] hover:text-[#F4B5C6] transition-colors text-sm" onClick={(e) => { e.preventDefault(); setSearchQuery(category); setCurrentView('products'); }}>{category}</a>
            ))}
          </div>
        </div>

        {/* Thương Hiệu Dropdown */}
        <div className="relative group cursor-pointer h-full flex items-center py-2">
          <div className="flex items-center gap-1 hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setCurrentView('products'); setProductsKey(k => k + 1); }}>
            Thương Hiệu <ChevronDown className="w-4 h-4" />
          </div>
          <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-3">
            {settings.brands.map(brand => (
              <a key={brand} href="#" className="px-5 py-2.5 hover:bg-[#FCE8ED] hover:text-[#F4B5C6] transition-colors text-sm" onClick={(e) => { e.preventDefault(); setSearchQuery(brand); setCurrentView('products'); }}>{brand}</a>
            ))}
          </div>
        </div>

        <a href="#" className="hover:text-[#F4B5C6] transition-colors py-2" onClick={(e) => { e.preventDefault(); setSearchQuery('Khuyến mãi'); setCurrentView('products'); setProductsKey(k => k + 1); }}>Khuyến Mãi</a>

        <a href="#" className="hover:text-[#F4B5C6] transition-colors py-2" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>
            <a href="#" className={`hover:text-[#F4B5C6] transition-colors py-2 ${currentView === 'blog' || currentView === 'post_detail' ? 'text-[#F4B5C6]' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('blog'); }}>Góc Làm Đẹp</a>
      </nav>
    </>
  );
};
