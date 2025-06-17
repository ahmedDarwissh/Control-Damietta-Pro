
import React, { useEffect, useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Shift, DailyTask, ShipInfo, PrayerTime, GeminiContent, Language, Team, User, UserContact } from '../types';
import { TEAMS_DATA, DAMIETTA_PRAYER_TIMES } from '../constants'; 
import ShiftCard from './ShiftCard'; 
import TaskItem from './TaskItem'; 
import ShipInfoCard from './ShipInfoCard'; 
import { getShiftsForUserTeam, getTasksForUser, updateTaskCompletionInFirestore, getAllShips, getTeamById, getAllUsers } from '../services/firestoreService';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useAppConfig } from '../contexts/AppConfigContext';

// Icons for stat cards
const StatCardIcon: React.FC<{ icon: React.ReactNode, bgColorClass: string }> = ({ icon, bgColorClass }) => (
    <div className={`p-3 rounded-full ${bgColorClass} text-white mr-3 rtl:ml-3 rtl:mr-0 shadow-md`}>
        {icon}
    </div>
);

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>;
const ListBulletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const ShipIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.841a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-csp-accent dark:text-csp-accent-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-csp-accent dark:text-csp-accent-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25a4.5 4.5 0 00-3.09 3.09L12 18.75l.813 2.846a4.5 4.5 0 003.09 3.09L18.75 21l2.846.813a4.5 4.5 0 003.09-3.09L21.75 18l-.813-2.846a4.5 4.5 0 00-3.09-3.09zM12 2.25l.813 2.846a4.5 4.5 0 003.09 3.09L18.75 9l-2.846.813a4.5 4.5 0 00-3.09 3.09L12 15.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L5.25 9l2.846-.813a4.5 4.5 0 003.09-3.09L12 2.25z" /></svg>;
const CakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-csp-accent dark:text-csp-accent-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a8.25 8.25 0 01-16.5 0V11.25m16.5 0a8.25 8.25 0 00-16.5 0m16.5 0v3.75A2.25 2.25 0 0119.5 17.25h-15A2.25 2.25 0 012.25 15v-3.75m16.5 0c0-3.75-3.75-6.75-8.25-6.75S3.75 7.5 3.75 11.25m16.5 0c0-2.25-.75-4.5-2.25-6M7.5 6.38V6.75a1.5 1.5 0 001.5 1.5h.75a1.5 1.5 0 001.5-1.5V6.38m-3 .087a3.375 3.375 0 016.75 0m-6.75 0V3.375c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v3.093m-3 .087H12M12 3.75v2.625" /></svg>;


const sectionCardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
const sectionTitleClasses = (lang: Language) => `text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text mb-3 ${lang === Language.AR ? 'font-cairo' : 'font-poppins'}`;


