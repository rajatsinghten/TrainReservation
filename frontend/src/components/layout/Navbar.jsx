import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axiosInstance, { removeToken, isAuthenticated } from '../../utils/axios'
import { Avatar, Badge, Button } from '../ui'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
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
        fetchFriendRequests()
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      if (error.response?.status === 401) handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendRequests = async () => {
    try {
      const response = await axiosInstance.get('/api/friends/requests')
      if (response.data.success) setInvitations(response.data.data.incoming || [])
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  const handleAcceptInvite = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', { requestId, status: 'accepted' })
      if (response.data.success) setInvitations(prev => prev.filter(inv => inv._id !== requestId))
    } catch (error) { console.error('Error accepting invitation:', error) }
  }

  const handleRejectInvite = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', { requestId, status: 'rejected' })
      if (response.data.success) setInvitations(prev => prev.filter(inv => inv._id !== requestId))
    } catch (error) { console.error('Error rejecting invitation:', error) }
  }

  useEffect(() => {
    fetchUserData()
    const interval = setInterval(() => {
      if (isAuthenticated()) fetchFriendRequests()
    }, 30000)
    return () => clearInterval(interval)
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

  const toggleNotifications = () => { setShowNotifications(prev => !prev); setShowProfileMenu(false) }
  const toggleMenu = () => setMenuOpen(prev => !prev)
  const toggleProfileMenu = () => { setShowProfileMenu(prev => !prev); setShowNotifications(false) }

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
            <span className="text-xl font-bold text-surface-900 tracking-tight">
              Train<span className="text-primary-600">Buddy</span>
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />}
            </svg>
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-20 skeleton rounded-lg" />
            ) : user ? (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {invitations.length > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {invitations.length}
                      </span>
                    )}
                  </button>

                  {/* Notification dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in-down z-[9999]">
                      <div className="px-4 py-3 border-b border-surface-100">
                        <h3 className="text-sm font-semibold text-surface-800">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {invitations.length > 0 ? (
                          invitations.map(invitation => (
                            <div key={invitation._id} className="px-4 py-3 border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <Avatar name={invitation.sender.name || invitation.sender.username} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-surface-800">
                                    <span className="font-semibold">{invitation.sender.name || invitation.sender.username}</span>
                                    {' '}sent a friend request
                                  </p>
                                  {invitation.sender.profession && (
                                    <p className="text-xs text-surface-500 mt-0.5">{invitation.sender.profession}</p>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    <Button size="xs" variant="accent" onClick={() => handleAcceptInvite(invitation._id)}>Accept</Button>
                                    <Button size="xs" variant="ghost" onClick={() => handleRejectInvite(invitation._id)}>Decline</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center">
                            <p className="text-sm text-surface-400">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                      <div className="px-4 py-3 border-b border-surface-100">
                        <p className="text-sm font-semibold text-surface-800 truncate">{user.name || user.username}</p>
                        <p className="text-xs text-surface-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {[
                          { to: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                          { to: '/friends', label: 'Friends', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                        ].map(item => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                      <div className="border-t border-surface-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-surface-200/60 bg-white/95 backdrop-blur-lg animate-fade-in-down">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
              onClick={toggleMenu}
            >
              Home
            </NavLink>
            {loading ? (
              <div className="px-3 py-2.5">
                <div className="h-4 w-20 skeleton rounded" />
              </div>
            ) : user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                  onClick={toggleMenu}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/friends"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                  onClick={toggleMenu}
                >
                  Friends
                  {invitations.length > 0 && (
                    <Badge variant="danger" size="sm">{invitations.length}</Badge>
                  )}
                </NavLink>
                <div className="pt-2 border-t border-surface-100">
                  <button
                    onClick={() => { handleLogout(); toggleMenu() }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={toggleMenu}
              >
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar