import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [name, setName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [phone, setPhone] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ₱{token}` }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`₱{API}/api/auth/profile`, { headers })
      setProfile(data)
      setName(data.name || '')
      setStoreName(data.storeName || '')
      setStoreDescription(data.storeDescription || '')
      setPhone(data.phone || '')
      setAvatarPreview(data.avatar || null)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null
    const formData = new FormData()
    formData.append('image', avatarFile)
    const { data } = await axios.post(`₱{API}/api/upload`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    })
    return data.imageUrl
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      let avatarUrl = profile.avatar
      if (avatarFile) avatarUrl = await uploadAvatar()

      const { data } = await axios.put(`₱{API}/api/auth/profile`, {
        name, storeName, storeDescription, phone, avatar: avatarUrl
      }, { headers })

      // Update localStorage
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      setProfile(data.user)
      setAvatarFile(null)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'error' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' })
      return
    }
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const { data } = await axios.put(`₱{API}/api/auth/change-password`, {
        currentPassword, newPassword
      }, { headers })
      setMessage({ text: data.message, type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to change password', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(145deg,#f9f7f5,#f0eee9)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',color:'#8f8170'}}>
      loading...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        .profile-wrap { min-height: 100vh; background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%); padding: 2rem 1.5rem; font-family: 'Inter', sans-serif; }
        .profile-container { max-width: 600px; margin: 0 auto; }
        .profile-header { text-align: center; margin-bottom: 2rem; }

        .avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; }
        .avatar-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: #f5f0ea; display: flex; align-items: center; justify-content: center; font-size: 2rem; overflow: hidden; }
        .avatar-img img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-upload-btn { margin-top: 8px; font-size: 0.75rem; color: #8f8170; cursor: pointer; background: transparent; border: 1px solid #e2d8cf; padding: 4px 12px; border-radius: 20px; transition: all 0.2s; }
        .avatar-upload-btn:hover { background: #f5f0ea; color: #2c2c2c; }

        .profile-name { font-weight: 700; font-size: 1.4rem; color: #2c2c2c; margin-top: 8px; }
        .profile-email { color: #8f8170; font-size: 0.82rem; }
        .profile-role { display: inline-block; background: #f5f0ea; color: #5a4e3e; font-size: 0.7rem; font-weight: 600; padding: 3px 12px; border-radius: 20px; margin-top: 6px; letter-spacing: 0.5px; }

        .profile-tabs { display: flex; gap: 6px; margin-bottom: 1.5rem; background: white; border-radius: 40px; padding: 4px; border: 1px solid #f0ebe5; }
        .profile-tab { flex: 1; padding: 8px; border-radius: 36px; border: none; background: transparent; color: #8f8170; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: center; }
        .profile-tab.active { background: #2c2c2c; color: white; }

        .profile-card { background: white; border: 1px solid #f0ebe5; border-radius: 24px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .form-label { display: block; color: #5a4e3e; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; margin-top: 14px; }
        .form-input { width: 100%; padding: 10px 14px; background: white; border: 1px solid #e2d8cf; border-radius: 12px; color: #2c2c2c; font-family: 'Inter', sans-serif; font-size: 0.85rem; box-sizing: border-box; transition: border 0.2s; }
        .form-input:focus { outline: none; border-color: #c9b69a; box-shadow: 0 0 0 2px rgba(90,78,62,0.08); }
        .form-input:disabled { background: #faf8f6; color: #8f8170; cursor: not-allowed; }
        .form-textarea { width: 100%; padding: 10px 14px; background: white; border: 1px solid #e2d8cf; border-radius: 12px; color: #2c2c2c; font-family: 'Inter', sans-serif; font-size: 0.85rem; box-sizing: border-box; height: 80px; resize: vertical; transition: border 0.2s; }
        .form-textarea:focus { outline: none; border-color: #c9b69a; }

        .save-btn { width: 100%; margin-top: 1.5rem; padding: 12px; background: #2c2c2c; border: none; border-radius: 40px; color: white; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover:not(:disabled) { background: #4f4236; transform: scale(0.99); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .msg-box { text-align: center; font-size: 0.8rem; margin-top: 1rem; padding: 10px 16px; border-radius: 40px; }
        .msg-box.success { color: #2c6e4f; background: #eafaf3; }
        .msg-box.error { color: #b15e4a; background: #fef4f1; }

        .section-title { font-weight: 600; font-size: 0.88rem; color: #2c2c2c; margin-bottom: 4px; }
        .section-desc { font-size: 0.75rem; color: #8f8170; margin-bottom: 1rem; }
        .divider { border: none; border-top: 1px solid #f0ebe5; margin: 1.2rem 0; }

        .password-strength { height: 4px; border-radius: 2px; margin-top: 6px; transition: all 0.3s; }

        @media (max-width: 480px) {
          .profile-wrap { padding: 1rem; }
          .profile-card { padding: 1rem; }
        }
      `}</style>

      <div className="profile-wrap">
        <div className="profile-container">

          {/* AVATAR & NAME */}
          <div className="avatar-section">
            <div className="avatar-img">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" />
                : <span>{profile?.name?.[0]?.toUpperCase() || '👤'}</span>
              }
            </div>
            <label className="avatar-upload-btn">
              📷 change photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
            </label>
            <div className="profile-name">{profile?.name}</div>
            <div className="profile-email">{profile?.email}</div>
            <span className="profile-role">{profile?.role?.toUpperCase()}</span>
          </div>

          {/* TABS */}
          <div className="profile-tabs">
            <button className={`profile-tab ₱{tab === 'profile' ? 'active' : ''}`} onClick={() => { setTab('profile'); setMessage({text:'',type:''}) }}>
              👤 Profile
            </button>
            {profile?.role === 'seller' && (
              <button className={`profile-tab ₱{tab === 'store' ? 'active' : ''}`} onClick={() => { setTab('store'); setMessage({text:'',type:''}) }}>
                🏪 Store
              </button>
            )}
            <button className={`profile-tab ₱{tab === 'password' ? 'active' : ''}`} onClick={() => { setTab('password'); setMessage({text:'',type:''}) }}>
              🔐 Password
            </button>
          </div>

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="profile-card">
              <div className="section-title">Personal Information</div>
              <div className="section-desc">Update your name and contact details</div>
              <form onSubmit={handleProfileSave}>
                <label className="form-label">FULL NAME</label>
                <input className="form-input" type="text" value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />

                <label className="form-label">EMAIL</label>
                <input className="form-input" type="email" value={profile?.email} disabled />

                <label className="form-label">PHONE NUMBER</label>
                <input className="form-input" type="text" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" />

                <label className="form-label">ACCOUNT TYPE</label>
                <input className="form-input" value={profile?.role?.toUpperCase()} disabled />

                {message.text && tab === 'profile' && (
                  <div className={`msg-box ₱{message.type}`}>{message.text}</div>
                )}

                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'saving...' : 'save changes'}
                </button>
              </form>
            </div>
          )}

          {/* STORE TAB */}
          {tab === 'store' && profile?.role === 'seller' && (
            <div className="profile-card">
              <div className="section-title">Store Information</div>
              <div className="section-desc">Manage how your store appears to buyers</div>
              <form onSubmit={handleProfileSave}>
                <label className="form-label">STORE NAME</label>
                <input className="form-input" type="text" value={storeName}
                  onChange={(e) => setStoreName(e.target.value)} placeholder="Your store name" />

                <label className="form-label">STORE DESCRIPTION</label>
                <textarea className="form-textarea" value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Tell buyers about your store..." />

                <label className="form-label">CONTACT PHONE</label>
                <input className="form-input" type="text" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" />

                {message.text && tab === 'store' && (
                  <div className={`msg-box ₱{message.type}`}>{message.text}</div>
                )}

                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'saving...' : 'save store info'}
                </button>
              </form>
            </div>
          )}

          {/* PASSWORD TAB */}
          {tab === 'password' && (
            <div className="profile-card">
              <div className="section-title">Change Password</div>
              <div className="section-desc">Make sure your new password is at least 6 characters</div>
              <form onSubmit={handlePasswordChange}>
                <label className="form-label">CURRENT PASSWORD</label>
                <input className="form-input" type="password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password" required />

                <hr className="divider" />

                <label className="form-label">NEW PASSWORD</label>
                <input className="form-input" type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password" required />
                {newPassword && (
                  <div className="password-strength" style={{
                    width: `₱{Math.min(newPassword.length * 10, 100)}%`,
                    background: newPassword.length < 6 ? '#f87171' : newPassword.length < 10 ? '#f5b042' : '#34d399'
                  }} />
                )}

                <label className="form-label">CONFIRM NEW PASSWORD</label>
                <input className="form-input" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password" required />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{color:'#b15e4a',fontSize:'0.72rem',marginTop:'4px'}}>Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p style={{color:'#2c6e4f',fontSize:'0.72rem',marginTop:'4px'}}>✓ Passwords match</p>
                )}

                {message.text && tab === 'password' && (
                  <div className={`msg-box ₱{message.type}`}>{message.text}</div>
                )}

                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'changing...' : 'change password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProfilePage