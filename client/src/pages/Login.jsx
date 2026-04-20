import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance, { setToken } from '../utils/axios'
import { Spinner } from '../components/ui'

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
       setError(error.response?.data?.message || 'Error occurred');
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-12 animate-minimal-in">
        <div className="text-center space-y-2">
          <Link to="/" className="text-sm font-black uppercase tracking-tighter">
            Train<span className="bg-black text-white px-1">Reservation</span>
          </Link>
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            {isLogin ? 'Sign In' : 'Register'}
          </h2>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase tracking-widest z-10">User</span>
            <input 
              type="text" 
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
              placeholder="Username"
              required
            />
          </div>

          {!isLogin && (
            <div className="relative animate-minimal-in">
              <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase tracking-widest z-10">Contact</span>
              <input 
                type="email" 
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Email"
                required
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase tracking-widest z-10">Secret</span>
            <input 
              type="password" 
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-4"
          >
            {loading ? <Spinner size="sm" /> : (isLogin ? 'PROCEED →' : 'JOIN →')}
          </button>

          {error && <p className="text-[10px] text-red-600 font-black uppercase text-center">{error}</p>}

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={toggleForm}
              className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
            >
              {isLogin ? "SWITCH TO REGISTER" : "SWITCH TO LOGIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login