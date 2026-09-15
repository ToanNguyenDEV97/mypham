const fs = require('fs');

let pv = fs.readFileSync('src/components/views/ProductsView.tsx', 'utf8');
pv = pv.replace("import { products, bodyCareProducts } from '../../data/mockData';", "import { products as mockProducts, bodyCareProducts } from '../../data/mockData';");
fs.writeFileSync('src/components/views/ProductsView.tsx', pv);

let hv = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');
hv = hv.replace("import { products, bodyCareProducts, reviews, blogPosts, instagramPosts } from '../../data/mockData';", "import { reviews, blogPosts, instagramPosts } from '../../data/mockData';");
fs.writeFileSync('src/components/views/HomeView.tsx', hv);
