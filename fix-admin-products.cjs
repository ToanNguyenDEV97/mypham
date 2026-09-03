const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const target1 = `  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;`;

const replacement1 = `  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;`;

code = code.replace(target1, replacement1);

const target2 = `              displayProducts.map((product) => (`;
const replacement2 = `              currentProducts.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp</td></tr>
              ) : currentProducts.map((product) => (`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
