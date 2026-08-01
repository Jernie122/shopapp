import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://shopapp-backend-1bio.onrender.com'

function ChatButton({ sellerId, sellerName, productId, productName }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const startChat = async () => {
    if (!user) { navigate('/login'); return }
    if (user._id === sellerId) return

    try {
      await axios.post(`${API}/api/chat/send`, {
        receiverId: sellerId,
        message: `Hi! I'm interested in your product: ${productName}`,
        productId
      }, { headers: { Authorization: `Bearer ${token}` } })

      const ids = [user._id, sellerId].sort()
      const conversationId = `${ids[0]}_${ids[1]}_${productId}`
      navigate(`/chat/${conversationId}`)
    } catch (err) {
      console.log(err)
    }
  }

  if (!user || user._id === sellerId || user.role === 'admin') return null

  return (
    <button onClick={startChat} style={{
      width: '100%',
      marginTop: '10px',
      padding: '12px',
      background: 'transparent',
      border: '1px solid #ffaa44',
      borderRadius: '30px',
      color: '#ffaa44',
      fontFamily: 'Orbitron, monospace',
      fontSize: '0.85rem',
      cursor: 'pointer',
      letterSpacing: '1px'
    }}>
      💬 CHAT WITH SELLER
    </button>
  )
}

export default ChatButton