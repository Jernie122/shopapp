import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function SellerDashboard() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/')
      return
    }
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/seller/my-products`, { headers })
      setProducts(data)
    } catch (err) { console.log(err) }
  }

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/seller/my-orders`, { headers })
      setOrders(data)
      setLoading(false)
    } catch (err) { setLoading(false) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${API}/api/products/${id}`, { headers })
      setProducts(products.filter(p => p._id !== id))
    } catch (err) { console.log(err) }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)

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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Roboto Mono&display=swap');
        .seller-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .seller-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.6rem; text-align: center; margin-bottom: 0.5rem; text-shadow: 0 0 6px #ff44aa; }
        .seller-sub { color: #888; font-size: 0.8rem; text-align: center; margin-bottom: 1.5rem; }
        .seller-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .seller-stat { background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 12px; padding: 1rem; text-align: center; }
        .seller-stat-val { font-size: 1.5rem; font-weight: bold; color: #ff44aa; font-family: 'Orbitron', monospace; }
        .seller-stat-label { font-size: 0.7rem; color: #ffaa44; margin-top: 4px; }
        .seller-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .seller-tab { padding: 0.5rem 1.5rem; border-radius: 30px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.75rem; letter-spacing: 1px; border: 1px solid #ffaa44; color: #ffaa44; background: transparent; }
        .seller-tab.active { background: #ffaa44; color: #0e0a1f; }
        .add-btn { padding: 0.5rem 1.5rem; border-radius: 30px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.75rem; letter-spacing: 1px; border: none; background: linear-gradient(90deg, #ff44aa, #ffaa44); color: #0e0a1f; font-weight: bold; }
        .seller-table { width: 100%; border-collapse: collapse; }
        .seller-table th { color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; padding: 10px; border-bottom: 1px solid #ffaa4444; text-align: left; }
        .seller-table td { color: #ccc; font-size: 0.8rem; padding: 10px; border-bottom: 1px solid #ffaa4422; }
        .seller-table tr:hover td { background: rgba(255,170,68,0.05); }
        .del-btn { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; }
        .del-btn:hover { background: #ff4444; color: #fff; }
        .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; background: #1a1030; }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; border: 1px solid; }
        .table-wrap { overflow-x: auto; }
        .tabs-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
        .empty-msg { text-align: center; color: #888; padding: 2rem; font-size: 0.85rem; }
      `}</style>

      <div className="seller-wrap">
        <h2 className="seller-title">⟡ SELLER DASHBOARD ⟡</h2>
        <p className="seller-sub">Welcome back, {user?.storeName || user?.name}!</p>

        <div className="seller-stats">
          <div className="seller-stat">
            <div className="seller-stat-val">{products.length}</div>
            <div className="seller-stat-label">MY PRODUCTS</div>
          </div>
          <div className="seller-stat">
            <div className="seller-stat-val">{orders.length}</div>
            <div className="seller-stat-label">TOTAL ORDERS</div>
          </div>
          <div className="seller-stat">
            <div className="seller-stat-val">₱{totalRevenue.toLocaleString()}</div>
            <div className="seller-stat-label">TOTAL REVENUE</div>
          </div>
          <div className="seller-stat">
            <div className="seller-stat-val" style={{color:'#ffaa44'}}>
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="seller-stat-label">PENDING ORDERS</div>
          </div>
        </div>

        <div className="tabs-row">
          <div className="seller-tabs">
            <button className={`seller-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>MY PRODUCTS</button>
            <button className={`seller-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>MY ORDERS</button>
          </div>
          {tab === 'products' && (
            <button className="add-btn" onClick={() => navigate('/add-product')}>+ ADD PRODUCT</button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#ffaa44' }}>Loading...</p>
        ) : (
          <>
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
                              : <div className="product-img" />
                            }
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
                            <span
                              className="status-badge"
                              style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) }}
                            >
                              {order.status.toUpperCase()}
                            </span>
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