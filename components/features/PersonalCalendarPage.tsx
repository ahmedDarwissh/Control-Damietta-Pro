
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { DailyTask, Shift } from '../../types';
import { getTasksForUser, getAllShifts } from '../../services/firestoreService'; // Assuming getAllShifts or a user-specific version

const PersonalCalendarPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ tasks: DailyTask[], shifts: Shift[], day: number } | null>(null);

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const userTasks = await getTasksForUser(currentUser.uid);
          const userShifts = currentUser.teamId 
            ? (await getAllShifts()).filter(s => s.teamId === currentUser.teamId) 
            : []; 
            
          setTasks(userTasks);
          setShifts(userShifts);
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching calendar data:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 for Sunday

  const getMonthName = (date: Date) => date.toLocaleString(language === 'ar' ? 'ar-EG-u-ca-islamic' : 'en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(task => task.dueDate?.startsWith(dateStr) || task.date === dateStr);
    const dayShifts = shifts.filter(shift => shift.date === dateStr);
    return { tasks: dayTasks, shifts: dayShifts, day: day };
  };

  const handleDayClick = (day: number) => {
    setSelectedDayEvents(getEventsForDay(day));
  };
  
  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentMonth);
    let startingDay = firstDayOfMonth(currentMonth); 
    if(language === 'ar') { // Adjust for Saturday start in Arabic
        startingDay = (startingDay + 1) % 7;
    }
    const daysArray: (number | null)[] = Array(startingDay).fill(null); 
    for (let i = 1; i <= totalDays; i++) daysArray.push(i);

    return daysArray.map((day, index) => {
      if (day === null) return <div key={`empty-${index}`} className="p-1.5 sm:p-2 border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10"></div>;
      const events = getEventsForDay(day);
      const hasTasks = events.tasks.length > 0;
      const hasShifts = events.shifts.length > 0;
      const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

      return (
        <div 
          key={day} 
          onClick={() => handleDayClick(day)}
          className={`p-1.5 sm:p-2 border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10 cursor-pointer hover:bg-csp-secondary-bg dark:hover:bg-csp-primary-dark transition-colors h-16 sm:h-20 flex flex-col justify-between ${isToday ? 'bg-csp-accent/10 dark:bg-csp-accent-dark/10' : ''} ${selectedDayEvents?.day === day ? 'ring-2 ring-csp-accent dark:ring-csp-accent-dark' : ''}`}
        >
          <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-csp-accent dark:text-csp-accent-dark' : 'text-csp-primary-text dark:text-csp-primary-dark-text'}`}>{day}</span>
          <div className="mt-auto flex flex-wrap gap-0.5">
            {hasTasks && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" title={`${events.tasks.length} task(s)`}></span>}
            {hasShifts && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" title={`${events.shifts.length} shift(s)`}></span>}
          </div>
        </div>
      );
    });
  };

  const weekdays = language === 'ar' 
    ? ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'] // Sat, Sun, Mon...
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4" dir={language}>
      <div className="bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-csp-secondary-bg dark:hover:bg-csp-primary-dark text-csp-accent dark:text-csp-accent-dark">&lt;</button>
          <h2 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{getMonthName(currentMonth)}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-csp-secondary-bg dark:hover:bg-csp-primary-dark text-csp-accent dark:text-csp-accent-dark">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-csp-secondary-text/10 dark:bg-csp-primary-dark-text/10 border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
          {weekdays.map(day => <div key={day} className="p-1.5 sm:p-2 text-center text-xs font-semibold text-csp-secondary-text dark:text-csp-secondary-dark-text bg-csp-secondary-bg dark:bg-csp-primary-dark">{day}</div>)}
          {renderCalendarDays()}
        </div>
      </div>

      {selectedDayEvents && (
        <div className="bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
           <h3 className={`text-md font-semibold mb-2 text-csp-primary-text dark:text-csp-primary-dark-text ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>
            {translate('eventsForDay', `${selectedDayEvents.day}/${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}`)}
          </h3>
          {selectedDayEvents.tasks.length === 0 && selectedDayEvents.shifts.length === 0 && <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('noEventsForDay')}</p>}
          {selectedDayEvents.shifts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mt-2 mb-1 text-csp-accent dark:text-csp-accent-dark">{translate('shifts')}:</h4>
              <ul className="list-disc list-inside text-xs pl-4 rtl:pr-4 text-csp-secondary-text dark:text-csp-secondary-dark-text">
                {selectedDayEvents.shifts.map(shift => <li key={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</li>)}
              </ul>
            </div>
          )}
          {selectedDayEvents.tasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mt-2 mb-1 text-csp-accent dark:text-csp-accent-dark">{translate('tasks')}:</h4>
              <ul className="list-disc list-inside text-xs pl-4 rtl:pr-4 text-csp-secondary-text dark:text-csp-secondary-dark-text">
                {selectedDayEvents.tasks.map(task => <li key={task.id} className={task.isCompleted ? 'line-through' : ''}>{task.description}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalCalendarPage;
