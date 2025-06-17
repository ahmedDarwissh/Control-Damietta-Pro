import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { TEAMS_DATA } from '../constants';
import { Shift } from '../types';
import ShiftCard from './ShiftCard';
import { addShiftToFirestore, getAllShifts } from '../services/firestoreService';

const ShiftManagementPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, error: globalAuthError, isFirestoreOffline } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedShiftType, setSelectedShiftType] = useState<'morning' | 'evening' | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchShifts = async () => {
      setIsLoading(true);
      try {
        const fetchedShifts = await getAllShifts();
        setShifts(fetchedShifts);
        handleFirestoreOutcome(null);
      } catch (err) {
        console.error("Error fetching shifts:", err);
        handleFirestoreOutcome(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShifts();
  }, [language, handleFirestoreOutcome]);


  const handleScheduleShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        alert(language === 'ar' ? 'يجب تسجيل الدخول لجدولة وردية.' : 'You must be logged in to schedule a shift.');
        return;
    }
    if (isFirestoreOffline) {
        alert(language === 'ar' ? 'أنت غير متصل حالياً. لا يمكن جدولة وردية.' : 'You are currently offline. Cannot schedule shift.');
        return;
    }
    const selectedTeam = TEAMS_DATA.find(t => t.id === selectedTeamId);
    if(!selectedTeam || !selectedShiftType || !selectedDate) {
        alert(language === 'ar' ? 'يا نجم املى كل الخانات الأول!' : 'Boss, fill all fields first!');
        return;
    }

    const shiftTypeName = selectedShiftType === 'morning' ? translate('morningShift') : translate('eveningShift');
    const newShiftName = `${selectedTeam.name} (${shiftTypeName})`;

    const newShiftData: Omit<Shift, 'id' | 'createdAt' | 'createdBy'> = { 
        name: newShiftName,
        startTime: selectedShiftType === 'morning' ? '07:30' : '19:30',
        endTime: selectedShiftType === 'morning' ? '19:30' : '07:30',
        teamId: selectedTeamId,
        date: selectedDate,
        shiftLeadName: selectedTeam.shiftLeadName,
        shiftLeadId: `sl_${selectedTeam.id}` 
    };

    try {
      const addedShift = await addShiftToFirestore(newShiftData, currentUser.uid);
      setShifts(prev => [...prev, addedShift].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime)));
      setSelectedTeamId('');
      setSelectedShiftType('');
      handleFirestoreOutcome(null);
    } catch (error) {
      console.error("Error scheduling shift:", error);
      handleFirestoreOutcome(error);
      alert(language === 'ar' ? 'فشلت جدولة الوردية. حاول تاني.' : 'Failed to schedule shift. Please try again.');
    }
  };
  
  if (isLoading && !globalAuthError) {
    return <div className="p-4 text-center text-csp-secondary dark:text-csp-base-dark-content">{translate('loading')}</div>;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <form onSubmit={handleScheduleShift} className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-xl shadow-lg">
        <h2 className={`text-lg font-semibold text-csp-primary dark:text-csp-accent mb-4 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{translate('scheduleShift')}</h2>
        <div className="space-y-4"> {/* Stack form fields */}
          <div>
            <label htmlFor="team" className="block text-xs font-medium text-csp-base-content dark:text-csp-base-dark-content mb-1">{translate('selectTeam')}</label>
            <select id="team" value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="block w-full p-2.5 border border-csp-base-300 dark:border-csp-base-dark-300 bg-csp-base-100 dark:bg-csp-base-dark-300 text-csp-base-content dark:text-csp-base-dark-content rounded-md shadow-sm focus:ring-1 focus:ring-csp-accent focus:border-csp-accent text-sm transition-shadow">
              <option value="">{translate('selectTeam')}...</option>
              {TEAMS_DATA.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="shiftType" className="block text-xs font-medium text-csp-base-content dark:text-csp-base-dark-content mb-1">{translate('selectShift')}</label>
            <select id="shiftType" value={selectedShiftType} onChange={e => setSelectedShiftType(e.target.value as 'morning' | 'evening' | '')} className="block w-full p-2.5 border border-csp-base-300 dark:border-csp-base-dark-300 bg-csp-base-100 dark:bg-csp-base-dark-300 text-csp-base-content dark:text-csp-base-dark-content rounded-md shadow-sm focus:ring-1 focus:ring-csp-accent focus:border-csp-accent text-sm transition-shadow">
              <option value="">{translate('selectShift')}...</option>
              <option value="morning">{translate('morningShift')}</option>
              <option value="evening">{translate('eveningShift')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-csp-base-content dark:text-csp-base-dark-content mb-1">{translate('selectDate')}</label>
            <input type="date" id="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="block w-full p-2.5 border border-csp-base-300 dark:border-csp-base-dark-300 bg-csp-base-100 dark:bg-csp-base-dark-300 text-csp-base-content dark:text-csp-base-dark-content rounded-md shadow-sm focus:ring-1 focus:ring-csp-accent focus:border-csp-accent text-sm transition-shadow" />
          </div>
        </div>
        <button 
            type="submit" 
            disabled={isFirestoreOffline}
            className={`mt-4 w-full py-2.5 px-4 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-csp-accent-focus transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-csp-accent disabled:opacity-60 disabled:cursor-not-allowed text-sm`}>
          {translate('scheduleShift')}
        </button>
      </form>

      {(!isLoading || shifts.length > 0) && !globalAuthError && (
        <section className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-xl shadow-lg">
          <h2 className={`text-lg font-semibold text-csp-primary dark:text-csp-accent mb-4 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{translate('allShifts')}</h2>
          {shifts.length > 0 ? (
              <div className="space-y-3"> {/* Shifts stack vertically */}
                  {shifts.map(shift => <ShiftCard key={shift.id} shift={shift} />)}
              </div>
          ) : (
              <p className="text-sm text-csp-secondary dark:text-gray-400 text-center py-4">{translate('noShiftsAvailable')}</p>
          )}
        </section>
      )}
      {shifts.length === 0 && !isLoading && !globalAuthError && (
        <p className="text-center text-sm text-csp-secondary dark:text-gray-400 py-4">
          {translate('noShiftsAvailable')}
        </p>
      )}
    </div>
  );
};

export default ShiftManagementPage;