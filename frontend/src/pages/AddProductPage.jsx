import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://shopapp-backend-1bio.onrender.com';

const categories = [
  'Shoes',
  'Shirts',
  'Pants',
  'Bags',
  'Electronics',
  'Food',
  'Beauty',
  'Home',
  'Sports',
  'Toys',
  'Books',
  'Other',
];

function AddProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      let imageUrl = '';

      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await axios.post(`${API}/api/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.post(
        `${API}/api/products`,
        {
          name,
          description,
          price: Number(price),
          category,
          stock: Number(stock),
          image: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Product added successfully!');
      setTimeout(() => navigate('/seller'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .aesthetic-add {
          min-height: 100vh;
          background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .add-card {
          background: white;
          border-radius: 32px;
          padding: 2rem;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 8px 28px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0ebe5;
        }

        .add-title {
          font-weight: 600;
          font-size: 1.6rem;
          letter-spacing: -0.3px;
          text-align: center;
          color: #2c2c2c;
          margin-bottom: 0.25rem;
        }

        .add-sub {
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
        .form-textarea,
        .form-select {
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
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #c9b69a;
          box-shadow: 0 0 0 2px rgba(90, 78, 62, 0.08);
        }

        .form-textarea {
          height: 100px;
          resize: vertical;
          border-radius: 20px;
        }

        .img-label {
          cursor: pointer;
          display: block;
          margin-top: 18px;
        }

        .img-placeholder {
          border: 2px dashed #e2d8cf;
          border-radius: 28px;
          padding: 1.8rem;
          text-align: center;
          color: #8f8170;
          font-size: 0.85rem;
          transition: all 0.2s;
          background: #fefcf9;
        }

        .img-placeholder:hover {
          border-color: #c9b69a;
          color: #5a4e3e;
        }

        .img-preview {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 24px;
          border: 1px solid #e2d8cf;
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

        .back-link {
          display: block;
          text-align: center;
          color: #8f8170;
          font-size: 0.75rem;
          margin-top: 1.2rem;
          cursor: pointer;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          color: #2c2c2c;
        }

        @media (max-width: 640px) {
          .aesthetic-add {
            padding: 1rem;
          }
          .add-card {
            padding: 1.5rem;
          }
          .add-title {
            font-size: 1.3rem;
          }
        }
      `}</style>

      <div className="aesthetic-add">
        <div className="add-card">
          <h2 className="add-title">add product</h2>
          <p className="add-sub">list a new item in your store</p>

          <form onSubmit={handleSubmit}>
            <label className="form-label">product name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g., Wool Cashmere Sweater"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="form-label">description</label>
            <textarea
              className="form-textarea"
              placeholder="describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <label className="form-label">price ($)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g., 89.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <label className="form-label">category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- select category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label className="form-label">stock quantity</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g., 25"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />

            <label className="img-label">
              <span className="form-label">product image</span>
              {preview ? (
                <img src={preview} alt="preview" className="img-preview" />
              ) : (
                <div className="img-placeholder">📸 click to upload image</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'adding...' : '➕ add product'}
            </button>
          </form>

          <span className="back-link" onClick={() => navigate('/seller')}>
            ← back to my store
          </span>
        </div>
      </div>
    </>
  );
}

export default AddProductPage;