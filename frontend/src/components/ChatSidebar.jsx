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

        /* Glass Floating Button */
        .glass-chat-tab {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9999;
          background: rgba(44, 44, 44, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-left: none;
          color: white;
          border-radius: 0 20px 20px 0;
          padding: 16px 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .glass-chat-tab:hover {
          background: rgba(44, 44, 44, 0.95);
          transform: translateY(-50%) scale(1.02);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
        }
        .glass-chat-tab-icon { font-size: 1.2rem; }
        .glass-chat-tab-label { 
          font-size: 0.6rem; 
          font-weight: 600; 
          letter-spacing: 1px; 
          writing-mode: vertical-lr;
        }
        .glass-chat-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #e05c3a;
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        /* Glass Overlay */
        .glass-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(3px);
          z-index: 9997;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Glass Drawer */
        .glass-chat-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 320px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255, 255, 255, 0.6);
          display: flex;
          flex-direction: column;
          box-shadow: 8px 0 32px rgba(0, 0, 0, 0.08);
          font-family: 'Inter', sans-serif;
          animation: slideIn 0.25s ease;
          z-index: 9998;
        }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        .glass-cd-header {
          padding: 1.2rem 1.2rem;
          background: rgba(44, 44, 44, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .glass-cd-title { font-weight: 600; font-size: 0.9rem; letter-spacing: -0.2px; }
        .glass-cd-close { 
          background: transparent; 
          border: none; 
          color: white; 
          cursor: pointer; 
          font-size: 1.2rem; 
          opacity: 0.7; 
          padding: 0;
          transition: opacity 0.2s;
        }
        .glass-cd-close:hover { opacity: 1; }

        .glass-cd-list { flex: 1; overflow-y: auto; padding: 8px 0; }
        .glass-cd-conv-item {
          padding: 0.9rem 1rem;
          margin: 4px 8px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          gap: 12px;
          align-items: center;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .glass-cd-conv-item:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .glass-cd-avatar {
          width: 44px; height: 44px;
          background: rgba(245, 240, 235, 0.8);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; flex-shrink: 0; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.6);
        }
        .glass-cd-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 18px; }
        .glass-cd-info { flex: 1; min-width: 0; }
        .glass-cd-name {
          font-weight: 600; font-size: 0.85rem; color: #2c2c2c;
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 4px;
        }
        .glass-cd-product { 
          font-size: 0.7rem; 
          color: #6b5a48; 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          margin-bottom: 4px;
        }
        .glass-cd-last { 
          font-size: 0.7rem; 
          color: #8f7a64; 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
        }
        .glass-cd-unread { 
          background: #2c2c2c; 
          color: white; 
          font-size: 0.65rem; 
          padding: 2px 8px; 
          border-radius: 20px; 
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .glass-cd-no-conv { 
          color: #6b5a48; 
          font-size: 0.8rem; 
          text-align: center; 
          padding: 2rem 1.5rem; 
          line-height: 1.6;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(4px);
          border-radius: 28px;
          margin: 1rem;
        }

        @media (max-width: 480px) {
          .glass-chat-drawer { width: 85vw; }
        }
      `}</style>

      {/* FLOATING BUTTON — only visible when sidebar is CLOSED */}
      {!open && (
        <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 9999 }}>
          <button className="glass-chat-tab" onClick={() => setOpen(true)}>
            <span className="glass-chat-tab-icon">💬</span>
            <span className="glass-chat-tab-label">CHAT</span>
            {unreadTotal > 0 && (
              <span className="glass-chat-badge">{unreadTotal}</span>
            )}
          </button>
        </div>
      )}

      {/* OVERLAY — click outside to close */}
      {open && <div className="glass-overlay" onClick={() => setOpen(false)} />}

      {/* DRAWER with glass theme */}
      {open && (
        <div className="glass-chat-drawer">
          <div className="glass-cd-header">
            <div className="glass-cd-title">💬 Messages</div>
            <button className="glass-cd-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="glass-cd-list">
            {conversations.length === 0 ? (
              <p className="glass-cd-no-conv">
                No conversations yet.<br/>
                Go to a product page<br/>
                and click "chat with seller"
              </p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.conversationId}
                  className="glass-cd-conv-item"
                  onClick={() => openChat(conv)}
                >
                  <div className="glass-cd-avatar">
                    {conv.product?.image
                      ? <img src={conv.product.image} alt="" />
                      : '🏪'
                    }
                  </div>
                  <div className="glass-cd-info">
                    <div className="glass-cd-name">
                      <span>{conv.otherUser?.storeName || conv.otherUser?.name}</span>
                      {conv.unread > 0 && <span className="glass-cd-unread">{conv.unread}</span>}
                    </div>
                    {conv.product && (
                      <div className="glass-cd-product">📦 {conv.product.name}</div>
                    )}
                    <div className="glass-cd-last">{conv.lastMessage?.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ChatSidebar