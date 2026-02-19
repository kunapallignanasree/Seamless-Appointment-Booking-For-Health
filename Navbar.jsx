import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'
import '../Navbar.css'

const Navbar = () => {
    const { aToken, setAToken } = useContext(AdminContext)
    const { dToken, setDToken } = useContext(DoctorContext)
    const navigate = useNavigate()

    const logout = () => {
        if (aToken) {
            setAToken('')
            localStorage.removeItem('aToken')
            navigate('/')
        }
        
        if (dToken) {
            setDToken('')
            localStorage.removeItem('dToken')
            // Redirect to admin login page when logging out from doctor panel
            window.location.href = '/admin-login'  // This will do a full page reload
        }
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
        <div className='flex items-center gap-4 text-xs'>
        <p className='text-2xl font-medium flex items-center gap-1'>
            <span className='material-symbols-outlined text-blue-500'>radio_button_checked</span>
            Doc<span className='text-blue-500 font-medium text-2xl'>Spot!</span>
          </p>
            <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
        </div>
        <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
  )
}

export default Navbar