import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export const ProductCard: React.FC<{ product: any; onClick?: () => void; onAddToCart?: (product: any) => void; isWishlisted?: boolean; onToggleWishlist?: (product: any) => void }> = ({ product, onClick, onAddToCart, isWishlisted, onToggleWishlist }) => (
  <div className="group flex flex-col bg-white">
    <div className="aspect-[4/5] relative bg-[#FCE8ED] overflow-hidden rounded-2xl mb-3">
      <div 
        className="absolute top-2 right-2 bg-white p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#F4B5C6] shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleWishlist) onToggleWishlist(product);
        }}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#F4B5C6] text-[#F4B5C6]' : ''}`} />
      </div>
      <img 
        src={product.image} 
        alt={product.name} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
        onClick={onClick}
      />
      <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          className="w-full bg-white/90 backdrop-blur-sm text-[#4A2C2C] hover:bg-[#4A2C2C] hover:text-white font-bold py-2.5 rounded-full text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product);
          }}
        >
          <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
        </button>
      </div>
    </div>
    <h3 
      className="text-sm md:text-base font-semibold text-[#4A2C2C] mb-1 truncate group-hover:text-[#F4B5C6] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {product.name}
    </h3>
    <div className="flex gap-1 mb-2">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < product.rating ? 'fill-[#F4B5C6] text-[#F4B5C6]' : 'fill-gray-200 text-gray-200'}`} />
      ))}
      <span className="text-xs text-gray-400 ml-1">{product.rating}.0/5</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-bold text-[#4A2C2C] text-lg">{product.newPrice || product.price}</span>
      {product.oldPrice && <span className="text-sm text-gray-400 line-through">{product.oldPrice}</span>}
      {product.discount && (
        <span className="bg-[#FCE8ED] text-[#F4B5C6] text-[10px] font-bold px-1.5 py-0.5 rounded">{product.discount}</span>
      )}
    </div>
  </div>
);

