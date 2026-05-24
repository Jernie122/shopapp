// RegisterPage.jsx – Synthwave Sunset
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('https://shopapp-backend-1bio.onrender.com/api/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .register-synth {
          min-height: 100vh;
          background: linear-gradient(180deg, #0e0a1f, #2a1030);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          font-family: 'Orbitron', monospace;
          padding: 1.5rem;
        }
        .register-grid {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 30%;
          background-image: repeating-linear-gradient(90deg, #ff44aa30 0px, #ff44aa30 2px, transparent 2px, transparent 40px);
          transform: skewX(-20deg) scaleY(0.4);
          animation: regGridMove 10s linear infinite;
        }
        @keyframes regGridMove { to { background-position: 80px 0; } }
        .register-sun {
          position: absolute;
          top: 5%;
          right: 5%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #ffaa44, #ff44aa);
          filter: blur(30px);
          opacity: 0.3;
          animation: sunGlow 4s infinite alternate;
        }
        .register-card {
          background: rgba(20,10,30,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid #ffaa44;
          border-radius: 32px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          z-index: 1;
        }
        .register-title { text-align: center; font-size: 1.8rem; color: #ffaa44; text-shadow: 0 0 5px #ff44aa; }
        .register-sub { text-align: center; color: #ff44aa; margin-bottom: 2rem; font-size: 0.8rem; }
        .error-msg { color: #ff44aa; border: 1px solid #ff44aa; padding: 0.3rem; border-radius: 40px; text-align: center; margin-bottom: 1rem; }
        .input-group { margin-bottom: 1rem; }
        .synth-input {
          width: 100%;
          padding: 0.8rem;
          background: #0a0515;
          border: 1px solid #ffaa44;
          border-radius: 60px;
          color: #ffaa44;
          font-family: monospace;
          outline: none;
        }
        .synth-input:focus { border-color: #ff44aa; box-shadow: 0 0 8px #ff44aa; }
        .register-btn {
          width: 100%;
          background: #ff44aa;
          border: none;
          padding: 0.8rem;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          border-radius: 60px;
          cursor: pointer;
        }
        .register-btn:hover { background: #ffaa44; box-shadow: 0 0 12px #ffaa44; }
        .login-link { text-align: center; margin-top: 1.5rem; font-size: 0.8rem; }
        .login-link a { color: #ffaa44; text-decoration: none; border-bottom: 1px solid #ffaa44; }
        .login-link a:hover { color: #ff44aa; }
      `}</style>
      <div className="register-synth">
        <div className="register-grid"></div>
        <div className="register-sun"></div>
        <div className="register-card">
          <div className="register-title">⟡ REGISTRATION NODE</div>
          <div className="register-sub">&gt; CREATE NEW ACCESS</div>
          {error && <div className="error-msg">⚠ {error}</div>}
          <form onSubmit={handleRegister}>
            <div className="input-group"><input type="text" placeholder="[ OPERATOR NAME ] // FULL NAME" value={name} onChange={(e) => setName(e.target.value)} className="synth-input" required /></div>
            <div className="input-group"><input type="email" placeholder="[ ENCRYPTED ID ] // EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="synth-input" required /></div>
            <div className="input-group"><input type="password" placeholder="[ SECURE KEY ] // PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} className="synth-input" required /></div>
            <button type="submit" className="register-btn">⚡ REGISTER</button>
          </form>
          <div className="login-link">[ EXISTING PROFILE? ] <Link to="/login">⟳ LOGIN</Link></div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;