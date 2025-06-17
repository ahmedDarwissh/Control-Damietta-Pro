
import { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Language } from '../types';

const useDateTime = () => {
  const { language } = useLocalization();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); 

    return () => {
      clearInterval(timerId); 
    };
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    };
    return date.toLocaleDateString(language === Language.AR ? 'ar-EG' : 'en-US', options);
  };

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    };
    return date.toLocaleTimeString(language === Language.AR ? 'ar-EG' : 'en-US', options);
  };
  
  return {
    dateString: formatDate(currentDateTime),
    timeString: formatTime(currentDateTime),
  };
};

export default useDateTime;
