import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'

function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    phone: ''
  })

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Your cart is empty!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const orderItems = items.map(item => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      }))

      await axios.post(
        'http://localhost:5000/api/orders',
        {
          items: orderItems,
          shippingAddress: form,
          totalPrice: total
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      clearCart()
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>🛒 Your cart is empty!</p>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          Go Shopping
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Roboto+Mono&display=swap');
        .checkout-wrap { min-height: 90vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .checkout-title { font-family: 'Orbitron', monospace; color: #ffaa44; text-align: center; font-size: 1.6rem; margin-bottom: 2rem; text-shadow: 0 0 6px #ff44aa; }
        .checkout-layout { display: flex; gap: 2rem; max-width: 1000px; margin: 0 auto; flex-wrap: wrap; }
        .checkout-form { flex: 1; min-width: 300px; }
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 4px; }
        .form-input {
          width: 100%; padding: 10px 14px; background: rgba(255,170,68,0.05);
          border: 1px solid #ffaa44; border-radius: 6px; color: #fff;
          font-family: 'Roboto Mono', monospace; font-size: 13px; box-sizing: border-box;
        }
        .form-input:focus { outline: none; border-color: #ff44aa; box-shadow: 0 0 6px #ff44aa55; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .order-summary { width: 300px; }
        .summary-card {
          background: rgba(255,170,68,0.05); border: 1px solid #ffaa44;
          border-radius: 12px; padding: 1.5rem;
        }
        .summary-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.9rem; margin-bottom: 1rem; }
        .summary-item { display: flex; justify-content: space-between; font-size: 12px; color: #ccc; margin-bottom: 8px; }
        .summary-item span:last-child { color: #ffaa44; }
        .summary-divider { border: none; border-top: 1px solid #ffaa4444; margin: 12px 0; }
        .summary-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; color: #ff44aa; }
        .place-order-btn {
          width: 100%; margin-top: 1.5rem; padding: 14px;
          background: linear-gradient(90deg, #ff44aa, #ffaa44);
          border: none; border-radius: 30px; color: #0e0a1f;
          font-family: 'Orbitron', monospace; font-size: 0.85rem;
          font-weight: bold; cursor: pointer; letter-spacing: 1px;
        }
        .place-order-btn:hover { opacity: 0.9; transform: scale(1.01); }
        .place-order-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { color: #ff44aa; font-size: 13px; text-align: center; margin-bottom: 1rem; }
        .cart-items-list { margin-bottom: 1rem; }
        .cart-mini-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid #ffaa4422;
        }
        .cart-mini-img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; background: #1a1030; }
        .cart-mini-name { flex: 1; font-size: 12px; color: #ccc; }
        .cart-mini-price { font-size: 12px; color: #ffaa44; }
      `}</style>
      <div className="checkout-wrap">
        <h2 className="checkout-title">⟡ CHECKOUT ⟡</h2>
        {error && <p className="error-msg">{error}</p>}
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleOrder}>
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input className="form-input" name="fullName" value={form.fullName}
                onChange={handleChange} placeholder="Juan dela Cruz" required />
            </div>
            <div className="form-group">
              <label className="form-label">COMPLETE ADDRESS</label>
              <input className="form-input" name="address" value={form.address}
                onChange={handleChange} placeholder="123 Rizal St, Barangay..." required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CITY</label>
                <input className="form-input" name="city" value={form.city}
                  onChange={handleChange} placeholder="Davao City" required />
              </div>
              <div className="form-group">
                <label className="form-label">PROVINCE</label>
                <input className="form-input" name="province" value={form.province}
                  onChange={handleChange} placeholder="Davao del Sur" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ZIP CODE</label>
                <input className="form-input" name="zipCode" value={form.zipCode}
                  onChange={handleChange} placeholder="8000" required />
              </div>
              <div className="form-group">
                <label className="form-label">PHONE NUMBER</label>
                <input className="form-input" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="09XX XXX XXXX" required />
              </div>
            </div>
            <button
              type="submit"
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? 'PLACING ORDER...' : '⟡ PLACE ORDER ⟡'}
            </button>
          </form>

          <div className="order-summary">
            <div className="summary-card">
              <p className="summary-title">ORDER SUMMARY</p>
              <div className="cart-items-list">
                {items.map(item => (
                  <div key={item._id} className="cart-mini-item">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="cart-mini-img" />
                      : <div className="cart-mini-img" />
                    }
                    <span className="cart-mini-name">{item.name} x{item.quantity}</span>
                    <span className="cart-mini-price">₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <hr className="summary-divider" />
              <div className="summary-item">
                <span>Subtotal</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span style={{ color: '#44ff99' }}>FREE</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-total">
                <span>TOTAL</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  empty: { textAlign: 'center', padding: '80px 20px', background: '#0e0a1f', minHeight: '90vh' },
  emptyText: { color: '#ffaa44', fontSize: '18px', marginBottom: '16px', fontFamily: 'monospace' },
  backBtn: {
    padding: '12px 24px', background: 'transparent', color: '#ff44aa',
    border: '1px solid #ff44aa', borderRadius: '30px', fontSize: '14px',
    cursor: 'pointer', fontFamily: 'monospace'
  }
}

export default CheckoutPage