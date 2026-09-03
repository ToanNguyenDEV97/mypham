const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('import { useUrlSync }')) {
  appCode = "import { useUrlSync } from './hooks/useUrlSync';\n" + appCode;
}

// Find the place to inject the hook
// It should be inside the App component, right after all the states are declared.

const stateEndRegex = /const \[showSuccess, setShowSuccess\] = useState\(false\);/;
if (appCode.match(stateEndRegex)) {
  const insertIndex = appCode.search(stateEndRegex) + "const [showSuccess, setShowSuccess] = useState(false);".length;
  
  const hookCall = `\n\n  useUrlSync(\n    currentView, setCurrentView,\n    searchQuery, setSearchQuery,\n    selectedProduct, setSelectedProduct,\n    selectedPost, setSelectedPost\n  );\n`;
  
  appCode = appCode.slice(0, insertIndex) + hookCall + appCode.slice(insertIndex);
  
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('App.tsx updated');
} else {
  console.log('Could not find where to insert');
}
