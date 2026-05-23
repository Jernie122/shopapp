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
          .empty-synth {
            min-height: 100vh;
            background: linear-gradient(180deg, #0e0a1f, #2a1030);
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          .empty-synth::before {
            content: '';
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 30%;
            background-image: repeating-linear-gradient(90deg, #ff44aa30 0px, #ff44aa30 2px, transparent 2px, transparent 40px);
            transform: skewX(-20deg) scaleY(0.4);
            animation: gridEmpty 10s linear infinite;
          }
          @keyframes gridEmpty { to { background-position: 80px 0; } }
          .empty-card {
            background: rgba(20,10,30,0.7);
            backdrop-filter: blur(12px);
            border: 1px solid #ffaa44;
            border-radius: 32px;
            padding: 2rem;
            text-align: center;
            z-index: 1;
          }
          .empty-text { font-size: 1.8rem; color: #ffaa44; text-shadow: 0 0 5px #ff44aa; }
          .empty-btn { background: #ff44aa; border: none; padding: 0.5rem 1.5rem; margin-top: 1rem; cursor: pointer; font-weight: bold; }
        `}</style>
        <div className="empty-synth">
          <div className="empty-card">
            <div className="empty-text">⟡ CART EMPTY // NO SIGNAL ⟡</div>
            <button onClick={() => navigate('/')} className="empty-btn">⟳ RETURN TO GRID</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .cart-synth {
          min-height: 100vh;
          background: linear-gradient(180deg, #0e0a1f 0%, #2a1030 40%, #1a0a2a 100%);
          position: relative;
          padding: 2rem 1.5rem;
          font-family: 'Orbitron', monospace;
        }
        .cart-grid {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 40%;
          background-image: repeating-linear-gradient(90deg, #ff44aa30 0px, #ff44aa30 2px, transparent 2px, transparent 40px);
          transform: skewX(-20deg) scaleY(0.4);
          animation: cartGridMove 10s linear infinite;
          pointer-events: none;
        }
        @keyframes cartGridMove { to { background-position: 80px 0; } }
        .cart-sun {
          position: fixed;
          top: 5%;
          right: 5%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #ffaa44, #ff44aa);
          filter: blur(30px);
          opacity: 0.3;
          animation: sunPulse 4s infinite alternate;
          pointer-events: none;
        }
        @keyframes sunPulse { 0%{ transform:scale(1); opacity:0.3; } 100%{ transform:scale(1.2); opacity:0.6; } }
        .cart-scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 8px);
          pointer-events: none;
        }
        .cart-content {
          position: relative;
          z-index: 2;
          max-width: 1300px;
          margin: 0 auto;
        }
        .cart-title {
          font-size: 1.8rem;
          color: #ffaa44;
          border-left: 4px solid #ff44aa;
          padding-left: 1rem;
          margin-bottom: 2rem;
        }
        .cart-layout {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .cart-items { flex: 1; }
        .cart-item {
          background: rgba(20,10,30,0.65);
          backdrop-filter: blur(8px);
          border: 1px solid #ffaa44;
          border-radius: 20px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          transition: 0.2s;
        }
        .cart-item:hover { border-color: #ff44aa; box-shadow: 0 0 12px #ff44aa; }
        .item-img {
          width: 80px;
          height: 80px;
          background: #0a0515;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ff44aa;
        }
        .item-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
        .no-img { color: #ffaa44; font-size: 0.7rem; }
        .item-details { flex: 1; }
        .item-name { font-family: 'Orbitron', monospace; color: #ffaa44; }
        .item-price { color: #ff44aa; font-size: 1.1rem; margin: 4px 0; }
        .item-qty, .item-subtotal { font-size: 0.75rem; opacity: 0.7; }
        .remove-btn {
          background: transparent;
          border: 1px solid #ff44aa;
          color: #ff44aa;
          padding: 4px 12px;
          border-radius: 30px;
          cursor: pointer;
        }
        .remove-btn:hover { background: #ff44aa; color: #000; }
        .cart-summary {
          background: rgba(20,10,30,0.65);
          backdrop-filter: blur(8px);
          border: 1px solid #ffaa44;
          border-radius: 24px;
          padding: 1.5rem;
          width: 280px;
        }
        .summary-title { font-size: 1.3rem; color: #ffaa44; border-bottom: 2px solid #ff44aa; display: inline-block; }
        .summary-row { display: flex; justify-content: space-between; margin: 0.8rem 0; color: #ccc; }
        .divider { border-top: 1px dashed #ff44aa; margin: 1rem 0; }
        .total-row { display: flex; justify-content: space-between; font-size: 1.2rem; color: #ff44aa; font-weight: bold; margin: 1rem 0; }
        .checkout-btn, .clear-btn {
          width: 100%;
          padding: 0.7rem;
          font-family: 'Orbitron', monospace;
          cursor: pointer;
          margin-bottom: 0.5rem;
          border: none;
        }
        .checkout-btn { background: #ff44aa; color: #0e0a1f; }
        .checkout-btn:hover { background: #ffaa44; box-shadow: 0 0 10px #ffaa44; }
        .clear-btn { background: transparent; border: 1px solid #ff44aa; color: #ff44aa; }
        .clear-btn:hover { background: #ff44aa; color: #000; }
        @media (max-width: 760px) {
          .cart-layout { flex-direction: column; }
          .cart-summary { width: auto; }
        }
      `}</style>
      <div className="cart-synth">
        <div className="cart-grid"></div>
        <div className="cart-sun"></div>
        <div className="cart-scanline"></div>

        <div className="cart-content">
          <div className="cart-title">⟡ CART // {items.length} ITEMS</div>
          <div className="cart-layout">
            <div className="cart-items">
              {items.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-img">
                    {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-img">[ NO FEED ]</div>}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">⍟ {item.price.toLocaleString()}</div>
                    <div className="item-qty">QUANTITY: {item.quantity}</div>
                    <div className="item-subtotal">SUBTOTAL: ⍟ {(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                  <button onClick={() => removeItem(item._id)} className="remove-btn">⨯ REMOVE</button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-title">⟡ SUMMARY</div>
              <div className="summary-row"><span>ITEMS ({items.length})</span><span>⍟ {total.toLocaleString()}</span></div>
              <div className="summary-row"><span>SHIPPING</span><span style={{color:'#ffaa44'}}>FREE</span></div>
              <div className="divider"></div>
              <div className="total-row"><span>TOTAL</span><span>⍟ {total.toLocaleString()}</span></div>
              <button className="checkout-btn" onClick={() => navigate('/checkout')}>⚡ PROCEED TO CHECKOUT</button>
              <button className="clear-btn" onClick={clearCart}>🗑 CLEAR CART</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartPage;