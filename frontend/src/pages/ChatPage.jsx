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
  const headers = { Authorization: `Bearer ₱{token}` }

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
      const { data } = await axios.get(`₱{API}/api/chat/conversations`, { headers })
      setConversations(data)
      setLoading(false)
    } catch (err) { setLoading(false) }
  }

  const fetchMessages = async (convId) => {
    try {
      const { data } = await axios.get(`₱{API}/api/chat/₱{convId}`, { headers })
      setMessages(data)
    } catch (err) { console.log(err) }
  }

  const openConversation = (convId) => {
    setActiveConv(convId)
    fetchMessages(convId)
    navigate(`/chat/₱{convId}`)
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

      const { data } = await axios.post(`₱{API}/api/chat/send`, {
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
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .chat-wrap {
          height: calc(100vh - 60px);
          background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.9), rgba(235, 225, 215, 0.7)), #f5efe9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          overflow: hidden;
        }

        /* Glass Conversation List */
        .conv-list {
          width: 300px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          box-shadow: 4px 0 12px rgba(0, 0, 0, 0.02);
        }

        .conv-header {
          padding: 1.2rem 1.2rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: #2c2c2c;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(4px);
        }

        .conv-item {
          padding: 0.9rem 1.2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 20px;
          margin: 4px 8px;
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(4px);
        }

        .conv-item:hover {
          background: rgba(255, 255, 255, 0.7);
          transform: translateX(3px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .conv-item.active {
          background: rgba(44, 44, 44, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .conv-item.active .conv-user,
        .conv-item.active .conv-last,
        .conv-item.active .conv-product {
          color: white;
        }

        .conv-user {
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          color: #2c2c2c;
        }

        .conv-product {
          font-size: 0.7rem;
          color: #6b5a48;
          margin-bottom: 4px;
        }

        .conv-last {
          font-size: 0.7rem;
          color: #8f7a64;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .unread-badge {
          background: #2c2c2c;
          color: white;
          font-size: 0.6rem;
          padding: 1px 6px;
          border-radius: 20px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .no-conv {
          color: #8f7a64;
          font-size: 0.8rem;
          text-align: center;
          padding: 2rem 1rem;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(8px);
          border-radius: 28px;
          margin: 1rem;
        }

        /* Glass Chat Area */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: rgba(250, 248, 246, 0.5);
          backdrop-filter: blur(8px);
          margin: 12px 12px 12px 0;
          border-radius: 36px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05), inset 0 0 0 0.5px rgba(255,255,255,0.6);
          overflow: hidden;
        }

        .chat-header {
          padding: 0.9rem 1.5rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .chat-header-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .chat-header-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #1e1e1e;
        }

        .chat-header-product {
          font-size: 0.72rem;
          color: #6b5a48;
        }

        /* Messages container */
        .messages-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .msg-row {
          display: flex;
        }

        .msg-row.mine {
          justify-content: flex-end;
        }

        .msg-row.theirs {
          justify-content: flex-start;
        }

        /* Glass bubbles */
        .msg-bubble {
          max-width: 70%;
          padding: 10px 16px;
          border-radius: 24px;
          font-size: 0.85rem;
          line-height: 1.45;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .msg-row.mine .msg-bubble {
          background: rgba(44, 44, 44, 0.85);
          color: white;
          border-bottom-right-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .msg-row.theirs .msg-bubble {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.7);
          color: #2c2c2c;
          border-bottom-left-radius: 6px;
        }

        .msg-time {
          font-size: 0.62rem;
          color: #a8957e;
          margin-top: 4px;
          text-align: right;
          padding-right: 6px;
        }

        .msg-sender {
          font-size: 0.7rem;
          color: #6b5a48;
          margin-bottom: 4px;
          font-weight: 500;
          padding-left: 4px;
        }

        /* Glass input area */
        .chat-input-wrap {
          padding: 1rem 1.2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }

        .chat-input {
          flex: 1;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 40px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #2c2c2c;
          outline: none;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }

        .chat-input:focus {
          border-color: #c9b69a;
          box-shadow: 0 0 0 2px rgba(90, 78, 62, 0.1);
          background: rgba(255, 255, 255, 0.9);
        }

        .send-btn {
          padding: 9px 24px;
          background: #2c2c2c;
          border: none;
          border-radius: 40px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .send-btn:hover {
          background: #4a3f33;
          transform: scale(0.97);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .no-chat {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(12px);
          border-radius: 48px;
          margin: 2rem;
          padding: 2rem;
          color: #6b5a48;
          font-size: 0.9rem;
          text-align: center;
        }

        .no-chat-icon {
          font-size: 3rem;
          opacity: 0.6;
        }

        /* Scrollbar */
        .messages-wrap::-webkit-scrollbar {
          width: 4px;
        }
        .messages-wrap::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .messages-wrap::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .chat-wrap {
            height: calc(100vh - 56px);
            flex-direction: column;
          }
          .conv-list {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            flex-shrink: 0;
            max-height: 90px;
            gap: 8px;
            padding: 8px;
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(16px);
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.5);
          }
          .conv-header {
            display: none;
          }
          .conv-item {
            min-width: 130px;
            padding: 0.5rem 0.8rem;
            margin: 0;
            border-radius: 24px;
          }
          .conv-item.active {
            border-left: none;
            border-bottom: 2px solid #8a6e4b;
          }
          .conv-product {
            display: none;
          }
          .chat-area {
            margin: 8px;
            border-radius: 28px;
          }
          .msg-bubble {
            max-width: 85%;
          }
        }
      `}</style>

      <div className="chat-wrap">
        <div className="conv-list">
          <div className="conv-header">💬 messages</div>
          {loading ? (
            <p style={{ color: '#8f7a64', fontSize: '12px', padding: '1rem', textAlign: 'center' }}>Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="no-conv">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.conversationId}
                className={`conv-item ₱{activeConv === conv.conversationId ? 'active' : ''}`}
                onClick={() => openConversation(conv.conversationId)}
              >
                <div className="conv-user">
                  <span>{conv.otherUser?.storeName || conv.otherUser?.name}</span>
                  {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                </div>
                {conv.product && <div className="conv-product">📦 {conv.product.name}</div>}
                <div className="conv-last">{conv.lastMessage?.message}</div>
              </div>
            ))
          )}
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
                  <div key={i} className={`msg-row ₱{isMine ? 'mine' : 'theirs'}`}>
                    <div>
                      {!isMine && (
                        <div className="msg-sender">{msg.sender?.storeName || msg.sender?.name}</div>
                      )}
                      <div className="msg-bubble">{msg.message}</div>
                      <div className="msg-time">
                        {new Date(msg.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
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
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>or go to a product page and click "chat with seller"</div>
          </div>
        )}
      </div>
    </>
  )
}

export default ChatPage