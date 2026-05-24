import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

const categories = ['Shoes', 'Shirts', 'Pants', 'Bags', 'Electronics', 'Food', 'Beauty', 'Home', 'Sports', 'Toys', 'Books', 'Other']

function AddProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      let imageUrl = ''

      if (image) {
        const formData = new FormData()
        formData.append('image', image)
        const uploadRes = await axios.post(`${API}/api/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
        imageUrl = uploadRes.data.imageUrl
      }

      await axios.post(`${API}/api/products`,
        { name, description, price: Number(price), category, stock: Number(stock), image: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('Product added successfully!')
      setTimeout(() => navigate('/seller'), 1500)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .add-wrap { min-height: 100vh; background: #0e0a1f; display: flex; justify-content: center; align-items: flex-start; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .add-box { background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 16px; padding: 2rem; width: 100%; max-width: 500px; }
        .add-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.4rem; text-align: center; margin-bottom: 0.5rem; text-shadow: 0 0 6px #ff44aa; }
        .add-sub { color: #888; font-size: 0.8rem; text-align: center; margin-bottom: 1.5rem; }
        .form-label { display: block; color: #ffaa44; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 4px; margin-top: 14px; }
        .form-input, .form-textarea, .form-select {
          width: 100%; padding: 10px 14px;
          background: rgba(255,170,68,0.05);
          border: 1px solid #ffaa44; border-radius: 6px;
          color: #fff; font-family: 'Roboto Mono', monospace;
          font-size: 13px; box-sizing: border-box;
        }
        .form-select { cursor: pointer; }
        .form-select option { background: #0e0a1f; color: #fff; }
        .form-textarea { height: 100px; resize: vertical; }
        .form-input:focus, .form-textarea:focus, .form-select:focus { outline: none; border-color: #ff44aa; box-shadow: 0 0 6px #ff44aa55; }
        .img-label { cursor: pointer; display: block; margin-top: 14px; }
        .img-placeholder { border: 2px dashed #ffaa44; border-radius: 8px; padding: 2rem; text-align: center; color: #ffaa44; font-size: 13px; transition: 0.2s; }
        .img-placeholder:hover { border-color: #ff44aa; color: #ff44aa; }
        .img-preview { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ffaa44; }
        .submit-btn { width: 100%; margin-top: 1.5rem; padding: 12px; background: linear-gradient(90deg, #ff44aa, #ffaa44); border: none; border-radius: 30px; color: #0e0a1f; font-family: 'Orbitron', monospace; font-size: 0.8rem; font-weight: bold; cursor: pointer; letter-spacing: 1px; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg { text-align: center; font-size: 13px; margin-top: 1rem; padding: 10px; border-radius: 8px; }
        .back-link { display: block; text-align: center; color: #888; font-size: 12px; margin-top: 1rem; cursor: pointer; }
        .back-link:hover { color: #ffaa44; }
      `}</style>

      <div className="add-wrap">
        <div className="add-box">
          <h2 className="add-title">⟡ ADD PRODUCT ⟡</h2>
          <p className="add-sub">List a new item in your store</p>

          <form onSubmit={handleSubmit}>
            <label className="form-label">PRODUCT NAME</label>
            <input className="form-input" type="text" placeholder="e.g. Nike Running Shoes"
              value={name} onChange={(e) => setName(e.target.value)} required />

            <label className="form-label">DESCRIPTION</label>
            <textarea className="form-textarea" placeholder="Describe your product..."
              value={description} onChange={(e) => setDescription(e.target.value)} required />

            <label className="form-label">PRICE (₱)</label>
            <input className="form-input" type="number" placeholder="e.g. 999"
              value={price} onChange={(e) => setPrice(e.target.value)} required />

            <label className="form-label">CATEGORY</label>
            <select className="form-select" value={category}
              onChange={(e) => setCategory(e.target.value)} required>
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label className="form-label">STOCK QUANTITY</label>
            <input className="form-input" type="number" placeholder="e.g. 50"
              value={stock} onChange={(e) => setStock(e.target.value)} required />

            <label className="img-label">
              <span className="form-label">PRODUCT IMAGE</span>
              {preview
                ? <img src={preview} alt="preview" className="img-preview" />
                : <div className="img-placeholder">📷 Click to upload product image</div>
              }
              <input type="file" accept="image/*" onChange={handleImageChange} style={{display:'none'}} />
            </label>

            {message && (
              <p className="msg" style={{
                color: message.includes('success') ? '#44ff99' : '#ff4444',
                background: message.includes('success') ? '#44ff9911' : '#ff444411'
              }}>{message}</p>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'UPLOADING...' : '⟡ ADD PRODUCT ⟡'}
            </button>
          </form>

          <span className="back-link" onClick={() => navigate('/seller')}>← Back to My Store</span>
        </div>
      </div>
    </>
  )
}

export default AddProductPage