import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = 'https://shopapp-backend-1bio.onrender.com'

function ChatPage() {
  const { conversationId } = useParams()
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    const newSocket = io(API)
    newSocket.emit('join', user._id)
    setSocket(newSocket)

    newSocket.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, data])
    })

    fetchConversations()

    return () => newSocket.disconnect()
  }, [])

  useEffect(() => {
    if (conversationId) fetchMessages()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/conversations`, { headers })
      setConversations(data)
      setLoading(false)
    } catch (err) { setLoading(false) }
  }

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/${conversationId}`, { headers })
      setMessages(data)
    } catch (err) { console.log(err) }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const currentMessages = messages
      const otherUser = currentMessages.find(m =>
        m.sender._id !== user._id
      )?.sender || conversations.find(c =>
        c.conversationId === conversationId
      )?.otherUser

      if (!otherUser) return

      const { data } = await axios.post(`${API}/api/chat/send`, {
        receiverId: otherUser._id,
        message: newMessage,
        productId: conversationId.split('_')[2]
      }, { headers })

      setMessages(prev => [...prev, data])
      setNewMessage('')

      socket?.emit('sendMessage', {
        ...data,
        receiverId: otherUser._id
      })

      fetchConversations()
    } catch (err) { console.log(err) }
  }

  const getOtherUser = () => {
    const conv = conversations.find(c => c.conversationId === conversationId)
    return conv?.otherUser
  }

  const getProduct = () => {
    const conv = conversations.find(c => c.conversationId === conversationId)
    return conv?.product
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Roboto+Mono&display=swap');
        .chat-wrap { min-height: 100vh; background: #0e0a1f; display: flex; font-family: 'Roboto Mono', monospace; }

        /* CONVERSATIONS LIST */
        .conv-list { width: 280px; border-right: 1px solid #ffaa4433; display: flex; flex-direction: column; flex-shrink: 0; }
        .conv-header { padding: 1rem; border-bottom: 1px solid #ffaa4433; font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.85rem; }
        .conv-item { padding: 1rem; border-bottom: 1px solid #ffaa4422; cursor: pointer; transition: 0.15s; }
        .conv-item:hover { background: rgba(255,170,68,0.05); }
        .conv-item.active { background: rgba(255,68,170,0.1); border-left: 2px solid #ff44aa; }
        .conv-user { color: #ffaa44; font-size: 0.8rem; font-weight: bold; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
        .conv-product { color: #888; font-size: 0.7rem; margin-bottom: 4px; }
        .conv-last { color: #666; font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .unread-badge { background: #ff44aa; color: #0e0a1f; font-size: 0.6rem; padding: 1px 6px; border-radius: 20px; }
        .no-conv { color: #888; font-size: 0.8rem; text-align: center; padding: 2rem; }

        /* CHAT AREA */
        .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .chat-header { padding: 1rem 1.5rem; border-bottom: 1px solid #ffaa4433; display: flex; align-items: center; gap: 1rem; }
        .chat-header-name { font-family: 'Orbitron', monospace; color: #ffaa44; font-size: 0.9rem; }
        .chat-header-product { color: #888; font-size: 0.75rem; }
        .chat-product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #ffaa44; }
        .messages-wrap { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .msg-row { display: flex; }
        .msg-row.mine { justify-content: flex-end; }
        .msg-row.theirs { justify-content: flex-start; }
        .msg-bubble { max-width: 65%; padding: 10px 14px; border-radius: 16px; font-size: 0.8rem; line-height: 1.5; }
        .msg-row.mine .msg-bubble { background: linear-gradient(135deg, #ff44aa, #ffaa44); color: #0e0a1f; border-bottom-right-radius: 4px; }
        .msg-row.theirs .msg-bubble { background: rgba(255,170,68,0.1); border: 1px solid #ffaa4433; color: #ccc; border-bottom-left-radius: 4px; }
        .msg-time { font-size: 0.65rem; color: #888; margin-top: 4px; text-align: right; }
        .msg-sender { font-size: 0.65rem; color: #ffaa44; margin-bottom: 4px; }
        .chat-input-wrap { padding: 1rem 1.5rem; border-top: 1px solid #ffaa4433; display: flex; gap: 0.8rem; }
        .chat-input { flex: 1; padding: 10px 16px; background: rgba(255,170,68,0.05); border: 1px solid #ffaa44; border-radius: 30px; color: #fff; font-family: 'Roboto Mono', monospace; font-size: 13px; outline: none; }
        .chat-input:focus { border-color: #ff44aa; }
        .send-btn { padding: 10px 20px; background: linear-gradient(90deg, #ff44aa, #ffaa44); border: none; border-radius: 30px; color: #0e0a1f; font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: bold; cursor: pointer; }
        .no-chat { flex: 1; display: flex; align-items: center; justify-content: center; color: #888; font-size: 0.85rem; flex-direction: column; gap: 1rem; }
        .no-chat-icon { font-size: 3rem; }
        @media (max-width: 640px) { .conv-list { width: 80px; } .conv-user span:first-child, .conv-product, .conv-last { display: none; } }
      `}</style>

      <div className="chat-wrap">
        {/* CONVERSATIONS SIDEBAR */}
        <div className="conv-list">
          <div className="conv-header">💬 MESSAGES</div>
          {loading ? (
            <p style={{color:'#888',fontSize:'12px',padding:'1rem',textAlign:'center'}}>Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="no-conv">No conversations yet</p>
          ) : conversations.map(conv => (
            <div
              key={conv.conversationId}
              className={`conv-item ${conversationId === conv.conversationId ? 'active' : ''}`}
              onClick={() => navigate(`/chat/${conv.conversationId}`)}
            >
              <div className="conv-user">
                <span>{conv.otherUser?.storeName || conv.otherUser?.name}</span>
                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
              </div>
              {conv.product && <div className="conv-product">📦 {conv.product.name}</div>}
              <div className="conv-last">{conv.lastMessage?.message}</div>
            </div>
          ))}
        </div>

        {/* CHAT AREA */}
        {conversationId ? (
          <div className="chat-area">
            <div className="chat-header">
              {getProduct()?.image && (
                <img src={getProduct().image} alt="" className="chat-product-img" />
              )}
              <div>
                <div className="chat-header-name">
                  {getOtherUser()?.storeName || getOtherUser()?.name || 'Chat'}
                </div>
                {getProduct() && (
                  <div className="chat-header-product">📦 {getProduct().name} — ₱{getProduct().price?.toLocaleString()}</div>
                )}
              </div>
            </div>

            <div className="messages-wrap">
              {messages.map((msg, i) => (
                <div key={i} className={`msg-row ${msg.sender._id === user._id ? 'mine' : 'theirs'}`}>
                  <div>
                    {msg.sender._id !== user._id && (
                      <div className="msg-sender">{msg.sender.storeName || msg.sender.name}</div>
                    )}
                    <div className="msg-bubble">{msg.message}</div>
                    <div className="msg-time">
                      {new Date(msg.createdAt).toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-wrap">
              <input
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-btn">SEND</button>
            </form>
          </div>
        ) : (
          <div className="no-chat">
            <div className="no-chat-icon">💬</div>
            <div>Select a conversation or start a new one</div>
            <div style={{fontSize:'0.75rem',color:'#666'}}>Go to a product page and click "Chat with Seller"</div>
          </div>
        )}
      </div>
    </>
  )
}

export default ChatPage