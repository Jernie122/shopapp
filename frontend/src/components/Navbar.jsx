import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

function Navbar() {
  const { items } = useCartStore();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        .aesthetic-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255,255,255,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #f0ebe5;
          padding: 0.6rem 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: -0.3px;
          background: linear-gradient(135deg, #2c2c2c, #8a6e4b);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .nav-logo:hover { opacity: 0.8; }
        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .nav-link {
          color: #5a4e3e;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #2c2c2c; }
        .cart-badge {
          background: #2c2c2c;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0 6px;
          border-radius: 30px;
          margin-left: 4px;
        }
        /* Profile dropdown */
        .profile-container {
          position: relative;
        }
        .profile-trigger {
          background: #f5f0ea;
          padding: 0.3rem 0.9rem;
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #5a4e3e;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
          border: 1px solid transparent;
        }
        .profile-trigger:hover {
          background: #ede5dc;
          border-color: #e2d8cf;
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
          border: 1px solid #f0ebe5;
          min-width: 180px;
          padding: 0.5rem 0;
          z-index: 1100;
          backdrop-filter: blur(4px);
        }
        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.55rem 1.2rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #5a4e3e;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .dropdown-item:hover {
          background: #f9f5f0;
          color: #2c2c2c;
        }
        .dropdown-divider {
          height: 1px;
          background: #f0ebe5;
          margin: 0.4rem 0;
        }
        .admin-link {
          background: #2c2c2c;
          color: white;
          border-radius: 40px;
          padding: 0.3rem 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        .admin-link:hover {
          background: #4f4236;
        }
        @media (max-width: 640px) {
          .aesthetic-nav { padding: 0.6rem 1rem; }
          .nav-links { gap: 1rem; }
          .profile-trigger { padding: 0.2rem 0.7rem; font-size: 0.7rem; }
          .dropdown-menu { right: -10px; min-width: 160px; }
        }
      `}</style>

      <nav className="aesthetic-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">aesthetic finds</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">home</Link>
            <Link to="/cart" className="nav-link">
              cart <span className="cart-badge">{items.length}</span>
            </Link>

            {user ? (
              <>
                {/* Admin badge stays visible (clean, but separate) */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-link">admin</Link>
                )}

                {/* Profile dropdown */}
                <div className="profile-container" ref={dropdownRef}>
                  <div className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    👤 {user.name.split(' ')[0]}
                    <span style={{ fontSize: '0.7rem' }}>{dropdownOpen ? '▲' : '▼'}</span>
                  </div>
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      {/* Orders - everyone */}
                      <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        📦 my orders
                      </Link>

                      {/* Chat */}
                      <Link to="/chat" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        💬 chat
                      </Link>

                      {/* Seller zone */}
                      {user.role === 'seller' && (
                        <>
                          <Link to="/seller" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                            🏪 my store
                          </Link>
                          <Link to="/add-product" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                            ➕ sell item
                          </Link>
                        </>
                      )}

                      {/* Buyer -> become seller */}
                      {user.role === 'buyer' && (
                        <Link to="/become-seller" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          ✨ become seller
                        </Link>
                      )}

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={logout}>
                        🚪 logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">login</Link>
                <Link to="/register" className="nav-link">register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;