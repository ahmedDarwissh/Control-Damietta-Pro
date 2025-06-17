
import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { DailyTask, PomodoroSession } from '../../types';
import { getTasksForUser, addPomodoroSession } from '../../services/firestoreService';
import firebase from 'firebase/compat/app';

const PomodoroTimerPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(true); // true for focus, false for break
  
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0); // Count of focus sessions

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null); // For notification sound

  useEffect(() => {
    if (currentUser) {
      getTasksForUser(currentUser.uid)
        .then(userTasks => setTasks(userTasks.filter(t => !t.isCompleted))) // Only show pending tasks
        .catch(err => console.error("Error fetching tasks for Pomodoro:", err));
    }
  }, [currentUser]);

  useEffect(() => {
    setTimeLeft(isFocusMode ? focusDuration * 60 : breakDuration * 60);
  }, [focusDuration, breakDuration, isFocusMode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Session ended
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.warn("Pomodoro sound play failed", e));
      }
      setIsActive(false);
      if (isFocusMode) {
        setCompletedSessions(prev => prev + 1);
        // Log completed focus session
        if (currentUser) {
            const sessionData: Omit<PomodoroSession, 'id'> = {
                userId: currentUser.uid,
                taskId: linkedTaskId || undefined,
                startTime: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - focusDuration * 60 * 1000)),
                duration: focusDuration,
                isCompleted: true
            };
            addPomodoroSession(sessionData).catch(err => console.error("Failed to log Pomodoro session", err));
        }
      }
      // Switch mode
      setIsFocusMode(prevMode => !prevMode);
      // Auto-start next session could be an option here
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft, isFocusMode, currentUser, focusDuration, breakDuration, linkedTaskId]); // Added breakDuration to dependency array

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsFocusMode(true);
    setTimeLeft(focusDuration * 60);
    setCompletedSessions(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2.5 px-5 rounded-md font-semibold text-sm transition-colors duration-150 shadow-md hover:shadow-lg";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;
  const secondaryButtonClasses = `${buttonClasses} bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-opacity-80`;

  return (
    <div className={`${cardClasses} text-center space-y-6`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <audio ref={audioRef} src="/sounds/pomodoro_complete.mp3" preload="auto" />
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isFocusMode ? 'text-csp-accent dark:text-csp-accent-dark' : 'text-green-500 dark:text-green-400'} ${language==='ar'?'font-cairo':'font-poppins'}`}>
          {isFocusMode ? translate('timerFocusing') : translate('timerOnBreak')}
        </h2>
        <p className={`text-6xl font-mono font-bold text-csp-primary-text dark:text-csp-primary-dark-text tracking-wider ${isActive && timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
          {formatTime(timeLeft)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <button onClick={toggleTimer} className={`${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : primaryButtonClasses} ${buttonClasses} text-white flex-1 w-full sm:w-auto`}>
          {isActive ? translate('pauseTimer') : translate('startTimer')}
        </button>
        <button onClick={resetTimer} className={`${secondaryButtonClasses} flex-1 w-full sm:w-auto`}>{translate('resetTimer')}</button>
      </div>

      <div className="space-y-3 pt-4 border-t border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="focusDuration" className={labelBaseClasses}>{translate('pomodoroFocusDuration')}</label>
            <input type="number" id="focusDuration" value={focusDuration} onChange={e => setFocusDuration(Math.max(1, Number(e.target.value)))} className={inputBaseClasses} disabled={isActive} />
          </div>
          <div className="flex-1">
            <label htmlFor="breakDuration" className={labelBaseClasses}>{translate('pomodoroBreakDuration')}</label>
            <input type="number" id="breakDuration" value={breakDuration} onChange={e => setBreakDuration(Math.max(1, Number(e.target.value)))} className={inputBaseClasses} disabled={isActive} />
          </div>
        </div>
        <div>
          <label htmlFor="linkedTask" className={labelBaseClasses}>{translate('pomodoroLinkTask')}</label>
          <select id="linkedTask" value={linkedTaskId || ''} onChange={e => setLinkedTaskId(e.target.value || null)} className={inputBaseClasses} disabled={isActive}>
            <option value="">{translate('selectTask')}</option>
            {tasks.map(task => <option key={task.id} value={task.id}>{task.description.substring(0,40)}...</option>)}
            {tasks.length === 0 && <option disabled>{translate('noTasksAvailable')}</option>}
          </select>
        </div>
      </div>
      <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">Completed focus sessions: {completedSessions}</p>
    </div>
  );
};
export default PomodoroTimerPage;
