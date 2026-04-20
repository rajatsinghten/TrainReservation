import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axiosInstance, { removeToken, isAuthenticated } from '../../utils/axios'
import { Avatar, Button } from '../ui'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const profileRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchUserData = async () => {
    if (!isAuthenticated()) { setLoading(false); return }
    try {
      const response = await axiosInstance.get('/api/users/me')
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      if (error.response?.status === 401) handleLogout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (userId) await axiosInstance.post('/api/users/logout', { userId })
      removeToken()
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      removeToken()
      setUser(null)
      navigate('/login')
    }
  }

  const toggleMenu = () => setMenuOpen(prev => !prev)
  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev)

  return (
    <nav className="fixed top-0 inset-x-0 z-[999] bg-white/80 backdrop-blur-lg border-b border-surface-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900 tracking-tight font-display">
              Train<span className="text-primary-600">Buddy</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 skeleton rounded-lg" />
            ) : user ? (
              <>
                <NavLink to="/dashboard" className="text-sm font-semibold text-surface-600 hover:text-primary-600 transition-colors">
                  My Bookings
                </NavLink>

                {/* Profile menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 transition-colors"
                  >
                    <Avatar name={user.name || user.username} size="sm" />
                    <svg className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in-down z-[9999]">
                      <div className="px-4 py-3 border-b border-surface-100 text-left">
                        <p className="text-sm font-semibold text-surface-800 truncate">{user.name || user.username}</p>
                        <p className="text-xs text-surface-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <NavLink
                          to="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors text-left"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          My Bookings
                        </NavLink>
                      </div>
                      <div className="border-t border-surface-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <NavLink to="/login">
                <Button variant="primary" size="sm">Sign in</Button>
              </NavLink>
            )}
          </div>
          
          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100" onClick={toggleMenu}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-surface-200 py-4 px-4 space-y-4 shadow-lg">
          <NavLink to="/dashboard" className="block text-sm font-semibold text-surface-600" onClick={toggleMenu}>My Bookings</NavLink>
          {user ? (
            <button onClick={() => { handleLogout(); toggleMenu(); }} className="block text-sm font-semibold text-red-600">Logout</button>
          ) : (
            <NavLink to="/login" className="block text-sm font-semibold text-primary-600" onClick={toggleMenu}>Sign In</NavLink>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar