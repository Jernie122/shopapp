// ProductPage.jsx – Synthwave Sunset Theme
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="synth-loader">
        <div className="retro-spinner"></div>
        <style>{`
          .synth-loader {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(180deg, #0e0a1f 0%, #2a0a2a 100%);
          }
          .retro-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid #ff44aa30;
            border-top: 3px solid #ffaa44;
            border-radius: 50%;
            animation: spin 0.8s linear infinite, glow 1s alternate infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes glow {
            0% { box-shadow: 0 0 0px #ffaa44; }
            100% { box-shadow: 0 0 20px #ff44aa; }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="synth-error">
        <div className="error-sun"></div>
        <div className="error-text">⟡ PRODUCT NOT FOUND ⟡</div>
        <button onClick={() => navigate('/')} className="home-link">⟳ RETURN TO GRID</button>
        <style>{`
          .synth-error {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(180deg, #0e0a1f, #2a0a2a);
            gap: 1.5rem;
          }
          .error-sun {
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, #ffaa44, #ff44aa);
            border-radius: 50%;
            filter: blur(20px);
            animation: pulse 2s infinite;
          }
          @keyframes pulse { 0%,100%{ transform: scale(1); opacity:0.7; } 50%{ transform: scale(1.2); opacity:1; } }
          .error-text { font-size: 2rem; color: #ffaa44; text-shadow: 0 0 8px #ff44aa; letter-spacing: 3px; }
          .home-link { background: #ff44aa; border: none; padding: 0.5rem 1.5rem; color: #0e0a1f; cursor: pointer; font-weight: bold; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800&family=Roboto+Mono&display=swap');

        .synthwave-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #0e0a1f 0%, #2a1030 40%, #1a0a2a 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Orbitron', 'Roboto Mono', monospace;
          padding: 2rem;
        }

        /* Animated grid floor (perspective) */
        .grid-floor {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
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
        }
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 80px 0; }
        }

        /* Retro sun */
        .retro-sun {
          position: absolute;
          top: 5%;
          right: 5%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #ffaa44, #ff44aa);
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0.4;
          animation: sunPulse 4s infinite alternate;
          z-index: 0;
        }
        @keyframes sunPulse { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.2); opacity: 0.6; } }

        /* Scanline overlay */
        .vhs-scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 8px);
          pointer-events: none;
          z-index: 1;
        }

        /* Main content */
        .product-card-synth {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 2rem auto;
          background: rgba(20, 10, 30, 0.65);
          backdrop-filter: blur(12px);
          border-radius: 32px;
          border: 1px solid #ffaa44;
          box-shadow: 0 0 20px #ff44aa80, 0 20px 30px rgba(0,0,0,0.5);
          transition: 0.2s;
        }
        .product-card-synth:hover {
          border-color: #ff44aa;
          box-shadow: 0 0 30px #ffaa44;
        }

        .card-body {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 2rem;
        }

        /* Back button */
        .back-btn-synth {
          background: transparent;
          border: none;
          color: #ffaa44;
          font-family: monospace;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 1rem 2rem 0 2rem;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .back-btn-synth:hover { color: #ff44aa; text-shadow: 0 0 4px #ff44aa; }

        /* Image section */
        .image-area {
          flex: 1;
          min-width: 240px;
        }
        .synth-frame {
          background: #0a0515;
          border-radius: 24px;
          padding: 8px;
          border: 1px solid #ffaa44;
        }
        .product-img-synth {
          width: 100%;
          border-radius: 20px;
          display: block;
        }
        .no-img-synth {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0515;
          color: #ffaa44;
          font-size: 0.8rem;
        }

        /* Details */
        .details-area {
          flex: 1.5;
        }
        .product-name-synth {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffaa44, #ff44aa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 5px #ff44aa;
        }
        .price-synth {
          font-size: 2rem;
          color: #ffaa44;
          text-shadow: 0 0 8px #ff44aa;
          margin: 0.5rem 0;
        }
        .desc-synth {
          color: #ddc;
          line-height: 1.5;
          border-left: 3px solid #ff44aa;
          padding-left: 1rem;
        }
        .meta-synth {
          display: flex;
          gap: 0.8rem;
          margin: 1rem 0;
          flex-wrap: wrap;
        }
        .tag-synth {
          background: rgba(255, 68, 170, 0.2);
          border: 1px solid #ff44aa;
          border-radius: 40px;
          padding: 0.2rem 1rem;
          font-size: 0.75rem;
          color: #ffaa44;
        }
        .seller-synth {
          color: #ffaa44cc;
          margin: 1rem 0;
        }
        .cart-btn-synth {
          width: 100%;
          background: linear-gradient(90deg, #ff44aa, #ffaa44);
          border: none;
          padding: 0.8rem;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          font-size: 1rem;
          border-radius: 60px;
          cursor: pointer;
          transition: 0.2s;
          text-transform: uppercase;
        }
        .cart-btn-synth:hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px #ff44aa;
        }

        @media (max-width: 760px) {
          .synthwave-container { padding: 1rem; }
          .product-name-synth { font-size: 1.4rem; }
          .price-synth { font-size: 1.6rem; }
          .retro-sun { width: 150px; height: 150px; top: 2%; right: 2%; }
        }
      `}</style>

      <div className="synthwave-container">
        <div className="grid-floor"></div>
        <div className="retro-sun"></div>
        <div className="vhs-scanline"></div>

        <div className="product-card-synth">
          <div>
            <button onClick={() => navigate('/')} className="back-btn-synth">
              ← BACK TO CRUISE
            </button>
          </div>
          <div className="card-body">
            <div className="image-area">
              <div className="synth-frame">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-img-synth" />
                ) : (
                  <div className="no-img-synth">[ NO SIGNAL ]</div>
                )}
              </div>
            </div>
            <div className="details-area">
              <div className="product-name-synth">{product.name}</div>
              <div className="price-synth">⍟ {product.price.toLocaleString()} CR</div>
              <div className="desc-synth">{product.description || "No description uploaded."}</div>
              <div className="meta-synth">
                <span className="tag-synth">CATEGORY: {product.category || "VOID"}</span>
                <span className="tag-synth">STOCK: {product.stock}</span>
              </div>
              <div className="seller-synth">⟡ PROVIDER: {product.seller?.name?.toUpperCase() || "ANONYMOUS"}</div>
              <button
                className="cart-btn-synth"
                onClick={() => {
                  addItem(product);
                  navigate('/cart');
                }}
              >
                ⚡ ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductPage;