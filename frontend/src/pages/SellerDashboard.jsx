import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function SellerDashboard() {
  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [p, o] = await Promise.all([
        axios.get(`${API}/api/seller/my-products`, { headers }),
        axios.get(`${API}/api/seller/my-orders`, { headers })
      ])
      setProducts(p.data)
      setOrders(o.data)
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/seller/orders/${id}/status`, { status }, { headers })
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o))
    } catch (err) { console.log(err) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${API}/api/products/${id}`, { headers })
      setProducts(products.filter(p => p._id !== id))
    } catch (err) { console.log(err) }
  }

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const processingOrders = orders.filter(o => o.status === 'processing')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')

  const getStatusColor = (status) => {
    const colors = { pending: '#ffaa44', processing: '#44aaff', shipped: '#aa44ff', delivered: '#44ff99', cancelled: '#ff4444' }
    return colors[status] || '#ffaa44'
  }

  const getNextStatuses = (current) => {
    const flow = { pending: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered', 'cancelled'], delivered: [], cancelled: [] }
    return flow[current] || []
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .seller-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .seller-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.6rem; text-align: center; margin-bottom: 0.3rem; text-shadow: 0 0 6px #ff44aa; }
        .seller-sub { color: #888; font-size: 0.8rem; text-align: center; margin-bottom: 1.5rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 12px; padding: 1rem; text-align: center; }
        .stat-val { font-size: 1.6rem; font-weight: bold; font-family: 'Orbitron', monospace; }
        .stat-label { font-size: 0.7rem; color: #ffaa44; margin-top: 4px; letter-spacing: 1px; }
        .tabs-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
        .seller-tabs { display: flex; gap: 0.8rem; flex-wrap: wrap; }
        .seller-tab { padding: 0.4rem 1.2rem; border-radius: 30px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.7rem; letter-spacing: 1px; border: 1px solid #ffaa44; color: #ffaa44; background: transparent; }
        .seller-tab.active { background: #ffaa44; color: #0e0a1f; }
        .add-btn { padding: 0.4rem 1.2rem; border-radius: 30px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.7rem; border: none; background: linear-gradient(90deg, #ff44aa, #ffaa44); color: #0e0a1f; font-weight: bold; }
        .table-wrap { overflow-x: auto; }
        .seller-table { width: 100%; border-collapse: collapse; }
        .seller-table th { color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; padding: 10px; border-bottom: 1px solid #ffaa4444; text-align: left; }
        .seller-table td { color: #ccc; font-size: 0.8rem; padding: 10px; border-bottom: 1px solid #ffaa4422; vertical-align: top; }
        .seller-table tr:hover td { background: rgba(255,170,68,0.03); }
        .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; background: #1a1030; }
        .del-btn { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.7rem; }
        .del-btn:hover { background: #ff4444; color: #fff; }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; border: 1px solid; display: inline-block; margin-bottom: 6px; }
        .action-btn { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; border: 1px solid; cursor: pointer; background: transparent; margin: 2px; }
        .buyer-info { font-size: 11px; color: #888; margin-top: 2px; }
        .order-items-list { font-size: 11px; color: #aaa; }
        .empty-msg { text-align: center; color: #888; padding: 3rem; font-size: 0.85rem; }
        .section-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.9rem; margin-bottom: 1rem; }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
        .overview-card { background: rgba(255,170,68,0.05); border: 1px solid #ffaa4466; border-radius: 12px; padding: 1.2rem; }
        .overview-card-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.8rem; margin-bottom: 1rem; letter-spacing: 1px; }
        .mini-order { padding: 8px; border-bottom: 1px solid #ffaa4422; font-size: 12px; }
        .mini-order:last-child { border-bottom: none; }
        .mini-buyer { color: #ffaa44; }
        .mini-total { color: #ff44aa; }
        .mini-status { font-size: 11px; }
      `}</style>

      <div className="seller-wrap">
        <h2 className="seller-title">⟡ SELLER DASHBOARD ⟡</h2>
        <p className="seller-sub">
          {user?.storeName && `🏪 ${user.storeName}`}
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ff44aa'}}>{products.length}</div>
            <div className="stat-label">PRODUCTS</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ffaa44'}}>{orders.length}</div>
            <div className="stat-label">TOTAL ORDERS</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ffaa44'}}>{pendingOrders.length}</div>
            <div className="stat-label">PENDING</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#44aaff'}}>{processingOrders.length}</div>
            <div className="stat-label">PROCESSING</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#44ff99'}}>{deliveredOrders.length}</div>
            <div className="stat-label">DELIVERED</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#ff4444'}}>{cancelledOrders.length}</div>
            <div className="stat-label">CANCELLED</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{color:'#44ff99'}}>₱{totalRevenue.toLocaleString()}</div>
            <div className="stat-label">REVENUE</div>
          </div>
        </div>

        <div className="tabs-row">
          <div className="seller-tabs">
            {['overview', 'orders', 'products'].map(t => (
              <button key={t} className={`seller-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.toUpperCase()}
                {t === 'orders' && pendingOrders.length > 0 && (
                  <span style={{background:'#ff44aa',color:'#0e0a1f',fontSize:'0.65rem',padding:'1px 6px',borderRadius:'20px',marginLeft:'4px'}}>
                    {pendingOrders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {tab === 'products' && (
            <button className="add-btn" onClick={() => navigate('/add-product')}>+ ADD PRODUCT</button>
          )}
        </div>

        {loading ? (
          <p style={{textAlign:'center',color:'#ffaa44'}}>Loading...</p>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="overview-grid">
                <div className="overview-card">
                  <p className="overview-card-title">⚡ PENDING ORDERS ({pendingOrders.length})</p>
                  {pendingOrders.length === 0 ? (
                    <p style={{color:'#888',fontSize:'12px'}}>No pending orders</p>
                  ) : pendingOrders.map(order => (
                    <div key={order._id} className="mini-order">
                      <div className="mini-buyer">👤 {order.buyer?.name}</div>
                      <div style={{color:'#888',fontSize:'11px'}}>{order.buyer?.email}</div>
                      <div className="mini-total">₱{order.totalPrice.toLocaleString()}</div>
                      <div className="order-items-list">
                        {order.items.map((item, i) => (
                          <div key={i}>• {item.name} x{item.quantity}</div>
                        ))}
                      </div>
                      <div style={{marginTop:'6px'}}>
                        <button className="action-btn" style={{color:'#44aaff',borderColor:'#44aaff'}}
                          onClick={() => updateOrderStatus(order._id, 'processing')}>
                          ✓ APPROVE
                        </button>
                        <button className="action-btn" style={{color:'#ff4444',borderColor:'#ff4444'}}
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}>
                          ✗ CANCEL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overview-card">
                  <p className="overview-card-title">🚚 PROCESSING ({processingOrders.length})</p>
                  {processingOrders.length === 0 ? (
                    <p style={{color:'#888',fontSize:'12px'}}>No processing orders</p>
                  ) : processingOrders.map(order => (
                    <div key={order._id} className="mini-order">
                      <div className="mini-buyer">👤 {order.buyer?.name}</div>
                      <div className="mini-total">₱{order.totalPrice.toLocaleString()}</div>
                      <div className="order-items-list">
                        {order.items.map((item, i) => (
                          <div key={i}>• {item.name} x{item.quantity}</div>
                        ))}
                      </div>
                      <div style={{marginTop:'6px'}}>
                        <button className="action-btn" style={{color:'#aa44ff',borderColor:'#aa44ff'}}
                          onClick={() => updateOrderStatus(order._id, 'shipped')}>
                          📦 MARK SHIPPED
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overview-card">
                  <p className="overview-card-title">✅ RECENTLY DELIVERED ({deliveredOrders.length})</p>
                  {deliveredOrders.length === 0 ? (
                    <p style={{color:'#888',fontSize:'12px'}}>No delivered orders yet</p>
                  ) : deliveredOrders.slice(0, 5).map(order => (
                    <div key={order._id} className="mini-order">
                      <div className="mini-buyer">👤 {order.buyer?.name}</div>
                      <div className="mini-total">₱{order.totalPrice.toLocaleString()}</div>
                      <div style={{color:'#44ff99',fontSize:'11px'}}>✓ DELIVERED</div>
                    </div>
                  ))}
                </div>

                <div className="overview-card">
                  <p className="overview-card-title">❌ CANCELLED ({cancelledOrders.length})</p>
                  {cancelledOrders.length === 0 ? (
                    <p style={{color:'#888',fontSize:'12px'}}>No cancelled orders</p>
                  ) : cancelledOrders.slice(0, 5).map(order => (
                    <div key={order._id} className="mini-order">
                      <div className="mini-buyer">👤 {order.buyer?.name}</div>
                      <div className="mini-total">₱{order.totalPrice.toLocaleString()}</div>
                      <div style={{color:'#ff4444',fontSize:'11px'}}>✗ CANCELLED</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div className="table-wrap">
                {orders.length === 0 ? (
                  <p className="empty-msg">No orders yet for your products.</p>
                ) : (
                  <table className="seller-table">
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>BUYER</th>
                        <th>ITEMS ORDERED</th>
                        <th>SHIPPING ADDRESS</th>
                        <th>TOTAL</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8).toUpperCase()}</td>
                          <td>
                            <div style={{color:'#ffaa44'}}>{order.buyer?.name}</div>
                            <div className="buyer-info">{order.buyer?.email}</div>
                          </td>
                          <td>
                            {order.items.map((item, i) => (
                              <div key={i} className="order-items-list">
                                • {item.name} x{item.quantity} — ₱{(item.price * item.quantity).toLocaleString()}
                              </div>
                            ))}
                          </td>
                          <td>
                            <div style={{fontSize:'11px',color:'#aaa'}}>
                              {order.shippingAddress?.fullName}<br/>
                              {order.shippingAddress?.address}<br/>
                              {order.shippingAddress?.city}, {order.shippingAddress?.province}<br/>
                              📞 {order.shippingAddress?.phone}
                            </div>
                          </td>
                          <td style={{color:'#ff44aa'}}>₱{order.totalPrice.toLocaleString()}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className="status-badge"
                              style={{color: getStatusColor(order.status), borderColor: getStatusColor(order.status)}}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {getNextStatuses(order.status).map(s => (
                              <button key={s} className="action-btn"
                                style={{color: getStatusColor(s), borderColor: getStatusColor(s)}}
                                onClick={() => updateOrderStatus(order._id, s)}>
                                {s.toUpperCase()}
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
              <div className="table-wrap">
                {products.length === 0 ? (
                  <p className="empty-msg">No products yet. Click ADD PRODUCT to start selling!</p>
                ) : (
                  <table className="seller-table">
                    <thead>
                      <tr>
                        <th>IMAGE</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>STOCK</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>
                            {product.image
                              ? <img src={product.image} alt={product.name} className="product-img" />
                              : <div className="product-img" />}
                          </td>
                          <td>{product.name}</td>
                          <td style={{color:'#ff44aa'}}>₱{product.price.toLocaleString()}</td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                          <td>
                            <button className="del-btn" onClick={() => deleteProduct(product._id)}>DELETE</button>
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
    </>
  )
}

export default SellerDashboard