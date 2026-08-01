import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';

const API = 'https://shopapp-backend-1bio.onrender.com';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const categories = ['All', 'Shoes', 'Shirts', 'Pants', 'Bags', 'Electronics', 'Food', 'Beauty', 'Home', 'Sports', 'Toys', 'Books', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, category, sortBy, minPrice, maxPrice]);

  const fetchProducts = async (keyword = '') => {
    try {
      const { data } = await axios.get(`${API}/api/products?search=${keyword}`);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (category !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice !== '') {
      result = result.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice !== '') {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
    }

    setFiltered(result);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const clearFilters = () => {
    setCategory('All');
    setSortBy('latest');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    fetchProducts('');
  };

  const getCategoryCount = (cat) => {
    if (cat === 'All') return products.length;
    return products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .aesthetic-home {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.9), rgba(235, 225, 215, 0.7)),
                      #f5efe9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1e1e1e;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        /* Hero Section - Glass effect optional but keep clean */
        .hero-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .hero-section h1 {
          font-size: 2.8rem;
          font-weight: 600;
          background: linear-gradient(135deg, #2c2c2c, #9b7b5c);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .hero-section p {
          color: #6b5a48;
          font-size: 0.95rem;
          font-weight: 400;
          backdrop-filter: blur(4px);
        }

        /* Search Bar - Glass + iOS shadow */
        .search-section {
          display: flex;
          justify-content: center;
          margin-bottom: 2.5rem;
        }

        .search-wrapper {
          display: flex;
          width: 100%;
          max-width: 540px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 60px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02), inset 0 0 0 0.5px rgba(255,255,255,0.8);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .search-wrapper:focus-within {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08), 0 0 0 2px rgba(139, 109, 77, 0.2);
          background: rgba(255, 255, 255, 0.85);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.9rem 1.5rem;
          font-size: 0.95rem;
          font-family: 'Inter', monospace;
          outline: none;
          color: #2c2c2c;
          border-radius: 60px;
        }

        .search-input::placeholder {
          color: #a8957e;
          font-weight: 400;
        }

        .search-btn {
          background: #2c2c2c;
          border: none;
          border-radius: 60px;
          padding: 0 1.8rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .search-btn:hover {
          background: #4a3f33;
          transform: scale(0.97);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }

        /* Layout */
        .layout-grid {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        /* Glass Sidebar - iPhone style */
        .filters-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 1.5rem;
          position: sticky;
          top: 80px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .sidebar-title {
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          color: #4f3f2f;
          margin-bottom: 1rem;
          border-bottom: 1.5px solid rgba(0,0,0,0.08);
          padding-bottom: 0.65rem;
          text-transform: uppercase;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #4f3f2f;
          transition: all 0.2s ease;
          margin-bottom: 2px;
        }

        .category-item:hover {
          background: rgba(0,0,0,0.05);
          color: #1e1e1e;
        }

        .category-item.active {
          background: rgba(44, 44, 44, 0.9);
          color: white;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .category-count {
          font-size: 0.7rem;
          background: rgba(0,0,0,0.08);
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 500;
        }

        .category-item.active .category-count {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .price-filter {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0,0,0,0.06);
        }

        .filter-label {
          font-weight: 600;
          font-size: 0.8rem;
          margin-bottom: 0.8rem;
          color: #4f3f2f;
        }

        .price-range-inputs {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .price-input {
          width: 100%;
          padding: 8px 10px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 20px;
          font-family: 'Inter', monospace;
          font-size: 0.8rem;
          color: #1e1e1e;
          outline: none;
          transition: 0.2s;
          backdrop-filter: blur(4px);
        }

        .price-input:focus {
          border-color: #b8a68c;
          box-shadow: 0 0 0 3px rgba(90, 78, 62, 0.1);
        }

        .clear-filters {
          width: 100%;
          margin-top: 1.5rem;
          padding: 9px 0;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.05);
          color: #4f3f2f;
          border-radius: 40px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .clear-filters:hover {
          background: rgba(255,255,255,0.8);
          border-color: rgba(0,0,0,0.1);
          color: #1e1e1e;
          transform: scale(0.98);
        }

        /* Products Area */
        .products-area {
          flex: 1;
          min-width: 0;
        }

        /* Sort Bar Glass */
        .sort-bar {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(8px);
          padding: 0.7rem 1rem;
          border-radius: 60px;
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .sort-label {
          color: #6b5a48;
          font-size: 0.75rem;
          font-weight: 500;
          margin-right: 0.25rem;
        }

        .sort-button {
          padding: 6px 18px;
          border-radius: 40px;
          border: 1px solid rgba(0,0,0,0.05);
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(4px);
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          color: #4f3f2f;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .sort-button.active {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .sort-button:hover:not(.active) {
          background: rgba(255,255,255,0.9);
          transform: translateY(-1px);
        }

        .results-count {
          color: #6b5a48;
          font-size: 0.75rem;
          font-weight: 500;
          background: rgba(255,255,255,0.5);
          padding: 6px 14px;
          border-radius: 40px;
          backdrop-filter: blur(4px);
          margin-left: auto;
        }

        /* Loader */
        .loader {
          display: flex;
          justify-content: center;
          padding: 3rem;
        }

        .spinner {
          width: 44px;
          height: 44px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top: 2px solid #6b5e4e;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Glass Product Cards - iPhone style */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.8rem;
        }

        .product-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          border-radius: 32px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 36px -12px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.05);
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .product-image-wrapper {
          height: 220px;
          background: rgba(245, 240, 235, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.04);
        }

        .no-image-placeholder {
          color: #a8957e;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .product-info {
          padding: 1.2rem 1rem 0.8rem;
        }

        .product-name {
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #1e1e1e;
          margin-bottom: 0.2rem;
        }

        .product-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2c2c2c;
          margin: 0.3rem 0;
        }

        .rating-stars {
          display: flex;
          gap: 2px;
          align-items: center;
          margin: 5px 0;
        }

        .product-stock {
          font-size: 0.7rem;
          color: #8f7a64;
          margin-top: 4px;
          font-weight: 500;
        }

        .add-to-cart {
          width: calc(100% - 2rem);
          margin: 0 1rem 1.2rem 1rem;
          background: rgba(44, 44, 44, 0.9);
          backdrop-filter: blur(4px);
          border: none;
          padding: 0.7rem;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 40px;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .add-to-cart:hover {
          background: #2c2c2c;
          transform: scale(0.98);
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }

        .no-products {
          text-align: center;
          color: #6b5a48;
          padding: 3rem;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(12px);
          border-radius: 48px;
          border: 1px solid rgba(255,255,255,0.5);
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filters-sidebar {
            display: none;
          }
          .hero-section h1 { font-size: 2rem; }
          .container { padding: 1.2rem; }
          .products-grid { gap: 1rem; }
          .sort-bar { border-radius: 32px; padding: 0.5rem 1rem; }
        }
      `}</style>

      <div className="aesthetic-home">
        <div className="container">
          <div className="hero-section">
            <h1>aesthetic finds</h1>
            <p>curated with intention · timeless pieces</p>
          </div>

          <form onSubmit={handleSearch} className="search-section">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                search
              </button>
            </div>
          </form>

          <div className="layout-grid">
            {/* Glass Sidebar */}
            <div className="filters-sidebar">
              <div className="sidebar-title">categories</div>
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`category-item ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="category-count">{getCategoryCount(cat)}</span>
                </div>
              ))}

              <div className="price-filter">
                <div className="filter-label">price range</div>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <span style={{ color: '#8f7a64' }}>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>

              <button className="clear-filters" onClick={clearFilters}>
                clear all filters
              </button>
            </div>

            {/* Products Grid Area */}
            <div className="products-area">
              <div className="sort-bar">
                <span className="sort-label">sort by:</span>
                {[
                  { key: 'latest', label: 'latest' },
                  { key: 'popular', label: 'popular' },
                  { key: 'rating', label: 'top rated' },
                  { key: 'price_low', label: 'price ↑' },
                  { key: 'price_high', label: 'price ↓' },
                ].map((s) => (
                  <button
                    key={s.key}
                    className={`sort-button ${sortBy === s.key ? 'active' : ''}`}
                    onClick={() => setSortBy(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
                <span className="results-count">{filtered.length} items</span>
              </div>

              {loading ? (
                <div className="loader">
                  <div className="spinner"></div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="no-products">no products found · try adjusting filters</div>
              ) : (
                <div className="products-grid">
                  {filtered.map((product) => (
                    <div key={product._id} className="product-card">
                      <div onClick={() => navigate(`/product/${product._id}`)}>
                        <div className="product-image-wrapper">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="product-image" />
                          ) : (
                            <div className="no-image-placeholder">no image</div>
                          )}
                        </div>
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-price">₱{product.price.toLocaleString()}</div>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                style={{
                                  color: star <= Math.round(product.ratings || 0) ? '#f5b042' : '#e0d4c8',
                                  fontSize: '13px',
                                }}
                              >
                                ★
                              </span>
                            ))}
                            <span style={{ fontSize: '11px', color: '#8f7a64', marginLeft: '4px' }}>
                              ({product.numReviews || 0})
                            </span>
                          </div>
                          <div className="product-stock">stock: {product.stock}</div>
                        </div>
                      </div>
                      <button
                        className="add-to-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(product);
                        }}
                      >
                        add to cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;