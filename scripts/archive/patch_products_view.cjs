const fs = require('fs');
let code = fs.readFileSync('src/components/views/ProductsView.tsx', 'utf8');

const oldLogic = `      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const combinedMap = new Map();
        [...products, ...bodyCareProducts].forEach(p => combinedMap.set(String(p.id), p));
        fetchedProducts.forEach(p => combinedMap.set(String(p.id), p));
        setAllProducts(Array.from(combinedMap.values()));
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([...products, ...bodyCareProducts]);
      }`;

const newLogic = `      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        setAllProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Không tải được sản phẩm, vui lòng thử lại');
      }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/views/ProductsView.tsx', code);
