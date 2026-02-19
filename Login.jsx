import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'
const Login = () => {
    // Set default state to 'Doctor' instead of 'Admin'
    const [loginType, setLoginType] = useState('Doctor')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { setAToken, backendUrl } = useContext(AdminContext)
    const { setDToken } = useContext(DoctorContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        // Basic validation
        if (!email || !password) {
            return toast.error('Please enter both email and password');
        }

        try {
            const endpoint = loginType === 'Admin' 
                ? '/api/admin/login' 
                : '/api/doctor/login';
            
            const { data } = await axios.post(backendUrl + endpoint, { 
                email: email.trim(), 
                password 
            });
            
            if (data.success && data.token) {
                // Store token and user data based on login type
                // Log the token and user data to console
                console.log('✅ Login successful!');
                console.log('🔑 Token:', data.token);
                console.log('👤 User Data:', data.user || 'Admin user');
                
                // Log stored tokens for debugging
                console.log('🔍 Stored Doctor Token:', localStorage.getItem('dToken'));
                console.log('🔍 Stored Admin Token:', localStorage.getItem('aToken'));
                
                if (loginType === 'Admin') {
                    localStorage.setItem('aToken', data.token);
                    localStorage.setItem('userRole', 'admin');
                    setAToken(data.token);
                    window.location.href = '/admin-dashboard';
                } else {
                    // Store doctor data
                    const { user } = data;
                    localStorage.setItem('dToken', data.token);
                    localStorage.setItem('userRole', 'doctor');
                    localStorage.setItem('userData', JSON.stringify({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        speciality: user.speciality,
                        image: user.image
                    }));
                    setDToken(data.token);
                    window.location.href = '/doctor-dashboard';
                }
                toast.success(data.message || 'Login successful');
            } else {
                throw new Error(data.message || 'Login failed');
            }
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error('Login error:', errorMessage);
            console.error('Full error:', error);
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            }
            
            toast.error(errorMessage || 'Login failed. Please check your credentials and try again.');
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'><span className='text-primary'> {loginType} </span> Login</p>
                <div className='w-full'>
                    <p>Email</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[DADADA] rounded w-full p-2 mt-1' type="email" required />
                </div>
                <div className='w-full'>
                    <p>Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[DADADA] rounded w-full p-2 mt-1' type="Password" required />
                </div>
                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
                {
                    loginType === 'Admin'
                        ? <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={() => setLoginType('Doctor')}>Click here</span></p>
                        : <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={() => setLoginType('Admin')}>Click here</span></p>
                }
                <button 
                    type="button"
                    onClick={() => window.location.href = 'https://docspot-com.vercel.app/'}
                    className='w-full py-2 rounded-md text-base border border-primary text-primary hover:bg-gray-50 mt-2'
                >
                    Back to Home
                </button>
            </div>
        </form>
    )
}

export default Login