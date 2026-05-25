import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import AddProductPage from './pages/AddProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import AdminDashboard from './pages/AdminDashboard'
import BecomeSellerPage from './pages/BecomeSellerPage'
import SellerDashboard from './pages/SellerDashboard'
import ChatPage from './pages/ChatPage'
import ChatSidebar from './components/ChatSidebar'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/product/:id' element={<ProductPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/add-product' element={<AddProductPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/orders' element={<OrderHistoryPage />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/become-seller' element={<BecomeSellerPage />} />
        <Route path='/seller' element={<SellerDashboard />} />
        <Route path='/chat/:conversationId' element={<ChatPage />} />
        <Route path='/chat' element={<ChatPage />} />
      </Routes>
      <ChatSidebar />
    </>
  )
}

export default App