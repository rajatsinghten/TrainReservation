import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance, { isAuthenticated } from '../utils/axios'

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    profession: '',
    bio: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    }
  }, [navigate])

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
      const requiredFields = ['name', 'age', 'profession', 'bio']
      for (const field of requiredFields) {
        if (!formData[field]) {
          setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
          setLoading(false)
          return;
        }
      }

      if (formData.bio.length > 200) {
        setError('Bio must be 200 characters or less')
        setLoading(false)
        return;
      }

      const ageNumber = Number(formData.age)
      if (isNaN(ageNumber) || ageNumber <= 0) {
        setError('Please enter a valid age')
        setLoading(false)
        return;
      }

      const profileData = {
        ...formData,
        age: ageNumber,
        profileCompleted: true
      }

      const response = await axiosInstance.put('/api/users/profile', profileData)

      if (response.data.success) {
        navigate('/')
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'An error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <Link to="/" className="block text-center mb-10">
          <span className="text-2xl font-black uppercase tracking-tighter">
            Train Reservation
          </span>
        </Link>

        {/* Card */}
        <div className="border-2 border-black p-8 space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tighter">
              Complete Your Profile
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
              Fill in your details to start booking tickets
            </p>
          </div>

          {error && (
            <div className="border-2 border-black bg-black text-white p-3">
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest opacity-40" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-black px-4 py-3 text-sm font-medium bg-white outline-none focus:bg-black focus:text-white transition-colors placeholder:opacity-30"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest opacity-40" htmlFor="age">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border-2 border-black px-4 py-3 text-sm font-medium bg-white outline-none focus:bg-black focus:text-white transition-colors placeholder:opacity-30"
                placeholder="Enter your age"
                min="1"
                required
              />
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest opacity-40" htmlFor="profession">
                Profession
              </label>
              <input
                type="text"
                id="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full border-2 border-black px-4 py-3 text-sm font-medium bg-white outline-none focus:bg-black focus:text-white transition-colors placeholder:opacity-30"
                placeholder="Enter your profession"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-40" htmlFor="bio">
                  Bio
                </label>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
                  {formData.bio.length}/200
                </span>
              </div>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full border-2 border-black px-4 py-3 text-sm font-medium bg-white outline-none focus:bg-black focus:text-white transition-colors placeholder:opacity-30 resize-none"
                placeholder="Tell us about yourself"
                maxLength={200}
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors disabled:opacity-40"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default ProfileSetup