import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import './Auth.css'

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await API.post('/auth/register', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })

      console.log('Registered:', response.data)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us today and get started</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              className="form-input"
              placeholder="Enter your username"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
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
              value={form.password}
              className="form-input"
              placeholder="Create a password"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={form.role}
              className="form-input"
              onChange={handleChange}
            >
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <button className="auth-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register