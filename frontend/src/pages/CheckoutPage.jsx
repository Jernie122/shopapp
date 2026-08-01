import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';

function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    phone: '',
  });

  // Inject Font Awesome if not already present
  useEffect(() => {
    if (!document.querySelector('#font-awesome-css')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const orderItems = items.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      await axios.post(
        'https://shopapp-backend-1bio.onrender.com/api/orders',
        {
          items: orderItems,
          shippingAddress: form,
          totalPrice: total,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

          .empty-checkout {
            min-height: 90vh;
            background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.9), rgba(235, 225, 215, 0.7)), #f5efe9;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 1rem;
          }

          .empty-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border-radius: 48px;
            padding: 2rem 2rem 2rem;
            text-align: center;
            box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.6);
            max-width: 420px;
            width: 100%;
          }

          .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #2c2c2c;
          }

          .empty-title {
            font-weight: 600;
            font-size: 1.4rem;
            color: #2c2c2c;
            margin-bottom: 0.5rem;
          }

          .empty-text {
            color: #6b5a48;
            font-size: 0.85rem;
            margin-bottom: 1.8rem;
          }

          .empty-btn {
            background: rgba(44, 44, 44, 0.9);
            backdrop-filter: blur(4px);
            border: none;
            padding: 0.7rem 1.8rem;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            color: white;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .empty-btn:hover {
            background: #2c2c2c;
            transform: scale(0.98);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          }
        `}</style>
        <div className="empty-checkout">
          <div className="empty-card">
            <div className="empty-icon"><i className="fas fa-shopping-bag"></i></div>
            <div className="empty-title">your cart is empty</div>
            <div className="empty-text">Add some items before checking out.</div>
            <button onClick={() => navigate('/')} className="empty-btn">
              <i className="fas fa-arrow-left"></i> continue shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .checkout-page {
          min-height: 90vh;
          background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.9), rgba(235, 225, 215, 0.7)), #f5efe9;
          padding: 2rem 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .checkout-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .checkout-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .checkout-header h1 {
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #2c2c2c, #9b7b5c);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          margin: 0;
        }

        .checkout-header p {
          color: #6b5a48;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .checkout-layout {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .checkout-form {
          flex: 2;
          min-width: 260px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .form-label {
          display: block;
          color: #4f3f2f;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          color: #2c2c2c;
          font-family: 'Inter', monospace;
          font-size: 0.85rem;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #c9b69a;
          box-shadow: 0 0 0 2px rgba(90, 78, 62, 0.1);
          background: rgba(255, 255, 255, 0.95);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .order-summary {
          flex: 1;
          min-width: 260px;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 100px;
        }

        .summary-title {
          font-weight: 600;
          font-size: 1rem;
          color: #2c2c2c;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 0.6rem;
          margin-bottom: 1rem;
        }

        .cart-items-list {
          margin-bottom: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .cart-mini-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .cart-mini-item:last-child {
          border-bottom: none;
        }

        .cart-mini-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 16px;
          background: rgba(245, 240, 235, 0.8);
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.6);
        }

        .cart-mini-name {
          flex: 1;
          font-size: 0.8rem;
          font-weight: 500;
          color: #2c2c2c;
        }

        .cart-mini-price {
          font-size: 0.8rem;
          font-weight: 600;
          color: #2c2c2c;
        }

        .summary-divider {
          border: none;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          margin: 12px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #4f3f2f;
          margin-bottom: 8px;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1rem;
          color: #1e1e1e;
          margin-top: 12px;
        }

        .error-message {
          text-align: center;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          padding: 10px;
          border-radius: 40px;
          background: rgba(255, 240, 235, 0.9);
          backdrop-filter: blur(4px);
          color: #b15e4a;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .place-order-btn {
          width: 100%;
          margin-top: 0.5rem;
          padding: 12px;
          background: rgba(44, 44, 44, 0.9);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 40px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .place-order-btn:hover:not(:disabled) {
          background: #2c2c2c;
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .place-order-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 760px) {
          .checkout-page {
            padding: 1rem;
          }
          .checkout-layout {
            flex-direction: column;
          }
          .order-summary {
            width: auto;
          }
          .summary-card {
            position: static;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>

      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>checkout</h1>
            <p><i className="fas fa-credit-card"></i> complete your order</p>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={handleOrder}>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-user"></i> full name</label>
                <input
                  className="form-input"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Juan dela Cruz"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-location-dot"></i> address</label>
                <input
                  className="form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Rizal St, Barangay..."
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">city</label>
                  <input
                    className="form-input"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Davao City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">province</label>
                  <input
                    className="form-input"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    placeholder="Davao del Sur"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><i className="fas fa-mail-bulk"></i> zip code</label>
                  <input
                    className="form-input"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="8000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fas fa-phone"></i> phone number</label>
                  <input
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09XX XXX XXXX"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> placing order...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> place order</>
                )}
              </button>
            </form>

            <div className="order-summary">
              <div className="summary-card">
                <div className="summary-title">
                  <i className="fas fa-receipt"></i> order summary
                </div>
                <div className="cart-items-list">
                  {items.map((item) => (
                    <div key={item._id} className="cart-mini-item">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="cart-mini-img"
                        />
                      ) : (
                        <div className="cart-mini-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-image" style={{ fontSize: '1rem', color: '#bcafa0' }}></i>
                        </div>
                      )}
                      <span className="cart-mini-name">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="cart-mini-price">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="summary-divider" />
                <div className="summary-item">
                  <span>subtotal</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span>shipping</span>
                  <span style={{ color: '#16a34a' }}><i className="fas fa-truck"></i> free</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-total">
                  <span>total</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;