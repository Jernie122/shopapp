import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://shopapp-backend-1bio.onrender.com';

function SellerDashboard() {
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [p, o] = await Promise.all([
        axios.get(`${API}/api/seller/my-products`, { headers }),
        axios.get(`${API}/api/seller/my-orders`, { headers }),
      ]);
      setProducts(p.data);
      setOrders(o.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/api/seller/orders/${id}/status`,
        { status },
        { headers }
      );
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/api/products/${id}`, { headers });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const processingOrders = orders.filter((o) => o.status === 'processing');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

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

  const getNextStatuses = (current) => {
    const flow = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };
    return flow[current] || [];
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .seller-dashboard {
          min-height: 100vh;
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
          padding: 2rem 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.3px;
          color: #2c2c2c;
          margin: 0;
        }

        .dashboard-header p {
          color: #8f8170;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 28px;
          padding: 1rem;
          text-align: center;
          border: 1px solid #f0ebe5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2c2c2c;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #8f8170;
          margin-top: 4px;
          letter-spacing: 0.3px;
        }

        .tabs-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 0.4rem 1.2rem;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          border: 1px solid #e2d8cf;
          background: white;
          color: #5a4e3e;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
        }

        .tab-btn:hover:not(.active) {
          background: #f5f0ea;
          border-color: #cbbcaa;
        }

        .badge-count {
          background: #e2d8cf;
          color: #2c2c2c;
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 30px;
          margin-left: 6px;
        }

        .add-product-btn {
          padding: 0.4rem 1.2rem;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.8rem;
          border: none;
          background: #2c2c2c;
          color: white;
          transition: all 0.2s;
        }

        .add-product-btn:hover {
          background: #4f4236;
          transform: scale(0.98);
        }

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 28px;
          border: 1px solid #f0ebe5;
          padding: 0;
        }

        .seller-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .seller-table th {
          text-align: left;
          padding: 1rem 1rem;
          background: #fefcf9;
          color: #5a4e3e;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e8dfd6;
        }

        .seller-table td {
          padding: 0.9rem 1rem;
          color: #4b3f32;
          border-bottom: 1px solid #f0ebe5;
          vertical-align: middle;
        }

        .seller-table tr:last-child td {
          border-bottom: none;
        }

        .product-img {
          width: 42px;
          height: 42px;
          object-fit: cover;
          border-radius: 14px;
          background: #f5f0ea;
        }

        .status-badge {
          padding: 3px 10px;
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 500;
          display: inline-block;
          border: 1px solid transparent;
        }

        .action-btn {
          background: transparent;
          border: 1px solid #e2d8cf;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          margin-right: 6px;
          transition: all 0.2s;
        }

        .action-btn.danger {
          border-color: #f0cfc9;
          color: #b15e4a;
        }
        .action-btn.danger:hover {
          background: #b15e4a;
          border-color: #b15e4a;
          color: white;
        }
        .action-btn.primary {
          border-color: #c9e6d6;
          color: #16a34a;
        }
        .action-btn.primary:hover {
          background: #16a34a;
          border-color: #16a34a;
          color: white;
        }
        .action-btn.warning {
          border-color: #f0dfc9;
          color: #d97706;
        }
        .action-btn.warning:hover {
          background: #d97706;
          border-color: #d97706;
          color: white;
        }
        .action-btn.secondary {
          border-color: #e2d8cf;
          color: #5a4e3e;
        }
        .action-btn.secondary:hover {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
        }

        .buyer-info {
          font-size: 0.7rem;
          color: #8f8170;
          margin-top: 2px;
        }

        .order-items-list {
          font-size: 0.7rem;
          color: #5a4e3e;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #8f8170;
          font-size: 0.85rem;
          background: white;
          border-radius: 28px;
          border: 1px solid #f0ebe5;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.2rem;
        }

        .overview-card {
          background: white;
          border-radius: 28px;
          padding: 1.2rem;
          border: 1px solid #f0ebe5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .overview-card-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: #2c2c2c;
          margin-bottom: 1rem;
          border-bottom: 1px solid #f0ebe5;
          padding-bottom: 0.5rem;
        }

        .mini-order {
          padding: 0.8rem 0;
          border-bottom: 1px solid #f0ebe5;
          font-size: 0.75rem;
        }

        .mini-order:last-child {
          border-bottom: none;
        }

        .mini-buyer {
          font-weight: 600;
          color: #2c2c2c;
        }

        .mini-total {
          font-weight: 600;
          color: #2c2c2c;
          margin-top: 4px;
        }

        .loader {
          text-align: center;
          padding: 3rem;
          color: #8f8170;
        }

        @media (max-width: 640px) {
          .seller-dashboard {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="seller-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>seller dashboard</h1>
            <p>{user?.storeName && `🏪 ${user.storeName}`}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">total orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{pendingOrders.length}</div>
              <div className="stat-label">pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{processingOrders.length}</div>
              <div className="stat-label">processing</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{deliveredOrders.length}</div>
              <div className="stat-label">delivered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{cancelledOrders.length}</div>
              <div className="stat-label">cancelled</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${totalRevenue.toLocaleString()}</div>
              <div className="stat-label">revenue</div>
            </div>
          </div>

          <div className="tabs-bar">
            <div className="tabs">
              {['overview', 'orders', 'products'].map((t) => (
                <button
                  key={t}
                  className={`tab-btn ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                  {t === 'orders' && pendingOrders.length > 0 && (
                    <span className="badge-count">{pendingOrders.length}</span>
                  )}
                </button>
              ))}
            </div>
            {tab === 'products' && (
              <button
                className="add-product-btn"
                onClick={() => navigate('/add-product')}
              >
                + add product
              </button>
            )}
          </div>

          {loading ? (
            <div className="loader">loading...</div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {tab === 'overview' && (
                <div className="overview-grid">
                  <div className="overview-card">
                    <div className="overview-card-title">
                      pending orders ({pendingOrders.length})
                    </div>
                    {pendingOrders.length === 0 ? (
                      <div className="empty-state" style={{ padding: '1rem' }}>
                        No pending orders
                      </div>
                    ) : (
                      pendingOrders.map((order) => (
                        <div key={order._id} className="mini-order">
                          <div className="mini-buyer">👤 {order.buyer?.name}</div>
                          <div className="buyer-info">{order.buyer?.email}</div>
                          <div className="mini-total">
                            ${order.totalPrice.toLocaleString()}
                          </div>
                          <div className="order-items-list">
                            {order.items.map((item, i) => (
                              <div key={i}>
                                • {item.name} × {item.quantity}
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <button
                              className="action-btn primary"
                              onClick={() =>
                                updateOrderStatus(order._id, 'processing')
                              }
                            >
                              approve
                            </button>
                            <button
                              className="action-btn danger"
                              onClick={() =>
                                updateOrderStatus(order._id, 'cancelled')
                              }
                            >
                              cancel
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-title">
                      processing ({processingOrders.length})
                    </div>
                    {processingOrders.length === 0 ? (
                      <div className="empty-state" style={{ padding: '1rem' }}>
                        No processing orders
                      </div>
                    ) : (
                      processingOrders.map((order) => (
                        <div key={order._id} className="mini-order">
                          <div className="mini-buyer">👤 {order.buyer?.name}</div>
                          <div className="mini-total">
                            ${order.totalPrice.toLocaleString()}
                          </div>
                          <div className="order-items-list">
                            {order.items.map((item, i) => (
                              <div key={i}>
                                • {item.name} × {item.quantity}
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <button
                              className="action-btn secondary"
                              onClick={() =>
                                updateOrderStatus(order._id, 'shipped')
                              }
                            >
                              mark shipped
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-title">
                      recently delivered ({deliveredOrders.length})
                    </div>
                    {deliveredOrders.length === 0 ? (
                      <div className="empty-state" style={{ padding: '1rem' }}>
                        No delivered orders yet
                      </div>
                    ) : (
                      deliveredOrders.slice(0, 5).map((order) => (
                        <div key={order._id} className="mini-order">
                          <div className="mini-buyer">👤 {order.buyer?.name}</div>
                          <div className="mini-total">
                            ${order.totalPrice.toLocaleString()}
                          </div>
                          <div className="status-badge delivered">
                            ✓ delivered
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-title">
                      cancelled ({cancelledOrders.length})
                    </div>
                    {cancelledOrders.length === 0 ? (
                      <div className="empty-state" style={{ padding: '1rem' }}>
                        No cancelled orders
                      </div>
                    ) : (
                      cancelledOrders.slice(0, 5).map((order) => (
                        <div key={order._id} className="mini-order">
                          <div className="mini-buyer">👤 {order.buyer?.name}</div>
                          <div className="mini-total">
                            ${order.totalPrice.toLocaleString()}
                          </div>
                          <div className="status-badge cancelled">
                            ✗ cancelled
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {tab === 'orders' && (
                <div className="table-wrapper">
                  {orders.length === 0 ? (
                    <div className="empty-state">
                      No orders yet for your products.
                    </div>
                  ) : (
                    <table className="seller-table">
                      <thead>
                        <tr>
                          <th>order ID</th>
                          <th>buyer</th>
                          <th>items ordered</th>
                          <th>shipping address</th>
                          <th>total</th>
                          <th>date</th>
                          <th>status</th>
                          <th>action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>#{order._id.slice(-8).toUpperCase()}</td>
                            <td>
                              <div>{order.buyer?.name}</div>
                              <div className="buyer-info">{order.buyer?.email}</div>
                            </td>
                            <td>
                              {order.items.map((item, i) => (
                                <div key={i} className="order-items-list">
                                  • {item.name} × {item.quantity} — $
                                  {(item.price * item.quantity).toLocaleString()}
                                </div>
                              ))}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.7rem', color: '#5a4e3e' }}>
                                {order.shippingAddress?.fullName}
                                <br />
                                {order.shippingAddress?.address}
                                <br />
                                {order.shippingAddress?.city},{' '}
                                {order.shippingAddress?.province}
                                <br />
                                📞 {order.shippingAddress?.phone}
                              </div>
                            </td>
                            <td>${order.totalPrice.toLocaleString()}</td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                className="status-badge"
                                style={{
                                  color: getStatusColor(order.status),
                                  borderColor: getStatusColor(order.status),
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td>
                              {getNextStatuses(order.status).map((s) => (
                                <button
                                  key={s}
                                  className="action-btn"
                                  style={{
                                    borderColor: getStatusColor(s),
                                    color: getStatusColor(s),
                                  }}
                                  onClick={() =>
                                    updateOrderStatus(order._id, s)
                                  }
                                >
                                  {s}
                                </button>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* PRODUCTS TAB */}
              {tab === 'products' && (
                <div className="table-wrapper">
                  {products.length === 0 ? (
                    <div className="empty-state">
                      No products yet. Click "add product" to start selling!
                    </div>
                  ) : (
                    <table className="seller-table">
                      <thead>
                        <tr>
                          <th>image</th>
                          <th>name</th>
                          <th>price</th>
                          <th>category</th>
                          <th>stock</th>
                          <th>action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="product-img"
                                />
                              ) : (
                                <div
                                  className="product-img"
                                  style={{ background: '#f5f0ea' }}
                                />
                              )}
                            </td>
                            <td>{product.name}</td>
                            <td>${product.price.toLocaleString()}</td>
                            <td>{product.category}</td>
                            <td>{product.stock}</td>
                            <td>
                              <button
                                className="action-btn danger"
                                onClick={() => deleteProduct(product._id)}
                              >
                                delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default SellerDashboard;