import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, db } from '../firebase';
import { User, UserRole, AuthState, AuthContextType, Language, UserSettings, NotificationSound, AppTheme } from '../types';
import { AUTH_TOKEN_KEY, REMEMBER_ME_KEY, DEFAULT_AVATAR_URL, AVATAR_OPTIONS, translations } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isOfflineError = (error: any): boolean => {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();

  return (
    message.includes('offline') ||
    message.includes('network error') || 
    message.includes('network request failed') || 
    message.includes('failed to fetch') || 
    message.includes('failed to reach backend') ||
    message.includes('could not reach cloud firestore backend') ||
    message.includes('no internet connection') || 
    code === 'unavailable' || 
    (error.name === "FirebaseError" && code.startsWith("unavailable"))
  );
};

const getGenericErrorMessage = (effectiveLang: Language): string => {
    return translations[effectiveLang]?.authError || "An unexpected error occurred.";
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirestoreOffline, setIsFirestoreOffline] = useState(false);
  const [userSettings, setUserSettingsState] = useState<UserSettings | undefined>(undefined);


  const handleFirestoreOutcome = useCallback((operationOutcomeError: any | null) => {
    const effectiveLang = (document.documentElement.lang === 'ar' ? Language.AR : Language.EN) as Language;
    const internetRequiredMsg = translations[effectiveLang].internetRequiredError;

    if (operationOutcomeError !== null) { 
        if (isOfflineError(operationOutcomeError)) {
            setIsFirestoreOffline(true);
            setError(internetRequiredMsg);
        } else {
            if (isFirestoreOffline) {
                console.warn("A non-network error occurred while offline:", operationOutcomeError);
            } else {
                setError(operationOutcomeError.message || getGenericErrorMessage(effectiveLang));
            }
        }
    } else { 
        setIsFirestoreOffline(false);
        setError(null);
    }
  }, [isFirestoreOffline]); // Added isFirestoreOffline to dependencies

  const updateUserPresence = useCallback(async (status: User['presence'] = 'online') => {
    if (auth.currentUser) {
      try {
        await db.collection('users').doc(auth.currentUser.uid).update({
          presence: status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        handleFirestoreOutcome(null);
      } catch (e: any) {
        handleFirestoreOutcome(e);
      }
    }
  }, [handleFirestoreOutcome]);

  const updateUserSettings = useCallback(async (settings: Partial<UserSettings>) => {
    if (currentUser) {
      try {
        const newSettings = { ...(currentUser.userSettings || {}), ...settings };
        await db.collection('users').doc(currentUser.uid).update({
          userSettings: newSettings,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        setCurrentUser(prev => prev ? { ...prev, userSettings: newSettings } : null);
        setUserSettingsState(newSettings); 
        handleFirestoreOutcome(null); 
        return Promise.resolve();
      } catch (err) {
        console.error("Error updating user settings:", err);
        handleFirestoreOutcome(err);
        throw err;
      }
    }
    return Promise.reject(new Error("No current user to update settings for."));
  }, [currentUser, handleFirestoreOutcome]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            setIsAdmin(userData.role === UserRole.ADMIN);
            setUserSettingsState(userData.userSettings || { 
                doNotDisturb: false,
                fontSize: 'base',
                notificationSound: NotificationSound.DEFAULT,
                preferredTheme: AppTheme.LIGHT, 
                prayerTimeLocation: 'Damietta',
            });
            updateUserPresence('online'); 
            handleFirestoreOutcome(null); 
          } else {
            console.warn("Authenticated user lacks Firestore profile.");
             const minimalUser: User = { 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email || "User (Profile Sync Pending)",
                role: UserRole.PRODUCTION_OPERATOR, 
                avatarUrl: firebaseUser.photoURL || DEFAULT_AVATAR_URL,
                presence: 'online', 
                points: 0,
                userSettings: {
                    doNotDisturb: false,
                    fontSize: 'base',
                    notificationSound: NotificationSound.DEFAULT,
                    preferredTheme: AppTheme.LIGHT,
                    prayerTimeLocation: 'Damietta',
                }
             };
            setCurrentUser(minimalUser);
            setUserSettingsState(minimalUser.userSettings);
            setIsAdmin(false);
            setError("Your user profile is incomplete. Please try signing up again or contact support.");
          }
        } catch (e: any) {
          handleFirestoreOutcome(e); 
          const errorUser: User = { 
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email || "User (Profile Error)",
              role: UserRole.PRODUCTION_OPERATOR,
              avatarUrl: firebaseUser.photoURL || DEFAULT_AVATAR_URL,
              presence: 'offline', 
              points: 0,
              userSettings: {
                  doNotDisturb: false,
                  fontSize: 'base',
                  notificationSound: NotificationSound.DEFAULT,
                  preferredTheme: AppTheme.LIGHT,
                  prayerTimeLocation: 'Damietta',
              }
            };
            setCurrentUser(errorUser); 
            setUserSettingsState(errorUser.userSettings);
            setIsAdmin(false); 
        }
      } else { 
        if(currentUser?.uid) { 
            updateUserPresence('offline');
        }
        setCurrentUser(null);
        setIsAdmin(false);
        setUserSettingsState(undefined);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsFirestoreOffline(false); 
        setError(null);
      }
      setLoading(false);
    });

    const handleVisibilityChange = () => {
      if (auth.currentUser) { 
        if (document.visibilityState === 'hidden') {
          updateUserPresence('offline');
        } else {
          updateUserPresence('online');
        }
      }
    };
    const handleBeforeUnload = () => {
        if (auth.currentUser) {
            updateUserPresence('offline');
        }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (auth.currentUser) { // Check auth.currentUser directly
        updateUserPresence('offline');
      }
    };
  }, [handleFirestoreOutcome, updateUserPresence, currentUser?.uid]); // Added currentUser?.uid because its absence means user logged out

  useEffect(() => {
    const effectiveLang = (document.documentElement.lang === 'ar' ? Language.AR : Language.EN) as Language;
    const internetRequiredMsg = translations[effectiveLang].internetRequiredError;

    const handleOnline = () => {
        console.log("Browser reported 'online'. Verifying Firestore connection.");
        if (isFirestoreOffline && error === internetRequiredMsg) {
            // Tentatively clear UI error, actual status confirmed by operation
            setIsFirestoreOffline(false); 
            setError(null);
        }
        if (auth.currentUser) {
            db.collection('users').doc(auth.currentUser.uid).get({ source: 'server' })
                .then(() => {
                    console.log("Firestore connection re-verified after browser online event.");
                    handleFirestoreOutcome(null);
                })
                .catch((e) => {
                    console.warn("Firestore still unreachable after browser online event.", e);
                    if (isOfflineError(e)) {
                        setIsFirestoreOffline(true);
                        setError(internetRequiredMsg);
                    } else {
                        handleFirestoreOutcome(e); // Handle other types of errors
                    }
                });
        }
    };

    const handleOffline = () => {
        console.log("Browser reported 'offline'.");
        setIsFirestoreOffline(true);
        setError(internetRequiredMsg);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        handleOffline();
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [error, isFirestoreOffline, handleFirestoreOutcome]);


  const signUp = async (name: string, email: string, pass: string, role: UserRole, teamId?: string, teamName?: string, avatarUrl?: string) => {
    setLoading(true);
    setError(null); 
    const effectiveLang = (document.documentElement.lang === 'ar' ? Language.AR : Language.EN) as Language;
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        const newUserProfile: User = {
          uid: firebaseUser.uid,
          name,
          email: firebaseUser.email,
          role,
          teamId: role === UserRole.ENGINEER || role === UserRole.SHIFT_LEAD ? undefined : teamId,
          teamName: role === UserRole.ENGINEER || role === UserRole.SHIFT_LEAD ? undefined : teamName,
          avatarUrl: avatarUrl || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
          presence: 'online',
          points: 0, 
          birthDate: '', 
          userSettings: { 
            doNotDisturb: false,
            fontSize: 'base',
            notificationSound: NotificationSound.DEFAULT,
            preferredTheme: AppTheme.LIGHT, 
            prayerTimeLocation: 'Damietta', 
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
        };
        await db.collection('users').doc(firebaseUser.uid).set(newUserProfile);
        handleFirestoreOutcome(null); 
      } else {
        throw new Error("Firebase user creation returned no user object.");
      }
    } catch (e: any) {
      console.error("Signup error:", e);
      if (e.code && (String(e.code).startsWith('firestore/') || e.message.toLowerCase().includes('firestore') || isOfflineError(e))) {
        handleFirestoreOutcome(e); 
      } else {
        const message = typeof e.message === 'string' ? e.message : getGenericErrorMessage(effectiveLang);
        setError(message);
      }
      throw e; 
    } 
    // setLoading handled by onAuthStateChanged
  };

  const logIn = async (email: string, pass: string, rememberMe: boolean = false) => {
    setLoading(true);
    setError(null); 
    const effectiveLang = (document.documentElement.lang === 'ar' ? Language.AR : Language.EN) as Language;
    try {
      await auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
      await auth.signInWithEmailAndPassword(email, pass);
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
      // onAuthStateChanged will handle success: fetching profile, setting user, calling handleFirestoreOutcome(null)
    } catch (e: any) {
      console.error("Login error:", e);
      // signInWithEmailAndPassword primarily throws auth errors or network errors if auth service is unreachable.
      // It doesn't directly interact with Firestore in a way that `handleFirestoreOutcome` for *data* operations would be relevant here.
      // If it's a network error making auth service unreachable, isOfflineError might catch it.
      if (isOfflineError(e)) {
          handleFirestoreOutcome(e); // This will set the generic offline message.
      } else {
          const message = typeof e.message === 'string' ? e.message : getGenericErrorMessage(effectiveLang);
          setError(message); // Auth-specific error (wrong password, user not found etc.)
      }
      setLoading(false); // Explicitly set loading to false on login failure.
      throw e;
    }
    // On success, setLoading(false) is handled by onAuthStateChanged after profile processing.
  };

  const logOut = async () => {
    if(auth.currentUser) { 
        await updateUserPresence('offline');
    }
    const effectiveLang = (document.documentElement.lang === 'ar' ? Language.AR : Language.EN) as Language;
    try {
      await auth.signOut();
    } catch (e: any) {
      console.error("Logout error:", e);
      const message = typeof e.message === 'string' ? e.message : getGenericErrorMessage(effectiveLang);
      setError(message); 
    }
    // onAuthStateChanged handles clearing user state.
  };

  const value: AuthContextType = {
    currentUser,
    isAdmin,
    loading,
    error,
    isFirestoreOffline,
    signUp,
    logIn,
    logOut,
    handleFirestoreOutcome,
    updateUserPresence,
    updateUserSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
