import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [dToken, setDTokenState] = useState(() => {
        return localStorage.getItem('dToken') || ''
    })
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const setDToken = useCallback((token) => {
        if (token) {
            localStorage.setItem('dToken', token)
        } else {
            localStorage.removeItem('dToken')
        }
        setDTokenState(token || '')
    }, [])

    const [appointments, setAppointments] = useState([])

    const getAppointments = useCallback(async () => {
        if (!dToken) {
            console.error('No authentication token found');
            toast.error('Please log in to view appointments');
            return [];
        }

        try {
            console.group('Fetching Appointments');
            console.log('API Endpoint:', `${backendUrl}/api/doctor/appointments`);
            
            const response = await axios.get(`${backendUrl}/api/doctor/appointments`, {
                headers: {
                    'Authorization': `Bearer ${dToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: true
            });

            console.log('Appointments API Response:', response.data);
            
            if (response.data && response.data.success) {
                const appointments = response.data.appointments || [];
                console.log(`Fetched ${appointments.length} appointments`);
                setAppointments(appointments);
                return appointments;
            } else {
                const errorMsg = response.data?.message || 'Failed to fetch appointments';
                console.error('API Error:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Error fetching appointments:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.status === 401) {
                // Token expired or invalid, clear it
                setDToken(null);
                toast.error('Session expired. Please log in again.');
            } else {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch appointments';
                toast.error(errorMsg);
            }
            return [];
        } finally {
            console.groupEnd();
        }
    }, [dToken, backendUrl, setDToken]);

    const completeAppointment = async (appointmentId) => {
        try {
            // Get the current user's ID from the token
            const decodedToken = jwtDecode(dToken);
            const docId = decodedToken.id;
            
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/appointment-complete`,
                { docId, appointmentId },
                { headers: { dToken } }
            );
            
            if (data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to complete appointment';
            toast.error(errorMessage);
        }
    }
    const cancelAppointment = async (appointmentId) => {
        try{
            const {data } = await axios.post(`${backendUrl}/api/doctor/appointment-cancel`,{appointmentId},{headers:{dToken}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
            } else{
                toast.error(data.message)
            }
        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDashData = useCallback(async () => {
        try{
            const {data } = await axios.get(`${backendUrl}/api/doctor/dashboard`,{headers:{dToken}})
            if(data.success){
                toast.success(data.message)
                setDashData(data.dashData)
            } else{
                toast.error(data.message)
            }
        }catch(error){
            console.error('Error fetching dashboard data:', error)
            toast.error(error.message || 'Failed to fetch dashboard data')
        }
    }, [dToken, backendUrl])

    const getProfileData = useCallback(async () => {
        try{
            const {data } = await axios.get(`${backendUrl}/api/doctor/doctor-profile`,{headers:{dToken}})
            if(data.success){
                toast.success(data.message)
                setProfileData(data.profileData)
                console.log(data.profileData)
            } else{
                toast.error(data.message)
            }
        }catch(error){
            console.error('Error fetching profile data:', error)
            toast.error(error.message || 'Failed to fetch profile data')
        }
    }, [dToken, backendUrl])
    const updateProfileData = useCallback(async (profileData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/update-doctor-profile`,
                profileData,
                {
                    headers: { 
                        'Authorization': `Bearer ${dToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (data.success) {
                toast.success(data.message)
                await getProfileData()
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.error('Error updating profile data:', error)
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile data'
            toast.error(errorMsg)
            return { success: false, message: errorMsg }
        }
    }, [dToken, backendUrl, getProfileData])
    const value ={
        backendUrl,
        dToken,
        setDToken,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        getDashData,
        setDashData,
        profileData,
        getProfileData,
        updateProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider