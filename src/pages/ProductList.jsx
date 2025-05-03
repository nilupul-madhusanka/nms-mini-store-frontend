import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { AuthContext } from '../context/AuthContext'
import './ProductList.css'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('default')
  const [cartNotification, setCartNotification] = useState(null)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products')
        setProducts(res.data)
      } catch (err) {
        setError('Failed to load products. Please try again later.')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (product) => {
    try {
      if (!user?.token) {
        navigate('/login')
        return
      }

      // Updated to match your cart API structure
      const res = await API.post(
        '/cart',
        {
          product: product._id,  // Changed from productId to match your API
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      )

      setCartNotification({
        productName: product.name,
        visible: true
      })

      setTimeout(() => {
        setCartNotification(prev => ({ ...prev, visible: false }))
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart. Please try again.')
      console.error('Error adding to cart:', err)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low-high':
        return a.price - b.price
      case 'price-high-low':
        return b.price - a.price
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Our Products</h1>
        <p>Discover amazing products for your needs</p>
        
        <div className="product-list-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="sort-dropdown">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your search.</p>
          <button 
            onClick={() => {
              setSearchTerm('')
              setSortOption('default')
            }}
            className="reset-button"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available'
                  }}
                />
                <button 
                  className="quick-view-button"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  Quick View
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <button 
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cartNotification?.visible && (
        <div className="cart-notification">
          <p>{cartNotification.productName} added to cart!</p>
          <button 
            className="view-cart-button"
            onClick={() => navigate('/cart')}
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductList