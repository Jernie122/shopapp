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
  const [applications, setApplications] = useState([])
  const [sellerStats, setSellerStats] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s, u, p, o, a, ss] = await Promise.all([
        axios.get(`${API}/api/admin/stats`, { headers }),
        axios.get(`${API}/api/admin/users`, { headers }),
        axios.get(`${API}/api/admin/products`, { headers }),
        axios.get(`${API}/api/admin/orders`, { headers }),
        axios.get(`${API}/api/admin/applications`, { headers }),
        axios.get(`${API}/api/admin/sellers`, { headers })
      ])
      setStats(s.data)
      setUsers(u.data)
      setProducts(p.data)
      setOrders(o.data)
      setApplications(a.data)
      setSellerStats(ss.data)
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`${API}/api/admin/users/${id}`, { headers })
      setUsers(users.filter(u => u._id !== id))
    } catch (err) { console.log(err) }
  }

  const suspendUser = async (id) => {
    try {
      const { data } = await axios.put(`${API}/api/admin/users/${id}/suspend`, {}, { headers })
      setUsers(users.map(u => u._id === id ? data.user : u))
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

  const approveApplication = async (id) => {
    try {
      await axios.put(`${API}/api/admin/applications/${id}/approve`, {}, { headers })
      setApplications(applications.map(a => a._id === id ? { ...a, status: 'approved' } : a))
      fetchAll()
    } catch (err) { console.log(err) }
  }

  const rejectApplication = async (id) => {
    const reason = window.prompt('Reason for rejection:')
    if (!reason) return
    try {
      await axios.put(`${API}/api/admin/applications/${id}/reject`, { reason }, { headers })
      setApplications(applications.map(a => a._id === id ? { ...a, status: 'rejected' } : a))
    } catch (err) { console.log(err) }
  }

  const getStatusColor = (status) => {
    const colors = { pending: '#ffaa44', processing: '#44aaff', shipped: '#aa44ff', delivered: '#44ff99', cancelled: '#ff4444', approved: '#44ff99', rejected: '#ff4444' }
    return colors[status] || '#ffaa44'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .admin-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .admin-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.8rem; text-align: center; margin-bottom: 2rem; text-shadow: 0 0 8px #ff44aa; }
        .admin-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; justify-content: center; }
        .admin-tab { padding: 0.5rem 1.5rem; border-radius: 30px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.75rem; letter-spacing: 1px; border: 1px solid #ffaa44; color: #ffaa44; background: transparent; }
        .admin-tab.active { background: #ffaa44; color: #0e0a1f; }
        .admin-tab:hover { background: #ffaa4433; }
        .notif { background: #ff44aa; color: #0e0a1f; font-size: 0.65rem; padding: 1px 6px; border-radius: 20px; margin-left: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 16px; padding: 1.5rem; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #ff44aa; font-family: 'Orbitron', monospace; }
        .stat-label { font-size: 0.75rem; color: #ffaa44; margin-top: 4px; letter-spacing: 1px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; padding: 10px; border-bottom: 1px solid #ffaa4444; text-align: left; }
        .admin-table td { color: #ccc; font-size: 0.8rem; padding: 10px; border-bottom: 1px solid #ffaa4422; vertical-align: top; }
        .admin-table tr:hover td { background: rgba(255,170,68,0.05); }
        .delete-btn { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; margin-right: 4px; }
        .delete-btn:hover { background: #ff4444; color: #fff; }
        .approve-btn { background: transparent; border: 1px solid #44ff99; color: #44ff99; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; margin-right: 4px; }
        .approve-btn:hover { background: #44ff99; color: #000; }
        .reject-btn { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; margin-right: 4px; }
        .reject-btn:hover { background: #ff4444; color: #fff; }
        .suspend-btn { background: transparent; border: 1px solid #ffaa44; color: #ffaa44; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; margin-right: 4px; }
        .suspend-btn:hover { background: #ffaa44; color: #000; }
        .status-select { background: #0e0a1f; border: 1px solid #ffaa44; color: #ffaa44; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; cursor: pointer; font-family: 'Roboto Mono', monospace; }
        .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; background: #1a1030; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; border: 1px solid; }
        .table-wrap { overflow-x: auto; }
        .section-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1rem; margin-bottom: 1rem; }
        .suspended-row td { opacity: 0.5; }
        .seller-card { background: rgba(255,170,68,0.05); border: 1px solid #ffaa4466; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
        .seller-card-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
        .seller-name { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1rem; }
        .seller-mini-stats { display: flex; gap: 1rem; flex-wrap: wrap; }
        .seller-mini-stat { text-align: center; }
        .seller-mini-val { font-family: 'Orbitron', monospace; font-size: 1.2rem; }
        .seller-mini-label { color: #888; font-size: 11px; }
        .recent-order-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #ffaa4422; font-size: 12px; flex-wrap: wrap; gap: 8px; }
        .recent-order-row:last-child { border-bottom: none; }
        .recent-orders-title { color: #ffaa44; font-size: 11px; letter-spacing: 1px; margin-bottom: 8px; }
      `}</style>

      <div className="admin-wrap">
        <h2 className="admin-title">⟡ ADMIN DASHBOARD ⟡</h2>

        <div className="admin-tabs">
          {['stats', 'sellers', 'applications', 'orders', 'products', 'users'].map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.toUpperCase()}
              {t === 'applications' && applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="notif">{applications.filter(a => a.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center',color:'#ffaa44'}}>Loading...</p> : (
          <>
            {/* STATS */}
            {tab === 'stats' && stats && (
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">BUYERS</div></div>
                <div className="stat-card"><div className="stat-value" style={{color:'#ffaa44'}}>{stats.totalSellers}</div><div className="stat-label">SELLERS</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalProducts}</div><div className="stat-label">PRODUCTS</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalOrders}</div><div className="stat-label">ORDERS</div></div>
                <div className="stat-card"><div className="stat-value">₱{stats.totalRevenue.toLocaleString()}</div><div className="stat-label">REVENUE</div></div>
                <div className="stat-card"><div className="stat-value" style={{color:'#ffaa44'}}>{stats.pendingOrders}</div><div className="stat-label">PENDING ORDERS</div></div>
                <div className="stat-card"><div className="stat-value" style={{color:'#ff44aa'}}>{stats.pendingApplications}</div><div className="stat-label">PENDING APPS</div></div>
              </div>
            )}

            {/* SELLERS */}
            {tab === 'sellers' && (
              <div>
                <p className="section-title">SELLER ACCOUNTS ({sellerStats.length})</p>
                {sellerStats.length === 0 ? (
                  <p style={{color:'#888',textAlign:'center',padding:'2rem'}}>No sellers yet</p>
                ) : sellerStats.map(({ seller, totalProducts, totalOrders, totalRevenue, pendingOrders, deliveredOrders, cancelledOrders, recentOrders }) => (
                  <div key={seller._id} className="seller-card">
                    <div className="seller-card-header">
                      <div>
                        <div className="seller-name">{seller.storeName || seller.name}</div>
                        <div style={{color:'#888',fontSize:'12px'}}>{seller.email}</div>
                        {seller.phone && <div style={{color:'#888',fontSize:'12px'}}>📞 {seller.phone}</div>}
                        <div style={{color: seller.isSuspended ? '#ff4444' : '#44ff99', fontSize:'11px',marginTop:'4px'}}>
                          {seller.isSuspended ? '⛔ SUSPENDED' : '✓ ACTIVE'}
                        </div>
                      </div>
                      <div className="seller-mini-stats">
                        <div className="seller-mini-stat">
                          <div className="seller-mini-val" style={{color:'#ff44aa'}}>{totalProducts}</div>
                          <div className="seller-mini-label">PRODUCTS</div>
                        </div>
                        <div className="seller-mini-stat">
                          <div className="seller-mini-val" style={{color:'#ffaa44'}}>{totalOrders}</div>
                          <div className="seller-mini-label">ORDERS</div>
                        </div>
                        <div className="seller-mini-stat">
                          <div className="seller-mini-val" style={{color:'#ffaa44'}}>{pendingOrders}</div>
                          <div className="seller-mini-label">PENDING</div>
                        </div>
                        <div className="seller-mini-stat">
                          <div className="seller-mini-val" style={{color:'#44ff99'}}>{deliveredOrders}</div>
                          <div className="seller-mini-label">DELIVERED</div>
                        </div>
                        <div className="seller-mini-stat">
                          <div className="seller-mini-val" style={{color:'#ff4444'}}>{cancelledOrders}</div>
                          <div className="seller-mini-label">CANCELLED</div>
                        </div>
                        <div className="seller-mini-stat">
                          <div className="seller-mini-val" style={{color:'#44ff99'}}>₱{totalRevenue.toLocaleString()}</div>
                          <div className="seller-mini-label">REVENUE</div>
                        </div>
                      </div>
                    </div>
                    {recentOrders.length > 0 && (
                      <div>
                        <div className="recent-orders-title">RECENT ORDERS:</div>
                        {recentOrders.map(order => (
                          <div key={order._id} className="recent-order-row">
                            <div>
                              <span style={{color:'#ffaa44'}}>👤 {order.buyer?.name}</span>
                              <span style={{color:'#888',marginLeft:'8px',fontSize:'11px'}}>{order.buyer?.email}</span>
                            </div>
                            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                              <span style={{color:'#ff44aa'}}>₱{order.totalPrice.toLocaleString()}</span>
                              <span style={{color: getStatusColor(order.status), fontSize:'11px', border:'1px solid', padding:'1px 8px', borderRadius:'20px', borderColor: getStatusColor(order.status)}}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* APPLICATIONS */}
            {tab === 'applications' && (
              <div>
                <p className="section-title">SELLER APPLICATIONS ({applications.length})</p>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>APPLICANT</th>
                        <th>STORE NAME</th>
                        <th>DESCRIPTION</th>
                        <th>PHONE</th>
                        <th>ADDRESS</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app._id}>
                          <td>{app.user?.name}<br/><span style={{color:'#888',fontSize:'11px'}}>{app.user?.email}</span></td>
                          <td>{app.storeName}</td>
                          <td style={{maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{app.storeDescription}</td>
                          <td>{app.phone}</td>
                          <td>{app.address}</td>
                          <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td><span className="badge" style={{color: getStatusColor(app.status), borderColor: getStatusColor(app.status)}}>{app.status.toUpperCase()}</span></td>
                          <td>
                            {app.status === 'pending' && (
                              <>
                                <button className="approve-btn" onClick={() => approveApplication(app._id)}>APPROVE</button>
                                <button className="reject-btn" onClick={() => rejectApplication(app._id)}>REJECT</button>
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
                <p className="section-title">ALL ORDERS ({orders.length})</p>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>ORDER ID</th><th>BUYER</th><th>ITEMS</th><th>TOTAL</th><th>DATE</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8).toUpperCase()}</td>
                          <td>{order.buyer?.name}<br/><span style={{color:'#888',fontSize:'11px'}}>{order.buyer?.email}</span></td>
                          <td>{order.items.length} item(s)</td>
                          <td style={{color:'#ff44aa'}}>₱{order.totalPrice.toLocaleString()}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select className="status-select" value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              style={{color: getStatusColor(order.status)}}>
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
                    <thead><tr><th>IMAGE</th><th>NAME</th><th>PRICE</th><th>CATEGORY</th><th>STOCK</th><th>SELLER</th><th>ACTION</th></tr></thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>{product.image ? <img src={product.image} alt={product.name} className="product-img" /> : <div className="product-img" />}</td>
                          <td>{product.name}</td>
                          <td style={{color:'#ff44aa'}}>₱{product.price.toLocaleString()}</td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                          <td>{product.seller?.storeName || product.seller?.name}</td>
                          <td><button className="delete-btn" onClick={() => deleteProduct(product._id)}>DELETE</button></td>
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
                    <thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th><th>JOINED</th><th>ACTION</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className={u.isSuspended ? 'suspended-row' : ''}>
                          <td>{u.name}{u.storeName && <span style={{color:'#888',fontSize:'11px',display:'block'}}>{u.storeName}</span>}</td>
                          <td>{u.email}</td>
                          <td><span className="badge" style={{color: u.role === 'seller' ? '#ffaa44' : '#aaa', borderColor: u.role === 'seller' ? '#ffaa44' : '#aaa'}}>{u.role.toUpperCase()}</span></td>
                          <td><span style={{color: u.isSuspended ? '#ff4444' : '#44ff99', fontSize:'12px'}}>{u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}</span></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="suspend-btn" onClick={() => suspendUser(u._id)}>{u.isSuspended ? 'UNSUSPEND' : 'SUSPEND'}</button>
                            <button className="delete-btn" onClick={() => deleteUser(u._id)}>DELETE</button>
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