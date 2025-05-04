import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await API.get('/cart', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCart(res.data);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to load cart',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchCart();
  }, [user]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await API.post('/checkout', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setMessage({
        text: `Order successful! Total: $${res.data.total.toFixed(2)}`,
        type: 'success'
      });
      
      await fetchCart(); // Refresh empty cart
      
      setTimeout(() => navigate('/products'), 10000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Checkout failed',
        type: 'error'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await API.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      await fetchCart();
      setMessage({
        text: 'Item removed from cart',
        type: 'success'
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to remove item',
        type: 'error'
      });
    }
  };

  if (!user) {
    return (
      <div className="auth-prompt">
        <h2>Your Cart</h2>
        <p>Please login to view your cart</p>
        <button 
          className="login-button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Your Shopping Cart</h1>
        <button 
          className="continue-shopping-button"
          onClick={() => navigate('/products')}
        >
          ← Continue Shopping
        </button>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      {cart?.items?.length > 0 ? (
        <>
          <div className="cart-items">
            {cart.items.map(item => (
              <div className="cart-item" key={item.product._id}>
                <div className="item-image">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Product+Image';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="price">${item.product.price.toFixed(2)}</p>
                  <div className="quantity-control">
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => handleRemove(item.product._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <button
                className="checkout-button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Browse our products to add items to your cart</p>
          <button 
            className="shop-button"
            onClick={() => navigate('/products')}
          >
            Shop Now
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;