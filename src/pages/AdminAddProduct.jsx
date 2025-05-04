import { useState } from 'react'
import API from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import './AdminAddProduct.css'

function AdminAddProduct() {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    image: ''
  })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [createdProduct, setCreatedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage({ text: 'Authentication required. Please login again.', type: 'error' })
        navigate('/login')
        return
      }

      // Validate price is a positive number
      if (isNaN(product.price) || parseFloat(product.price) <= 0) {
        setMessage({ text: 'Please enter a valid price (greater than 0)', type: 'error' })
        return
      }

      // Validate image URL
      try {
        new URL(product.image)
      } catch (err) {
        setMessage({ text: 'Please enter a valid image URL', type: 'error' })
        return
      }

      const res = await API.post('/products', {
        name: product.name.trim(),
        price: parseFloat(product.price),
        image: product.image.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setCreatedProduct(res.data)
      setMessage({ text: 'Product added successfully!', type: 'success' })
      setProduct({ name: '', price: '', image: '' })
    } catch (err) {
      console.error('Add product error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to add product'
      setMessage({ 
        text: errorMessage,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-add-product-container">
      <div className="admin-add-product-card">
        <h2>Add New Product - Admin Only</h2>
        <p className="subtitle">Fill in the details to add a new product</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Enter product name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="Enter price"
              value={product.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              className="form-input"
              placeholder="Enter image URL"
              value={product.image}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>

        <div className="back-link">
          <p><Link to="/login" className="auth-link">Back to Login page</Link></p>
        </div>

        {createdProduct && (
          <div className="product-preview">
            <h4>Product Added Successfully</h4>
            <div className="preview-content">
              <img 
                src={createdProduct.image} 
                alt={createdProduct.name} 
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available'
                }}
              />
              <div className="product-details">
                <h5>{createdProduct.name}</h5>
                <p className="price">${parseFloat(createdProduct.price).toFixed(2)}</p>
                <p className="product-id">ID: {createdProduct._id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAddProduct