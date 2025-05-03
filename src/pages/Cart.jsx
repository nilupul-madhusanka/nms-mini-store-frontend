import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { AuthContext } from '../context/AuthContext'
import './Cart.css'

function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!user?.token) {
          setLoading(false)
          return
        }

        const res = await API.get('/cart', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        })
        setCart(res.data)
      } catch (err) {
        setMessage({
          text: err.response?.data?.message || 'Failed to load cart',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const res = await API.put(
        `/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      )
      setCart(res.data)
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update quantity',
        type: 'error'
      })
    }
  }

  const removeItem = async (itemId) => {
    try {
      const res = await API.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      setCart(res.data)
      setMessage({
        text: 'Item removed from cart',
        type: 'success'
      })
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to remove item',
        type: 'error'
      })
    }
  }

  const handleCheckout = async () => {
    if (!user || !user.token) {
      setMessage({
        text: 'You must be logged in to checkout',
        type: 'error'
      })
      navigate('/login')
      return
    }

    if (!cart?.items || cart.items.length === 0) {
      setMessage({
        text: 'Your cart is empty',
        type: 'error'
      })
      return
    }

    setIsCheckingOut(true)
    try {
      await API.post(
        '/orders',
        {
          items: cart.items.map(item => ({
            productId: item.product._id,
            quantity: item.quantity
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      )

      // Clear the cart after successful order
      await API.delete('/cart', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })

      setMessage({
        text: 'Order placed successfully!',
        type: 'success'
      })
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/order-success')
      }, 2000)
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to place order',
        type: 'error'
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    ).toFixed(2)
  }

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="cart-empty">
        <h2>Your Cart</h2>
        <p>Please login to view your cart</p>
        <button 
          onClick={() => navigate('/login')}
          className="login-button"
        >
          Login
        </button>
      </div>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart</h2>
        <p>Your cart is currently empty</p>
        <button 
          onClick={() => navigate('/products')}
          className="shop-button"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <p>Review your items before checkout</p>
      </div>

      {message.text && (
        <div className={`cart-message ${message.type}`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item._id} className="cart-item">
            <div className="item-image">
              <img
                src={item.product.image}
                alt={item.product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Product+Image'
                }}
              />
            </div>
            <div className="item-details">
              <h3>{item.product.name}</h3>
              <p className="item-price">${item.product.price.toFixed(2)}</p>
              
              <div className="quantity-control">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="item-subtotal">
              <p>${(item.product.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(item._id)}
                className="remove-item"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-details">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${calculateTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="checkout-button"
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  )
}

export default Cart