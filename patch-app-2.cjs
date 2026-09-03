const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHomeView = `<HomeView setSelectedProduct={handleProductClick} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />`;
const newHomeView = `<HomeView setSelectedProduct={handleProductClick} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} onNavigateToBlog={() => setCurrentView('blog')} onPostClick={(post: any) => { setSelectedPost(post); setCurrentView('post_detail'); }} />`;

code = code.replace(oldHomeView, newHomeView);

fs.writeFileSync('src/App.tsx', code);
