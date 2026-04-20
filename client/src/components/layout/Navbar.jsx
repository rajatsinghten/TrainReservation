import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axiosInstance, { removeToken, isAuthenticated } from '../../utils/axios'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const profileRef = useRef(null)

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

  return (
    <nav className="fixed top-0 inset-x-0 z-[999] bg-white border-b-2 border-black h-16">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 group">
          <span className="text-sm font-black uppercase tracking-tighter">
            Train<span className="bg-black text-white px-1 ml-0.5">Reservation</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          {loading ? (
            <div className="h-4 w-12 bg-black/5 animate-pulse" />
          ) : user ? (
            <>
              <NavLink 
                to="/dashboard" 
                className={({isActive}) => `text-[10px] font-black uppercase tracking-widest ${isActive ? 'border-b-2 border-black' : 'hover:opacity-50'}`}
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                className="text-[10px] font-black uppercase tracking-widest text-black hover:opacity-50"
              >
                Logout
              </button>
              
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-[10px] font-black uppercase">
                {user.username?.[0] || 'U'}
              </div>
            </>
          ) : (
            <NavLink 
              to="/login" 
              className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-1.5 hover:bg-black hover:text-white transition-all"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar