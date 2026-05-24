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
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .aesthetic-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #f0ebe5;
          padding: 0.7rem 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
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
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: -0.3px;
          background: linear-gradient(135deg, #2c2c2c, #8a6e4b);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .nav-logo:hover {
          opacity: 0.8;
        }

        .nav-links {
          display: flex;
          gap: 1.2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-link {
          color: #5a4e3e;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s ease;
          letter-spacing: 0.2px;
        }

        .nav-link:hover {
          color: #2c2c2c;
        }

        .cart-badge {
          background: #2c2c2c;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0 6px;
          border-radius: 30px;
          margin-left: 4px;
        }

        .user-name {
          background: #f5f0ea;
          padding: 0.25rem 0.8rem;
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #5a4e3e;
        }

        .logout-btn,
        .auth-link,
        .sell-btn,
        .admin-btn {
          background: transparent;
          border: 1px solid #e2d8cf;
          color: #5a4e3e;
          padding: 0.3rem 1rem;
          border-radius: 40px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: 0.2px;
        }

        .logout-btn:hover,
        .auth-link:hover,
        .sell-btn:hover,
        .admin-btn:hover {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
        }

        .admin-btn {
          border-color: #2c2c2c;
          background: #2c2c2c;
          color: white;
        }

        .admin-btn:hover {
          background: #4f4236;
          border-color: #4f4236;
        }

        @media (max-width: 640px) {
          .aesthetic-nav {
            padding: 0.7rem 1rem;
          }
          .nav-links {
            gap: 0.8rem;
          }
          .logout-btn,
          .auth-link,
          .sell-btn,
          .admin-btn {
            padding: 0.2rem 0.7rem;
            font-size: 0.7rem;
          }
        }
      `}</style>

      <nav className="aesthetic-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            aesthetic finds
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              home
            </Link>
            <Link to="/cart" className="nav-link">
              cart <span className="cart-badge">{items.length}</span>
            </Link>

            {user ? (
              <>
                {/* ADMIN */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-btn">
                    admin
                  </Link>
                )}

                {/* SELLER */}
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller" className="sell-btn">
                      my store
                    </Link>
                    <Link to="/add-product" className="sell-btn">
                      + sell
                    </Link>
                  </>
                )}

                {/* BUYER */}
                {user.role === 'buyer' && (
                  <Link to="/become-seller" className="sell-btn">
                    become seller
                  </Link>
                )}

                <Link to="/orders" className="nav-link">
                  orders
                </Link>
                <span className="user-name">👤 {user.name}</span>
                <button onClick={logout} className="logout-btn">
                  logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-link">
                  login
                </Link>
                <Link to="/register" className="auth-link">
                  register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;