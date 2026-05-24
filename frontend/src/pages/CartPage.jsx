import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

          .empty-cart {
            min-height: 100vh;
            background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 1rem;
          }

          .empty-card {
            background: white;
            border-radius: 32px;
            padding: 2rem 2rem 2rem;
            text-align: center;
            box-shadow: 0 8px 28px -12px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0ebe5;
            max-width: 400px;
            width: 100%;
          }

          .empty-icon {
            font-size: 3rem;
            margin-bottom: 0.5rem;
          }

          .empty-title {
            font-weight: 600;
            font-size: 1.3rem;
            color: #2c2c2c;
            margin-bottom: 0.5rem;
          }

          .empty-text {
            color: #8f8170;
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }

          .empty-btn {
            background: #2c2c2c;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.8rem;
            color: white;
            transition: all 0.2s ease;
          }

          .empty-btn:hover {
            background: #4f4236;
            transform: scale(0.98);
          }
        `}</style>
        <div className="empty-cart">
          <div className="empty-card">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">your cart is empty</div>
            <div className="empty-text">Looks like you haven't added anything yet.</div>
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

        .cart-page {
          min-height: 100vh;
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
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
          letter-spacing: -0.3px;
          color: #2c2c2c;
          margin: 0;
        }

        .cart-header p {
          color: #8f8170;
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
          min-width: 240px;
          background: white;
          border-radius: 28px;
          padding: 1.5rem;
          border: 1px solid #f0ebe5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .cart-item {
          background: white;
          border-radius: 24px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          border: 1px solid #f0ebe5;
          transition: all 0.2s ease;
        }

        .cart-item:hover {
          border-color: #e2d8cf;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .item-image {
          width: 80px;
          height: 80px;
          background: #fefcf9;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid #f0ebe5;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          color: #bcafa0;
          font-size: 0.7rem;
          text-align: center;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #2c2c2c;
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
          color: #8f8170;
          margin-top: 4px;
        }

        .item-subtotal {
          font-size: 0.75rem;
          font-weight: 500;
          color: #5a4e3e;
          margin-top: 4px;
        }

        .remove-btn {
          background: transparent;
          border: 1px solid #e2d8cf;
          color: #b15e4a;
          padding: 5px 12px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.2s;
          font-family: 'Inter', monospace;
        }

        .remove-btn:hover {
          background: #b15e4a;
          border-color: #b15e4a;
          color: white;
        }

        .summary-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: #2c2c2c;
          border-bottom: 1px solid #f0ebe5;
          padding-bottom: 0.6rem;
          margin-bottom: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin: 0.75rem 0;
          color: #5a4e3e;
        }

        .divider {
          border-top: 1px solid #f0ebe5;
          margin: 1rem 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1rem;
          color: #2c2c2c;
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
        }

        .checkout-btn {
          background: #2c2c2c;
          color: white;
        }

        .checkout-btn:hover {
          background: #4f4236;
          transform: scale(0.98);
        }

        .clear-btn {
          background: transparent;
          border: 1px solid #e2d8cf;
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
            <p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
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
                    <div className="item-price">${item.price.toLocaleString()}</div>
                    <div className="item-quantity">quantity: {item.quantity}</div>
                    <div className="item-subtotal">
                      subtotal: ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="remove-btn"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-title">order summary</div>
              <div className="summary-row">
                <span>subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>shipping</span>
                <span style={{ color: '#16a34a' }}>free</span>
              </div>
              <div className="divider"></div>
              <div className="total-row">
                <span>total</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                proceed to checkout
              </button>
              <button className="clear-btn" onClick={clearCart}>
                clear cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartPage;