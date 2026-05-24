import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';

const API = 'https://shopapp-backend-1bio.onrender.com'

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

  const categories = ['All', 'Shoes', 'Shirts', 'Pants', 'Bags', 'Electronics', 'Food', 'Beauty', 'Home', 'Sports', 'Toys', 'Books', 'Other']

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
    let result = [...products]

    if (category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }

    if (minPrice !== '') {
      result = result.filter(p => p.price >= Number(minPrice))
    }

    if (maxPrice !== '') {
      result = result.filter(p => p.price <= Number(maxPrice))
    }

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0))
    }

    setFiltered(result)
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const clearFilters = () => {
    setCategory('All')
    setSortBy('latest')
    setMinPrice('')
    setMaxPrice('')
    setSearch('')
    fetchProducts('')
  }

  const getCategoryCount = (cat) => {
    if (cat === 'All') return products.length
    return products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .synth-home { min-height: 100vh; background: linear-gradient(180deg, #0e0a1f 0%, #2a1030 40%, #1a0a2a 100%); position: relative; overflow-x: hidden; font-family: 'Orbitron', 'Roboto Mono', monospace; }
        .grid-floor-home { position: fixed; bottom: 0; left: 0; width: 100%; height: 40%; background-image: repeating-linear-gradient(90deg, #ff44aa30 0px, #ff44aa30 2px, transparent 2px, transparent 40px); transform: skewX(-20deg) scaleY(0.4); transform-origin: bottom center; animation: gridMove 10s linear infinite; pointer-events: none; z-index: 0; }
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 80px 0; } }
        .retro-sun-home { position: fixed; top: 5%; right: 5%; width: 250px; height: 250px; background: radial-gradient(circle, #ffaa44, #ff44aa); border-radius: 50%; filter: blur(30px); opacity: 0.4; animation: sunPulse 4s infinite alternate; pointer-events: none; z-index: 0; }
        @keyframes sunPulse { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.2); opacity: 0.6; } }
        .vhs-home { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 8px); pointer-events: none; z-index: 1; }
        .home-content { position: relative; z-index: 2; max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem; }
        .hero-synth { text-align: center; padding: 2rem 1rem; }
        .hero-synth h1 { font-size: 3rem; background: linear-gradient(135deg, #ffaa44, #ff44aa); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 0 8px #ff44aa; letter-spacing: 4px; }
        .hero-synth p { color: #ffaa44; font-family: monospace; font-size: 0.9rem; }
        .search-synth { display: flex; justify-content: center; margin: 1.5rem auto; max-width: 550px; }
        .search-box { display: flex; width: 100%; background: rgba(20,10,30,0.7); backdrop-filter: blur(8px); border: 1px solid #ffaa44; border-radius: 60px; transition: 0.2s; }
        .search-box:focus-within { border-color: #ff44aa; box-shadow: 0 0 12px #ff44aa; }
        .search-input { flex: 1; background: transparent; border: none; padding: 0.8rem 1.2rem; color: #ffaa44; font-family: monospace; outline: none; }
        .search-input::placeholder { color: #ffaa4480; }
        .search-btn { background: #ff44aa; border: none; border-radius: 60px; padding: 0 1.5rem; font-family: 'Orbitron', monospace; font-weight: bold; color: #0e0a1f; cursor: pointer; }
        .search-btn:hover { background: #ffaa44; box-shadow: 0 0 10px #ffaa44; }

        /* MAIN LAYOUT */
        .main-layout { display: flex; gap: 1.5rem; align-items: flex-start; }

        /* SIDEBAR */
        .sidebar { width: 220px; flex-shrink: 0; background: rgba(20,10,30,0.7); backdrop-filter: blur(8px); border: 1px solid #ffaa4466; border-radius: 16px; padding: 1.2rem; position: sticky; top: 80px; }
        .sidebar-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 1rem; border-bottom: 1px solid #ffaa4433; padding-bottom: 0.5rem; }
        .cat-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-family: 'Roboto Mono', monospace; font-size: 0.75rem; color: #aaa; transition: 0.15s; margin-bottom: 2px; }
        .cat-item:hover { background: rgba(255,170,68,0.1); color: #ffaa44; }
        .cat-item.active { background: rgba(255,68,170,0.15); color: #ff44aa; border: 1px solid #ff44aa33; }
        .cat-count { font-size: 0.65rem; background: rgba(255,170,68,0.15); color: #ffaa44; padding: 1px 6px; border-radius: 10px; }
        .cat-item.active .cat-count { background: rgba(255,68,170,0.2); color: #ff44aa; }
        .filter-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ffaa4433; }
        .filter-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.7rem; letter-spacing: 1px; margin-bottom: 0.8rem; }
        .price-inputs { display: flex; gap: 6px; align-items: center; }
        .price-input { width: 100%; padding: 5px 8px; background: rgba(255,170,68,0.05); border: 1px solid #ffaa4466; border-radius: 6px; color: #ffaa44; font-family: monospace; font-size: 12px; box-sizing: border-box; }
        .price-input:focus { outline: none; border-color: #ff44aa; }
        .price-sep { color: #888; font-size: 12px; }
        .clear-btn { width: 100%; margin-top: 1rem; padding: 7px; background: transparent; border: 1px solid #ff44aa; color: #ff44aa; border-radius: 20px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.65rem; letter-spacing: 1px; }
        .clear-btn:hover { background: #ff44aa; color: #0e0a1f; }

        /* PRODUCTS AREA */
        .products-area { flex: 1; min-width: 0; }
        .sort-bar { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .sort-label { color: #888; font-size: 0.75rem; font-family: 'Roboto Mono', monospace; }
        .sort-btn { padding: 5px 14px; border-radius: 20px; border: 1px solid #ffaa4466; background: transparent; color: #aaa; font-family: 'Roboto Mono', monospace; font-size: 0.75rem; cursor: pointer; }
        .sort-btn.active { background: #ff44aa; border-color: #ff44aa; color: #0e0a1f; }
        .sort-btn:hover { border-color: #ffaa44; color: #ffaa44; }
        .results-count { color: #888; font-size: 0.75rem; font-family: 'Roboto Mono', monospace; margin-left: auto; }

        /* GRID */
        .loader-synth { display: flex; justify-content: center; padding: 3rem; }
        .retro-spinner { width: 50px; height: 50px; border: 3px solid #ff44aa30; border-top: 3px solid #ffaa44; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .grid-synth { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
        .card-synth { background: rgba(20,10,30,0.65); backdrop-filter: blur(8px); border: 1px solid #ffaa44; border-radius: 24px; overflow: hidden; transition: 0.25s; cursor: pointer; }
        .card-synth:hover { transform: translateY(-6px); border-color: #ff44aa; box-shadow: 0 0 20px #ff44aa; }
        .img-wrapper-synth { height: 180px; background: #0a0515; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #ff44aa; }
        .product-img-synth { width: 100%; height: 100%; object-fit: cover; }
        .no-img-synth { color: #ffaa44; font-family: monospace; font-size: 0.75rem; }
        .info-synth { padding: 1rem; color: #ffaa44; }
        .name-synth { font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .price-synth { font-size: 1.1rem; color: #ff44aa; margin: 0.3rem 0; }
        .stars-synth { display: flex; gap: 2px; align-items: center; margin: 3px 0; }
        .stock-synth { font-size: 0.65rem; opacity: 0.7; }
        .add-synth { width: 100%; background: #ff44aa; border: none; padding: 0.6rem; font-family: 'Orbitron', monospace; font-weight: bold; color: #0e0a1f; cursor: pointer; transition: 0.2s; border-radius: 40px; margin-top: 0.5rem; font-size: 0.75rem; }
        .add-synth:hover { background: #ffaa44; box-shadow: 0 0 10px #ffaa44; }
        .no-products-synth { text-align: center; color: #ffaa44; padding: 3rem; border: 1px dashed #ff44aa; border-radius: 12px; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .hero-synth h1 { font-size: 1.8rem; }
        }
      `}</style>

      <div className="synth-home">
        <div className="grid-floor-home"></div>
        <div className="retro-sun-home"></div>
        <div className="vhs-home"></div>

        <div className="home-content">
          <div className="hero-synth">
            <h1>⟡ SYNTHWAVE BAZAAR ⟡</h1>
            <p>&gt; retro terminals // neon deals // 1984 reissue</p>
          </div>

          <form onSubmit={handleSearch} className="search-synth">
            <div className="search-box">
              <input type="text" placeholder="[ SEARCH PRODUCTS ]" value={search}
                onChange={(e) => setSearch(e.target.value)} className="search-input" />
              <button type="submit" className="search-btn">SCAN</button>
            </div>
          </form>

          <div className="main-layout">
            {/* SIDEBAR */}
            <div className="sidebar">
              <div className="sidebar-title">⟡ CATEGORIES</div>
              {categories.map(cat => (
                <div
                  key={cat}
                  className={`cat-item ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="cat-count">{getCategoryCount(cat)}</span>
                </div>
              ))}

              <div className="filter-section">
                <div className="filter-title">💰 PRICE RANGE</div>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <span className="price-sep">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>

              <button className="clear-btn" onClick={clearFilters}>
                ✕ CLEAR FILTERS
              </button>
            </div>

            {/* PRODUCTS AREA */}
            <div className="products-area">
              <div className="sort-bar">
                <span className="sort-label">SORT:</span>
                {[
                  { key: 'latest', label: 'Latest' },
                  { key: 'popular', label: 'Popular' },
                  { key: 'rating', label: 'Top Rated' },
                  { key: 'price_low', label: 'Price ↑' },
                  { key: 'price_high', label: 'Price ↓' }
                ].map(s => (
                  <button
                    key={s.key}
                    className={`sort-btn ${sortBy === s.key ? 'active' : ''}`}
                    onClick={() => setSortBy(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
                <span className="results-count">{filtered.length} products</span>
              </div>

              {loading ? (
                <div className="loader-synth"><div className="retro-spinner"></div></div>
              ) : filtered.length === 0 ? (
                <div className="no-products-synth">⚠ NO SIGNAL // EMPTY GRID</div>
              ) : (
                <div className="grid-synth">
                  {filtered.map((product) => (
                    <div key={product._id} className="card-synth">
                      <div onClick={() => navigate(`/product/${product._id}`)}>
                        <div className="img-wrapper-synth">
                          {product.image
                            ? <img src={product.image} alt={product.name} className="product-img-synth" />
                            : <div className="no-img-synth">[ NO DISPLAY ]</div>
                          }
                        </div>
                        <div className="info-synth">
                          <div className="name-synth">{product.name}</div>
                          <div className="price-synth">⍟ {product.price.toLocaleString()}</div>
                          <div className="stars-synth">
                            {[1,2,3,4,5].map(star => (
                              <span key={star} style={{color: star <= Math.round(product.ratings || 0) ? '#ffaa44' : '#333', fontSize:'13px', textShadow: star <= Math.round(product.ratings || 0) ? '0 0 4px #ffaa44' : 'none'}}>★</span>
                            ))}
                            <span style={{fontSize:'11px',color:'#888',marginLeft:'4px'}}>({product.numReviews || 0})</span>
                          </div>
                          <div className="stock-synth">📼 STOCK: {product.stock}</div>
                        </div>
                      </div>
                      <div style={{padding:'0 1rem 1rem'}}>
                        <button className="add-synth" onClick={(e) => { e.stopPropagation(); addItem(product); }}>
                          ⚡ ADD TO CART
                        </button>
                      </div>
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