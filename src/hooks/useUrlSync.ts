import { useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useUrlSync = (
  currentView: string,
  setCurrentView: (view: any) => void,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  selectedProduct: any,
  setSelectedProduct: (p: any) => void,
  selectedPost: any,
  setSelectedPost: (p: any) => void
) => {
  const isInitialLoad = useRef(true);

  // Sync state to URL
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    const params = new URLSearchParams(window.location.search);
    
    if (currentView !== 'home') {
      params.set('view', currentView);
    } else {
      params.delete('view');
    }
    
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    if (currentView === 'product_detail' && selectedProduct) {
      params.set('id', selectedProduct.id.toString());
    } else {
      params.delete('id');
    }
    
    if (currentView === 'post_detail' && selectedPost) {
      params.set('postId', selectedPost.id.toString());
    } else {
      params.delete('postId');
    }
    
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    
    if (window.location.search !== (params.toString() ? '?' + params.toString() : '')) {
      window.history.pushState({}, '', newUrl);
    }
  }, [currentView, searchQuery, selectedProduct, selectedPost]);

  // Handle popstate (back/forward)
  useEffect(() => {
    const handlePopState = async () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') || 'home';
      const q = params.get('q') || '';
      const id = params.get('id');
      const postId = params.get('postId');
      
      setCurrentView(view as any);
      setSearchQuery(q);
      
      if (view === 'product_detail' && id) {
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSelectedProduct({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching product from URL:', error);
        }
      }
      
      if (view === 'post_detail' && postId) {
        try {
          const docRef = doc(db, 'posts', postId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSelectedPost({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching post from URL:', error);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // On initial load, read from URL
    handlePopState();
    isInitialLoad.current = false;
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentView, setSearchQuery, setSelectedProduct, setSelectedPost]);
};
