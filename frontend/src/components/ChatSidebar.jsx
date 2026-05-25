import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = 'https://shopapp-backend-1bio.onrender.com'

function ChatSidebar() {
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [socket, setSocket] = useState(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const userId = user?._id || user?.id
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user) return

    const newSocket = io(API, { transports: ['websocket', 'polling'] })
    newSocket.emit('join', userId)
    setSocket(newSocket)

    newSocket.on('receiveMessage', () => {
      fetchConversations()
    })

    fetchConversations()

    const interval = setInterval(() => {
      fetchConversations()
    }, 3000)

    return () => {
      newSocket.disconnect()
      clearInterval(interval)
    }
  }, [])

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/conversations`, { headers })
      setConversations(data)
      setUnreadTotal(data.reduce((sum, c) => sum + (c.unread || 0), 0))
    } catch (err) { console.log(err) }
  }

  const openChat = (conv) => {
    setOpen(false)
    navigate(`/chat/${conv.conversationId}`)
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        .chat-tab {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9999;
          background: #2c2c2c;
          color: white;
          border: none;
          border-radius: 0 12px 12px 0;
          padding: 14px 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          box-shadow: 3px 0 12px rgba(0,0,0,0.15);
          transition: background 0.2s;
          position: relative;
        }
        .chat-tab:hover { background: #4f4236; }
        .chat-tab-icon { font-size: 1.1rem; }
        .chat-tab-label { font-size: 0.58rem; font-weight: 600; letter-spacing: 1px; writing-mode: vertical-lr; }
        .chat-tab-badge {
          position: absolute;
          top: 4px;
          right: -4px;
          background: #e05c3a;
          color: white;
          font-size: 0.58rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .chat-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.25);
          z-index: 9997;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .chat-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: white;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          font-family: 'Inter', sans-serif;
          animation: slideIn 0.25s ease;
        }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        .cd-header {
          padding: 1rem 1.2rem;
          background: #2c2c2c;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .cd-title { font-weight: 600; font-size: 0.88rem; }
        .cd-close { background: transparent; border: none; color: white; cursor: pointer; font-size: 1.1rem; opacity: 0.7; padding: 0; }
        .cd-close:hover { opacity: 1; }

        .cd-list { flex: 1; overflow-y: auto; }
        .cd-conv-item {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f9f7f5;
          cursor: pointer;
          display: flex;
          gap: 10px;
          align-items: center;
          transition: background 0.15s;
        }
        .cd-conv-item:hover { background: #faf8f6; }
        .cd-avatar {
          width: 40px; height: 40px;
          background: #f5f0ea;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0; overflow: hidden;
        }
        .cd-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .cd-info { flex: 1; min-width: 0; }
        .cd-name {
          font-weight: 600; font-size: 0.8rem; color: #2c2c2c;
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 2px;
        }
        .cd-product { font-size: 0.68rem; color: #8f8170; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .cd-last { font-size: 0.7rem; color: #bcafa0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cd-unread { background: #2c2c2c; color: white; font-size: 0.58rem; padding: 2px 6px; border-radius: 10px; flex-shrink: 0; }
        .cd-no-conv { color: #bcafa0; font-size: 0.8rem; text-align: center; padding: 3rem 1.5rem; line-height: 1.8; }

        @media (max-width: 480px) {
          .chat-drawer { width: 80vw; }
        }
      `}</style>

      {/* FIXED TAB on left */}
      <div style={{position:'fixed', left:0, top:'50%', transform:'translateY(-50%)', zIndex:9999}}>
        <button className="chat-tab" onClick={() => setOpen(!open)}>
          <span className="chat-tab-icon">💬</span>
          <span className="chat-tab-label">CHAT</span>
          {unreadTotal > 0 && (
            <span className="chat-tab-badge">{unreadTotal}</span>
          )}
        </button>
      </div>

      {/* OVERLAY — click outside to close */}
      {open && <div className="chat-overlay" onClick={() => setOpen(false)} />}

      {/* DRAWER */}
      {open && (
        <div className="chat-drawer">
          <div className="cd-header">
            <div className="cd-title">💬 Messages</div>
            <button className="cd-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="cd-list">
            {conversations.length === 0 ? (
              <p className="cd-no-conv">
                No conversations yet.<br/>
                Go to a product page<br/>
                and click "chat with seller"
              </p>
            ) : conversations.map(conv => (
              <div
                key={conv.conversationId}
                className="cd-conv-item"
                onClick={() => openChat(conv)}
              >
                <div className="cd-avatar">
                  {conv.product?.image
                    ? <img src={conv.product.image} alt="" />
                    : '🏪'
                  }
                </div>
                <div className="cd-info">
                  <div className="cd-name">
                    <span>{conv.otherUser?.storeName || conv.otherUser?.name}</span>
                    {conv.unread > 0 && <span className="cd-unread">{conv.unread}</span>}
                  </div>
                  {conv.product && (
                    <div className="cd-product">📦 {conv.product.name}</div>
                  )}
                  <div className="cd-last">{conv.lastMessage?.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default ChatSidebar