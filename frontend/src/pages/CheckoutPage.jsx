import { useState } from 'react';
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
            background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', sans-serif;
            padding: 2rem;
          }
          .empty-card {
            background: white;
            border-radius: 32px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 8px 28px -12px rgba(0,0,0,0.08);
            border: 1px solid #f0ebe5;
            max-width: 400px;
          }
          .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
          .empty-title { font-weight: 600; font-size: 1.3rem; color: #2c2c2c; margin-bottom: 0.5rem; }
          .empty-text { color: #8f8170; font-size: 0.85rem; margin-bottom: 1.5rem; }
          .empty-btn {
            background: #2c2c2c;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.8rem;
            color: white;
            transition: all 0.2s;
          }
          .empty-btn:hover { background: #4f4236; transform: scale(0.98); }
        `}</style>
        <div className="empty-checkout">
          <div className="empty-card">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">your cart is empty</div>
            <div className="empty-text">Add some items before checking out.</div>
            <button onClick={() => navigate('/')} className="empty-btn">
              continue shopping
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
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
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
          letter-spacing: -0.3px;
          color: #2c2c2c;
          margin: 0;
        }

        .checkout-header p {
          color: #8f8170;
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
          background: white;
          border-radius: 28px;
          padding: 1.5rem;
          border: 1px solid #f0ebe5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .form-label {
          display: block;
          color: #5a4e3e;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2d8cf;
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
          box-shadow: 0 0 0 2px rgba(90, 78, 62, 0.08);
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
          background: white;
          border-radius: 28px;
          padding: 1.5rem;
          border: 1px solid #f0ebe5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          position: sticky;
          top: 100px;
        }

        .summary-title {
          font-weight: 600;
          font-size: 1rem;
          color: #2c2c2c;
          border-bottom: 1px solid #f0ebe5;
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
          border-bottom: 1px solid #f0ebe5;
        }

        .cart-mini-item:last-child {
          border-bottom: none;
        }

        .cart-mini-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 12px;
          background: #f5f0ea;
          flex-shrink: 0;
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
          border-top: 1px solid #f0ebe5;
          margin: 12px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #5a4e3e;
          margin-bottom: 8px;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1rem;
          color: #2c2c2c;
          margin-top: 12px;
        }

        .error-message {
          text-align: center;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          padding: 10px;
          border-radius: 40px;
          background: #fef4f1;
          color: #b15e4a;
        }

        .place-order-btn {
          width: 100%;
          margin-top: 0.5rem;
          padding: 12px;
          background: #2c2c2c;
          border: none;
          border-radius: 40px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
        }

        .place-order-btn:hover:not(:disabled) {
          background: #4f4236;
          transform: scale(0.98);
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
            <p>complete your order</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={handleOrder}>
              <div className="form-group">
                <label className="form-label">full name</label>
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
                <label className="form-label">address</label>
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
                  <label className="form-label">zip code</label>
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
                  <label className="form-label">phone number</label>
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
                {loading ? 'placing order...' : 'place order'}
              </button>
            </form>

            <div className="order-summary">
              <div className="summary-card">
                <div className="summary-title">order summary</div>
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
                        <div className="cart-mini-img" />
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
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span>shipping</span>
                  <span style={{ color: '#16a34a' }}>free</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-total">
                  <span>total</span>
                  <span>${total.toLocaleString()}</span>
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