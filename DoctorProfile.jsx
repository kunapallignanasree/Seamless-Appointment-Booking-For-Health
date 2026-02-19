import React, { useEffect, useState, useContext } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PropTypes from 'prop-types'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContex'

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, updateProfileData } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localData, setLocalData] = useState({
    fees: '',
    address: { line1: '', line2: '' },
    availability: false
  })

  // Initialize local data when profileData changes
  useEffect(() => {
    if (profileData) {
      setLocalData({
        fees: profileData.fees?.toString() || '0',
        address: {
          line1: profileData.address?.line1 || '',
          line2: profileData.address?.line2 || ''
        },
        availability: profileData.availability || false
      })
    }
  }, [profileData])

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken, getProfileData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLocalData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setLocalData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      // Format the data to match the backend expectations
      const dataToUpdate = {
        fees: parseFloat(localData.fees) || 0,
        address: {
          line1: localData.address.line1,
          line2: localData.address.line2
        },
        availability: localData.availability
      }
      
      const result = await updateProfileData(dataToUpdate)
      
      if (result?.success) {
        toast.success('Profile updated successfully')
        setIsEdit(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Default empty profile data to prevent errors
  const safeProfileData = profileData || {
    name: '',
    degree: '',
    speciality: '',
    experience: '',
    about: '',
    image: '',
    fees: '',
    address: { line1: '', line2: '' },
    availability: false
  }

  return safeProfileData && (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          <img 
            className='bg-primary/80 w-full sm:max-w-64 rounded-lg' 
            src={safeProfileData.image || '/default-doctor.png'} 
            alt={`Profile of Dr. ${safeProfileData.name}`} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-doctor.png';
            }}
          />
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          {/* Doc Info : name, degree, experience */}
            <h1 className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{safeProfileData.name || 'Doctor Profile'}</h1>
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p>{[safeProfileData.degree, safeProfileData.speciality].filter(Boolean).join(' - ')}</p>
              {safeProfileData.experience && (
                <span className='py-0.5 px-2 border text-xs rounded-full'>{safeProfileData.experience}</span>
              )}
          </div>
          {/*Doc About */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3'>About</p>
            <p className='text-sm text-gray-600 max-w-[700px] mt-1'>
              {safeProfileData.about || 'No description available'}
            </p>
          </div>

          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee: <span className='text-gray-800'>
              {isEdit ? (
                <input
                  type="number"
                  name="fees"
                  min="0"
                  step="0.01"
                  value={localData.fees}
                  onChange={handleInputChange}
                  className='border rounded px-2 py-1 w-32'
                  disabled={isLoading}
                />
              ) : (
                profileData.fees !== undefined ? `${currency}${profileData.fees}` : 'Not set'
              )}
            </span>
          </p>

          <div className='flex flex-col gap-2 py-2'>
            <p>Address:</p>
            {isEdit ? (
              <div className='flex flex-col gap-2'>
                <input
                  type="text"
                  name="line1"
                  value={localData.address.line1}
                  onChange={handleAddressChange}
                  placeholder="Address Line 1"
                  className='border rounded px-2 py-1 text-sm'
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="line2"
                  value={localData.address.line2}
                  onChange={handleAddressChange}
                  placeholder="Address Line 2 (Optional)"
                  className='border rounded px-2 py-1 text-sm'
                  disabled={isLoading}
                />
              </div>
            ) : (
              <p className='text-sm'>
                {profileData.address?.line1 || 'N/A'}
                {profileData.address?.line2 ? `, ${profileData.address.line2}` : ''}
              </p>
            )}
          </div>

          <div className='flex gap-1 pt-2 items-center'>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="availability-checkbox"
                checked={localData.availability}
                onChange={() => setLocalData(prev => ({ ...prev, availability: !prev.availability }))}
                disabled={!isEdit || isLoading}
                className={`h-4 w-4 rounded border-gray-300 ${isEdit ? 'text-green-600 focus:ring-green-500 cursor-pointer' : 'text-blue-600 focus:ring-blue-500 cursor-not-allowed'}`}
              />
              <label htmlFor="availability-checkbox" className="ml-2 cursor-pointer">
                Available for Appointments
              </label>
            </div>
          </div>

          <div className='flex gap-3 mt-5'>
            {isEdit ? (
              <>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className='px-4 py-1 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2'
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => {
                    // Reset to original data and exit edit mode
                    setLocalData({
                      fees: profileData.fees || '',
                      address: {
                        line1: profileData.address?.line1 || '',
                        line2: profileData.address?.line2 || ''
                      },
                      availability: profileData.availability || false
                    })
                    setIsEdit(false)
                  }}
                  disabled={isLoading}
                  className='px-4 py-1 border border-gray-300 text-sm rounded-full hover:bg-gray-50 transition-all'
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEdit(true)}
                className='px-4 py-1 border border-primary text-primary text-sm rounded-full hover:bg-primary/10 transition-all'
              >
                Edit Profile
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

DoctorProfile.propTypes = {
  // Add any required PropTypes here if needed
}

export default DoctorProfile