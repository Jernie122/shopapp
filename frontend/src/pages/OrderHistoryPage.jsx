import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/orders/myorders`, { headers })
      setOrders(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const confirmDelivery = async (orderId) => {
    if (!window.confirm('Confirm that you received this order?')) return
    try {
      await axios.put(`${API}/api/orders/${orderId}/confirm`, {}, { headers })
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'delivered' } : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming order')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffaa44',
      processing: '#44aaff',
      shipped: '#aa44ff',
      delivered: '#44ff99',
      cancelled: '#ff4444'
    }
    return colors[status] || '#ffaa44'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Roboto+Mono&display=swap');
        .orders-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .orders-title { font-family: 'Orbitron', monospace; color: #ffaa44; text-align: center; font-size: 1.6rem; margin-bottom: 2rem; text-shadow: 0 0 6px #ff44aa; }
        .orders-list { max-width: 800px; margin: 0 auto; }
        .order-card { background: rgba(255,170,68,0.05); border: 1px solid #ffaa4466; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px; }
        .order-id { font-size: 11px; color: #888; }
        .order-date { font-size: 11px; color: #888; }
        .order-status { font-size: 11px; padding: 4px 12px; border-radius: 20px; font-family: 'Orbitron', monospace; letter-spacing: 1px; border: 1px solid; }
        .order-items { margin-bottom: 1rem; }
        .order-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #ffaa4422; }
        .order-item:last-child { border-bottom: none; }
        .order-item-img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background: #1a1030; flex-shrink: 0; }
        .order-item-info { flex: 1; }
        .order-item-name { font-size: 13px; color: #ccc; margin-bottom: 2px; }
        .order-item-qty { font-size: 11px; color: #888; }
        .order-item-price { font-size: 13px; color: #ffaa44; }
        .order-item-actions { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
        .review-btn { background: transparent; border: 1px solid #ffaa44; color: #ffaa44; padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 0.7rem; font-family: 'Orbitron', monospace; white-space: nowrap; }
        .review-btn:hover { background: #ffaa44; color: #0e0a1f; }
        .reviewed-badge { color: #44ff99; font-size: 0.7rem; border: 1px solid #44ff99; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
        .order-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ffaa4433; flex-wrap: wrap; gap: 8px; }
        .order-total { font-size: 14px; color: #ff44aa; font-weight: bold; }
        .order-address { font-size: 11px; color: #888; }
        .confirm-btn { background: linear-gradient(90deg, #44ff99, #44aaff); border: none; color: #0e0a1f; padding: 8px 20px; border-radius: 30px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; }
        .confirm-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .shipped-notice { background: rgba(170,68,255,0.1); border: 1px solid #aa44ff; border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #aa44ff; margin-bottom: 8px; }
        .empty-orders { text-align: center; padding: 60px 20px; }
        .empty-text { color: #ffaa44; font-size: 16px; margin-bottom: 16px; }
        .shop-btn { padding: 10px 24px; background: transparent; color: #ff44aa; border: 1px solid #ff44aa; border-radius: 30px; cursor: pointer; font-family: monospace; font-size: 13px; }
      `}</style>

      <div className="orders-wrap">
        <h2 className="orders-title">⟡ MY ORDERS ⟡</h2>
        {loading ? (
          <p style={{textAlign:'center',color:'#ffaa44'}}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <p className="empty-text">No orders yet!</p>
            <button className="shop-btn" onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <p className="order-id">ORDER # {order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-PH', {year:'numeric',month:'long',day:'numeric'})}</p>
                  </div>
                  <span className="order-status" style={{color: getStatusColor(order.status), borderColor: getStatusColor(order.status)}}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Shipped notice */}
                {order.status === 'shipped' && (
                  <div className="shipped-notice">
                    📦 Your order is on the way! Click "Confirm Received" once you receive it.
                  </div>
                )}

                {/* Order items */}
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="order-item-img" />
                        : <div className="order-item-img" />
                      }
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <div className="order-item-actions">
                        <span className="order-item-price">₱{(item.price * item.quantity).toLocaleString()}</span>
                        {order.status === 'delivered' && (
                          <button
                            className="review-btn"
                            onClick={() => navigate(`/product/${item.product?._id || item.product}?review=true`)}
                          >
                            ⭐ RATE
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
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px'}}>
                    <div className="order-total">TOTAL: ₱{order.totalPrice.toLocaleString()}</div>
                    {order.status === 'shipped' && (
                      <button className="confirm-btn" onClick={() => confirmDelivery(order._id)}>
                        ✓ CONFIRM RECEIVED
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default OrderHistoryPage