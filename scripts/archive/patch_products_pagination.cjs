const fs = require('fs');
let code = fs.readFileSync('src/components/views/ProductsView.tsx', 'utf8');

if (!code.includes("import { Pagination }")) {
  code = code.replace(
    "import { SEO } from '../ui/SEO';",
    "import { SEO } from '../ui/SEO';\nimport { Pagination } from '../ui/Pagination';"
  );
}

// Add state
const oldState = `  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);`;
const newState = `  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCat, priceFilters, brandFilters, sortOrder, searchQuery]);

  // Scroll to top on page change
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);`;
if (!code.includes("setCurrentPage(1)")) {
  code = code.replace(oldState, newState);
}

// Update paginated products logic before return
const paginatedLogicOld = `  });

  return (
    <>
      <SEO`;
const paginatedLogicNew = `  });

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <SEO`;
if (!code.includes("const paginatedProducts =")) {
  code = code.replace(paginatedLogicOld, paginatedLogicNew);
}

// Update the render list
code = code.replace(
  "filteredAndSortedProducts.map(product => (",
  "paginatedProducts.map(product => ("
);

// Replace pagination UI
const oldPagination = `          {filteredAndSortedProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
               <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                 <button className="w-10 h-10 rounded-full bg-[#F4B5C6] text-white flex items-center justify-center font-bold shadow-md">1</button>
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors font-bold text-gray-600">2</button>
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#F4B5C6] hover:text-[#F4B5C6] transition-colors"><ChevronRight className="w-5 h-5" /></button>
               </div>
            </div>
          )}`;
const newPagination = `          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}`;
if (code.includes(oldPagination)) {
  code = code.replace(oldPagination, newPagination);
}

fs.writeFileSync('src/components/views/ProductsView.tsx', code);
