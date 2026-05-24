import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function BecomeSellerPage() {
  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    phone: '',
    address: ''
  })
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role === 'seller') { navigate('/seller'); return }
    if (user.role === 'admin') { navigate('/admin'); return }
    checkApplication()
  }, [])

  const checkApplication = async () => {
    try {
      const { data } = await axios.get(`${API}/api/seller/my-application`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setApplication(data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      await axios.post(`${API}/api/seller/apply`, form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage('Application submitted successfully! Please wait for admin approval.')
      checkApplication()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'approved') return '#44ff99'
    if (status === 'rejected') return '#ff4444'
    return '#ffaa44'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Roboto+Mono&display=swap');
        .become-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; display: flex; justify-content: center; align-items: flex-start; }
        .become-box { background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 16px; padding: 2rem; width: 100%; max-width: 500px; margin-top: 2rem; }
        .become-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.4rem; text-align: center; margin-bottom: 0.5rem; text-shadow: 0 0 6px #ff44aa; }
        .become-sub { color: #888; font-size: 0.8rem; text-align: center; margin-bottom: 1.5rem; }
        .form-label { display: block; color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 4px; margin-top: 12px; }
        .form-input, .form-textarea {
          width: 100%; padding: 10px 14px; background: rgba(255,170,68,0.05);
          border: 1px solid #ffaa44; border-radius: 6px; color: #fff;
          font-family: 'Roboto Mono', monospace; font-size: 13px; box-sizing: border-box;
        }
        .form-textarea { height: 100px; resize: vertical; }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: #ff44aa; }
        .submit-btn {
          width: 100%; margin-top: 1.5rem; padding: 12px;
          background: linear-gradient(90deg, #ff44aa, #ffaa44);
          border: none; border-radius: 30px; color: #0e0a1f;
          font-family: 'Orbitron', monospace; font-size: 0.8rem;
          font-weight: bold; cursor: pointer; letter-spacing: 1px;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg { text-align: center; font-size: 13px; margin-top: 1rem; padding: 10px; border-radius: 8px; }
        .status-card { text-align: center; padding: 2rem; }
        .status-badge { font-size: 1.2rem; font-family: 'Orbitron', monospace; padding: 8px 24px; border-radius: 30px; border: 2px solid; display: inline-block; margin: 1rem 0; }
        .status-desc { color: #888; font-size: 0.8rem; line-height: 1.6; }
        .store-info { background: rgba(255,170,68,0.05); border-radius: 8px; padding: 1rem; margin-top: 1rem; text-align: left; }
        .store-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #ffaa4422; }
        .store-row:last-child { border-bottom: none; }
        .store-key { color: #ffaa44; }
        .store-val { color: #ccc; }
      `}</style>
      <div className="become-wrap">
        <div className="become-box">
          <h2 className="become-title">⟡ BECOME A SELLER ⟡</h2>
          <p className="become-sub">Apply to open your store on Synthwave Bazaar</p>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#ffaa44' }}>Loading...</p>
          ) : application ? (
            <div className="status-card">
              <p style={{ color: '#ccc', fontSize: '13px' }}>Your application status:</p>
              <div
                className="status-badge"
                style={{ color: getStatusColor(application.status), borderColor: getStatusColor(application.status) }}
              >
                {application.status.toUpperCase()}
              </div>
              <div className="store-info">
                <div className="store-row"><span className="store-key">STORE NAME</span><span className="store-val">{application.storeName}</span></div>
                <div className="store-row"><span className="store-key">PHONE</span><span className="store-val">{application.phone}</span></div>
                <div className="store-row"><span className="store-key">ADDRESS</span><span className="store-val">{application.address}</span></div>
                <div className="store-row"><span className="store-key">APPLIED</span><span className="store-val">{new Date(application.createdAt).toLocaleDateString()}</span></div>
              </div>
              {application.status === 'pending' && (
                <p className="status-desc" style={{ marginTop: '1rem' }}>Your application is being reviewed by our admin. Please wait for approval.</p>
              )}
              {application.status === 'rejected' && (
                <div>
                  <p className="status-desc" style={{ color: '#ff4444', marginTop: '1rem' }}>Your application was rejected.</p>
                  {application.rejectionReason && (
                    <p className="status-desc">Reason: {application.rejectionReason}</p>
                  )}
                </div>
              )}
              {application.status === 'approved' && (
                <p className="status-desc" style={{ color: '#44ff99', marginTop: '1rem' }}>
                  Congratulations! Your application was approved. Please logout and login again to access your seller dashboard!
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="form-label">STORE NAME</label>
              <input className="form-input" name="storeName" value={form.storeName}
                onChange={handleChange} placeholder="e.g. Jerni's Shop" required />

              <label className="form-label">STORE DESCRIPTION</label>
              <textarea className="form-textarea" name="storeDescription" value={form.storeDescription}
                onChange={handleChange} placeholder="Tell us about your store..." required />

              <label className="form-label">PHONE NUMBER</label>
              <input className="form-input" name="phone" value={form.phone}
                onChange={handleChange} placeholder="09XX XXX XXXX" required />

              <label className="form-label">STORE ADDRESS</label>
              <input className="form-input" name="address" value={form.address}
                onChange={handleChange} placeholder="City, Province" required />

              {message && (
                <p className="msg" style={{
                  color: message.includes('success') ? '#44ff99' : '#ff4444',
                  background: message.includes('success') ? '#44ff9911' : '#ff444411'
                }}>{message}</p>
              )}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'SUBMITTING...' : '⟡ SUBMIT APPLICATION ⟡'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default BecomeSellerPage