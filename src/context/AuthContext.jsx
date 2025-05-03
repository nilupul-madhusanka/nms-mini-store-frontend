import { createContext, useState, useEffect } from 'react'

// Create the context
export const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Load user from localStorage on app startup
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (token && role) {
      setUser({ token, role })
    }
  }, [])

  const login = ({ token, role }) => {
    setUser({ token, role })
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
