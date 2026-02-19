import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContex';
import { assets } from "../../assets/assets";
const formatTimeWithAMPM = (timeString) => {
  try {
    if (!timeString) return 'N/A';
    
    // Try to parse the time string (handles formats like '14:30', '2:30 PM', '2:30PM', etc.)
    const time = timeString.toString().trim();
    
    // If already in 12-hour format with AM/PM, return as is
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    
    // Handle 24-hour format
    const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return timeString;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString;
    }
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12; // Convert 0 to 12 for 12-hour format
    
    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment, completeAppointment } = useContext(AdminContext);
  const {calculateAge,slotDateFormat,currency} = useContext(AppContext)
  useEffect(()=>{
    if(aToken){
      getAllAppointments()
    }
  },[aToken])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-2 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll '> 

        <div className='hiddebn sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b' >
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {appointments.map((item,index)=>{
          return(
            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index+1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" />
                <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p className="whitespace-nowrap">
                {slotDateFormat(item.slotDate.split('_').join('-'))}, {formatTimeWithAMPM(item.slotTime)}
              </p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full bg-gray-200' src={item.docData.image} alt="" />
                <p>{item.docData.name}</p>
              </div>
              <p>{currency}{item.amount}</p>
              {
                    item.cancelled
                      ? <p className="text-red-400 text-xs font-medium">Cancelled</p>
                      : item.isCompleted
                        ? <p className="text-green-400 text-xs font-medium">Completed</p>
                        : <div className="flex">
                          <img onClick={() => cancelAppointment(item._id)} className="w-10 cursor-pointer" src={assets.cancel_icon} alt="" />
                          <img onClick={() => completeAppointment(item._id)} className="w-10 cursor-pointer" src={assets.tick_icon} alt="" />
                        </div>
                  }
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default AllAppointments;