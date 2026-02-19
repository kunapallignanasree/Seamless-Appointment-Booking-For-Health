import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const AddDoctor = () => {

  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const { backendUrl, aToken, setAToken } = useContext(AdminContext)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const navigate = useNavigate();

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'prescripto_unsigned'); // Replace with your unsigned preset

    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dlgq89kur/image/upload',
      formData
    );
    return response.data.secure_url;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!aToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      if (!docImg) {
        return toast.error('Please upload doctor image');
      }

      // Validate form fields
      if (!name || !email || !password || !experience || !fees || !about || !speciality || !degree || !address1) {
        return toast.error('Please fill in all required fields');
      }

      // 1. First create the address object
      const addressObj = { 
        line1: address1.trim(), 
        line2: (address2 || '').trim() 
      };

      let cloudinaryUrl = '';
      try {
        cloudinaryUrl = await uploadToCloudinary(docImg);
      } catch (err) {
        toast.error('Image upload failed');
        setIsSubmitting(false);
        return;
      }

      // 2. Prepare doctor data (send address as string if needed)
      const doctorData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        image: cloudinaryUrl, // <-- match schema field name
        speciality: speciality,
        degree: degree.trim(),
        experience: experience,
        about: about.trim(),
        availability: true, // <-- default value, or set as needed
        fees: Number(fees),
        address: { line1: address1.trim(), line2: (address2 || '').trim() },
        date: Date.now(), // <-- current timestamp
        slots_booked: (() => {
          const slots = {};
          const today = new Date();
          
          // Initialize slots for next 7 days
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const dateKey = `${day}_${month}_${year}`;
            
            // Initialize with empty array for each date
            slots[dateKey] = [];
            
            // For debugging
            console.log(`Initialized slots for date: ${dateKey}`, slots[dateKey]);
          }
          return slots;
        })(), // <-- Initialize with empty slots for next 7 days
      };

      console.log('Doctor data being sent:', doctorData);

      setIsSubmitting(true);

      // Create config
      const config = {
        headers: {
          'Authorization': `Bearer ${aToken}`,
          'Accept': 'application/json'
        },
        timeout: 60000,
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      };

      // Make the request
      console.log('Sending request to:', `${backendUrl}/api/admin/add-doctor`);
      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        doctorData,
        config
      );

      if (data.success) {
        toast.success(data.message || 'Doctor added successfully!');
        // Reset form fields
        setName('');
        setEmail('');
        setPassword('');
        setExperience('1 Year');
        setFees('');
        setAbout('');
        setSpeciality('General physician');
        setDegree('');
        setAddress1('');
        setAddress2('');
        setDocImg(false);
        // Reset file input
        document.getElementById('doc-img').value = '';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else if (error.response) {
        // Server responded with error status code
        const { status, data } = error.response;
        
        if (status === 401 || status === 403) {
          toast.error("Session expired. Please login again.");
          setAToken('');
          localStorage.removeItem('aToken');
          // Redirect to login
          navigate('/admin/login');
        } else if (status === 400 && data.missing) {
          toast.error(`Missing required fields: ${data.missing.join(', ')}`);
        } else {
          toast.error(data?.message || `Error: ${status} - Failed to add doctor`);
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please check your connection and try again.");
      } else {
        // Something else happened
        toast.error(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add button click animation
  const handleButtonClick = (e) => {
    if (isSubmitting) return;
    setIsButtonClicked(true);
    setTimeout(() => setIsButtonClicked(false), 200);
  };

  return (
    <form onSubmit={onSubmitHandler} className='m-6 w-full'>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>

      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id='doc-img' hidden />
          <p>Upload doctor <br /> picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor Name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='name' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='email' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='password' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Experience</p>
              <select onChange={(e) => setExperience(e.target.value)} value={experience} className='border rounded px-3 py-2' name="experience" >
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Fees</p>
              <input onChange={(e) => setFees(e.target.value)} value={fees} className='border rounded px-3 py-2' type="number" placeholder='fees' required />
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Speciality</p>
              <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='border rounded px-3 py-2' >
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Education</p>
              <input onChange={(e) => setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='education' required />
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Address</p>
              <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='address 1' required />
              <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='address 2' required />
            </div>
          </div>

        </div>
        
        <div>
          <p className='mt-4 mb-2'>About Doctor</p>
          <textarea 
            onChange={(e) => setAbout(e.target.value)} 
            value={about} 
            className='w-full px-4 pt-2 border rounded' 
            rows={5} 
            placeholder='Write about doctor' 
            required 
          />
        </div>

        <button 
          type='submit' 
          onClick={handleButtonClick}
          disabled={isSubmitting}
          className={`mt-6 bg-primary px-10 py-3 text-white rounded-full 
            hover:bg-opacity-90 transition-all duration-200 transform
            ${isButtonClicked ? 'scale-95' : 'scale-100'}
            ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? 'Adding...' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;