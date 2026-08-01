import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://shopapp-backend-1bio.onrender.com';

function BecomeSellerPage() {
  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    phone: '',
    address: '',
  });
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'seller') {
      navigate('/seller');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    checkApplication();
  }, []);

  const checkApplication = async () => {
    try {
      const { data } = await axios.get(`${API}/api/seller/my-application`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplication(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await axios.post(`${API}/api/seller/apply`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Application submitted successfully! Please wait for admin approval.');
      checkApplication();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return '#16a34a';
    if (status === 'rejected') return '#dc2626';
    return '#d97706';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .aesthetic-seller {
          min-height: 100vh;
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .seller-card {
          background: white;
          border-radius: 32px;
          padding: 2rem;
          width: 100%;
          max-width: 540px;
          box-shadow: 0 8px 28px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0ebe5;
          margin-top: 1rem;
        }

        .seller-title {
          font-weight: 600;
          font-size: 1.5rem;
          letter-spacing: -0.3px;
          text-align: center;
          color: #2c2c2c;
          margin-bottom: 0.25rem;
        }

        .seller-sub {
          color: #8f8170;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1.8rem;
        }

        .form-label {
          display: block;
          color: #5a4e3e;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
          margin-top: 18px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2d8cf;
          border-radius: 20px;
          color: #2c2c2c;
          font-family: 'Inter', monospace;
          font-size: 0.9rem;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #c9b69a;
          box-shadow: 0 0 0 2px rgba(90, 78, 62, 0.08);
        }

        .form-textarea {
          height: 100px;
          resize: vertical;
          border-radius: 20px;
        }

        .submit-btn {
          width: 100%;
          margin-top: 1.8rem;
          padding: 12px;
          background: #2c2c2c;
          border: none;
          border-radius: 40px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #4f4236;
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .message {
          text-align: center;
          font-size: 0.8rem;
          margin-top: 1rem;
          padding: 10px;
          border-radius: 40px;
          font-weight: 500;
        }

        .message.success {
          color: #2c6e4f;
          background: #eafaf3;
        }

        .message.error {
          color: #b15e4a;
          background: #fef4f1;
        }

        .status-container {
          text-align: center;
          padding: 1rem 0;
        }

        .status-badge {
          font-weight: 600;
          font-size: 0.9rem;
          padding: 6px 20px;
          border-radius: 40px;
          border: 1px solid;
          display: inline-block;
          margin: 1rem 0;
        }

        .info-card {
          background: #fefcf9;
          border-radius: 24px;
          padding: 1rem;
          margin-top: 1rem;
          text-align: left;
          border: 1px solid #f0ebe5;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          padding: 6px 0;
          border-bottom: 1px solid #f0ebe5;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-key {
          color: #5a4e3e;
          font-weight: 500;
        }

        .info-value {
          color: #2c2c2c;
        }

        .status-message {
          font-size: 0.8rem;
          margin-top: 1rem;
          line-height: 1.5;
          color: #5a4e3e;
        }

        .loader {
          text-align: center;
          padding: 2rem;
          color: #8f8170;
        }

        @media (max-width: 640px) {
          .aesthetic-seller {
            padding: 1rem;
          }
          .seller-card {
            padding: 1.5rem;
          }
          .seller-title {
            font-size: 1.3rem;
          }
        }
      `}</style>

      <div className="aesthetic-seller">
        <div className="seller-card">
          <h2 className="seller-title">become a seller</h2>
          <p className="seller-sub">Apply to open your store</p>

          {loading ? (
            <div className="loader">loading...</div>
          ) : application ? (
            <div className="status-container">
              <p style={{ color: '#8f8170', fontSize: '0.8rem' }}>
                your application status:
              </p>
              <div
                className="status-badge"
                style={{
                  color: getStatusColor(application.status),
                  borderColor: getStatusColor(application.status),
                }}
              >
                {application.status}
              </div>

              <div className="info-card">
                <div className="info-row">
                  <span className="info-key">store name</span>
                  <span className="info-value">{application.storeName}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">phone</span>
                  <span className="info-value">{application.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">address</span>
                  <span className="info-value">{application.address}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">applied on</span>
                  <span className="info-value">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {application.status === 'pending' && (
                <div className="status-message">
                  Your application is being reviewed by our admin. Please wait for approval.
                </div>
              )}

              {application.status === 'rejected' && (
                <div>
                  <div className="status-message" style={{ color: '#dc2626' }}>
                    Your application was rejected.
                  </div>
                  {application.rejectionReason && (
                    <div className="status-message">
                      Reason: {application.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {application.status === 'approved' && (
                <div className="status-message" style={{ color: '#16a34a' }}>
                  Congratulations! Your application was approved. Please logout and login
                  again to access your seller dashboard.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="form-label">store name</label>
              <input
                className="form-input"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                placeholder="e.g., Modern Finds"
                required
              />

              <label className="form-label">store description</label>
              <textarea
                className="form-textarea"
                name="storeDescription"
                value={form.storeDescription}
                onChange={handleChange}
                placeholder="Tell us about your store..."
                required
              />

              <label className="form-label">phone number</label>
              <input
                className="form-input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="09XX XXX XXXX"
                required
              />

              <label className="form-label">store address</label>
              <input
                className="form-input"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="City, Province"
                required
              />

              {message && (
                <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'submitting...' : 'apply to sell'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default BecomeSellerPage;