import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

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

  if (items.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

          .empty-cart {
            min-height: 100vh;
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
            padding: 2.5rem;
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
        <div className="empty-cart">
          <div className="empty-card">
            <div className="empty-icon"><i className="fas fa-shopping-bag"></i></div>
            <div className="empty-title">your cart is empty</div>
            <div className="empty-text">Looks like you haven't added anything yet.</div>
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

        .cart-page {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.9), rgba(235, 225, 215, 0.7)), #f5efe9;
          padding: 2rem 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .cart-header {
          margin-bottom: 2rem;
        }

        .cart-header h1 {
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #2c2c2c, #9b7b5c);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          margin: 0;
        }

        .cart-header p {
          color: #6b5a48;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .cart-layout {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .cart-items {
          flex: 2;
          min-width: 240px;
        }

        .cart-summary {
          flex: 1;
          min-width: 260px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .cart-item {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 28px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .cart-item:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.85);
        }

        .item-image {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          color: #a8957e;
          font-size: 0.7rem;
          text-align: center;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #1e1e1e;
          margin-bottom: 4px;
        }

        .item-price {
          font-weight: 600;
          font-size: 1rem;
          color: #2c2c2c;
          margin: 4px 0;
        }

        .item-quantity {
          font-size: 0.7rem;
          color: #6b5a48;
          margin-top: 4px;
        }

        .item-subtotal {
          font-size: 0.75rem;
          font-weight: 500;
          color: #4f3f2f;
          margin-top: 4px;
        }

        .remove-btn {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #b15e4a;
          padding: 6px 14px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 600;
          transition: all 0.2s;
          font-family: 'Inter', monospace;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .remove-btn:hover {
          background: #b15e4a;
          border-color: #b15e4a;
          color: white;
          transform: scale(0.95);
        }

        .summary-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: #2c2c2c;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 0.6rem;
          margin-bottom: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin: 0.75rem 0;
          color: #4f3f2f;
        }

        .divider {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          margin: 1rem 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1rem;
          color: #1e1e1e;
          margin: 1rem 0;
        }

        .checkout-btn,
        .clear-btn {
          width: 100%;
          padding: 0.7rem;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0.6rem;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .checkout-btn {
          background: rgba(44, 44, 44, 0.9);
          backdrop-filter: blur(4px);
          color: white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .checkout-btn:hover {
          background: #2c2c2c;
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #b15e4a;
        }

        .clear-btn:hover {
          background: #b15e4a;
          border-color: #b15e4a;
          color: white;
        }

        @media (max-width: 760px) {
          .cart-page {
            padding: 1rem;
          }
          .cart-layout {
            flex-direction: column;
          }
          .cart-summary {
            position: static;
            width: auto;
          }
          .cart-item {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>your cart</h1>
            <p><i className="fas fa-boxes"></i> {items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>

          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="no-image">no image</div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">₱{item.price.toLocaleString()}</div>
                    <div className="item-quantity">
                      <i className="fas fa-cubes"></i> quantity: {item.quantity}
                    </div>
                    <div className="item-subtotal">
                      subtotal: ₱{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="remove-btn"
                  >
                    <i className="fas fa-trash-alt"></i> remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-title">
                <i className="fas fa-receipt"></i> order summary
              </div>
              <div className="summary-row">
                <span>subtotal</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>shipping</span>
                <span style={{ color: '#16a34a' }}><i className="fas fa-truck"></i> free</span>
              </div>
              <div className="divider"></div>
              <div className="total-row">
                <span>total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                <i className="fas fa-lock"></i> proceed to checkout
              </button>
              <button className="clear-btn" onClick={clearCart}>
                <i className="fas fa-eraser"></i> clear cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartPage;