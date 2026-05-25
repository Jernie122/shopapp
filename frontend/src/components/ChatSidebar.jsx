import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = 'https://shopapp-backend-1bio.onrender.com'

function ChatSidebar() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('list') // 'list' or 'chat'
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

    return () => {
      newSocket.disconnect()
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/conversations`, { headers })
      setConversations(data)
      const total = data.reduce((sum, c) => sum + (c.unread || 0), 0)
      setUnreadTotal(total)
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

        .chat-float-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 52px;
          height: 52px;
          background: #2c2c2c;
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 1.3rem;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, background 0.2s;
        }
        .chat-float-btn:hover { background: #4f4236; transform: scale(1.05); }

        .chat-unread-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #e05c3a;
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .chat-panel {
          position: fixed;
          bottom: 88px;
          right: 24px;
          width: 320px;
          height: 480px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          z-index: 9998;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          transform-origin: bottom right;
          animation: popIn 0.2s ease;
        }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .cp-header {
          padding: 0.9rem 1rem;
          background: #2c2c2c;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .cp-header-left { display: flex; align-items: center; gap: 8px; }
        .cp-back-btn { background: transparent; border: none; color: white; cursor: pointer; font-size: 1rem; padding: 0; display: flex; align-items: center; }
        .cp-title { font-weight: 600; font-size: 0.85rem; }
        .cp-subtitle { font-size: 0.7rem; color: #bcafa0; margin-top: 1px; }
        .cp-close { background: transparent; border: none; color: white; cursor: pointer; font-size: 1.1rem; padding: 0; opacity: 0.7; }
        .cp-close:hover { opacity: 1; }

        .cp-conv-list { flex: 1; overflow-y: auto; }
        .cp-conv-item { padding: 0.8rem 1rem; border-bottom: 1px solid #f9f7f5; cursor: pointer; transition: background 0.15s; display: flex; gap: 10px; align-items: center; }
        .cp-conv-item:hover { background: #faf8f6; }
        .cp-avatar { width: 36px; height: 36px; background: #f5f0ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .cp-conv-info { flex: 1; min-width: 0; }
        .cp-conv-name { font-weight: 600; font-size: 0.78rem; color: #2c2c2c; display: flex; justify-content: space-between; }
        .cp-conv-product { font-size: 0.68rem; color: #8f8170; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cp-conv-last { font-size: 0.7rem; color: #bcafa0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cp-unread { background: #2c2c2c; color: white; font-size: 0.6rem; padding: 1px 5px; border-radius: 10px; }
        .cp-no-conv { color: #bcafa0; font-size: 0.8rem; text-align: center; padding: 2rem 1rem; }

        .cp-messages { flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; background: #faf8f6; }
        .cp-msg-row { display: flex; }
        .cp-msg-row.mine { justify-content: flex-end; }
        .cp-msg-row.theirs { justify-content: flex-start; }
        .cp-msg-bubble { max-width: 75%; padding: 7px 12px; border-radius: 16px; font-size: 0.78rem; line-height: 1.4; }
        .cp-msg-row.mine .cp-msg-bubble { background: #2c2c2c; color: white; border-bottom-right-radius: 4px; }
        .cp-msg-row.theirs .cp-msg-bubble { background: white; border: 1px solid #f0ebe5; color: #2c2c2c; border-bottom-left-radius: 4px; }
        .cp-msg-time { font-size: 0.6rem; color: #bcafa0; margin-top: 2px; text-align: right; }
        .cp-msg-sender { font-size: 0.62rem; color: #8f8170; margin-bottom: 2px; }

        .cp-input-wrap { padding: 0.6rem 0.8rem; border-top: 1px solid #f0ebe5; display: flex; gap: 0.5rem; background: white; flex-shrink: 0; }
        .cp-input { flex: 1; padding: 7px 12px; background: #f9f7f5; border: 1px solid #f0ebe5; border-radius: 30px; color: #2c2c2c; font-family: 'Inter', sans-serif; font-size: 0.78rem; outline: none; }
        .cp-input:focus { border-color: #c9b69a; }
        .cp-send { padding: 7px 14px; background: #2c2c2c; border: none; border-radius: 30px; color: white; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
        .cp-send:hover { background: #4f4236; }

        @media (max-width: 480px) {
          .chat-panel { width: calc(100vw - 24px); right: 12px; bottom: 80px; height: 420px; }
          .chat-float-btn { bottom: 16px; right: 16px; }
        }
      `}</style>

      {/* FLOATING BUTTON */}
      <button className="chat-float-btn" onClick={() => setOpen(!open)} style={{position:'relative'}}>
        {open ? '✕' : '💬'}
        {!open && unreadTotal > 0 && (
          <span className="chat-unread-dot">{unreadTotal}</span>
        )}
      </button>

      {/* CHAT PANEL */}
      {open && (
        <div className="chat-panel">
          {/* HEADER */}
          <div className="cp-header">
            <div className="cp-header-left">
              {view === 'chat' && (
                <button className="cp-back-btn" onClick={() => setView('list')}>←</button>
              )}
              <div>
                <div className="cp-title">
                  {view === 'list' ? '💬 Messages' : (activeConv?.otherUser?.storeName || activeConv?.otherUser?.name)}
                </div>
                {view === 'chat' && activeConv?.product && (
                  <div className="cp-subtitle">📦 {activeConv.product.name}</div>
                )}
              </div>
            </div>
            <button className="cp-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* CONVERSATION LIST */}
          {view === 'list' && (
            <div className="cp-conv-list">
              {conversations.length === 0 ? (
                <p className="cp-no-conv">No conversations yet.<br/>Go to a product and click "chat with seller"</p>
              ) : conversations.map(conv => (
                <div key={conv.conversationId} className="cp-conv-item" onClick={() => openChat(conv)}>
                  <div className="cp-avatar">
                    {conv.product?.image
                      ? <img src={conv.product.image} style={{width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover'}} alt="" />
                      : '🏪'
                    }
                  </div>
                  <div className="cp-conv-info">
                    <div className="cp-conv-name">
                      <span>{conv.otherUser?.storeName || conv.otherUser?.name}</span>
                      {conv.unread > 0 && <span className="cp-unread">{conv.unread}</span>}
                    </div>
                    {conv.product && <div className="cp-conv-product">📦 {conv.product.name}</div>}
                    <div className="cp-conv-last">{conv.lastMessage?.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHAT MESSAGES */}
          {view === 'chat' && (
            <>
              <div className="cp-messages">
                {loading ? (
                  <p style={{textAlign:'center',color:'#bcafa0',fontSize:'0.78rem'}}>Loading...</p>
                ) : messages.map((msg, i) => {
                  const senderId = msg.sender?._id || msg.sender
                  const isMine = senderId === userId
                  return (
                    <div key={i} className={`cp-msg-row ${isMine ? 'mine' : 'theirs'}`}>
                      <div>
                        {!isMine && (
                          <div className="cp-msg-sender">{msg.sender?.storeName || msg.sender?.name}</div>
                        )}
                        <div className="cp-msg-bubble">{msg.message}</div>
                        <div className="cp-msg-time">
                          {new Date(msg.createdAt).toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="cp-input-wrap">
                <input
                  className="cp-input"
                  placeholder="write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="cp-send">send</button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ChatSidebar