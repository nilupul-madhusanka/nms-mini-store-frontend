import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminAddProduct from './pages/AdminAddProduct'
import PrivateRoute from './components/PrivateRoute'
import ProductList from './pages/ProductList'
import Cart from './pages/Cart'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/add-product"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminAddProduct />
            </PrivateRoute>
          }
        />
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  )
}

export default App
