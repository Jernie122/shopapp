import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'

const API = 'https://shopapp-backend-1bio.onrender.com'

function StarRating({ rating, onRate, interactive }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{display:'flex',gap:'4px'}}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{
            fontSize: interactive ? '1.5rem' : '1rem',
            cursor: interactive ? 'pointer' : 'default',
            color: star <= (hover || rating) ? '#ffaa44' : '#333',
            textShadow: star <= (hover || rating) ? '0 0 4px #ffaa44' : 'none',
            transition: '0.1s'
          }}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >★</span>
      ))}
    </div>
  )
}

function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewMsg, setReviewMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addItem } = useCartStore()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${API}/api/products/${id}`)
      setProduct(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API}/api/reviews/${id}`)
      setReviews(data)
    } catch (error) {
      console.log(error)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (rating === 0) { setReviewMsg('Please select a star rating!'); return }
    setSubmitting(true)
    setReviewMsg('')
    try {
      await axios.post(
        `${API}/api/reviews/${id}`,
        { rating: Number(rating), comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setReviewMsg('Review submitted!')
      setRating(0)
      setComment('')
      fetchReviews()
      fetchProduct()
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return
    try {
      await axios.delete(
        `${API}/api/reviews/${id}/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchReviews()
      fetchProduct()
    } catch (err) {
      console.log(err)
    }
  }

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!product) return <div style={styles.loading}>Product not found.</div>

  const alreadyReviewed = reviews.some(r => r.user?._id === user?._id || r.user === user?._id)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=Roboto+Mono&display=swap');
        .product-wrap { min-height: 100vh; background: #0e0a1f; padding: 2rem; font-family: 'Roboto Mono', monospace; }
        .back-btn { background: transparent; border: none; color: #ffaa44; cursor: pointer; font-family: 'Roboto Mono', monospace; font-size: 0.85rem; margin-bottom: 1.5rem; padding: 0; }
        .back-btn:hover { color: #ff44aa; }
        .product-card { background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 16px; padding: 2rem; display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; max-width: 900px; margin-left: auto; margin-right: auto; }
        .product-img-box { width: 300px; height: 300px; background: #0a0515; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #ff44aa; flex-shrink: 0; overflow: hidden; }
        .product-img-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
        .no-img-text { color: #ffaa44; font-size: 0.8rem; }
        .product-details { flex: 1; min-width: 200px; }
        .product-name { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1.3rem; margin-bottom: 0.5rem; }
        .product-price { font-size: 1.8rem; color: #ff44aa; font-family: 'Orbitron', monospace; margin-bottom: 1rem; }
        .product-desc { color: #aaa; font-size: 0.85rem; line-height: 1.7; margin-bottom: 1rem; }
        .product-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .product-tag { background: rgba(255,170,68,0.1); border: 1px solid #ffaa4466; color: #ffaa44; padding: 3px 12px; border-radius: 20px; font-size: 0.75rem; }
        .rating-display { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
        .rating-count { color: #888; font-size: 0.75rem; }
        .seller-info { color: #888; font-size: 0.8rem; margin-bottom: 1.5rem; }
        .add-cart-btn { width: 100%; padding: 14px; background: linear-gradient(90deg, #ff44aa, #ffaa44); border: none; border-radius: 30px; color: #0e0a1f; font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: bold; cursor: pointer; letter-spacing: 1px; }
        .add-cart-btn:hover { opacity: 0.9; transform: scale(1.01); }

        .reviews-section { max-width: 900px; margin: 0 auto; }
        .reviews-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 1rem; margin-bottom: 1.5rem; text-shadow: 0 0 4px #ff44aa; }
        .review-form { background: rgba(255,170,68,0.05); border: 1px solid #ffaa4466; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
        .review-form-title { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.85rem; margin-bottom: 1rem; }
        .review-textarea { width: 100%; padding: 10px 14px; background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 6px; color: #fff; font-family: 'Roboto Mono', monospace; font-size: 13px; box-sizing: border-box; height: 80px; resize: vertical; margin: 0.8rem 0; }
        .review-textarea:focus { outline: none; border-color: #ff44aa; }
        .submit-review-btn { padding: 8px 24px; background: linear-gradient(90deg, #ff44aa, #ffaa44); border: none; border-radius: 30px; color: #0e0a1f; font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: bold; cursor: pointer; }
        .submit-review-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .review-msg { font-size: 13px; margin-top: 0.5rem; }
        .review-card { background: rgba(255,170,68,0.03); border: 1px solid #ffaa4433; border-radius: 10px; padding: 1rem; margin-bottom: 0.8rem; }
        .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 8px; }
        .reviewer-name { color: #ffaa44; font-size: 0.85rem; font-weight: bold; }
        .review-date { color: #888; font-size: 0.75rem; }
        .review-comment { color: #ccc; font-size: 0.85rem; line-height: 1.6; margin-top: 0.5rem; }
        .delete-review-btn { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 2px 8px; border-radius: 20px; cursor: pointer; font-size: 0.7rem; }
        .no-reviews { color: #888; text-align: center; padding: 2rem; font-size: 0.85rem; }
        .login-to-review { color: #888; font-size: 0.85rem; text-align: center; padding: 1rem; }
        .login-to-review a { color: #ffaa44; cursor: pointer; }
      `}</style>

      <div className="product-wrap">
        <button className="back-btn" onClick={() => navigate('/')}>← BACK TO BAZAAR</button>

        <div className="product-card">
          <div className="product-img-box">
            {product.image
              ? <img src={product.image} alt={product.name} />
              : <div className="no-img-text">[ NO DISPLAY ]</div>
            }
          </div>
          <div className="product-details">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-price">₱{product.price.toLocaleString()}</div>
            <div className="rating-display">
              <StarRating rating={Math.round(product.ratings || 0)} interactive={false} />
              <span className="rating-count">
                {product.ratings > 0 ? product.ratings.toFixed(1) : 'No ratings'} ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <p className="product-desc">{product.description}</p>
            <div className="product-tags">
              <span className="product-tag">📦 {product.category}</span>
              <span className="product-tag">🗃 Stock: {product.stock}</span>
            </div>
            <p className="seller-info">🏪 Sold by: {product.seller?.storeName || product.seller?.name || 'Unknown'}</p>
            <button className="add-cart-btn" onClick={() => { addItem(product); navigate('/cart') }}>
              ⚡ ADD TO CART
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="reviews-section">
          <p className="reviews-title">⟡ CUSTOMER REVIEWS ({reviews.length})</p>

          {/* REVIEW FORM */}
          {user ? (
            alreadyReviewed ? (
              <p style={{color:'#44ff99',fontSize:'13px',marginBottom:'1.5rem',textAlign:'center'}}>✓ You have already reviewed this product</p>
            ) : (
              <div className="review-form">
                <p className="review-form-title">WRITE A REVIEW</p>
                <form onSubmit={submitReview}>
                  <div style={{marginBottom:'0.5rem'}}>
                    <p style={{color:'#888',fontSize:'12px',marginBottom:'6px'}}>YOUR RATING:</p>
                    <StarRating rating={rating} onRate={(val) => setRating(Number(val))} interactive={true} />
                  </div>
                  <textarea
                    className="review-textarea"
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  {reviewMsg && (
                    <p className="review-msg" style={{color: reviewMsg.includes('submitted') ? '#44ff99' : '#ff4444'}}>
                      {reviewMsg}
                    </p>
                  )}
                  <button type="submit" className="submit-review-btn" disabled={submitting}>
                    {submitting ? 'SUBMITTING...' : '⟡ SUBMIT REVIEW'}
                  </button>
                </form>
              </div>
            )
          ) : (
            <p className="login-to-review">
              <span onClick={() => navigate('/login')} style={{color:'#ffaa44',cursor:'pointer'}}>Login</span> to write a review
            </p>
          )}

          {/* REVIEWS LIST */}
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div>
                    <div className="reviewer-name">👤 {review.name}</div>
                    <StarRating rating={review.rating} interactive={false} />
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString('en-PH', {year:'numeric',month:'long',day:'numeric'})}</span>
                    {user && (review.user?._id === user._id || review.user === user._id) && (
                      <button className="delete-review-btn" onClick={() => deleteReview(review._id)}>DELETE</button>
                    )}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

const styles = {
  loading: { minHeight: '100vh', background: '#0e0a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffaa44', fontFamily: 'monospace' }
}

export default ProductPage