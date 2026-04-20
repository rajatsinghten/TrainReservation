import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance, { setToken } from '../utils/axios'
import { Button, Input, Alert, Spinner } from '../components/ui'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin 
        ? '/api/users/login' 
        : '/api/users/register'
      
      if (!isLogin && !formData.email) {
        setError('Email is required for registration')
        setLoading(false)
        return
      }

      const response = await axiosInstance.post(endpoint, formData)
      
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('userId', response.data.userId)
        
        if (isLogin) {
          navigate('/')
        } else {
          navigate('/profile-setup')
        }
      }
    } catch (error) {
      console.error('Login/Register error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and make sure the server is running.');
      } else if (error.response?.status === 0) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(
          error.response?.data?.message || 
          'An error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({ username: '', email: '', password: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Train<span className="text-primary-400">Buddy</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-surface-400 mt-1">
              {isLogin ? 'Sign in to find your travel buddies' : 'Join the TrainBuddy community'}
            </p>
          </div>
          
          {error && (
            <Alert variant="error" className="mb-5 !bg-red-500/10 !border-red-500/20 !text-red-300">
              {error}
            </Alert>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5" htmlFor="username">
                Username
              </label>
              <input 
                type="text" 
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder-surface-500 text-sm
                         focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                         transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>

            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-surface-300 mb-1.5" htmlFor="email">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-surface-500 text-sm
                           focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                           transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <input 
                type="password" 
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder-surface-500 text-sm
                         focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                         transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${loading 
                  ? 'bg-primary-600/50 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30'
                } text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-surface-900`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" className="text-white" />
                  Processing...
                </span>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </button>

            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={toggleForm}
                className="text-surface-400 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-medium text-primary-400">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login