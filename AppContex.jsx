import { createContext } from "react"

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currency = '₹'

    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        return age;
    }

    const months = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']



    const slotDateFormat = (slotDate) => {
        try {
            if (!slotDate) return 'N/A';
            
            // Handle different date formats
            let dateArray;
            if (slotDate.includes('-')) {
                dateArray = slotDate.split('-');
                // If the date is in YYYY-MM-DD format
                if (dateArray[0].length === 4) {
                    return `${dateArray[2]}-${months[parseInt(dateArray[1], 10)]}-${dateArray[0]}`;
                }
                // If the date is in DD-MM-YYYY format
                return `${dateArray[0]}-${months[parseInt(dateArray[1], 10)]}-${dateArray[2]}`;
            } else if (slotDate.includes('/')) {
                dateArray = slotDate.split('/');
                // Handle MM/DD/YYYY or DD/MM/YYYY formats
                if (dateArray[0].length === 4) {
                    return `${dateArray[2]}-${months[parseInt(dateArray[1], 10)]}-${dateArray[0]}`;
                }
                return `${dateArray[1]}-${months[parseInt(dateArray[0], 10)]}-${dateArray[2]}`;
            }
            
            return slotDate; // Return as is if format is not recognized
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }
    const formatTimeWithAMPM = (timeString) => {
        if (!timeString) return 'N/A';
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Invalid Time';
        }
    };

    const value = {
        calculateAge,
        formatTimeWithAMPM,
        slotDateFormat,
        currency
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider