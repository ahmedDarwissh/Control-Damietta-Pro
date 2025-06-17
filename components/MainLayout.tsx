
import React, { useState, useEffect } from 'react';
import Header from './Header';
import BottomNavigationBar from './BottomNavigationBar';
import Dashboard from './Dashboard';
import ShiftManagementPage from './ShiftManagementPage';
import TaskManagementPage from './TaskManagementPage';
import ShipManagementPage from './ShipManagementPage';
import SettingsPage from './SettingsPage';
import TeamPage from './TeamPage';
import ReportsPage from './ReportsPage';
import EntertainmentPage from './EntertainmentPage';
import AdminDashboard from './AdminDashboard';
import PIDSymbolsPage from './PIDSymbolsPage';
import SavingsPage from './SavingsPage'; // Gam-eya
import ShiftButlerPage from './ShiftButlerPage';
import ChatPage from './ChatPage';
import MorePage from './MorePage';
import ProfilePage from './ProfilePage';

// Feature Pages
import EquipmentLogPage from './features/EquipmentLogPage';
import SafetyChecklistPage from './features/SafetyChecklistPage';
import EmergencyContactsPage from './features/EmergencyContactsPage';
import UnitConverterPage from './features/UnitConverterPage';
import DocumentViewerPage from './features/DocumentViewerPage';
import InternalNewsPage from './features/InternalNewsPage';
import FeedbackPage from './features/FeedbackPage';
import UserGuidePage from './features/UserGuidePage';
import TaskTemplatesPage from './features/TaskTemplatesPage';
import PomodoroTimerPage from './features/PomodoroTimerPage';
import PersonalCalendarPage from './features/PersonalCalendarPage';
import LeaveRequestPage from './features/LeaveRequestPage';
import UserDirectoryPage from './features/UserDirectoryPage';
import AuditLogPage from './features/AuditLogPage';
import NoteTakingPage from './features/NoteTakingPage';
import LearningResourcesPage from './features/LearningResourcesPage';
import PersonalExpensesPage from './features/PersonalExpensesPage';
import GoalSettingPage from './features/GoalSettingPage';
import AdvancedCalculatorPage from './features/AdvancedCalculatorPage';
import KanbanBoardPage from './features/KanbanBoardPage';
import DocumentScannerPage from './features/DocumentScannerPage';
import DataExportImportPage from './features/DataExportImportPage';
import ShoppingListPage from './features/ShoppingListPage';


