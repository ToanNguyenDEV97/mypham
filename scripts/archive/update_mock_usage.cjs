const fs = require('fs');

// ProductsView
let pv = fs.readFileSync('src/components/views/ProductsView.tsx', 'utf8');

pv = pv.replace(
  "import { products as mockProducts, bodyCareProducts } from '../../data/mockData';",
  "import { products as mockProducts, bodyCareProducts } from '../../data/mockData';"
); // restore it if needed, or I can just re-import it properly

if (!pv.includes("import { products as mockProducts")) {
  pv = pv.replace(
    "import { useState, useMemo } from 'react';",
    "import { useState, useMemo } from 'react';\nimport { products as mockProducts, bodyCareProducts } from '../../data/mockData';"
  );
}

const pvOldFetch = `        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        setAllProducts(fetchedProducts);`;
const pvNewFetch = `        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        if (fetchedProducts.length === 0) {
          setAllProducts([...mockProducts, ...bodyCareProducts]);
          setIsUsingMockData(true);
        } else {
          setAllProducts(fetchedProducts);
          setIsUsingMockData(false);
        }`;
pv = pv.replace(pvOldFetch, pvNewFetch);

pv = pv.replace(
  "const [error, setError] = useState<string | null>(null);",
  "const [error, setError] = useState<string | null>(null);\n  const [isUsingMockData, setIsUsingMockData] = useState(false);"
);

pv = pv.replace(
  `{error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}`,
  `{error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}
        {isUsingMockData && !error && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-6 border border-yellow-200 text-sm">
            <strong>Lưu ý:</strong> Đây là dữ liệu mẫu. Hiện chưa có sản phẩm thật nào trong hệ thống.
          </div>
        )}`
);

fs.writeFileSync('src/components/views/ProductsView.tsx', pv);

// HomeView
let hv = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');
if (!hv.includes("products as mockProducts")) {
  hv = hv.replace(
    "import { reviews, blogPosts, instagramPosts } from '../../data/mockData';",
    "import { products as mockProducts, bodyCareProducts, reviews, blogPosts, instagramPosts } from '../../data/mockData';"
  );
}

const hvOldFetch = `        const fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        setHomeProducts(fetchedProducts.slice(0, 8)); // maybe 8 is better, or just 4`;
const hvNewFetch = `        const fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        if (fetchedProducts.length === 0) {
          setHomeProducts([...mockProducts, ...bodyCareProducts].slice(0, 8));
          setIsUsingMockData(true);
        } else {
          setHomeProducts(fetchedProducts.slice(0, 8));
        }`;

hv = hv.replace(hvOldFetch, hvNewFetch);

hv = hv.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [isUsingMockData, setIsUsingMockData] = useState(false);"
);

hv = hv.replace(
  `{/* Best Sellers Section */}`,
  `{/* Best Sellers Section */}
      {isUsingMockData && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-4">
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 text-sm">
            <strong>Lưu ý:</strong> Dưới đây là dữ liệu mẫu. Hiện chưa có sản phẩm thật nào trong hệ thống.
          </div>
        </div>
      )}`
);

fs.writeFileSync('src/components/views/HomeView.tsx', hv);
