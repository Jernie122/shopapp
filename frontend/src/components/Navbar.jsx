import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

function Navbar() {
  const { items } = useCartStore();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .synth-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(20, 10, 30, 0.75);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #ffaa44;
          padding: 0.7rem 2rem;
          font-family: 'Orbitron', monospace;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        .nav-logo {
          font-size: 1.4rem;
          font-weight: bold;
          color: #ffaa44;
          text-decoration: none;
          text-shadow: 0 0 4px #ff44aa;
        }
        .nav-logo:hover { color: #ff44aa; }
        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .nav-link {
          color: #ffaa44;
          text-decoration: none;
          font-size: 0.85rem;
          letter-spacing: 1px;
          font-family: 'Roboto Mono', monospace;
        }
        .nav-link:hover { color: #ff44aa; text-shadow: 0 0 3px #ff44aa; }
        .cart-badge {
          background: #ff44aa;
          color: #0e0a1f;
          font-size: 0.7rem;
          padding: 0 5px;
          border-radius: 30px;
          margin-left: 4px;
        }
        .user-name {
          border: 1px solid #ffaa44;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
        }
        .logout-btn, .auth-link {
          background: transparent;
          border: 1px solid #ff44aa;
          color: #ff44aa;
          padding: 0.2rem 0.8rem;
          border-radius: 30px;
          cursor: pointer;
          font-family: monospace;
          text-decoration: none;
          font-size: 0.85rem;
        }
        .logout-btn:hover, .auth-link:hover {
          background: #ff44aa;
          color: #0e0a1f;
        }
        .sell-btn {
          background: transparent;
          border: 1px solid #ffaa44;
          color: #ffaa44;
          padding: 0.2rem 0.8rem;
          border-radius: 30px;
          cursor: pointer;
          font-family: monospace;
          text-decoration: none;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }
        .sell-btn:hover {
          background: #ffaa44;
          color: #0e0a1f;
        }
        .admin-btn {
          background: transparent;
          border: 1px solid #ff44aa;
          color: #ff44aa;
          padding: 0.2rem 0.8rem;
          border-radius: 30px;
          cursor: pointer;
          font-family: monospace;
          text-decoration: none;
          font-size: 0.85rem;
          letter-spacing: 1px;
          text-shadow: 0 0 4px #ff44aa;
        }
        .admin-btn:hover {
          background: #ff44aa;
          color: #0e0a1f;
        }
        @media (max-width: 640px) {
          .synth-nav { padding: 0.7rem 1rem; }
          .nav-links { gap: 0.8rem; }
        }
      `}</style>
      <nav className="synth-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">⟡ SYNTHWAVE ⟡</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">HOME</Link>
            <Link to="/cart" className="nav-link">CART <span className="cart-badge">{items.length}</span></Link>
            {user ? (
              <>
                {/* ADMIN */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-btn">⟡ ADMIN</Link>
                )}

                {/* SELLER */}
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller" className="sell-btn">MY STORE</Link>
                    <Link to="/add-product" className="sell-btn">+ SELL</Link>
                  </>
                )}

                {/* BUYER */}
                {user.role === 'buyer' && (
                  <Link to="/become-seller" className="sell-btn">BECOME SELLER</Link>
                )}

                <Link to="/orders" className="nav-link">ORDERS</Link>
                <span className="nav-link user-name">👤 {user.name.toUpperCase()}</span>
                <button onClick={logout} className="logout-btn">LOGOUT</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link auth-link">LOGIN</Link>
                <Link to="/register" className="nav-link auth-link">REGISTER</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;