import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppConfig } from '../contexts/AppConfigContext';
import { PageNavItemId } from '../types';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<PageNavItemId>('dashboard');
  const { language, translate } = useLocalization();
  const { currentUser, isAdmin, error: authErrorFromHook, isFirestoreOffline: authContextIsOffline } = useAuth(); // Renamed authError to authErrorFromHook
  const { appConfig, loadingConfig, errorConfig: appConfigErrorFromHook } = useAppConfig(); // Renamed errorConfig

  useEffect(() => {
    if (appConfig && !loadingConfig) {
      const isCurrentPageEnabled = () => {
        switch(activePage) {
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
          // New feature toggles
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
          case 'shoppingList': return appConfig.isShoppingListEnabled !== false;
          case 'userDirectory': return appConfig.isUserDirectoryEnabled !== false;
          case 'personalCalendar': return appConfig.isPersonalCalendarEnabled !== false;
          case 'auditLog': return appConfig.isAuditLogEnabled !== false;
          case 'taskTemplates': return appConfig.isTaskTemplatesEnabled !== false;
          default: return true;
        }
      };
      if (!isCurrentPageEnabled()) {
        setActivePage('dashboard');
      }
    }
  }, [activePage, appConfig, loadingConfig, setActivePage]);


  const renderPage = () => {
    if (loadingConfig && !appConfig) return <div className="p-6 text-center">{translate('loading')}</div>;

    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TaskManagementPage />;
      case 'chat': return <ChatPage />;
      case 'ships': return <ShipManagementPage />;
      case 'more': return <MorePage setActivePage={setActivePage} />;
      case 'profile': return <ProfilePage />;

      case 'shifts': return <ShiftManagementPage />;
      case 'team': return <TeamPage />; 
      case 'userDirectory': return appConfig?.isUserDirectoryEnabled !== false ? <UserDirectoryPage /> : <Dashboard />;
      case 'personalCalendar': return appConfig?.isPersonalCalendarEnabled !== false ? <PersonalCalendarPage /> : <Dashboard />;
      case 'leaveRequests': return appConfig?.isLeaveRequestsEnabled !== false ? <LeaveRequestPage /> : <Dashboard />;
      case 'entertainment': return appConfig?.isEntertainmentEnabled !== false ? <EntertainmentPage /> : <Dashboard />;
      case 'pid': return <PIDSymbolsPage />;
      case 'savings': return appConfig?.isSavingsPoolEnabled !== false ? <SavingsPage /> : <Dashboard />;
      case 'butler': return appConfig?.isShiftButlerEnabled !== false ? <ShiftButlerPage /> : <Dashboard />;
      case 'reports': return <ReportsPage />;

      case 'equipmentLog': return appConfig?.isEquipmentLogEnabled !== false ? <EquipmentLogPage /> : <Dashboard />;
      case 'safetyChecklist': return appConfig?.isSafetyChecklistEnabled !== false ? <SafetyChecklistPage /> : <Dashboard />;
      case 'emergencyContacts': return appConfig?.isEmergencyContactsEnabled !== false ? <EmergencyContactsPage /> : <Dashboard />;
      case 'unitConverter': return appConfig?.isUnitConverterEnabled !== false ? <UnitConverterPage /> : <Dashboard />;
      case 'documentViewer': return appConfig?.isDocumentViewerEnabled !== false ? <DocumentViewerPage /> : <Dashboard />;
      case 'internalNews': return appConfig?.isInternalNewsEnabled !== false ? <InternalNewsPage /> : <Dashboard />;
      case 'feedback': return appConfig?.isFeedbackEnabled !== false ? <FeedbackPage /> : <Dashboard />;
      case 'userGuide': return appConfig?.isUserGuideEnabled !== false ? <UserGuidePage /> : <Dashboard />;

      // New Feature Page Routes
      case 'taskTemplates': return appConfig?.isTaskTemplatesEnabled !== false ? <TaskTemplatesPage /> : <Dashboard />;
      case 'pomodoroTimer': return appConfig?.isPomodoroEnabled !== false ? <PomodoroTimerPage /> : <Dashboard />;
      case 'kanbanBoard': return appConfig?.isKanbanBoardEnabled !== false ? <KanbanBoardPage /> : <Dashboard />;
      case 'noteTaking': return appConfig?.isNoteTakingEnabled !== false ? <NoteTakingPage /> : <Dashboard />;
      case 'documentScanner': return appConfig?.isDocumentScannerEnabled !== false ? <DocumentScannerPage /> : <Dashboard />;
      case 'learningResources': return appConfig?.isLearningResourcesEnabled !== false ? <LearningResourcesPage /> : <Dashboard />;
      case 'personalExpenses': return appConfig?.isPersonalExpensesEnabled !== false ? <PersonalExpensesPage /> : <Dashboard />;
      case 'goalSetting': return appConfig?.isGoalSettingEnabled !== false ? <GoalSettingPage /> : <Dashboard />;
      case 'advancedCalculator': return appConfig?.isAdvancedCalculatorEnabled !== false ? <AdvancedCalculatorPage /> : <Dashboard />;
      case 'dataExportImport': return appConfig?.isDataExportImportEnabled !== false ? <DataExportImportPage /> : <Dashboard />;
      case 'shoppingList': return appConfig?.isShoppingListEnabled !== false ? <ShoppingListPage /> : <Dashboard />; 


      case 'admin': return isAdmin ? <AdminDashboard /> : <Dashboard />;
      case 'auditLog': return isAdmin && appConfig?.isAuditLogEnabled !== false ? <AuditLogPage /> : <Dashboard />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text">{translate('loading')}</div>;
  }

  const appConfigIsOfflineError = appConfigErrorFromHook && appConfigErrorFromHook.toLowerCase().includes("offline");
  
  let displayError: string | null = null;
  let displayTitleKey: string = 'authError'; 
  let isActuallyOffline: boolean = false;

  if (appConfigIsOfflineError) {
    displayError = appConfigErrorFromHook;
    displayTitleKey = 'offlineIndicatorShort';
    isActuallyOffline = true;
  } else if (authContextIsOffline) {
    displayError = authErrorFromHook || translate('internetRequiredError');
    displayTitleKey = 'offlineIndicatorShort';
    isActuallyOffline = true;
  } else if (appConfigErrorFromHook) { // Non-offline appConfigError
    displayError = appConfigErrorFromHook;
    displayTitleKey = 'appConfigErrorTitle'; // Ensure this key is added to translations
  } else if (authErrorFromHook) { // Non-offline authError
    displayError = authErrorFromHook;
    displayTitleKey = 'authError';
  }
  
  const bannerVisible = !!displayError;
  const bannerTitle = translate(displayTitleKey as any);
  const bannerMessage = displayError;

  const errorBannerClass = isActuallyOffline
    ? "bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300"
    : "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300";

  const mainContentPaddingTop = `pt-[calc(4rem+${bannerVisible ? '3.75rem' : '0rem'}+1rem)]`;
  const mainContentPaddingBottom = `pb-[calc(4rem+1rem)]`;
  
  return (
    <div className={`flex flex-col h-full bg-csp-secondary-bg dark:bg-csp-primary-dark ${language === 'ar' ? 'font-tajawal' : 'font-poppins'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPageTitle={activePage} setActivePage={setActivePage} />

      {bannerVisible && (
        <div
          className={`p-3 border-l-4 rtl:border-r-4 rtl:border-l-0 ${errorBannerClass} fixed top-16 left-0 right-0 z-40`}
          style={{height: 'auto', minHeight: '3.75rem'}} 
          role="alert"
        >
          <div className="flex items-start h-full">
            <div className="flex-shrink-0 mt-0.5">
              {isActuallyOffline ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 text-yellow-500 dark:text-yellow-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 12.75l1.662-2.905M12.75 12.75L11.412 15.655m1.338-2.905L14.25 12l-1.662-2.905M12.75 12.75L14.25 12M12 12.75L10.338 9.845m1.662 2.905L12 12.75M5.01 16.342a4.495 4.495 0 004.234 2.158h7.512a4.5 4.5 0 004.234-2.158m-16.092-2.96A4.492 4.492 0 014.5 10.5H5.25a2.25 2.25 0 012.25 2.25v.01A4.507 4.507 0 0012 15.75h0a4.507 4.507 0 004.5-3.039v-.01a2.25 2.25 0 012.25-2.25H19.5a4.492 4.492 0 013.48 2.882M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 text-red-500 dark:text-red-400">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-sm">{bannerTitle}</p>
              {bannerMessage && <p className="text-xs whitespace-pre-wrap">{bannerMessage}</p>}
            </div>
          </div>
        </div>
      )}

      <main className={`flex-1 overflow-y-auto bg-csp-secondary-bg dark:bg-csp-primary-dark p-4 ${mainContentPaddingTop} ${mainContentPaddingBottom}`}>
        {renderPage()}
      </main>

      <BottomNavigationBar activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default MainLayout;
