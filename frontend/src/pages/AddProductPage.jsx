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
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      setMessage('Maximum 5 images allowed')
      return
    }
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (images.length === 0) {
      setMessage('Please add at least one image')
      return
    }
    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      let imageUrls = []

      if (images.length === 1) {
        const formData = new FormData()
        formData.append('image', images[0])
        const uploadRes = await axios.post(`${API}/api/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
        imageUrls = [uploadRes.data.imageUrl]
      } else {
        const formData = new FormData()
        images.forEach(img => formData.append('images', img))
        const uploadRes = await axios.post(`${API}/api/upload/multiple`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
        imageUrls = uploadRes.data.imageUrls
      }

      await axios.post(`${API}/api/products`,
        {
          name,
          description,
          price: Number(price),
          category,
          stock: Number(stock),
          image: imageUrls[0],
          images: imageUrls
        },
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        .add-wrap { min-height: 100vh; background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%); display: flex; justify-content: center; align-items: flex-start; padding: 2rem; font-family: 'Inter', sans-serif; }
        .add-box { background: white; border: 1px solid #f0ebe5; border-radius: 24px; padding: 2rem; width: 100%; max-width: 520px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .add-title { font-weight: 700; font-size: 1.4rem; color: #2c2c2c; text-align: center; margin-bottom: 0.3rem; }
        .add-sub { color: #8f8170; font-size: 0.82rem; text-align: center; margin-bottom: 1.8rem; }
        .form-label { display: block; color: #5a4e3e; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.3px; margin-bottom: 5px; margin-top: 14px; }
        .form-input, .form-textarea, .form-select { width: 100%; padding: 10px 14px; background: white; border: 1px solid #e2d8cf; border-radius: 12px; color: #2c2c2c; font-family: 'Inter', sans-serif; font-size: 0.85rem; box-sizing: border-box; transition: border 0.2s; }
        .form-input:focus, .form-textarea:focus, .form-select:focus { outline: none; border-color: #c9b69a; box-shadow: 0 0 0 2px rgba(90,78,62,0.08); }
        .form-select { cursor: pointer; }
        .form-select option { background: white; }
        .form-textarea { height: 100px; resize: vertical; }

        .images-upload-area { margin-top: 14px; }
        .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; margin-bottom: 10px; }
        .img-thumb { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; border: 1px solid #f0ebe5; }
        .img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .img-thumb-main { position: absolute; bottom: 4px; left: 4px; background: #2c2c2c; color: white; font-size: 0.55rem; padding: 2px 6px; border-radius: 6px; font-weight: 600; }
        .img-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }
        .img-remove:hover { background: #e05c3a; }

        .upload-box { border: 2px dashed #e2d8cf; border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
        .upload-box:hover { border-color: #c9b69a; background: #faf8f6; }
        .upload-icon { font-size: 1.8rem; margin-bottom: 6px; }
        .upload-text { color: #8f8170; font-size: 0.8rem; }
        .upload-hint { color: #bcafa0; font-size: 0.72rem; margin-top: 4px; }

        .submit-btn { width: 100%; margin-top: 1.8rem; padding: 13px; background: #2c2c2c; border: none; border-radius: 40px; color: white; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; }
        .submit-btn:hover:not(:disabled) { background: #4f4236; transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .msg { text-align: center; font-size: 0.8rem; margin-top: 1rem; padding: 10px 16px; border-radius: 40px; }
        .back-link { display: block; text-align: center; color: #bcafa0; font-size: 0.78rem; margin-top: 1rem; cursor: pointer; transition: color 0.2s; }
        .back-link:hover { color: #5a4e3e; }
      `}</style>

      <div className="add-wrap">
        <div className="add-box">
          <h2 className="add-title">Add New Product</h2>
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

            <div className="images-upload-area">
              <label className="form-label">PRODUCT IMAGES <span style={{color:'#bcafa0',fontWeight:400}}>(up to 5)</span></label>

              {previews.length > 0 && (
                <div className="images-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="img-thumb">
                      <img src={src} alt={`preview ${i}`} />
                      {i === 0 && <span className="img-thumb-main">MAIN</span>}
                      <button type="button" className="img-remove" onClick={() => removeImage(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {previews.length < 5 && (
                <label className="upload-box">
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">Click to upload images</div>
                  <div className="upload-hint">First image will be the main photo · Max 5 images</div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{display:'none'}}
                  />
                </label>
              )}
            </div>

            {message && (
              <p className="msg" style={{
                color: message.includes('success') ? '#2c6e4f' : '#b15e4a',
                background: message.includes('success') ? '#eafaf3' : '#fef4f1'
              }}>{message}</p>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Add Product'}
            </button>
          </form>

          <span className="back-link" onClick={() => navigate('/seller')}>← Back to My Store</span>
        </div>
      </div>
    </>
  )
}

export default AddProductPage