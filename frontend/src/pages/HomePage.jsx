// HomePage.jsx – Synthwave Sunset
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (keyword = '') => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/products?search=${keyword}`
      );
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');

        .synth-home {
          min-height: 100vh;
          background: linear-gradient(180deg, #0e0a1f 0%, #2a1030 40%, #1a0a2a 100%);
          position: relative;
          overflow-x: hidden;
          font-family: 'Orbitron', 'Roboto Mono', monospace;
          padding: 2rem 1.5rem;
        }

        /* Animated grid floor */
        .grid-floor-home {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 40%;
          background-image: repeating-linear-gradient(
            90deg,
            #ff44aa30 0px,
            #ff44aa30 2px,
            transparent 2px,
            transparent 40px
          );
          transform: skewX(-20deg) scaleY(0.4);
          transform-origin: bottom center;
          animation: gridMove 10s linear infinite;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 80px 0; }
        }

        /* Retro sun */
        .retro-sun-home {
          position: fixed;
          top: 5%;
          right: 5%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #ffaa44, #ff44aa);
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0.4;
          animation: sunPulse 4s infinite alternate;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes sunPulse {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0.6; }
        }

        /* Scanline */
        .vhs-home {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 8px);
          pointer-events: none;
          z-index: 1;
        }

        /* Main content */
        .home-content {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Hero */
        .hero-synth {
          text-align: center;
          padding: 2rem 1rem;
        }
        .hero-synth h1 {
          font-size: 3rem;
          background: linear-gradient(135deg, #ffaa44, #ff44aa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 8px #ff44aa;
          letter-spacing: 4px;
        }
        .hero-synth p {
          color: #ffaa44;
          font-family: monospace;
          font-size: 0.9rem;
        }

        /* Search */
        .search-synth {
          display: flex;
          justify-content: center;
          margin: 2rem auto;
          max-width: 550px;
        }
        .search-box {
          display: flex;
          width: 100%;
          background: rgba(20, 10, 30, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid #ffaa44;
          border-radius: 60px;
          transition: 0.2s;
        }
        .search-box:focus-within {
          border-color: #ff44aa;
          box-shadow: 0 0 12px #ff44aa;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.8rem 1.2rem;
          color: #ffaa44;
          font-family: monospace;
          outline: none;
        }
        .search-input::placeholder {
          color: #ffaa4480;
        }
        .search-btn {
          background: #ff44aa;
          border: none;
          border-radius: 60px;
          padding: 0 1.5rem;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          color: #0e0a1f;
          cursor: pointer;
          transition: 0.2s;
        }
        .search-btn:hover {
          background: #ffaa44;
          box-shadow: 0 0 10px #ffaa44;
        }

        /* Loading */
        .loader-synth {
          display: flex;
          justify-content: center;
          padding: 3rem;
        }
        .retro-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #ff44aa30;
          border-top: 3px solid #ffaa44;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Product grid */
        .grid-synth {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        .card-synth {
          background: rgba(20, 10, 30, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid #ffaa44;
          border-radius: 24px;
          overflow: hidden;
          transition: 0.25s;
          cursor: pointer;
        }
        .card-synth:hover {
          transform: translateY(-6px);
          border-color: #ff44aa;
          box-shadow: 0 0 20px #ff44aa;
        }
        .img-wrapper-synth {
          height: 200px;
          background: #0a0515;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #ff44aa;
        }
        .product-img-synth {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .no-img-synth {
          color: #ffaa44;
          font-family: monospace;
        }
        .info-synth {
          padding: 1rem;
          color: #ffaa44;
        }
        .name-synth {
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .price-synth {
          font-size: 1.2rem;
          color: #ff44aa;
          margin: 0.4rem 0;
        }
        .stock-synth {
          font-size: 0.7rem;
          opacity: 0.7;
        }
        .add-synth {
          width: 100%;
          background: #ff44aa;
          border: none;
          padding: 0.6rem;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          color: #0e0a1f;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 0.5rem;
          border-radius: 40px;
        }
        .add-synth:hover {
          background: #ffaa44;
          box-shadow: 0 0 10px #ffaa44;
        }
        .no-products-synth {
          text-align: center;
          color: #ffaa44;
          padding: 2rem;
          border: 1px dashed #ff44aa;
        }
        @media (max-width: 640px) {
          .hero-synth h1 { font-size: 1.8rem; }
          .grid-synth { gap: 1rem; }
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
              <input
                type="text"
                placeholder="[ SEARCH PRODUCTS ]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                SCAN
              </button>
            </div>
          </form>

          {loading ? (
            <div className="loader-synth"><div className="retro-spinner"></div></div>
          ) : products.length === 0 ? (
            <div className="no-products-synth">⚠ NO SIGNAL // EMPTY GRID</div>
          ) : (
            <div className="grid-synth">
              {products.map((product) => (
                <div key={product._id} className="card-synth">
                  <div onClick={() => navigate(`/product/${product._id}`)}>
                    <div className="img-wrapper-synth">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="product-img-synth" />
                      ) : (
                        <div className="no-img-synth">[ NO DISPLAY ]</div>
                      )}
                    </div>
                    <div className="info-synth">
                      <div className="name-synth">{product.name}</div>
                      <div className="price-synth">⍟ {product.price.toLocaleString()}</div>
                      <div className="stock-synth">📼 STOCK: {product.stock}</div>
                    </div>
                  </div>
                  <button
                    className="add-synth"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(product);
                    }}
                  >
                    ⚡ ADD TO CART
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HomePage;