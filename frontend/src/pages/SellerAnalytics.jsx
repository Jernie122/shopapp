import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'

const API = 'https://shopapp-backend-1bio.onrender.com'

function SellerAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('revenue')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/'); return }
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API}/api/seller/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const formatCurrency = (val) => `$${Number(val).toLocaleString()}`

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background:'white',border:'1px solid #f0ebe5',borderRadius:'12px',padding:'10px 14px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
          <p style={{fontWeight:600,fontSize:'0.78rem',color:'#2c2c2c',marginBottom:'4px'}}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{fontSize:'0.75rem',color:p.color}}>
              {p.name}: {p.name === 'Revenue' ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        .analytics-wrap { min-height: 100vh; background: linear-gradient(145deg, #f9f7f5 0%, #f0eee9 100%); padding: 2rem 1.5rem; font-family: 'Inter', sans-serif; }
        .analytics-container { max-width: 1100px; margin: 0 auto; }
        .analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .analytics-title { font-weight: 700; font-size: 1.6rem; color: #2c2c2c; letter-spacing: -0.3px; }
        .analytics-sub { color: #8f8170; font-size: 0.82rem; margin-top: 2px; }
        .back-btn { background: transparent; border: 1px solid #e2d8cf; color: #5a4e3e; padding: 8px 16px; border-radius: 40px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 500; transition: all 0.2s; }
        .back-btn:hover { background: #2c2c2c; color: white; border-color: #2c2c2c; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; border: 1px solid #f0ebe5; border-radius: 20px; padding: 1.2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .stat-icon { font-size: 1.4rem; margin-bottom: 8px; }
        .stat-val { font-size: 1.6rem; font-weight: 700; color: #2c2c2c; letter-spacing: -0.5px; }
        .stat-label { font-size: 0.72rem; color: #8f8170; margin-top: 2px; font-weight: 500; }

        .chart-card { background: white; border: 1px solid #f0ebe5; border-radius: 24px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.8rem; }
        .chart-title { font-weight: 600; font-size: 0.95rem; color: #2c2c2c; }
        .chart-tabs { display: flex; gap: 6px; }
        .chart-tab { padding: 5px 14px; border-radius: 20px; border: 1px solid #e2d8cf; background: transparent; color: #5a4e3e; font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .chart-tab.active { background: #2c2c2c; border-color: #2c2c2c; color: white; }

        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }

        .top-products { background: white; border: 1px solid #f0ebe5; border-radius: 24px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .top-product-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f9f7f5; }
        .top-product-item:last-child { border-bottom: none; }
        .top-product-rank { width: 24px; height: 24px; background: #f5f0ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #5a4e3e; flex-shrink: 0; }
        .top-product-rank.gold { background: #fef3c7; color: #92400e; }
        .top-product-rank.silver { background: #f3f4f6; color: #374151; }
        .top-product-rank.bronze { background: #fef3c7; color: #b45309; }
        .top-product-img { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; background: #f5f0ea; flex-shrink: 0; }
        .top-product-info { flex: 1; min-width: 0; }
        .top-product-name { font-weight: 600; font-size: 0.8rem; color: #2c2c2c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .top-product-sold { font-size: 0.7rem; color: #8f8170; }
        .top-product-rev { font-weight: 600; font-size: 0.82rem; color: #2c2c2c; white-space: nowrap; }

        .no-data { text-align: center; color: #bcafa0; padding: 3rem; font-size: 0.85rem; }

        @media (max-width: 768px) {
          .charts-row { grid-template-columns: 1fr; }
          .analytics-wrap { padding: 1rem; }
        }
      `}</style>

      <div className="analytics-wrap">
        <div className="analytics-container">
          <div className="analytics-header">
            <div>
              <h1 className="analytics-title">📊 Analytics</h1>
              <p className="analytics-sub">Your store performance overview</p>
            </div>
            <button className="back-btn" onClick={() => navigate('/seller')}>← Back to Dashboard</button>
          </div>

          {loading ? (
            <p style={{textAlign:'center',color:'#8f8170',padding:'4rem'}}>Loading analytics...</p>
          ) : !data ? (
            <p style={{textAlign:'center',color:'#8f8170',padding:'4rem'}}>No data available yet</p>
          ) : (
            <>
              {/* STATS */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-val">${data.totalRevenue.toLocaleString()}</div>
                  <div className="stat-label">TOTAL REVENUE</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-val">{data.totalOrders}</div>
                  <div className="stat-label">TOTAL ORDERS</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🛍️</div>
                  <div className="stat-val">{data.totalProducts}</div>
                  <div className="stat-label">PRODUCTS LISTED</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-val">{data.uniqueCustomers}</div>
                  <div className="stat-label">CUSTOMERS SERVED</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-val">
                    {data.totalOrders > 0
                      ? `$${Math.round(data.totalRevenue / data.totalOrders).toLocaleString()}`
                      : '$0'}
                  </div>
                  <div className="stat-label">AVG ORDER VALUE</div>
                </div>
              </div>

              {/* MAIN LINE CHART */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">Last 7 Days Performance</div>
                  <div className="chart-tabs">
                    <button
                      className={`chart-tab ${activeChart === 'revenue' ? 'active' : ''}`}
                      onClick={() => setActiveChart('revenue')}
                    >Revenue</button>
                    <button
                      className={`chart-tab ${activeChart === 'orders' ? 'active' : ''}`}
                      onClick={() => setActiveChart('orders')}
                    >Orders</button>
                  </div>
                </div>
                {data.last7Days.every(d => d.revenue === 0 && d.orders === 0) ? (
                  <p className="no-data">No sales in the last 7 days</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.last7Days} margin={{top:5,right:10,left:0,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                      <XAxis dataKey="date" tick={{fontSize:11,fill:'#8f8170'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize:11,fill:'#8f8170'}} axisLine={false} tickLine={false}
                        tickFormatter={activeChart === 'revenue' ? (v) => `$${v.toLocaleString()}` : undefined} />
                      <Tooltip content={<CustomTooltip />} />
                      {activeChart === 'revenue' ? (
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2c2c2c" strokeWidth={2.5} dot={{fill:'#2c2c2c',r:4}} activeDot={{r:6}} />
                      ) : (
                        <Line type="monotone" dataKey="orders" name="Orders" stroke="#8a6e4b" strokeWidth={2.5} dot={{fill:'#8a6e4b',r:4}} activeDot={{r:6}} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="charts-row">
                {/* PIE CHART */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Order Status</div>
                  </div>
                  {data.statusBreakdown.length === 0 ? (
                    <p className="no-data">No orders yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data.statusBreakdown}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.statusBreakdown.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val} orders`]} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'0.72rem'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* BAR CHART */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Daily Orders (Bar)</div>
                  </div>
                  {data.last7Days.every(d => d.orders === 0) ? (
                    <p className="no-data">No orders in last 7 days</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.last7Days} margin={{top:5,right:10,left:0,bottom:5}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                        <XAxis dataKey="date" tick={{fontSize:10,fill:'#8f8170'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize:10,fill:'#8f8170'}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="orders" name="Orders" fill="#2c2c2c" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* TOP PRODUCTS */}
              <div className="top-products">
                <div className="chart-header">
                  <div className="chart-title">🏆 Top Selling Products</div>
                </div>
                {data.topProducts.length === 0 ? (
                  <p className="no-data">No sales yet</p>
                ) : data.topProducts.map((product, i) => (
                  <div key={i} className="top-product-item">
                    <div className={`top-product-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                      {i + 1}
                    </div>
                    {product.image
                      ? <img src={product.image} alt={product.name} className="top-product-img" />
                      : <div className="top-product-img" />
                    }
                    <div className="top-product-info">
                      <div className="top-product-name">{product.name}</div>
                      <div className="top-product-sold">{product.totalSold} units sold</div>
                    </div>
                    <div className="top-product-rev">${product.totalRevenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SellerAnalytics