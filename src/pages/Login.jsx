import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import './Auth.css'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
        const res = await API.post('/auth/login', form)
        console.log("Login response:", res.data)
        const { token, role } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        navigate(role === 'admin' ? '/admin/add-product' : '/products')
    } catch (err) {
        console.log('Login error:', err);
        setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to login</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />
          </div>
          
          <button className="auth-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Login