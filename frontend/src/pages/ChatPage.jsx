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
  const [activeConv, setActiveConv] = useState(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const userId = user?._id || user?.id
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    const newSocket = io(API, { transports: ['websocket', 'polling'] })
    newSocket.emit('join', userId)
    setSocket(newSocket)

    newSocket.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, data])
      fetchConversations()
    })

    fetchConversations()

// Auto refresh every 3 seconds
const interval = setInterval(() => {
  fetchConversations()
  if (activeConv) fetchMessages(activeConv)
}, 3000)

return () => {
  newSocket.disconnect()
  clearInterval(interval)
}
  }, [])

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      setActiveConv(conversationId)
    }
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

  const fetchMessages = async (convId) => {
    try {
      const { data } = await axios.get(`${API}/api/chat/${convId}`, { headers })
      setMessages(data)
    } catch (err) { console.log(err) }
  }

  const openConversation = (convId) => {
    setActiveConv(convId)
    fetchMessages(convId)
    navigate(`/chat/${convId}`)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return

    try {
      const conv = conversations.find(c => c.conversationId === activeConv)
      const otherUser = conv?.otherUser
      if (!otherUser) return

      const receiverId = otherUser._id || otherUser.id
      const productId = activeConv.split('_')[2]

      const { data } = await axios.post(`${API}/api/chat/send`, {
        receiverId,
        message: newMessage,
        productId: productId !== 'undefined' ? productId : undefined
      }, { headers })

      setMessages(prev => [...prev, data])
      setNewMessage('')

      socket?.emit('sendMessage', {
        ...data,
        receiverId
      })

      fetchConversations()
    } catch (err) { console.log(err) }
  }

  const getActiveConvData = () => conversations.find(c => c.conversationId === activeConv)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        * { box-sizing: border-box; }
        .chat-wrap { height: calc(100vh - 60px); background: #f9f7f5; display: flex; font-family: 'Inter', sans-serif; overflow: hidden; }
        .conv-list { width: 280px; border-right: 1px solid #f0ebe5; background: white; display: flex; flex-direction: column; flex-shrink: 0; }
        .conv-header { padding: 1rem 1.2rem; border-bottom: 1px solid #f0ebe5; font-weight: 600; font-size: 0.9rem; color: #2c2c2c; }
        .conv-item { padding: 0.9rem 1.2rem; border-bottom: 1px solid #f9f7f5; cursor: pointer; transition: background 0.15s; }
        .conv-item:hover { background: #faf8f6; }
        .conv-item.active { background: #f5f0ea; border-left: 3px solid #8a6e4b; }
        .conv-user { font-weight: 600; font-size: 0.8rem; color: #2c2c2c; display: flex; justify-content: space-between; margin-bottom: 3px; }
        .conv-product { font-size: 0.7rem; color: #8f8170; margin-bottom: 3px; }
        .conv-last { font-size: 0.72rem; color: #bcafa0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .unread-badge { background: #2c2c2c; color: white; font-size: 0.6rem; padding: 1px 6px; border-radius: 20px; }
        .no-conv { color: #bcafa0; font-size: 0.8rem; text-align: center; padding: 2rem 1rem; }
        .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #faf8f6; }
        .chat-header { padding: 0.9rem 1.5rem; border-bottom: 1px solid #f0ebe5; background: white; display: flex; align-items: center; gap: 0.8rem; }
        .chat-header-img { width: 36px; height: 36px; object-fit: cover; border-radius: 8px; border: 1px solid #f0ebe5; background: #f5f0ea; }
        .chat-header-name { font-weight: 600; font-size: 0.85rem; color: #2c2c2c; }
        .chat-header-product { font-size: 0.72rem; color: #8f8170; }
        .messages-wrap { flex: 1; overflow-y: auto; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .msg-row { display: flex; }
        .msg-row.mine { justify-content: flex-end; }
        .msg-row.theirs { justify-content: flex-start; }
        .msg-bubble { max-width: 65%; padding: 9px 14px; border-radius: 18px; font-size: 0.82rem; line-height: 1.5; }
        .msg-row.mine .msg-bubble { background: #2c2c2c; color: white; border-bottom-right-radius: 4px; }
        .msg-row.theirs .msg-bubble { background: white; border: 1px solid #f0ebe5; color: #2c2c2c; border-bottom-left-radius: 4px; }
        .msg-time { font-size: 0.62rem; color: #bcafa0; margin-top: 3px; text-align: right; }
        .msg-sender { font-size: 0.65rem; color: #8f8170; margin-bottom: 3px; font-weight: 500; }
        .chat-input-wrap { padding: 0.9rem 1.2rem; border-top: 1px solid #f0ebe5; background: white; display: flex; gap: 0.6rem; align-items: center; }
        .chat-input { flex: 1; padding: 9px 16px; background: #f9f7f5; border: 1px solid #f0ebe5; border-radius: 40px; color: #2c2c2c; font-family: 'Inter', sans-serif; font-size: 0.82rem; outline: none; transition: border 0.2s; }
        .chat-input:focus { border-color: #c9b69a; }
        .send-btn { padding: 9px 20px; background: #2c2c2c; border: none; border-radius: 40px; color: white; font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .send-btn:hover { background: #4f4236; }
        .no-chat { flex: 1; display: flex; align-items: center; justify-content: center; color: #bcafa0; font-size: 0.85rem; flex-direction: column; gap: 0.8rem; background: #faf8f6; }
        .no-chat-icon { font-size: 2.5rem; }
        @media (max-width: 640px) {
  .chat-wrap { height: calc(100vh - 56px); flex-direction: column; }
  .conv-list { width: 100%; height: auto; border-right: none; border-bottom: 1px solid #f0ebe5; flex-direction: row; overflow-x: auto; display: flex; flex-shrink: 0; max-height: 80px; }
  .conv-header { display: none; }
  .conv-item { min-width: 120px; padding: 0.6rem 0.8rem; border-bottom: none; border-right: 1px solid #f9f7f5; flex-shrink: 0; }
  .conv-item.active { border-left: none; border-bottom: 3px solid #8a6e4b; }
  .conv-user { font-size: 0.72rem; }
  .conv-product { display: none; }
  .conv-last { font-size: 0.65rem; }
  .chat-area { flex: 1; min-height: 0; }
  .chat-header { padding: 0.6rem 1rem; }
  .chat-header-name { font-size: 0.8rem; }
  .chat-header-product { font-size: 0.65rem; }
  .messages-wrap { padding: 0.8rem; }
  .msg-bubble { max-width: 80%; font-size: 0.8rem; padding: 8px 12px; }
  .chat-input-wrap { padding: 0.6rem 0.8rem; gap: 0.4rem; }
  .chat-input { font-size: 0.8rem; padding: 8px 12px; }
  .send-btn { padding: 8px 14px; font-size: 0.7rem; }
  .no-chat { padding: 2rem 1rem; }
}
      `}</style>

      <div className="chat-wrap">
        <div className="conv-list">
          <div className="conv-header">💬 messages</div>
          {loading ? (
            <p style={{color:'#bcafa0',fontSize:'12px',padding:'1rem',textAlign:'center'}}>Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="no-conv">No conversations yet</p>
          ) : conversations.map(conv => (
            <div
              key={conv.conversationId}
              className={`conv-item ${activeConv === conv.conversationId ? 'active' : ''}`}
              onClick={() => openConversation(conv.conversationId)}
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

        {activeConv ? (
          <div className="chat-area">
            <div className="chat-header">
              {getActiveConvData()?.product?.image && (
                <img src={getActiveConvData().product.image} alt="" className="chat-header-img" />
              )}
              <div>
                <div className="chat-header-name">
                  {getActiveConvData()?.otherUser?.storeName || getActiveConvData()?.otherUser?.name || 'Chat'}
                </div>
                {getActiveConvData()?.product && (
                  <div className="chat-header-product">
                    📦 {getActiveConvData().product.name} — ₱{getActiveConvData().product.price?.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="messages-wrap">
              {messages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender
                const isMine = senderId === userId
                return (
                  <div key={i} className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                    <div>
                      {!isMine && (
                        <div className="msg-sender">{msg.sender?.storeName || msg.sender?.name}</div>
                      )}
                      <div className="msg-bubble">{msg.message}</div>
                      <div className="msg-time">
                        {new Date(msg.createdAt).toLocaleTimeString('en-PH', {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-wrap">
              <input
                className="chat-input"
                placeholder="write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-btn">send</button>
            </form>
          </div>
        ) : (
          <div className="no-chat">
            <div className="no-chat-icon">💬</div>
            <div>select a conversation</div>
            <div style={{fontSize:'0.75rem',color:'#d4c9be'}}>or go to a product page and click "chat with seller"</div>
          </div>
        )}
      </div>
    </>
  )
}

export default ChatPage