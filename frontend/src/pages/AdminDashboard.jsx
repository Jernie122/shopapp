import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function AdminDashboard() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchStats()
    fetchUsers()
    fetchProducts()
    fetchOrders()
  }, [])

  const headers = { Authorization: `Bearer ${token}` }

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/stats`, { headers })
      setStats(data)
    } catch (err) { console.log(err) }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/users`, { headers })
      setUsers(data)
    } catch (err) { console.log(err) }
  }

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/products`, { headers })
      setProducts(data)
    } catch (err) { console.log(err) }
  }

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/orders`, { headers })
      setOrders(data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`${API}/api/admin/users/${id}`, { headers })
      setUsers(users.filter(u => u._id !== id))
    } catch (err) { console.log(err) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${API}/api/admin/products/${id}`, { headers })
      setProducts(products.filter(p => p._id !== id))
    } catch (err) { console.log(err) }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/admin/orders/${id}/status`, { status }, { headers })
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o))
    } catch (err) { console.log(err) }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffaa44', processing: '#44aaff',
      shipped: '#aa44ff', delivered: '#44ff99', cancelled: '#ff4444'
    }
    return colors[status] || '#ffaa44'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .admin-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .admin-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.8rem; text-align: center; margin-bottom: 2rem; text-shadow: 0 0 8px #ff44aa; }
        .admin-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; justify-content: center; }
        .admin-tab {
          padding: 0.5rem 1.5rem; border-radius: 30px; cursor: pointer;
          font-family: 'Orbitron', monospace; font-size: 0.75rem; letter-spacing: 1px;
          border: 1px solid #ffaa44; color: #ffaa44; background: transparent;
        }
        .admin-tab.active { background: #ffaa44; color: #0e0a1f; }
        .admin-tab:hover { background: #ffaa4433; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card {
          background: rgba(255,170,68,0.05); border: 1px solid #ffaa44;
          border-radius: 16px; padding: 1.5rem; text-align: center;
        }
        .stat-value { font-size: 2rem; font-weight: bold; color: #ff44aa; font-family: 'Orbitron', monospace; }
        .stat-label { font-size: 0.75rem; color: #ffaa44; margin-top: 4px; letter-spacing: 1px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; padding: 10px; border-bottom: 1px solid #ffaa4444; text-align: left; }
        .admin-table td { color: #ccc; font-size: 0.8rem; padding: 10px; border-bottom: 1px solid #ffaa4422; }
        .admin-table tr:hover td { background: rgba(255,170,68,0.05); }
        .delete-btn {
          background: transparent; border: 1px solid #ff4444; color: #ff4444;
          padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.75rem;
        }
        .delete-btn:hover { background: #ff4444; color: #fff; }
        .status-select {
          background: #0e0a1f; border: 1px solid #ffaa44; color: #ffaa44;
          padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; cursor: pointer;
          font-family: 'Roboto Mono', monospace;
        }
        .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; background: #1a1030; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; border: 1px solid; }
        .table-wrap { overflow-x: auto; }
        .section-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1rem; margin-bottom: 1rem; }
        .loading { text-align: center; color: #ffaa44; padding: 40px; }
      `}</style>

      <div className="admin-wrap">
        <h2 className="admin-title">⟡ ADMIN DASHBOARD ⟡</h2>

        <div className="admin-tabs">
          {['stats', 'orders', 'products', 'users'].map(t => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading">Loading data...</p>
        ) : (
          <>
            {/* STATS */}
            {tab === 'stats' && stats && (
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-label">TOTAL USERS</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalProducts}</div>
                    <div className="stat-label">TOTAL PRODUCTS</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalOrders}</div>
                    <div className="stat-label">TOTAL ORDERS</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">₱{stats.totalRevenue.toLocaleString()}</div>
                    <div className="stat-label">TOTAL REVENUE</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{color:'#ffaa44'}}>{stats.pendingOrders}</div>
                    <div className="stat-label">PENDING ORDERS</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{color:'#44ff99'}}>{stats.deliveredOrders}</div>
                    <div className="stat-label">DELIVERED</div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div>
                <p className="section-title">ALL ORDERS ({orders.length})</p>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>BUYER</th>
                        <th>ITEMS</th>
                        <th>TOTAL</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8).toUpperCase()}</td>
                          <td>{order.buyer?.name || 'Unknown'}</td>
                          <td>{order.items.length} item(s)</td>
                          <td style={{color:'#ff44aa'}}>₱{order.totalPrice.toLocaleString()}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select
                              className="status-select"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              style={{color: getStatusColor(order.status)}}
                            >
                              {['pending','processing','shipped','delivered','cancelled'].map(s => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                              ))}
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
                <p className="section-title">ALL PRODUCTS ({products.length})</p>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>IMAGE</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>STOCK</th>
                        <th>SELLER</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>
                            {product.image
                              ? <img src={product.image} alt={product.name} className="product-img" />
                              : <div className="product-img" />
                            }
                          </td>
                          <td>{product.name}</td>
                          <td style={{color:'#ff44aa'}}>₱{product.price.toLocaleString()}</td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                          <td>{product.seller?.name || 'Unknown'}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => deleteProduct(product._id)}
                            >
                              DELETE
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
                <p className="section-title">ALL USERS ({users.length})</p>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>ROLE</th>
                        <th>JOINED</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                color: u.role === 'admin' ? '#ff44aa' : '#ffaa44',
                                borderColor: u.role === 'admin' ? '#ff44aa' : '#ffaa44'
                              }}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            {u.role !== 'admin' && (
                              <button
                                className="delete-btn"
                                onClick={() => deleteUser(u._id)}
                              >
                                DELETE
                              </button>
                            )}
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
  )
}

export default AdminDashboard