const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes("PolicyView")) {
  code = code.replace(
    "import { BlogView } from './components/views/BlogView';",
    "import { BlogView } from './components/views/BlogView';\nimport { PolicyView } from './components/views/PolicyView';"
  );
}

// Add state
const targetState = `  const [selectedPost, setSelectedPost] = useState<Post | null>(null);`;
const replaceState = `  const [selectedPost, setSelectedPost] = useState<Post | null>(null);\n  const [selectedPolicySlug, setSelectedPolicySlug] = useState<string | null>(null);`;
if (!code.includes("selectedPolicySlug")) {
  code = code.replace(targetState, replaceState);
}

// Update useUrlSync call
const targetUrl = `  useUrlSync(
    currentView, setCurrentView,
    searchQuery, setSearchQuery,
    selectedProduct, setSelectedProduct,
    selectedPost, setSelectedPost
  );`;
const replaceUrl = `  useUrlSync(
    currentView, setCurrentView,
    searchQuery, setSearchQuery,
    selectedProduct, setSelectedProduct,
    selectedPost, setSelectedPost,
    selectedPolicySlug, setSelectedPolicySlug
  );`;
if (code.includes(targetUrl)) {
  code = code.replace(targetUrl, replaceUrl);
}

// Add PolicyView to render
const targetRender = `          ) : currentView === 'post_detail' && selectedPost ? (
            <PostDetailView post={selectedPost} onBack={() => setCurrentView('blog')} />
          ) : (`;
const replaceRender = `          ) : currentView === 'post_detail' && selectedPost ? (
            <PostDetailView post={selectedPost} onBack={() => setCurrentView('blog')} />
          ) : currentView === 'policy_page' && selectedPolicySlug ? (
            <PolicyView slug={selectedPolicySlug} onBack={() => setCurrentView('home')} />
          ) : (`;
if (code.includes(targetRender)) {
  code = code.replace(targetRender, replaceRender);
}

// Add selectedPolicySlug to Footer
const targetFooter = `      <Footer 
        settings={settings}
        setCurrentView={setCurrentView}
        setSearchQuery={setSearchQuery}
        setProductsKey={setProductsKey}
        setIsMenuOpen={setIsMenuOpen}
      />`;
const replaceFooter = `      <Footer 
        settings={settings}
        setCurrentView={setCurrentView}
        setSearchQuery={setSearchQuery}
        setProductsKey={setProductsKey}
        setIsMenuOpen={setIsMenuOpen}
        setSelectedPolicySlug={setSelectedPolicySlug}
      />`;
if (code.includes(targetFooter)) {
  code = code.replace(targetFooter, replaceFooter);
}

fs.writeFileSync('src/App.tsx', code);
