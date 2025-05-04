import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products');
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!user?.token) {
      navigate('/login');
      return;
    }

    try {
      await API.post(
        '/cart/add',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      setNotification({
        message: 'Item added to cart!',
        productId,
        visible: true
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError('Failed to add to cart. Please try again.');
    }
  };
  const handleLogout = async () => {
    try {
      setLoading(true)
      
      await logout()
      navigate('/login')
    } catch (err) {
      setLoading(false)
      setError('Failed to logout. Please try again.')
    }
  }

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="product-list-container">
      <header className="product-list-header">
        <h1>Discover Our Products</h1>
        <div className="header-actions">
          <div className="header-buttons">
          <button 
            className="cart-button"
            onClick={() => navigate('/cart')}
          >
            <span className="icon">🛒</span> Cart
          </button>
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="icon">👋</span> Logout
          </button>
          </div>
        </div>
      </header>

      <div className="product-grid">
        {products.map(product => (
          <div className="product-card" key={product._id}>
            <div className="product-image-container">
              <img 
                src={product.image} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <button 
                className="add-to-cart-button"
                onClick={() => handleAddToCart(product._id)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {notification?.visible && (
        <div className="notification">
          <p>{notification.message}</p>
          <button 
            className="view-cart-button"
            onClick={() => navigate('/cart')}
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;