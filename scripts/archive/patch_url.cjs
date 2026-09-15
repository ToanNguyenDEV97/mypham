const fs = require('fs');
let code = fs.readFileSync('src/hooks/useUrlSync.ts', 'utf8');

const target1 = `  selectedPost: Post | null,
  setSelectedPost: (p: Post | null) => void
) => {`;
const replace1 = `  selectedPost: Post | null,
  setSelectedPost: (p: Post | null) => void,
  selectedPolicySlug: string | null,
  setSelectedPolicySlug: (s: string | null) => void
) => {`;
code = code.replace(target1, replace1);

const target2 = `    if (currentView === 'post_detail' && selectedPost) {
      params.set('postId', selectedPost.id.toString());
    } else {
      params.delete('postId');
    }`;
const replace2 = `    if (currentView === 'post_detail' && selectedPost) {
      params.set('postId', selectedPost.id.toString());
    } else {
      params.delete('postId');
    }
    
    if (currentView === 'policy_page' && selectedPolicySlug) {
      params.set('policy', selectedPolicySlug);
    } else {
      params.delete('policy');
    }`;
code = code.replace(target2, replace2);

const target3 = `      const id = params.get('id');
      const postId = params.get('postId');`;
const replace3 = `      const id = params.get('id');
      const postId = params.get('postId');
      const policy = params.get('policy');`;
code = code.replace(target3, replace3);

const target4 = `      if (view === 'post_detail' && postId) {`;
const replace4 = `      if (view === 'policy_page' && policy) {
        setSelectedPolicySlug(policy);
      }
      
      if (view === 'post_detail' && postId) {`;
code = code.replace(target4, replace4);

const target5 = `  }, [currentView, searchQuery, selectedProduct, selectedPost]);`;
const replace5 = `  }, [currentView, searchQuery, selectedProduct, selectedPost, selectedPolicySlug]);`;
code = code.replace(target5, replace5);

const target6 = `  }, [setCurrentView, setSearchQuery, setSelectedProduct, setSelectedPost]);`;
const replace6 = `  }, [setCurrentView, setSearchQuery, setSelectedProduct, setSelectedPost, setSelectedPolicySlug]);`;
code = code.replace(target6, replace6);

fs.writeFileSync('src/hooks/useUrlSync.ts', code);
