import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://shopapp-backend-1bio.onrender.com';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ₱{token}` };

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`₱{API}/api/orders/myorders`, { headers });
      setOrders(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const confirmDelivery = async (orderId) => {
    if (!window.confirm('Confirm that you received this order?')) return;
    try {
      await axios.put(`₱{API}/api/orders/₱{orderId}/confirm`, {}, { headers });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'delivered' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#d97706',
      processing: '#2563eb',
      shipped: '#7c3aed',
      delivered: '#16a34a',
      cancelled: '#dc2626',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .orders-page {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.9), rgba(235, 225, 215, 0.7)), #f5efe9;
          padding: 2rem 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .orders-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .orders-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .orders-header h1 {
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #2c2c2c, #9b7b5c);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          margin: 0;
        }

        .orders-header p {
          color: #6b5a48;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .loader {
          text-align: center;
          padding: 3rem;
          color: #6b5a48;
        }

        .empty-orders {
          text-align: center;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 48px;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #2c2c2c;
        }

        .empty-title {
          font-weight: 600;
          font-size: 1.2rem;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: #6b5a48;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .shop-btn {
          background: rgba(44, 44, 44, 0.9);
          backdrop-filter: blur(4px);
          border: none;
          padding: 0.7rem 1.8rem;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          color: white;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .shop-btn:hover {
          background: #2c2c2c;
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .order-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border-radius: 32px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
        }

        .order-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 16px 28px -12px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.85);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 8px;
        }

        .order-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-id {
          font-size: 0.7rem;
          color: #6b5a48;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .order-date {
          font-size: 0.7rem;
          color: #8f7a64;
        }

        .order-status {
          font-size: 0.7rem;
          padding: 4px 14px;
          border-radius: 40px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .shipped-notice {
          background: rgba(37, 99, 235, 0.1);
          backdrop-filter: blur(4px);
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 0.75rem;
          color: #2563eb;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .order-items {
          margin-bottom: 1rem;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item-img {
          width: 56px;
          height: 56px;
          object-fit: cover;
          border-radius: 20px;
          background: rgba(245, 240, 235, 0.8);
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .order-item-info {
          flex: 1;
        }

        .order-item-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e1e1e;
          margin-bottom: 4px;
        }

        .order-item-qty {
          font-size: 0.7rem;
          color: #6b5a48;
        }

        .order-item-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
        }

        .order-item-price {
          font-size: 0.85rem;
          font-weight: 700;
          color: #2c2c2c;
        }

        .review-btn {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #4f3f2f;
          padding: 4px 12px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.2s;
          font-family: 'Inter', monospace;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .review-btn:hover {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
          transform: scale(0.95);
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          flex-wrap: wrap;
          gap: 12px;
        }

        .order-address {
          font-size: 0.7rem;
          color: #6b5a48;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .order-total {
          font-size: 1rem;
          font-weight: 700;
          color: #1e1e1e;
        }

        .confirm-btn {
          background: rgba(44, 44, 44, 0.9);
          backdrop-filter: blur(4px);
          border: none;
          color: white;
          padding: 7px 20px;
          border-radius: 40px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .confirm-btn:hover {
          background: #2c2c2c;
          transform: scale(0.98);
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }

        @media (max-width: 640px) {
          .orders-page {
            padding: 1rem;
          }
          .order-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .order-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .order-item {
            flex-wrap: wrap;
          }
          .order-item-actions {
            align-items: flex-start;
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>

      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>my orders</h1>
            <p><i className="fas fa-truck"></i> track your purchases</p>
          </div>

          {loading ? (
            <div className="loader"><i className="fas fa-spinner fa-spin"></i> loading...</div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon"><i className="fas fa-box-open"></i></div>
              <div className="empty-title">no orders yet</div>
              <div className="empty-text">You haven't placed any orders.</div>
              <button className="shop-btn" onClick={() => navigate('/')}>
                <i className="fas fa-arrow-left"></i> start shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="order-id">
                        <i className="fas fa-receipt"></i> order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date">
                        <i className="far fa-calendar-alt"></i> {new Date(order.createdAt).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span
                      className="order-status"
                      style={{
                        color: getStatusColor(order.status),
                        borderColor: getStatusColor(order.status),
                      }}
                    >
                      {order.status === 'pending' && <i className="fas fa-clock"></i>}
                      {order.status === 'processing' && <i className="fas fa-cogs"></i>}
                      {order.status === 'shipped' && <i className="fas fa-shipping-fast"></i>}
                      {order.status === 'delivered' && <i className="fas fa-check-circle"></i>}
                      {order.status === 'cancelled' && <i className="fas fa-ban"></i>}
                      {' '}{order.status}
                    </span>
                  </div>

                  {order.status === 'shipped' && (
                    <div className="shipped-notice">
                      <i className="fas fa-truck-fast"></i> Your order is on the way! Click "Confirm Received" once you receive it.
                    </div>
                  )}

                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-img"
                          />
                        ) : (
                          <div className="order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-image" style={{ fontSize: '1.2rem', color: '#bcafa0' }}></i>
                          </div>
                        )}
                        <div className="order-item-info">
                          <div className="order-item-name">{item.name}</div>
                          <div className="order-item-qty"><i className="fas fa-cubes"></i> quantity: {item.quantity}</div>
                        </div>
                        <div className="order-item-actions">
                          <div className="order-item-price">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </div>
                          {order.status === 'delivered' && (
                            <button
                              className="review-btn"
                              onClick={() =>
                                navigate(
                                  `/product/₱{item.product?._id || item.product}?review=true`
                                )
                              }
                            >
                              <i className="fas fa-star"></i> rate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div>
                      <div className="order-address">
                        <i className="fas fa-map-pin"></i> {order.shippingAddress?.city}, {order.shippingAddress?.province}
                      </div>
                      <div className="order-address">
                        <i className="fas fa-phone-alt"></i> {order.shippingAddress?.phone}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="order-total">
                        <i className="fas fa-tag"></i> total: ₱{order.totalPrice.toLocaleString()}
                      </div>
                      {order.status === 'shipped' && (
                        <button
                          className="confirm-btn"
                          onClick={() => confirmDelivery(order._id)}
                        >
                          <i className="fas fa-check-double"></i> confirm received
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderHistoryPage;