import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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

        const uploadRes = await axios.post(
          'https://shopapp-backend-1bio.onrender.com/api/upload',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        imageUrl = uploadRes.data.imageUrl
      }

      await axios.post(
        'https://shopapp-backend-1bio.onrender.com/api/products',
        { name, description, price: Number(price), category, stock: Number(stock), image: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('Product added successfully!')
      setTimeout(() => navigate('/'), 1500)

    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Add New Product</h2>
        {message && (
          <p style={{
            ...styles.msg,
            color: message.includes('success') ? 'green' : 'red'
          }}>{message}</p>
        )}
        <form onSubmit={handleSubmit}>
          <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  style={{...styles.input, cursor:'pointer'}}
  required
>
  <option value=''>-- Select Category --</option>
  <option value='Shoes'>Shoes</option>
  <option value='Shirts'>Shirts</option>
  <option value='Pants'>Pants</option>
  <option value='Bags'>Bags</option>
  <option value='Electronics'>Electronics</option>
  <option value='Food'>Food</option>
  <option value='Beauty'>Beauty</option>
  <option value='Home'>Home</option>
  <option value='Sports'>Sports</option>
  <option value='Toys'>Toys</option>
  <option value='Books'>Books</option>
  <option value='Other'>Other</option>
</select>
          <textarea
            placeholder='Product Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            required
          />
          <input
            type='number'
            placeholder='Price (₱)'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type='text'
            placeholder='Category (e.g. Shoes, Shirts)'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type='number'
            placeholder='Stock quantity'
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={styles.input}
            required
          />
          <div style={styles.imageBox}>
            <label style={styles.imageLabel}>
              {preview ? (
                <img src={preview} alt='preview' style={styles.preview} />
              ) : (
                <div style={styles.imagePlaceholder}>
                  📷 Click to upload product image
                </div>
              )}
              <input
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <button
            type='submit'
            style={styles.btn}
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center',
    padding: '40px 20px', background: '#f5f5f5', minHeight: '90vh'
  },
  box: {
    background: 'white', padding: '32px', borderRadius: '8px',
    width: '100%', maxWidth: '500px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: 'fit-content'
  },
  title: { textAlign: 'center', marginBottom: '24px', color: '#333' },
  input: {
    width: '100%', padding: '10px 14px', marginBottom: '12px',
    border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%', padding: '10px 14px', marginBottom: '12px',
    border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px',
    boxSizing: 'border-box', height: '100px', resize: 'vertical'
  },
  imageBox: { marginBottom: '16px' },
  imageLabel: { cursor: 'pointer', display: 'block' },
  imagePlaceholder: {
    border: '2px dashed #ddd', borderRadius: '8px', padding: '32px',
    textAlign: 'center', color: '#aaa', fontSize: '14px'
  },
  preview: {
    width: '100%', height: '200px', objectFit: 'cover',
    borderRadius: '8px', border: '1px solid #ddd'
  },
  btn: {
    width: '100%', padding: '12px', background: '#ee4d2d', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '15px', cursor: 'pointer'
  },
  msg: { textAlign: 'center', marginBottom: '12px', fontSize: '14px' }
}

export default AddProductPage