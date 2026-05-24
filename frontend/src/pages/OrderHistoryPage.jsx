import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://shopapp-backend-1bio.onrender.com';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/orders/myorders`, { headers });
      setOrders(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const confirmDelivery = async (orderId) => {
    if (!window.confirm('Confirm that you received this order?')) return;
    try {
      await axios.put(`${API}/api/orders/${orderId}/confirm`, {}, { headers });
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
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
          padding: 2rem 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .orders-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .orders-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .orders-header h1 {
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.3px;
          color: #2c2c2c;
          margin: 0;
        }

        .orders-header p {
          color: #8f8170;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .loader {
          text-align: center;
          padding: 3rem;
          color: #8f8170;
        }

        .empty-orders {
          text-align: center;
          background: white;
          border-radius: 32px;
          padding: 3rem 2rem;
          border: 1px solid #f0ebe5;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .empty-title {
          font-weight: 600;
          font-size: 1.2rem;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: #8f8170;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .shop-btn {
          background: #2c2c2c;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          color: white;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .shop-btn:hover {
          background: #4f4236;
          transform: scale(0.98);
        }

        .order-card {
          background: white;
          border-radius: 28px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid #f0ebe5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: all 0.2s;
        }

        .order-card:hover {
          box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.1);
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
          color: #8f8170;
          font-weight: 500;
        }

        .order-date {
          font-size: 0.7rem;
          color: #8f8170;
        }

        .order-status {
          font-size: 0.7rem;
          padding: 4px 12px;
          border-radius: 40px;
          font-weight: 600;
          border: 1px solid;
        }

        .shipped-notice {
          background: #f0f4fe;
          border-radius: 20px;
          padding: 10px 14px;
          font-size: 0.75rem;
          color: #2563eb;
          margin-bottom: 1rem;
        }

        .order-items {
          margin-bottom: 1rem;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid #f0ebe5;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item-img {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 16px;
          background: #f5f0ea;
          flex-shrink: 0;
        }

        .order-item-info {
          flex: 1;
        }

        .order-item-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #2c2c2c;
          margin-bottom: 2px;
        }

        .order-item-qty {
          font-size: 0.7rem;
          color: #8f8170;
        }

        .order-item-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
        }

        .order-item-price {
          font-size: 0.85rem;
          font-weight: 600;
          color: #2c2c2c;
        }

        .review-btn {
          background: transparent;
          border: 1px solid #e2d8cf;
          color: #5a4e3e;
          padding: 4px 12px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.2s;
          font-family: 'Inter', monospace;
        }

        .review-btn:hover {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f0ebe5;
          flex-wrap: wrap;
          gap: 12px;
        }

        .order-address {
          font-size: 0.7rem;
          color: #8f8170;
          margin-bottom: 4px;
        }

        .order-total {
          font-size: 1rem;
          font-weight: 700;
          color: #2c2c2c;
        }

        .confirm-btn {
          background: #2c2c2c;
          border: none;
          color: white;
          padding: 6px 18px;
          border-radius: 40px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .confirm-btn:hover {
          background: #4f4236;
          transform: scale(0.98);
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
        }
      `}</style>

      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>my orders</h1>
            <p>track your purchases</p>
          </div>

          {loading ? (
            <div className="loader">loading...</div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <div className="empty-title">no orders yet</div>
              <div className="empty-text">You haven't placed any orders.</div>
              <button className="shop-btn" onClick={() => navigate('/')}>
                start shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="order-id">
                        order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-PH', {
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
                      {order.status}
                    </span>
                  </div>

                  {order.status === 'shipped' && (
                    <div className="shipped-notice">
                      📦 Your order is on the way! Click "Confirm Received" once you receive it.
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
                          <div className="order-item-img" />
                        )}
                        <div className="order-item-info">
                          <div className="order-item-name">{item.name}</div>
                          <div className="order-item-qty">quantity: {item.quantity}</div>
                        </div>
                        <div className="order-item-actions">
                          <div className="order-item-price">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                          {order.status === 'delivered' && (
                            <button
                              className="review-btn"
                              onClick={() =>
                                navigate(
                                  `/product/${item.product?._id || item.product}?review=true`
                                )
                              }
                            >
                              rate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div>
                      <div className="order-address">
                        📍 {order.shippingAddress?.city}, {order.shippingAddress?.province}
                      </div>
                      <div className="order-address">
                        📞 {order.shippingAddress?.phone}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="order-total">total: ${order.totalPrice.toLocaleString()}</div>
                      {order.status === 'shipped' && (
                        <button
                          className="confirm-btn"
                          onClick={() => confirmDelivery(order._id)}
                        >
                          confirm received
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