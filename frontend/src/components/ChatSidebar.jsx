import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = 'https://shopapp-backend-1bio.onrender.com'

function ChatSidebar() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('list')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const userId = user?._id || user?.id
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user) return
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
      if (activeConv) fetchMessages(activeConv.conversationId)
    }, 3000)
    return () => { newSocket.disconnect(); clearInterval(interval) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/conversations`, { headers })
      setConversations(data)
      setUnreadTotal(data.reduce((sum, c) => sum + (c.unread || 0), 0))
    } catch (err) { console.log(err) }
  }

  const fetchMessages = async (convId) => {
    try {
      const { data } = await axios.get(`${API}/api/chat/${convId}`, { headers })
      setMessages(data)
    } catch (err) { console.log(err) }
  }

  const openChat = async (conv) => {
    setActiveConv(conv)
    setView('chat')
    setLoading(true)
    await fetchMessages(conv.conversationId)
    setLoading(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return
    try {
      const receiverId = activeConv.otherUser?._id || activeConv.otherUser?.id
      const productId = activeConv.conversationId.split('_')[2]
      const { data } = await axios.post(`${API}/api/chat/send`, {
        receiverId,
        message: newMessage,
        productId: productId !== 'undefined' ? productId : undefined
      }, { headers })
      setMessages(prev => [...prev, data])
      setNewMessage('')
      socket?.emit('sendMessage', { ...data, receiverId })
      fetchConversations()
    } catch (err) { console.log(err) }
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        /* TOGGLE TAB - sticks to left side */
        .chat-tab {
          position: fixed;
          left: ${open ? '300px' : '0px'};
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
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 3px 0 12px rgba(0,0,0,0.15);
          transition: left 0.3s ease;
          writing-mode: vertical-lr;
          min-height: 80px;
          justify-content: center;
        }
        .chat-tab:hover { background: #4f4236; }
        .chat-tab-icon { font-size: 1rem; writing-mode: horizontal-tb; }
        .chat-tab-unread {
          background: #e05c3a;
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          writing-mode: horizontal-tb;
          position: absolute;
          top: 6px;
          right: -4px;
        }

        /* OVERLAY - clicking outside collapses */
        .chat-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3);
          z-index: 9997;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* SIDEBAR DRAWER */
        .chat-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 300px;
          height: 100vh;
          background: white;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          font-family: 'Inter', sans-serif;
          animation: slideIn 0.3s ease;
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
        .cd-header-left { display: flex; align-items: center; gap: 8px; }
        .cd-back { background: transparent; border: none; color: white; cursor: pointer; font-size: 1rem; padding: 0; }
        .cd-title { font-weight: 600; font-size: 0.88rem; }
        .cd-subtitle { font-size: 0.68rem; color: #bcafa0; margin-top: 2px; }
        .cd-close { background: transparent; border: none; color: white; cursor: pointer; font-size: 1.1rem; opacity: 0.7; padding: 0; }
        .cd-close:hover { opacity: 1; }

        /* CONV LIST */
        .cd-list { flex: 1; overflow-y: auto; }
        .cd-conv-item { padding: 0.8rem 1rem; border-bottom: 1px solid #f9f7f5; cursor: pointer; display: flex; gap: 10px; align-items: center; transition: background 0.15s; }
        .cd-conv-item:hover { background: #faf8f6; }
        .cd-avatar { width: 38px; height: 38px; background: #f5f0ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; overflow: hidden; }
        .cd-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .cd-info { flex: 1; min-width: 0; }
        .cd-name { font-weight: 600; font-size: 0.78rem; color: #2c2c2c; display: flex; justify-content: space-between; align-items: center; }
        .cd-product { font-size: 0.67rem; color: #8f8170; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cd-last { font-size: 0.69rem; color: #bcafa0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cd-unread { background: #2c2c2c; color: white; font-size: 0.58rem; padding: 1px 5px; border-radius: 10px; flex-shrink: 0; }
        .cd-no-conv { color: #bcafa0; font-size: 0.8rem; text-align: center; padding: 3rem 1.5rem; line-height: 1.6; }

        /* MESSAGES */
        .cd-messages { flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; background: #faf8f6; }
        .cd-msg-row { display: flex; }
        .cd-msg-row.mine { justify-content: flex-end; }
        .cd-msg-row.theirs { justify-content: flex-start; }
        .cd-bubble { max-width: 78%; padding: 7px 12px; border-radius: 16px; font-size: 0.78rem; line-height: 1.45; }
        .cd-msg-row.mine .cd-bubble { background: #2c2c2c; color: white; border-bottom-right-radius: 4px; }
        .cd-msg-row.theirs .cd-bubble { background: white; border: 1px solid #f0ebe5; color: #2c2c2c; border-bottom-left-radius: 4px; }
        .cd-time { font-size: 0.58rem; color: #bcafa0; margin-top: 2px; text-align: right; }
        .cd-sender { font-size: 0.6rem; color: #8f8170; margin-bottom: 2px; }

        /* INPUT */
        .cd-input-wrap { padding: 0.7rem 0.9rem; border-top: 1px solid #f0ebe5; display: flex; gap: 0.5rem; background: white; flex-shrink: 0; }
        .cd-input { flex: 1; padding: 8px 14px; background: #f9f7f5; border: 1px solid #f0ebe5; border-radius: 30px; color: #2c2c2c; font-family: 'Inter', sans-serif; font-size: 0.78rem; outline: none; }
        .cd-input:focus { border-color: #c9b69a; }
        .cd-send { padding: 8px 16px; background: #2c2c2c; border: none; border-radius: 30px; color: white; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; white-space: nowrap; }
        .cd-send:hover { background: #4f4236; }

        @media (max-width: 480px) {
          .chat-drawer { width: 85vw; }
          .chat-tab { left: ${open ? '85vw' : '0px'}; }
        }
      `}</style>

      {/* TOGGLE TAB */}
      <button className="chat-tab" onClick={() => setOpen(!open)} style={{position:'relative'}}>
        <span className="chat-tab-icon">{open ? '✕' : '💬'}</span>
        {!open && <span style={{fontSize:'0.6rem',writingMode:'vertical-lr',letterSpacing:'1px'}}>CHAT</span>}
        {!open && unreadTotal > 0 && (
          <span className="chat-tab-unread">{unreadTotal}</span>
        )}
      </button>

      {/* OVERLAY */}
      {open && <div className="chat-overlay" onClick={() => setOpen(false)} />}

      {/* DRAWER */}
      {open && (
        <div className="chat-drawer">
          <div className="cd-header">
            <div className="cd-header-left">
              {view === 'chat' && (
                <button className="cd-back" onClick={() => setView('list')}>←</button>
              )}
              <div>
                <div className="cd-title">
                  {view === 'list' ? '💬 Messages' : (activeConv?.otherUser?.storeName || activeConv?.otherUser?.name)}
                </div>
                {view === 'chat' && activeConv?.product && (
                  <div className="cd-subtitle">📦 {activeConv.product.name}</div>
                )}
              </div>
            </div>
            <button className="cd-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* LIST VIEW */}
          {view === 'list' && (
            <div className="cd-list">
              {conversations.length === 0 ? (
                <p className="cd-no-conv">No conversations yet.<br/>Go to a product page and click<br/>"chat with seller" to start.</p>
              ) : conversations.map(conv => (
                <div key={conv.conversationId} className="cd-conv-item" onClick={() => openChat(conv)}>
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
                    {conv.product && <div className="cd-product">📦 {conv.product.name}</div>}
                    <div className="cd-last">{conv.lastMessage?.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHAT VIEW */}
          {view === 'chat' && (
            <>
              <div className="cd-messages">
                {loading ? (
                  <p style={{textAlign:'center',color:'#bcafa0',fontSize:'0.78rem',padding:'2rem'}}>Loading...</p>
                ) : messages.map((msg, i) => {
                  const senderId = msg.sender?._id || msg.sender
                  const isMine = senderId === userId
                  return (
                    <div key={i} className={`cd-msg-row ${isMine ? 'mine' : 'theirs'}`}>
                      <div>
                        {!isMine && (
                          <div className="cd-sender">{msg.sender?.storeName || msg.sender?.name}</div>
                        )}
                        <div className="cd-bubble">{msg.message}</div>
                        <div className="cd-time">
                          {new Date(msg.createdAt).toLocaleTimeString('en-PH', {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="cd-input-wrap">
                <input
                  className="cd-input"
                  placeholder="write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="cd-send">send</button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ChatSidebar