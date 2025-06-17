
import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppConfig } from '../contexts/AppConfigContext'; // Import useAppConfig
import { PageNavItemId } from '../types';
import { NAV_ITEMS_EN, NAV_ITEMS_AR } from '../constants';

// Re-using or adapting icons for consistency
const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`w-6 h-6 flex items-center justify-center ${className}`}>{children}</div>
);

const IconShifts = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></IconWrapper>;
const IconTeam = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-3.741M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg></IconWrapper>;
const IconEntertainment = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg></IconWrapper>;
const IconPID = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg></IconWrapper>;
const IconSavings = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a8.25 8.25 0 01-16.5 0V11.25m16.5 0a8.25 8.25 0 00-16.5 0M16.5 0V11.25m-16.5 0V0m16.5 0A8.25 8.25 0 004.5 0" /></svg></IconWrapper>; 
const IconButler = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m3-.75H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></IconWrapper>; 
const IconReports = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197M13.282 7.468L8.036 12.716m0 0H4.5m3.536 0V8.25m5.757 7.316l5.248-5.248m0 0H21m-3.248 0V18" /></svg></IconWrapper>;
const IconAdmin = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.314.44.24.945-.12 1.45l-.773.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0 .55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></IconWrapper>;
const IconSettings = IconAdmin; 
const IconProfile = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg></IconWrapper>;
const IconEquipmentLog = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg></IconWrapper>;
const IconSafetyChecklist = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></IconWrapper>;
const IconEmergencyContacts = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg></IconWrapper>;
const IconUnitConverter = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg></IconWrapper>;
const IconDocumentViewer = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></IconWrapper>;
const IconInternalNews = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 015.625 5.25h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H5.625" /></svg></IconWrapper>;
const IconFeedback = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-2.286a1.125 1.125 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg></IconWrapper>;
const IconUserGuide = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></IconWrapper>;
const IconShoppingList = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg></IconWrapper>;

// New specific icons
const IconPersonalCalendar = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg></IconWrapper>;
const IconNoteTaking = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 7.5H12m-2.25 3H12m-2.25 3H12m-2.25 3H12" /></svg></IconWrapper>;
const IconKanbanBoard = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v12a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v12a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6z" /></svg></IconWrapper>;


const iconMap: Record<string, React.FC> = {
  shifts: IconShifts,
  team: IconTeam,
  entertainment: IconEntertainment,
  pid: IconPID,
  savings: IconSavings,
  butler: IconButler,
  reports: IconReports,
  admin: IconAdmin,
  settings: IconSettings,
  profile: IconProfile,
  equipmentLog: IconEquipmentLog,
  safetyChecklist: IconSafetyChecklist,
  emergencyContacts: IconEmergencyContacts,
  unitConverter: IconUnitConverter,
  documentViewer: IconDocumentViewer,
  internalNews: IconInternalNews,
  feedback: IconFeedback,
  userGuide: IconUserGuide,
  shoppingList: IconShoppingList, 
  taskTemplates: IconSafetyChecklist, 
  pomodoroTimer: IconShifts, 
  personalCalendar: IconPersonalCalendar, // New Icon
  leaveRequests: IconShifts, 
  userDirectory: IconTeam, 
  auditLog: IconAdmin, 
  noteTaking: IconNoteTaking, // New Icon
  learningResources: IconUserGuide, 
  personalExpenses: IconSavings, 
  goalSetting: IconTeam, 
  advancedCalculator: IconUnitConverter, 
  kanbanBoard: IconKanbanBoard, // New Icon
  documentScanner: IconTeam, 
  dataExportImport: IconAdmin, 
};

const ChevronRightIcon = () => <IconWrapper className="text-csp-secondary-text dark:text-csp-secondary-dark-text"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></IconWrapper>;
const ChevronLeftIcon = () => <IconWrapper className="text-csp-secondary-text dark:text-csp-secondary-dark-text"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></IconWrapper>;


interface MorePageProps {
  setActivePage: (page: PageNavItemId) => void;
}

