
import React, { useState, useEffect, Suspense, lazy } from 'react';
import SplashScreen from './components/SplashScreen';
import MainLayout from './components/MainLayout';
import AuthPage from './components/AuthPage';
import DisclaimerScreen from './components/DisclaimerScreen';
import { LocalizationProvider } from './contexts/LocalizationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { DisclaimerAgreementStatus, UserSettings, NotificationSound as NotificationSoundEnum } from './types';
import { DISCLAIMER_AGREEMENT_KEY, NOTIFICATION_SOUNDS } from './constants';
import { initializeFirebaseApp, requestNotificationPermission, onMessageListener, registerServiceWorker } from './firebase';

// Define a basic interface for the expected FCM payload structure
interface FCMMessagePayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    image?: string; // For rich notifications
  };
  data?: { [key:string]: string }; // For custom data, including click_action
}

// Check for Gemini API Key availability (developer warning)
if (!process.env.API_KEY) {
  console.error(
    "CRITICAL: Gemini API_KEY (process.env.API_KEY) is not set. " +
    "The application's AI features will not function. " +
    "Please ensure the API_KEY environment variable is configured."
  );
} else if (process.env.API_KEY === "YOUR_GEMINI_API_KEY" || (process.env.API_KEY.startsWith("AIzaSy") && process.env.API_KEY.length < 30) ) { 
  // The check for "YOUR_GEMINI_API_KEY" or a common pattern for Google API keys that might be placeholders.
  // Adjust the second part of the condition if a more specific placeholder pattern is known.
   console.warn(
    "Warning: Gemini API_KEY (process.env.API_KEY) appears to be a placeholder or invalid. " +
    "Please verify and set your actual key for AI features to work correctly. " +
    "For production, manage API keys via secure environment variables."
  );
}


const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth(); 
  const [appLoading, setAppLoading] = useState(true);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState<DisclaimerAgreementStatus>(() => {
    const agreedStatus = localStorage.getItem(DISCLAIMER_AGREEMENT_KEY);
    return agreedStatus === DisclaimerAgreementStatus.AGREED
           ? DisclaimerAgreementStatus.AGREED
           : DisclaimerAgreementStatus.NOT_AGREED;
  });

  // Effect for one-time initializations (Firebase, Service Worker, App Load Timer)
  useEffect(() => {
    initializeFirebaseApp();
    registerServiceWorker();
    
    const appLoadTimer = setTimeout(() => {
      setAppLoading(false);
    }, 2500); // Slightly longer splash for new intro

    return () => {
      clearTimeout(appLoadTimer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect for operations dependent on currentUser or its settings
  useEffect(() => {
    // Apply theme from userSettings or localStorage or time of day on initial load
    const applyTheme = (settings?: UserSettings) => {
      let themeToApply = settings?.preferredTheme || localStorage.theme || 'light';
      
      if (!settings?.preferredTheme && !localStorage.theme) { // No preference stored
          const currentHour = new Date().getHours();
          if (currentHour >= 18 || currentHour < 6) { // 6 PM to 6 AM
              themeToApply = 'dark';
          } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
             themeToApply = 'dark'; // Fallback to system preference if time based is not met.
          }
      }
      
      document.documentElement.classList.remove('light', 'dark', 'oceanBlue', 'desertGold'); // Remove all theme classes
      document.documentElement.classList.add(themeToApply);
      document.documentElement.setAttribute('data-theme', themeToApply);
      localStorage.theme = themeToApply; // Persist theme choice
    };

    if (currentUser?.userSettings) {
        applyTheme(currentUser.userSettings);
    } else {
        applyTheme(); // Apply default theme logic if no user settings
    }
    
    // Apply font size from userSettings
    if (currentUser?.userSettings?.fontSize) {
      document.documentElement.style.fontSize = 
        currentUser.userSettings.fontSize === 'sm' ? '14px' : 
        currentUser.userSettings.fontSize === 'lg' ? '18px' : '16px'; // Default 'base'
    } else {
      document.documentElement.style.fontSize = '16px'; // Default
    }

    // Setup notifications, also dependent on currentUser for settings
    let notificationTimer: ReturnType<typeof setTimeout> | undefined; // Use ReturnType for NodeJS.Timeout or number
    if (currentUser) { // Only setup notifications if user is logged in
        const setupNotifications = async () => {
          try {
            await requestNotificationPermission();
            onMessageListener()
              .then((payloadUntyped) => {
                const payload = payloadUntyped as FCMMessagePayload;
                console.log('Received foreground message: ', payload);
                
                const userSettings = currentUser?.userSettings;
                // Play notification sound if not DND
                if (userSettings && !userSettings.doNotDisturb && payload.notification) {
                    const soundSettingEnumVal = userSettings.notificationSound || NotificationSoundEnum.DEFAULT;
                    const soundInfo = NOTIFICATION_SOUNDS.find(ns => ns.id === soundSettingEnumVal);
                    const soundPath = soundInfo?.filePath || '/sounds/default_notification.mp3';
                    if (soundPath && soundPath !== '' && soundPath !== '/sounds/none.mp3') { 
                        const audio = new Audio(soundPath);
                        audio.play().catch(e => console.warn("Audio play failed:", e));
                    }
                }

                if (payload?.notification) {
                    alert(`New Notification: ${payload.notification.title}\n${payload.notification.body}`);
                } else if (payload?.data) {
                    alert(`New Data Message: ${JSON.stringify(payload.data)}`);
                }
              })
              .catch(err => console.log('Failed to receive foreground message: ', err));
          } catch (err) {
            console.error("Error setting up notifications:", err);
          }
        };
        // Delay notification setup slightly to ensure Firebase messaging is ready
        notificationTimer = setTimeout(setupNotifications, 2000);
    }
    
    return () => {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }
    };
  // Trigger this effect if user settings change or if user logs in/out
  }, [currentUser?.userSettings, currentUser?.uid]); 


  const handleAgreeDisclaimer = () => {
    localStorage.setItem(DISCLAIMER_AGREEMENT_KEY, DisclaimerAgreementStatus.AGREED);
    setDisclaimerAgreed(DisclaimerAgreementStatus.AGREED);
  };

  const handleExitApp = () => {
    alert("To exit, please close this browser tab or switch apps.");
  };

  if (appLoading) {
    return <SplashScreen
              introLine1Key="splashIntroLine1"
              introLine2Key="splashIntroLine2"
           />;
  }

  if (disclaimerAgreed !== DisclaimerAgreementStatus.AGREED) {
    return <DisclaimerScreen onAgree={handleAgreeDisclaimer} onExit={handleExitApp} />;
  }

  if (authLoading) {
      return <SplashScreen messageKey="authenticating" />;
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return <MainLayout />;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<SplashScreen />}>
      <LocalizationProvider>
        <AuthProvider>
          <AppConfigProvider>
            <AppContent />
          </AppConfigProvider>
        </AuthProvider>
      </LocalizationProvider>
    </Suspense>
  );
};

export default App;
