import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
    const [aToken, setAToken] = useState(() => localStorage.getItem('aToken') || '');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const[dashData, setDashData] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    // Memoized function to prevent unnecessary recreations
    const getAllDoctors = useCallback(async () => {
        if (!aToken) return;
        
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
                headers: {
                    'Authorization': `Bearer ${aToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (data.success && data.doctors) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message || 'Failed to fetch doctors');
            }
            return data.doctors;
        } catch (error) {
            console.error('Error fetching doctors:', error);
            if (error.response?.status === 401) {
                // Handle unauthorized
                setAToken('');
                localStorage.removeItem('aToken');
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch doctors. Please try again.');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }

    }, [aToken, backendUrl, navigate]);

    const changeAvailability = async(docId) =>{
        try{

            const {data} = await axios.post(`${backendUrl}/api/admin/change-availability`, {docId}, {
                headers: {
                    'Authorization': `Bearer ${aToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message || 'Failed to change availability');
            }
        } catch(error) {
            toast.error(error.response?.data?.message || 'Failed to change availability. Please try again.');
        }
    }

    const getAllAppointments  = async () =>{
        try{

        
        const {data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
            headers: {
                'Authorization': `Bearer ${aToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (data.success && data.appointments) {
            setAppointments(data.appointments);
            console.log(data.appointments)
        } else {
            toast.error(data.message || 'Failed to fetch appointments');
        }
    } catch(error) {
        toast.error(error.response?.data?.message || 'Failed to fetch appointments. Please try again.');
    }
    }

    const cancelAppointment = async(appointmentId) => {
        try {
            // Update local state optimistically
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt._id === appointmentId 
                        ? { ...appt, cancelled: true, isCompleted: false }
                        : appt
                )
            );
            
            const {data} = await axios.post(`${backendUrl}/api/admin/appointment-cancel`, {appointmentId}, {
                headers: {
                    'Authorization': `Bearer ${aToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (data.success) {
                toast.success(data.message);
                // Refresh data to ensure consistency
                getAllAppointments();
            } else {
                // Revert on error
                toast.error(data.message || 'Failed to cancel appointment');
                getAllAppointments();
            }
        } catch(error) {
            // Revert on error
            toast.error(error.response?.data?.message || 'Failed to cancel appointment. Please try again.');
            getAllAppointments();
        }
    }

    const completeAppointment = async(appointmentId) => {
        try {
            // Update local state optimistically
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt._id === appointmentId 
                        ? { ...appt, isCompleted: true, cancelled: false }
                        : appt
                )
            );
            
            const {data} = await axios.post(`${backendUrl}/api/admin/appointment-complete`, {appointmentId}, {
                headers: {
                    'Authorization': `Bearer ${aToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (data.success) {
                toast.success(data.message);
                // Refresh data to ensure consistency
                getAllAppointments();
            } else {
                // Revert on error
                toast.error(data.message || 'Failed to complete appointment');
                getAllAppointments();
            }
        } catch(error) {
            // Revert on error
            console.error('Error completing appointment:', error);
            toast.error(error.response?.data?.message || 'Failed to complete appointment. Please try again.');
            getAllAppointments();
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${aToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (data.success && data.dashData) {
                setDashData(data.dashData);
                console.log(data.dashData)
            } else {
                toast.error(data.message || 'Failed to fetch dashboard data');
            }
        } catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard data. Please try again.');
        }
    }

    // Update token in localStorage when it changes
    useEffect(() => {
        if (aToken) {
            localStorage.setItem('aToken', aToken);
        } else {
            localStorage.removeItem('aToken');
        }
    }, [aToken]);



    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        aToken,
        setAToken,
        doctors,
        isLoading,
        getAllDoctors,
        changeAvailability,
        appointments,
        setAppointments,
        cancelAppointment,
        completeAppointment,
        getAllAppointments,
        dashData,
        getDashData,
        backendUrl
    }), [aToken, doctors, isLoading, getAllDoctors, changeAvailability, appointments, setAppointments, cancelAppointment, completeAppointment, getAllAppointments, backendUrl, dashData, getDashData]);

    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;