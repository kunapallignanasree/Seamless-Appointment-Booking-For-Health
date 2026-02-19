import React, { useContext, useEffect, useMemo } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { doctors, isLoading, error, getAllDoctors, changeAvailability } = useContext(AdminContext);
  
  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllDoctors();
      } catch (err) {
        console.error('Error in DoctorsList:', err);
        // Error is already handled in the context
      }
    };
    
    fetchData();
  }, [getAllDoctors]);
  
  // Memoize the doctors list to prevent unnecessary re-renders
  const doctorsList = useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) return [];
    return doctors.map(doctor => ({
      ...doctor,
      // Ensure image URL is properly formatted
      image: doctor.image?.startsWith('http') ? doctor.image : 
            doctor.image ? `http://localhost:4000/${doctor.image}` : null
    }));
  }, [doctors]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Log the doctors data to check its structure
  console.log('Doctors data:', doctors);

  return (
    <div className='m-5 max-h-[90vh] overflow-y-auto'>
      <h1 className='text-lg font-medium mb-5'>All Doctors</h1>
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
        {doctorsList && doctorsList.length > 0 ? (
          doctorsList.map((doctor, index) => (
            <div 
              className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer group h-full flex flex-col'
              key={doctor._id || index}
            >
              {doctor.image ? (
                <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500'
                  src={doctor.image}
                  alt={`${doctor.name || 'Doctor'}'s profile`}
                  onError={(e) => {
                    console.error('Error loading image:', doctor.image);
                    e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                  }}
                />
              ) : (
                <div>
                  No Image Available
                </div>
              )}

              <div className='p-4'>
                <p className='text-neutral-800 text-lg font-medium'>{doctor.name}</p>
                <p className='text-zinc-600 text-sm'>{doctor.speciality}</p>
                <div className='mt-2 flex items-center gap-1 text-sm'>
                  <input onChange={() => changeAvailability(doctor._id)} type="checkbox" checked={doctor.availability} />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No doctors found</p>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;