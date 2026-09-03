const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const propsTarget = `export const HomeView = ({ setSelectedProduct, addToCart, wishlist, toggleWishlist }: any) => {`;
const propsReplacement = `export const HomeView = ({ setSelectedProduct, addToCart, wishlist, toggleWishlist, onNavigateToBlog, onPostClick }: any) => {`;
code = code.replace(propsTarget, propsReplacement);

const stateTarget = `const [homeProducts, setHomeProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);`;
const stateReplacement = `const [homeProducts, setHomeProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>(blogPosts);`;
code = code.replace(stateTarget, stateReplacement);

const fetchTarget = `        if (bannersSnapshot.docs.length > 0) {
          setBanners(bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setBanners([
            { id: 1, image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=2000", title: "Mỹ Phẩm Hữu Cơ", subtitle: "Làm đẹp từ thiên nhiên" }
          ]);
        }
      } catch (error) {`;
const fetchReplacement = `        if (bannersSnapshot.docs.length > 0) {
          setBanners(bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setBanners([
            { id: 1, image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=2000", title: "Mỹ Phẩm Hữu Cơ", subtitle: "Làm đẹp từ thiên nhiên" }
          ]);
        }

        const postsQuery = query(collection(db, 'posts'), limit(3));
        const postsSnapshot = await getDocs(postsQuery);
        if (postsSnapshot.docs.length > 0) {
          setRecentPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {`;
code = code.replace(fetchTarget, fetchReplacement);

const blogRenderTarget = `<a href="#" className="text-sm font-bold text-[#F4B5C6] hover:text-[#4A2C2C] transition-colors uppercase tracking-wider">Xem Tất Cả</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map(post => (
              <div key={post.id} className="group cursor-pointer">`;
const blogRenderReplacement = `<button onClick={() => onNavigateToBlog?.()} className="text-sm font-bold text-[#F4B5C6] hover:text-[#4A2C2C] transition-colors uppercase tracking-wider">Xem Tất Cả</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.slice(0,3).map(post => (
              <div key={post.id} className="group cursor-pointer" onClick={() => onPostClick?.(post)}>`;
code = code.replace(blogRenderTarget, blogRenderReplacement);

fs.writeFileSync('src/components/views/HomeView.tsx', code);
