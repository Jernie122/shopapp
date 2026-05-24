import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('https://shopapp-backend-1bio.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .login-page {
          min-height: 100vh;
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 1.5rem;
        }

        .login-card {
          background: white;
          border-radius: 32px;
          padding: 2rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 8px 28px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0ebe5;
        }

        .login-title {
          text-align: center;
          font-weight: 600;
          font-size: 1.6rem;
          letter-spacing: -0.3px;
          color: #2c2c2c;
          margin-bottom: 0.25rem;
        }

        .login-sub {
          text-align: center;
          color: #8f8170;
          font-size: 0.85rem;
          margin-bottom: 1.8rem;
        }

        .error-message {
          background: #fef4f1;
          color: #b15e4a;
          border-radius: 40px;
          padding: 0.7rem;
          text-align: center;
          font-size: 0.8rem;
          margin-bottom: 1.2rem;
          font-weight: 500;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .modern-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: #ffffff;
          border: 1px solid #e2d8cf;
          border-radius: 40px;
          font-family: 'Inter', monospace;
          font-size: 0.9rem;
          color: #2c2c2c;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .modern-input:focus {
          border-color: #c9b69a;
          box-shadow: 0 0 0 2px rgba(90, 78, 62, 0.08);
        }

        .modern-input::placeholder {
          color: #bcafa0;
          font-weight: 400;
        }

        .login-btn {
          width: 100%;
          background: #2c2c2c;
          border: none;
          padding: 0.8rem;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: white;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .login-btn:hover {
          background: #4f4236;
          transform: scale(0.98);
        }

        .register-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #8f8170;
        }

        .register-link a {
          color: #2c2c2c;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid #e2d8cf;
        }

        .register-link a:hover {
          color: #4f4236;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-title">welcome back</div>
          <div className="login-sub">sign in to your account</div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modern-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modern-input"
                required
              />
            </div>
            <button type="submit" className="login-btn">
              sign in
            </button>
          </form>

          <div className="register-link">
            don't have an account? <Link to="/register">create one</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;