const Dashboard: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, error: globalAuthError, isFirestoreOffline } = useAuth();
  const { appConfig } = useAppConfig();
  
  const [userShifts, setUserShifts] = useState<Shift[]>([]);
  const [userTasks, setUserTasks] = useState<DailyTask[]>([]);
  const [allShips, setAllShips] = useState<ShipInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentTeamDetails, setCurrentTeamDetails] = useState<Team | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UserContact[]>([]);


  const [aiWisdom, setAiWisdom] = useState<string>(translate('aiWisdomPlaceholder'));
  const [aiRiddle, setAiRiddle] = useState<{ question: string, answer?: string }>({ question: translate('aiRiddlePlaceholder') });
  const [loadingAiContent, setLoadingAiContent] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoadingData(true);
      const todayStr = new Date().toISOString().split('T')[0];
      
      const fetchData = async () => {
        try {
          const shiftsPromise = currentUser.teamId ? getShiftsForUserTeam(currentUser.teamId, todayStr) : Promise.resolve([]);
          const tasksPromise = getTasksForUser(currentUser.uid); 
          const shipsPromise = getAllShips();
          const teamDetailsPromise = currentUser.teamId ? getTeamById(currentUser.teamId) : Promise.resolve(null);
          const allUsersPromise = getAllUsers();


          const [shifts, tasks, shipsData, teamData, allUsersData] = await Promise.all([shiftsPromise, tasksPromise, shipsPromise, teamDetailsPromise, allUsersPromise]);
          
          setUserShifts(shifts);
          setUserTasks(tasks.sort((a,b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1: -1) || (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))); 
          setAllShips(shipsData);
          setCurrentTeamDetails(teamData);

          // Calculate upcoming birthdays
          const today = new Date();
          const currentDay = today.getDate();
          const currentMonth = today.getMonth(); // 0-indexed
          const upcoming = allUsersData.filter(user => {
            if (!user.birthDate) return false; // YYYY-MM-DD
            const [birthYear, birthMonth, birthDay] = user.birthDate.split('-').map(Number);
            // Check if birthday is in the next 7 days, considering year wrap-around
            const nextBirthdayThisYear = new Date(today.getFullYear(), birthMonth - 1, birthDay);
            const nextBirthdayNextYear = new Date(today.getFullYear() + 1, birthMonth - 1, birthDay);
            
            let diffThisYear = (nextBirthdayThisYear.getTime() - today.getTime()) / (1000 * 3600 * 24);
            if (diffThisYear < 0) diffThisYear += 365.25; // approx days in year, consider if already passed this year

            let diffNextYear = (nextBirthdayNextYear.getTime() - today.getTime()) / (1000 * 3600 * 24);

            return (diffThisYear >= 0 && diffThisYear <= 7) || (diffNextYear >=0 && diffNextYear <=7);
          }).sort((a,b) => { // Sort by upcoming date
            const dateA = new Date(today.getFullYear(), parseInt(a.birthDate!.split('-')[1]) - 1, parseInt(a.birthDate!.split('-')[2]));
            const dateB = new Date(today.getFullYear(), parseInt(b.birthDate!.split('-')[1]) - 1, parseInt(b.birthDate!.split('-')[2]));
            if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
            if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);
            return dateA.getTime() - dateB.getTime();
          });
          setUpcomingBirthdays(upcoming);

          handleFirestoreOutcome(null);

        } catch (err: any) {
          console.error("Error fetching dashboard data:", err);
          handleFirestoreOutcome(err);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [currentUser, language, handleFirestoreOutcome]);

  useEffect(() => {
    const fetchAiContent = async () => {
      if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
        setAiWisdom("AI Wisdom: The best way to predict the future is to create it. (Configure API_KEY for real content)");
        setAiRiddle({question: "AI Riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? (Configure API_KEY for real content)", answer: "An echo"});
        setLoadingAiContent(false);
        return;
      }
      setLoadingAiContent(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Fetch Wisdom
        const wisdomPrompt = language === Language.AR
          ? "اكتب حكمة يومية قصيرة ومضحكة باللهجة المصرية لفني أو مهندس يعمل في مجال البترول والغاز."
          : "Write a short, humorous daily wisdom in English for an engineer or technician in the oil and gas field.";
        const wisdomResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17', contents: wisdomPrompt,
        });
        setAiWisdom(wisdomResponse.text || "Failed to fetch wisdom.");

        // Fetch Riddle
        const riddlePrompt = language === Language.AR
          ? "اعطيني فزورة بترولية مضحكة باللهجة المصرية العامية مع اجابتها. افصل السؤال عن الإجابة بكلمة 'الإجابة:'"
          : "Give me a funny oil and gas related riddle in colloquial English with its answer. Separate the question from the answer with 'Answer:'";
        const riddleResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17', contents: riddlePrompt,
        });
        const riddleText = riddleResponse.text;
        if (riddleText) {
          const parts = riddleText.split(language === Language.AR ? 'الإجابة:' : 'Answer:');
          setAiRiddle({ question: parts[0].trim(), answer: parts[1]?.trim() });
        } else {
          setAiRiddle({ question: "Failed to fetch riddle." });
        }

      } catch (error) {
        console.error("Error fetching AI content:", error);
        setAiWisdom(language === Language.AR ? "الذكاء الاصطناعي شكله بيفطر فول... حاول تاني!" : "AI is having breakfast... try again!");
        setAiRiddle({ question: language === Language.AR ? "الفوازير خلصت من عند الذكاء الاصطناعي." : "AI ran out of riddles for today."});
      } finally {
        setLoadingAiContent(false);
      }
    };
    fetchAiContent();
  }, [language]);


  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (isFirestoreOffline) {
      alert(language === Language.AR ? 'أنت غير متصل حالياً. لا يمكن تحديث المهمة.' : 'You are currently offline. Cannot update task.');
      return;
    }
    try {
      await updateTaskCompletionInFirestore(taskId, !currentStatus);
      setUserTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
        ).sort((a,b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1: -1) || (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
      );
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error(`Error toggling task ${taskId}:`, err);
      handleFirestoreOutcome(err);
      alert(language === Language.AR ? 'فشل تحديث المهمة.' : 'Failed to update task.');
    }
  };
  
  const handleEditTaskPlaceholder = (taskToEdit: DailyTask) => {
    alert(`${translate('editTask')} "${taskToEdit.description}" ${translate('featureUnavailableFromDashboard')}`);
  };

  const handleDeleteTaskPlaceholder = (taskIdToDelete: string) => {
    alert(`${translate('deleteTask')} ID: ${taskIdToDelete} ${translate('featureUnavailableFromDashboard')}`);
  };

  const pendingTasks = userTasks.filter(task => !task.isCompleted);
  const currentShiftLeadAvatar = currentTeamDetails?.avatarUrl || userShifts[0]?.teamAvatarUrl;

  const getCurrentShiftDisplayName = () => {
    if (userShifts.length > 0) return userShifts[0].name; 
    return translate('noShifts');
  }

  if (!currentUser) return <div className="p-4 text-center text-csp-error">{translate('authError')}</div>;
  if (loadingData && !globalAuthError && !isFirestoreOffline) return <div className="p-4 text-center text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center mb-4">
        {currentShiftLeadAvatar && (
            <img src={currentShiftLeadAvatar} alt={currentTeamDetails?.name || userShifts[0]?.name} title={currentTeamDetails?.shiftLeadName || userShifts[0]?.shiftLeadName} className="w-16 h-16 rounded-full shadow-lg border-2 border-csp-accent dark:border-csp-accent-dark object-cover mb-3 sm:mb-0 transition-transform hover:scale-105"/>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { titleKey: 'myShiftsToday', value: getCurrentShiftDisplayName(), icon: <CalendarIcon />, color: 'bg-csp-info' },
          { titleKey: 'pendingTasks', value: pendingTasks.length, icon: <ListBulletIcon />, color: 'bg-csp-accent dark:bg-csp-accent-dark' },
          { titleKey: 'activeShips', value: allShips.length, icon: <ShipIconMini />, color: 'bg-csp-success' },
          { titleKey: 'overdueTasks', value: 0, icon: <ExclamationTriangleIcon />, color: 'bg-csp-error' } 
        ].map(stat => (
          <div key={stat.titleKey} className={`bg-csp-primary dark:bg-csp-secondary-dark-bg p-3.5 rounded-xl shadow-interactive hover:shadow-interactive-lg flex items-center transition-all`}>
            <StatCardIcon icon={stat.icon} bgColorClass={stat.color} />
            <div>
              <h3 className={`text-xs font-semibold text-csp-secondary-text dark:text-csp-secondary-dark-text mb-0.5 ${language === Language.AR ? 'text-right' : 'text-left'}`}>{translate(stat.titleKey as any)}</h3>
              <p className={`text-lg font-bold text-csp-primary-text dark:text-csp-primary-dark-text truncate ${language === Language.AR ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Wisdom and Riddle Section */}
      {(appConfig?.isEntertainmentEnabled !== false) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={sectionCardClasses}>
                <h2 className={`${sectionTitleClasses(language)} flex items-center`}>
                    <SunIcon /> <span className="mx-2">{translate('aiWisdomTitle')}</span>
                </h2>
                <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text italic min-h-[3em]">
                    {loadingAiContent ? `${translate('loading')}...` : aiWisdom}
                </p>
            </div>
            <div className={sectionCardClasses}>
                 <h2 className={`${sectionTitleClasses(language)} flex items-center`}>
                    <SparklesIcon /> <span className="mx-2">{translate('aiRiddleTitle')}</span>
                </h2>
                <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text italic min-h-[3em]">
                    {loadingAiContent ? `${translate('loading')}...` : aiRiddle.question}
                </p>
                {aiRiddle.answer && !loadingAiContent && (
                    <details className="text-xs mt-2">
                        <summary className="cursor-pointer text-csp-accent dark:text-csp-accent-dark hover:underline">{language === 'ar' ? 'اعرف الإجابة' : 'Show Answer'}</summary>
                        <p className="mt-1 text-csp-secondary-text dark:text-csp-secondary-dark-text">{aiRiddle.answer}</p>
                    </details>
                )}
            </div>
        </div>
      )}
      
      {/* Upcoming Birthdays Section */}
      {upcomingBirthdays.length > 0 && (
        <div className={sectionCardClasses}>
            <h2 className={`${sectionTitleClasses(language)} flex items-center`}>
                <CakeIcon /> <span className="mx-2">{translate('upcomingBirthdays')}</span>
            </h2>
            <ul className="space-y-2">
                {upcomingBirthdays.map(user => (
                    <li key={user.uid} className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text p-2 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md shadow-sm">
                        {new Date().getMonth() === parseInt(user.birthDate!.split('-')[1]) - 1 && new Date().getDate() === parseInt(user.birthDate!.split('-')[2])
                            ? <span className="font-semibold text-csp-accent dark:text-csp-accent-dark animate-pulse">🎉 {translate('happyBirthdayTo', user.name)} 🎉</span>
                            : <span>{user.name} - {new Date(new Date().getFullYear(), parseInt(user.birthDate!.split('-')[1]) -1, parseInt(user.birthDate!.split('-')[2])).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {month: 'long', day: 'numeric'})}</span>
                        }
                    </li>
                ))}
            </ul>
        </div>
      )}


      {/* My Shifts Section */}
      <div className={sectionCardClasses}>
        <h2 className={sectionTitleClasses(language)}>{translate('myShifts')}</h2>
        {userShifts.length > 0 ? (
          userShifts.map(shift => <ShiftCard key={shift.id} shift={shift} />)
        ) : (
          <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('noShifts')}</p>
        )}
      </div>

      {/* Daily Tasks Section */}
      <div className={sectionCardClasses}>
        <h2 className={sectionTitleClasses(language)}>{translate('dailyTasks')}</h2>
        {userTasks.length > 0 ? (
          <ul className="space-y-3">
            {userTasks.slice(0, 5).map(task => ( // Show top 5 tasks, more on tasks page
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggleComplete={handleToggleTask} 
                onEdit={handleEditTaskPlaceholder}
                onDelete={handleDeleteTaskPlaceholder}
                showDetails={false} // Keep dashboard view simple
                isOffline={isFirestoreOffline}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('noPendingTasks')}</p>
        )}
        {userTasks.length > 5 && <p className="text-xs text-center mt-3 text-csp-accent dark:text-csp-accent-dark">{translate('viewAll')} {translate('tasks')}...</p>}
      </div>

      {/* Ship Operations Section */}
      <div className={sectionCardClasses}>
        <h2 className={sectionTitleClasses(language)}>{translate('shipOperations')}</h2>
        {allShips.length > 0 ? (
          <div className="space-y-3">
            {allShips.slice(0, 3).map(ship => <ShipInfoCard key={ship.id} ship={ship} />)}
          </div>
        ) : (
          <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('noShipsData')}</p>
        )}
         {allShips.length > 3 && <p className="text-xs text-center mt-3 text-csp-accent dark:text-csp-accent-dark">{translate('viewAll')} {translate('labelShipsPlural')}...</p>}
      </div>
    </div>
  );
};

export default Dashboard;