const MorePage: React.FC<MorePageProps> = ({ setActivePage }) => {
  const { language, translate } = useLocalization();
  const { isAdmin } = useAuth();
  const { appConfig } = useAppConfig(); // Use appConfig
  const navItemsConstants = language === 'ar' ? NAV_ITEMS_AR : NAV_ITEMS_EN;

  const moreScreenItems = navItemsConstants.filter(item => {
    if (['dashboard', 'tasks', 'chat', 'ships', 'more'].includes(item.id)) return false;
    if (item.adminOnly && !isAdmin) return false;
    
    // Check against AppConfig for feature toggles
    if (appConfig) {
        switch(item.id as PageNavItemId) { // Cast item.id for type safety
            case 'butler': return appConfig.isShiftButlerEnabled !== false;
            case 'savings': return appConfig.isSavingsPoolEnabled !== false;
            case 'entertainment': return appConfig.isEntertainmentEnabled !== false;
            case 'equipmentLog': return appConfig.isEquipmentLogEnabled !== false;
            case 'safetyChecklist': return appConfig.isSafetyChecklistEnabled !== false;
            case 'emergencyContacts': return appConfig.isEmergencyContactsEnabled !== false;
            case 'unitConverter': return appConfig.isUnitConverterEnabled !== false;
            case 'documentViewer': return appConfig.isDocumentViewerEnabled !== false;
            case 'internalNews': return appConfig.isInternalNewsEnabled !== false;
            case 'feedback': return appConfig.isFeedbackEnabled !== false;
            case 'userGuide': return appConfig.isUserGuideEnabled !== false;
            case 'pomodoroTimer': return appConfig.isPomodoroEnabled !== false;
            case 'leaveRequests': return appConfig.isLeaveRequestsEnabled !== false;
            case 'noteTaking': return appConfig.isNoteTakingEnabled !== false;
            case 'learningResources': return appConfig.isLearningResourcesEnabled !== false;
            case 'personalExpenses': return appConfig.isPersonalExpensesEnabled !== false;
            case 'goalSetting': return appConfig.isGoalSettingEnabled !== false;
            case 'advancedCalculator': return appConfig.isAdvancedCalculatorEnabled !== false;
            case 'kanbanBoard': return appConfig.isKanbanBoardEnabled !== false;
            case 'documentScanner': return appConfig.isDocumentScannerEnabled !== false;
            case 'dataExportImport': return appConfig.isDataExportImportEnabled !== false;
            case 'userDirectory': return appConfig.isUserDirectoryEnabled !== false;
            case 'personalCalendar': return appConfig.isPersonalCalendarEnabled !== false;
            case 'auditLog': return appConfig.isAuditLogEnabled !== false && isAdmin; // Ensure admin check for admin-only features
            case 'taskTemplates': return appConfig.isTaskTemplatesEnabled !== false;
            case 'shoppingList': return appConfig.isShoppingListEnabled !== false; // Added shopping list toggle
        }
    }
    return true; // If no specific toggle, assume enabled (or handle based on default behavior)
  });

  return (
    <div className="space-y-1.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {moreScreenItems.map((item) => {
        const IconComponent = iconMap[item.icon] || IconTeam; // Fallback icon
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className="w-full flex items-center justify-between p-4 bg-csp-primary dark:bg-csp-secondary-dark-bg hover:bg-csp-secondary-bg dark:hover:bg-csp-primary-dark rounded-lg shadow-sm hover:shadow-md transition-all duration-150 group"
            aria-current={ false }
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {IconComponent && <span className="text-csp-accent dark:text-csp-accent-dark group-hover:scale-110 transition-transform"><IconComponent /></span>}
              <span className="text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text">
                {translate(item.labelKey as any)}
              </span>
              {item.isNew && (
                <span className="text-xs bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark px-1.5 py-0.5 rounded-full animate-pulse">
                  {language === 'ar' ? 'جديد' : 'New'}
                </span>
              )}
            </div>
            {language === 'ar' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>
        );
      })}
    </div>
  );
};

export default MorePage;
