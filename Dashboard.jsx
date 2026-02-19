import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { assets } from "../../assets/assets";
import { AppContext } from '../../context/AppContex';

const formatTimeWithAMPM = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, completeAppointment, dashData: initialDashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [localDashData, setLocalDashData] = useState(initialDashData);
  
  // Keep localDashData in sync with context
  useEffect(() => {
    setLocalDashData(initialDashData);
  }, [initialDashData]);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!localDashData) return;
    
    // Optimistic update
    const updatedAppointments = localDashData.latestAppointments.map(appt => 
      appt._id === appointmentId 
        ? { ...appt, cancelled: true, isCompleted: false }
        : appt
    );
    
    setLocalDashData({
      ...localDashData,
      latestAppointments: updatedAppointments
    });
    
    try {
      await cancelAppointment(appointmentId);
    } catch (error) {
      // Revert on error
      setLocalDashData(initialDashData);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    if (!localDashData) return;
    
    // Optimistic update
    const updatedAppointments = localDashData.latestAppointments.map(appt => 
      appt._id === appointmentId 
        ? { ...appt, isCompleted: true, cancelled: false }
        : appt
    );
    
    setLocalDashData({
      ...localDashData,
      latestAppointments: updatedAppointments
    });
    
    try {
      await completeAppointment(appointmentId);
    } catch (error) {
      // Revert on error
      setLocalDashData(initialDashData);
    }
  };

  if (!localDashData) return null;
  
  return (
    <div className='m-5'>

      <div className='flex flex-wrap gap-3'>

        <div className='flex items-center gap-2 g-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{localDashData.doctors}</p>
            <p className='text-gray-400'>Doctors</p>
          </div>
        </div>

        <div className='flex items-center gap-2 g-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{localDashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-2 g-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{localDashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>

      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {
            localDashData.latestAppointments.map((item, index) => {
              return (
                <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                  <img className='rounded-full w-10' src={item.docData.image} alt="" />
                  <div className='flex-1 text-sm'>
                    <p className='text-gray-800 font-medium'>{item.docData.name}</p>
                    <p className='text-gray-600'>
                      {slotDateFormat(item.slotDate.split('_').join('-'))}, {formatTimeWithAMPM(item.slotTime)}
                    </p>
                  </div>
                  {
                    item.cancelled
                      ? <p className="text-red-400 text-xs font-medium">Cancelled</p>
                      : item.isCompleted
                        ? <p className="text-green-400 text-xs font-medium">Completed</p>
                        : <div className="flex">
                          <img 
                            onClick={() => handleCancelAppointment(item._id)} 
                            className="w-10 cursor-pointer hover:opacity-80 transition-opacity" 
                            src={assets.cancel_icon} 
                            alt="Cancel appointment" 
                          />
                          <img 
                            onClick={() => handleCompleteAppointment(item._id)} 
                            className="w-10 cursor-pointer hover:opacity-80 transition-opacity" 
                            src={assets.tick_icon} 
                            alt="Mark as completed" 
                          />
                        </div>
                  }
                </div>
              )
            })
          }
        </div>
      </div>

    </div>
  )
}

export default Dashboard