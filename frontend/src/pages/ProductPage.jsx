import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import ChatButton from '../components/ChatButton'

const API = 'https://shopapp-backend-1bio.onrender.com';

function StarRating({ rating, onRate, interactive }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: interactive ? '1.5rem' : '0.9rem',
            cursor: interactive ? 'pointer' : 'default',
            color: star <= (hover || rating) ? '#f5b042' : '#e2d8cf',
            transition: '0.1s',
          }}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`₱{API}/api/products/₱{id}`);
      setProduct(data);
      setActiveImage(data.image);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`₱{API}/api/reviews/₱{id}`);
      setReviews(data);
    } catch (error) {
      console.log(error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) { setReviewMsg('Please select a star rating!'); return; }
    setSubmitting(true);
    setReviewMsg('');
    try {
      const response = await axios.post(
        `₱{API}/api/reviews/₱{id}`,
        { rating: Number(rating), comment },
        { headers: { Authorization: `Bearer ₱{token}` } }
      );
      setReviewMsg(response.data.message || 'Review submitted!');
      setRating(0);
      setComment('');
      fetchReviews();
      fetchProduct();
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await axios.delete(`₱{API}/api/reviews/₱{id}/₱{reviewId}`, {
        headers: { Authorization: `Bearer ₱{token}` },
      });
      fetchReviews();
      fetchProduct();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader">loading...</div></div>;
  if (!product) return <div className="loader-container"><div className="loader">Product not found.</div></div>;

  const alreadyReviewed = reviews.some(
    (r) => r.user?._id === user?._id || r.user === user?._id
  );

  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        .product-page { min-height: 100vh; background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%); padding: 2rem 1.5rem; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .product-container { max-width: 1100px; margin: 0 auto; }
        .back-btn { background: transparent; border: none; color: #5a4e3e; cursor: pointer; font-family: 'Inter', monospace; font-size: 0.8rem; margin-bottom: 1.5rem; padding: 0; transition: color 0.2s; }
        .back-btn:hover { color: #2c2c2c; }
        .product-card { background: white; border-radius: 32px; border: 1px solid #f0ebe5; padding: 2rem; display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .product-image-section { display: flex; flex-direction: column; gap: 10px; width: 300px; flex-shrink: 0; }
        .product-image-wrapper { width: 300px; height: 300px; background: #fefcf9; border-radius: 24px; display: flex; align-items: center; justify-content: center; border: 1px solid #f0ebe5; overflow: hidden; }
        .product-image-wrapper img { width: 100%; height: 100%; object-fit: cover; border-radius: 24px; transition: opacity 0.2s; }
        .no-image { color: #bcafa0; font-size: 0.8rem; }
        .thumbnails { display: flex; gap: 6px; flex-wrap: wrap; }
        .thumb { width: 58px; height: 58px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; flex-shrink: 0; }
        .thumb:hover { border-color: #c9b69a; }
        .thumb.active { border-color: #2c2c2c; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .product-details { flex: 1; min-width: 200px; }
        .product-name { font-weight: 600; font-size: 1.6rem; letter-spacing: -0.3px; color: #2c2c2c; margin-bottom: 0.5rem; }
        .product-price { font-size: 1.8rem; font-weight: 700; color: #2c2c2c; margin-bottom: 0.75rem; }
        .product-description { color: #5a4e3e; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }
        .product-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .product-tag { background: #fefcf9; border: 1px solid #e2d8cf; color: #5a4e3e; padding: 4px 14px; border-radius: 40px; font-size: 0.75rem; font-weight: 500; }
        .rating-display { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
        .rating-count { color: #8f8170; font-size: 0.75rem; }
        .seller-info { color: #8f8170; font-size: 0.8rem; margin-bottom: 1.5rem; }
        .add-to-cart-btn { width: 100%; padding: 12px; background: #2c2c2c; border: none; border-radius: 40px; color: white; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.3px; }
        .add-to-cart-btn:hover { background: #4f4236; transform: scale(0.98); }
        .reviews-section { max-width: 900px; margin: 0 auto; }
        .reviews-title { font-weight: 600; font-size: 1.2rem; color: #2c2c2c; margin-bottom: 1.5rem; }
        .review-form { background: white; border: 1px solid #f0ebe5; border-radius: 28px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .review-form-title { font-weight: 600; font-size: 0.9rem; color: #2c2c2c; margin-bottom: 1rem; }
        .review-textarea { width: 100%; padding: 10px 14px; background: white; border: 1px solid #e2d8cf; border-radius: 20px; color: #2c2c2c; font-family: 'Inter', monospace; font-size: 0.85rem; box-sizing: border-box; height: 90px; resize: vertical; margin: 0.8rem 0; transition: all 0.2s; }
        .review-textarea:focus { outline: none; border-color: #c9b69a; box-shadow: 0 0 0 2px rgba(90,78,62,0.08); }
        .submit-review-btn { padding: 8px 24px; background: #2c2c2c; border: none; border-radius: 40px; color: white; font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .submit-review-btn:hover:not(:disabled) { background: #4f4236; transform: scale(0.98); }
        .submit-review-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .review-message { font-size: 0.75rem; margin-top: 0.5rem; padding: 6px 12px; border-radius: 40px; display: inline-block; }
        .review-message.success { color: #2c6e4f; background: #eafaf3; }
        .review-message.error { color: #b15e4a; background: #fef4f1; }
        .review-card { background: white; border: 1px solid #f0ebe5; border-radius: 24px; padding: 1rem; margin-bottom: 0.8rem; }
        .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 8px; }
        .reviewer-name { font-weight: 600; font-size: 0.85rem; color: #2c2c2c; }
        .review-date { color: #8f8170; font-size: 0.7rem; }
        .review-comment { color: #5a4e3e; font-size: 0.85rem; line-height: 1.5; margin-top: 0.5rem; }
        .delete-review-btn { background: transparent; border: 1px solid #f0cfc9; color: #b15e4a; padding: 3px 12px; border-radius: 40px; cursor: pointer; font-size: 0.7rem; font-weight: 500; transition: all 0.2s; }
        .delete-review-btn:hover { background: #b15e4a; border-color: #b15e4a; color: white; }
        .no-reviews { color: #8f8170; text-align: center; padding: 2rem; font-size: 0.85rem; background: white; border-radius: 28px; border: 1px solid #f0ebe5; }
        .login-to-review { text-align: center; padding: 1rem; background: white; border-radius: 28px; border: 1px solid #f0ebe5; }
        .login-to-review a { color: #2c2c2c; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .already-reviewed { text-align: center; padding: 0.8rem; background: #eafaf3; color: #2c6e4f; border-radius: 40px; font-size: 0.8rem; margin-bottom: 1.5rem; }
        .loader-container { min-height: 100vh; background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%); display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
        .loader { color: #8f8170; font-size: 0.9rem; }
        @media (max-width: 760px) {
          .product-page { padding: 1rem; }
          .product-card { padding: 1rem; }
          .product-image-section { width: 100%; }
          .product-image-wrapper { width: 100%; height: 260px; }
        }
      `}</style>

      <div className="product-page">
        <div className="product-container">
          <button className="back-btn" onClick={() => navigate('/')}>← back to shop</button>

          <div className="product-card">
            {/* IMAGE GALLERY */}
            <div className="product-image-section">
              <div className="product-image-wrapper">
                {activeImage
                  ? <img src={activeImage} alt={product.name} />
                  : <div className="no-image">no image</div>
                }
              </div>
              {allImages.length > 1 && (
                <div className="thumbnails">
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      className={`thumb ₱{activeImage === img ? 'active' : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`view ₱{i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS */}
            <div className="product-details">
              <h1 className="product-name">{product.name}</h1>
              <div className="product-price">₱{product.price.toLocaleString()}</div>
              <div className="rating-display">
                <StarRating rating={Math.round(product.ratings || 0)} interactive={false} />
                <span className="rating-count">
                  {product.ratings > 0 ? product.ratings.toFixed(1) : 'No ratings'} ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <p className="product-description">{product.description}</p>
              <div className="product-tags">
                <span className="product-tag">📦 {product.category}</span>
                <span className="product-tag">🗃 stock: {product.stock}</span>
              </div>
              <p className="seller-info">🏪 sold by: {product.seller?.storeName || product.seller?.name || 'Unknown'}</p>

              <button className="add-to-cart-btn" onClick={() => { addItem(product); navigate('/cart'); }}>
                add to cart
              </button>

              <ChatButton
                sellerId={product.seller?._id}
                sellerName={product.seller?.storeName || product.seller?.name}
                productId={product._id}
                productName={product.name}
              />
            </div>
          </div>

          {/* REVIEWS */}
          <div className="reviews-section">
            <div className="reviews-title">customer reviews ({reviews.length})</div>

            {user ? (
              alreadyReviewed ? (
                <div className="already-reviewed">✓ You have already reviewed this product</div>
              ) : (
                <div className="review-form">
                  <div className="review-form-title">write a review</div>
                  <form onSubmit={submitReview}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <p style={{ color: '#5a4e3e', fontSize: '0.75rem', marginBottom: '6px', fontWeight: 500 }}>your rating:</p>
                      <StarRating rating={rating} onRate={(val) => setRating(Number(val))} interactive={true} />
                    </div>
                    <textarea className="review-textarea" placeholder="Share your experience with this product..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                    {reviewMsg && (
                      <div className={`review-message ₱{reviewMsg.includes('submitted') ? 'success' : 'error'}`}>{reviewMsg}</div>
                    )}
                    <button type="submit" className="submit-review-btn" disabled={submitting}>
                      {submitting ? 'submitting...' : 'submit review'}
                    </button>
                  </form>
                </div>
              )
            ) : (
              <div className="login-to-review">
                <a onClick={() => navigate('/login')}>Login</a> to write a review
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="no-reviews">No reviews yet. Be the first to review!</div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div>
                      <div className="reviewer-name">👤 {review.name}</div>
                      <StarRating rating={review.rating} interactive={false} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      {user && (review.user?._id === user._id || review.user === user._id) && (
                        <button className="delete-review-btn" onClick={() => deleteReview(review._id)}>delete</button>
                      )}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductPage;