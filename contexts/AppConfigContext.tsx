import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { db } from '../firebase';
import { AppConfiguration } from '../types';
import { QURAN_RADIO_STREAM_URL } from '../constants'; // Default value

interface AppConfigContextType {
  appConfig: AppConfiguration | null;
  loadingConfig: boolean;
  errorConfig: string | null;
  refreshConfig: () => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

const defaultAppConfig: AppConfiguration = {
  quranRadioUrl: QURAN_RADIO_STREAM_URL,
  isShiftButlerEnabled: true,
  isSavingsPoolEnabled: true, // Gam-eya
  isEntertainmentEnabled: true,
  isEquipmentLogEnabled: true,
  isSafetyChecklistEnabled: true,
  isEmergencyContactsEnabled: true,
  isUnitConverterEnabled: true,
  isDocumentViewerEnabled: true,
  isInternalNewsEnabled: true,
  isFeedbackEnabled: true,
  isUserGuideEnabled: true,
  // New feature toggles default to true
  isPomodoroEnabled: true,
  isLeaveRequestsEnabled: true,
  isNoteTakingEnabled: true,
  isLearningResourcesEnabled: true,
  isPersonalExpensesEnabled: true,
  isGoalSettingEnabled: true,
  isAdvancedCalculatorEnabled: true,
  isKanbanBoardEnabled: true,
  isDocumentScannerEnabled: true,
  isDataExportImportEnabled: true,
  // Ensure all existing toggles from types.ts are here with defaults
  isPersonalCalendarEnabled: true,
  isAuditLogEnabled: true, 
  isTaskTemplatesEnabled: true,
  isUserDirectoryEnabled: true,
  isShoppingListEnabled: true,
};

// Helper to check for offline errors (can be shared or duplicated)
const isOfflineError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  return errorMessage.includes('offline') ||
         errorCode === 'unavailable' ||
         errorMessage.includes('network error') ||
         errorMessage.includes('failed to get document because the client is offline');
};

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appConfig, setAppConfig] = useState<AppConfiguration | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  const fetchAppConfig = async () => {
    setLoadingConfig(true);
    setErrorConfig(null);
    try {
      const docRef = db.collection('appSettings').doc('globalConfig');
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        // Merge fetched config with defaults to ensure all keys are present
        const fetchedConfig = docSnap.data() as Partial<AppConfiguration>;
        setAppConfig({ ...defaultAppConfig, ...fetchedConfig });
      } else {
        // If the config doesn't exist, set it with defaults in Firestore
        await docRef.set(defaultAppConfig);
        setAppConfig(defaultAppConfig);
        console.log("Default app config set in Firestore as it was missing.");
      }
    } catch (error: any) {
      if (isOfflineError(error)) {
        console.warn("App configuration fetch failed due to offline state (handled):", error.message);
        setErrorConfig("Failed to load application settings: The application is offline. Using default settings. Some features may be affected.");
      } else {
        console.error("Error fetching app configuration (unhandled type):", error);
        setErrorConfig("Failed to load application settings due to an error. Using default settings. Some features may be affected.");
      }
      setAppConfig(defaultAppConfig); // Fallback to default if fetch fails
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchAppConfig();
  }, []);

  return (
    <AppConfigContext.Provider value={{ appConfig, loadingConfig, errorConfig, refreshConfig: fetchAppConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = (): AppConfigContextType => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};