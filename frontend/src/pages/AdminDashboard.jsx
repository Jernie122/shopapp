import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://shopapp-backend-1bio.onrender.com';

function AdminDashboard() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sellerStats, setSellerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ₱{token}` };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [s, u, p, o, a, ss] = await Promise.all([
        axios.get(`₱{API}/api/admin/stats`, { headers }),
        axios.get(`₱{API}/api/admin/users`, { headers }),
        axios.get(`₱{API}/api/admin/products`, { headers }),
        axios.get(`₱{API}/api/admin/orders`, { headers }),
        axios.get(`₱{API}/api/admin/applications`, { headers }),
        axios.get(`₱{API}/api/admin/sellers`, { headers }),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setProducts(p.data);
      setOrders(o.data);
      setApplications(a.data);
      setSellerStats(ss.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`₱{API}/api/admin/users/₱{id}`, { headers });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const suspendUser = async (id) => {
    try {
      const { data } = await axios.put(
        `₱{API}/api/admin/users/₱{id}/suspend`,
        {},
        { headers }
      );
      setUsers(users.map((u) => (u._id === id ? data.user : u)));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`₱{API}/api/admin/products/₱{id}`, { headers });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `₱{API}/api/admin/orders/₱{id}/status`,
        { status },
        { headers }
      );
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      console.log(err);
    }
  };

  const approveApplication = async (id) => {
    try {
      await axios.put(
        `₱{API}/api/admin/applications/₱{id}/approve`,
        {},
        { headers }
      );
      setApplications(
        applications.map((a) => (a._id === id ? { ...a, status: 'approved' } : a))
      );
      fetchAll();
    } catch (err) {
      console.log(err);
    }
  };

  const rejectApplication = async (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await axios.put(
        `₱{API}/api/admin/applications/₱{id}/reject`,
        { reason },
        { headers }
      );
      setApplications(
        applications.map((a) => (a._id === id ? { ...a, status: 'rejected' } : a))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#d97706',
      processing: '#2563eb',
      shipped: '#7c3aed',
      delivered: '#16a34a',
      cancelled: '#dc2626',
      approved: '#16a34a',
      rejected: '#dc2626',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .admin-container {
          min-height: 100vh;
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-header h1 {
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.3px;
          background: linear-gradient(135deg, #2c2c2c, #8a6e4b);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tab-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          border: 1px solid #e2d8cf;
          background: white;
          color: #5a4e3e;
          transition: all 0.2s ease;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 28px;
          padding: 1.3rem;
          text-align: center;
          border: 1px solid #f0ebe5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2c2c2c;
          letter-spacing: -0.5px;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #8f8170;
          margin-top: 4px;
          letter-spacing: 0.3px;
        }

        .section-title {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #2c2c2c;
        }

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 28px;
          border: 1px solid #f0ebe5;
          padding: 0;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .admin-table th {
          text-align: left;
          padding: 1rem 1rem;
          background: #fefcf9;
          color: #5a4e3e;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e8dfd6;
        }

        .admin-table td {
          padding: 0.9rem 1rem;
          color: #4b3f32;
          border-bottom: 1px solid #f0ebe5;
          vertical-align: middle;
        }

        .admin-table tr:last-child td {
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
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          margin-right: 6px;
          transition: all 0.2s;
          font-family: 'Inter', monospace;
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
        .action-btn.warning {
          border-color: #f0dfc9;
          color: #d97706;
        }
        .action-btn.warning:hover {
          background: #d97706;
          border-color: #d97706;
          color: white;
        }
        .action-btn.success {
          border-color: #c9e6d6;
          color: #16a34a;
        }
        .action-btn.success:hover {
          background: #16a34a;
          border-color: #16a34a;
          color: white;
        }
        .action-btn.neutral {
          border-color: #e2d8cf;
          color: #5a4e3e;
        }
        .action-btn.neutral:hover {
          background: #2c2c2c;
          border-color: #2c2c2c;
          color: white;
        }

        .status-select {
          background: white;
          border: 1px solid #e2d8cf;
          border-radius: 30px;
          padding: 5px 12px;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', monospace;
          color: #4b3f32;
        }

        .seller-card {
          background: white;
          border-radius: 28px;
          padding: 1.2rem;
          margin-bottom: 1rem;
          border: 1px solid #f0ebe5;
        }

        .seller-header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .seller-name {
          font-weight: 700;
          font-size: 1rem;
          color: #2c2c2c;
        }

        .seller-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .seller-stat-item {
          text-align: center;
        }

        .seller-stat-value {
          font-weight: 700;
          font-size: 1rem;
        }

        .seller-stat-label {
          font-size: 0.65rem;
          color: #8f8170;
        }

        .recent-orders-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #8f8170;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .recent-order-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0ebe5;
          font-size: 0.75rem;
          flex-wrap: wrap;
          gap: 8px;
        }

        .recent-order-row:last-child {
          border-bottom: none;
        }

        .suspended-row td {
          opacity: 0.6;
        }

        .loader {
          text-align: center;
          padding: 3rem;
          color: #8f8170;
        }

        @media (max-width: 640px) {
          .admin-container {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="admin-container">
        <div className="admin-header">
          <h1>admin dashboard</h1>
        </div>

        <div className="tabs">
          {['stats', 'sellers', 'applications', 'orders', 'products', 'users'].map(
            (t) => (
              <button
                key={t}
                className={`tab-btn ₱{tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
                {t === 'applications' &&
                  applications.filter((a) => a.status === 'pending').length > 0 && (
                    <span className="badge-count">
                      {applications.filter((a) => a.status === 'pending').length}
                    </span>
                  )}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="loader">loading...</div>
        ) : (
          <>
            {/* STATS */}
            {tab === 'stats' && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">buyers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalSellers}</div>
                  <div className="stat-label">sellers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalProducts}</div>
                  <div className="stat-label">products</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalOrders}</div>
                  <div className="stat-label">orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">₱{stats.totalRevenue.toLocaleString()}</div>
                  <div className="stat-label">revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.pendingOrders}</div>
                  <div className="stat-label">pending orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.pendingApplications}</div>
                  <div className="stat-label">pending apps</div>
                </div>
              </div>
            )}

            {/* SELLERS */}
            {tab === 'sellers' && (
              <div>
                <div className="section-title">
                  seller accounts ({sellerStats.length})
                </div>
                {sellerStats.length === 0 ? (
                  <div className="loader">no sellers yet</div>
                ) : (
                  sellerStats.map(
                    ({
                      seller,
                      totalProducts,
                      totalOrders,
                      totalRevenue,
                      pendingOrders,
                      deliveredOrders,
                      cancelledOrders,
                      recentOrders,
                    }) => (
                      <div key={seller._id} className="seller-card">
                        <div className="seller-header">
                          <div>
                            <div className="seller-name">
                              {seller.storeName || seller.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8f8170' }}>
                              {seller.email}
                            </div>
                            {seller.phone && (
                              <div style={{ fontSize: '0.7rem', color: '#8f8170' }}>
                                📞 {seller.phone}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: '0.65rem',
                                marginTop: '4px',
                                color: seller.isSuspended ? '#dc2626' : '#16a34a',
                              }}
                            >
                              {seller.isSuspended ? '⛔ suspended' : '✓ active'}
                            </div>
                          </div>
                          <div className="seller-stats">
                            <div className="seller-stat-item">
                              <div className="seller-stat-value">{totalProducts}</div>
                              <div className="seller-stat-label">products</div>
                            </div>
                            <div className="seller-stat-item">
                              <div className="seller-stat-value">{totalOrders}</div>
                              <div className="seller-stat-label">orders</div>
                            </div>
                            <div className="seller-stat-item">
                              <div className="seller-stat-value">{pendingOrders}</div>
                              <div className="seller-stat-label">pending</div>
                            </div>
                            <div className="seller-stat-item">
                              <div className="seller-stat-value">{deliveredOrders}</div>
                              <div className="seller-stat-label">delivered</div>
                            </div>
                            <div className="seller-stat-item">
                              <div className="seller-stat-value">{cancelledOrders}</div>
                              <div className="seller-stat-label">cancelled</div>
                            </div>
                            <div className="seller-stat-item">
                              <div className="seller-stat-value">
                                ₱{totalRevenue.toLocaleString()}
                              </div>
                              <div className="seller-stat-label">revenue</div>
                            </div>
                          </div>
                        </div>
                        {recentOrders.length > 0 && (
                          <div>
                            <div className="recent-orders-title">recent orders</div>
                            {recentOrders.map((order) => (
                              <div key={order._id} className="recent-order-row">
                                <div>
                                  <span style={{ fontWeight: 500 }}>
                                    {order.buyer?.name}
                                  </span>
                                  <span
                                    style={{
                                      color: '#8f8170',
                                      marginLeft: '8px',
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    {order.buyer?.email}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>
                                    ₱{order.totalPrice.toLocaleString()}
                                  </span>
                                  <span
                                    className="status-badge"
                                    style={{
                                      borderColor: getStatusColor(order.status),
                                      color: getStatusColor(order.status),
                                    }}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            )}

            {/* APPLICATIONS */}
            {tab === 'applications' && (
              <div>
                <div className="section-title">
                  seller applications ({applications.length})
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>applicant</th>
                        <th>store name</th>
                        <th>description</th>
                        <th>phone</th>
                        <th>address</th>
                        <th>date</th>
                        <th>status</th>
                        <th>action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td>
                            {app.user?.name}
                            <br />
                            <span style={{ fontSize: '0.7rem', color: '#8f8170' }}>
                              {app.user?.email}
                            </span>
                          </td>
                          <td>{app.storeName}</td>
                          <td style={{ maxWidth: '180px', whiteSpace: 'normal' }}>
                            {app.storeDescription}
                          </td>
                          <td>{app.phone}</td>
                          <td>{app.address}</td>
                          <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                borderColor: getStatusColor(app.status),
                                color: getStatusColor(app.status),
                              }}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {app.status === 'pending' && (
                              <>
                                <button
                                  className="action-btn success"
                                  onClick={() => approveApplication(app._id)}
                                >
                                  approve
                                </button>
                                <button
                                  className="action-btn danger"
                                  onClick={() => rejectApplication(app._id)}
                                >
                                  reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div>
                <div className="section-title">all orders ({orders.length})</div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>order id</th>
                        <th>buyer</th>
                        <th>items</th>
                        <th>total</th>
                        <th>date</th>
                        <th>status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8).toUpperCase()}</td>
                          <td>
                            {order.buyer?.name}
                            <br />
                            <span style={{ fontSize: '0.7rem', color: '#8f8170' }}>
                              {order.buyer?.email}
                            </span>
                          </td>
                          <td>{order.items.length} item(s)</td>
                          <td style={{ fontWeight: 600 }}>₱{order.totalPrice.toLocaleString()}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select
                              className="status-select"
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                            >
                              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                )
                              )}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <div>
                <div className="section-title">all products ({products.length})</div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>image</th>
                        <th>name</th>
                        <th>price</th>
                        <th>category</th>
                        <th>stock</th>
                        <th>seller</th>
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
                          <td>₱{product.price.toLocaleString()}</td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                          <td>{product.seller?.storeName || product.seller?.name}</td>
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
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div>
                <div className="section-title">all users ({users.length})</div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>name</th>
                        <th>email</th>
                        <th>role</th>
                        <th>status</th>
                        <th>joined</th>
                        <th>action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className={u.isSuspended ? 'suspended-row' : ''}>
                          <td>
                            {u.name}
                            {u.storeName && (
                              <div style={{ fontSize: '0.7rem', color: '#8f8170' }}>
                                {u.storeName}
                              </div>
                            )}
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                borderColor: u.role === 'seller' ? '#d97706' : '#8f8170',
                                color: u.role === 'seller' ? '#d97706' : '#6b7280',
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                borderColor: u.isSuspended ? '#dc2626' : '#16a34a',
                                color: u.isSuspended ? '#dc2626' : '#16a34a',
                              }}
                            >
                              {u.isSuspended ? 'suspended' : 'active'}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="action-btn warning"
                              onClick={() => suspendUser(u._id)}
                            >
                              {u.isSuspended ? 'unsuspend' : 'suspend'}
                            </button>
                            <button
                              className="action-btn danger"
                              onClick={() => deleteUser(u._id)}
                            >
                              delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;