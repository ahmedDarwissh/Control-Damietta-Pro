
import React, { useState, ChangeEvent, useRef } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Language } from '../types';
import { COMPANY_LOGO_URL, TEAMS_DATA, AVATAR_OPTIONS, REGISTRATION_ROLES, translations } from '../constants';
import { storage, db } from '../firebase'; // For avatar upload
import firebase from 'firebase/compat/app'; // For Timestamp

const EyeIconSvg: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIconSvg: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
  </svg>
);

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);


const AuthPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { signUp, logIn, error: authError, loading: authLoading } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [teamId, setTeamId] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setFormError(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 2 ميجا بايت).' : 'Image size too large (max 2MB).');
        return;
      }
      setCustomAvatarFile(file);
      setSelectedAvatar(''); // Clear selection from predefined
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); 

    if (!email.trim() || !password.trim()) {
        setFormError(language === 'ar' ? 'البريد الإلكتروني وكلمة المرور مطلوبان.' : 'Email and password are required.');
        return;
    }
    // Using new RegExp() for email validation
    if(!new RegExp("\\S+@\\S+\\.\\S+").test(email)){
        setFormError(translate('invalidEmail'));
        return;
    }
    if(password.length < 6){
        setFormError(translate('weakPassword'));
        return;
    }

    try {
      let finalAvatarUrl = selectedAvatar;
      if (!isLoginView && customAvatarFile) {
        // Upload custom avatar
        const filePath = `avatars/${Date.now()}_${customAvatarFile.name}`;
        const fileRef = storage.ref(filePath);
        await fileRef.put(customAvatarFile);
        finalAvatarUrl = await fileRef.getDownloadURL();
      } else if (!isLoginView && !selectedAvatar && !customAvatarFile) {
        finalAvatarUrl = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]; // Default if nothing selected
      }


      if (isLoginView) {
        await logIn(email, password, rememberMe);
      } else {
        if (password !== confirmPassword) {
          setFormError(translate('passwordMismatch'));
          return;
        }
        if (!name.trim()) {
            setFormError(translate('nameRequired'));
            return;
        }
        if (!role) {
            setFormError(translate('roleRequired'));
            return;
        }
        
        // Team selection logic based on role
        // Engineers and Shift Leads do NOT select a team.
        // Unit Heads and Production Operators MUST select a team.
        const requiresTeam = role === UserRole.UNIT_HEAD || role === UserRole.PRODUCTION_OPERATOR;
        if (requiresTeam && !teamId) {
            setFormError(translate('teamRequired'));
            return;
        }

        const selectedTeamData = TEAMS_DATA.find(t => t.id === teamId);
        await signUp(name, email, password, role, requiresTeam ? teamId : undefined, requiresTeam ? selectedTeamData?.name : undefined, finalAvatarUrl);
      }
    } catch (err: any) {
      setFormError(authError || err.message || (language === 'ar' ? 'حدث خطأ ما.' : 'An unexpected error occurred.'));
    }
  };
  
  const inputBaseClasses = "mt-1 block w-full px-3 py-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-primary dark:bg-csp-secondary-dark-bg text-csp-primary-text dark:text-csp-primary-dark-text transition-all duration-150 placeholder:text-csp-secondary-text/70 dark:placeholder:text-csp-secondary-dark-text/70";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-primary-dark-text";


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-csp-secondary-bg dark:bg-csp-primary-dark p-4 transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-csp-primary dark:bg-csp-secondary-dark-bg shadow-xl rounded-xl p-6 sm:p-8 border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
        <img src={COMPANY_LOGO_URL} alt={translate('appName')} className="w-36 h-auto mx-auto mb-6 rounded-md" />
        <h2 className={`text-2xl font-bold text-center mb-6 text-csp-primary-text dark:text-csp-primary-dark-text ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>
          {isLoginView ? translate('loginTitle') : translate('signupTitle')}
        </h2>

        {(formError || authError) && (
            <p className="mb-4 text-center text-csp-error bg-red-500/10 p-3 rounded-lg text-xs border border-red-500/30">
                {formError || authError}
            </p>
        )}


        <form onSubmit={handleAuthAction} className="space-y-5">
          {!isLoginView && (
            <div>
              <label htmlFor="name" className={labelBaseClasses}>{translate('nameLabel')}</label>
              <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputBaseClasses}/>
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelBaseClasses}>{translate('emailLabel')}</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputBaseClasses}/>
          </div>

          <div className="relative">
            <label htmlFor="password" className={labelBaseClasses}>{translate('passwordLabel')}</label>
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isLoginView ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputBaseClasses}/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-9 text-csp-secondary-text dark:text-csp-secondary-dark-text hover:text-csp-accent dark:hover:text-csp-accent-dark p-1 focus:outline-none`} title={showPassword ? translate('hidePassword') : translate('showPassword')}>
              {showPassword ? <EyeSlashIconSvg className="w-5 h-5"/> : <EyeIconSvg className="w-5 h-5"/>}
            </button>
          </div>

          {!isLoginView && (
            <>
            <div className="relative">
              <label htmlFor="confirmPassword" className={labelBaseClasses}>{translate('confirmPasswordLabel')}</label>
              <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputBaseClasses}/>
            </div>
            <div>
                <label htmlFor="role" className={labelBaseClasses}>{translate('roleLabel')}</label>
                <select id="role" name="role" required value={role} onChange={(e) => { setRole(e.target.value as UserRole | ''); setTeamId(''); }} className={inputBaseClasses}>
                    <option value="">{translate('selectRole')}</option>
                    {REGISTRATION_ROLES.map(r => <option key={r} value={r}>{translate(r.toLowerCase() as keyof typeof translations[Language.EN])}</option>)}
                </select>
            </div>
            {role && (role === UserRole.UNIT_HEAD || role === UserRole.PRODUCTION_OPERATOR) && (
                 <div>
                    <label htmlFor="teamId" className={labelBaseClasses}>{translate('teamAffiliationLabel')}</label>
                    <select id="teamId" name="teamId" required value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputBaseClasses}>
                        <option value="">{translate('selectTeamAffiliation')}</option>
                        {TEAMS_DATA.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label className={labelBaseClasses}>{translate('selectAvatar')}</label>
                <div className="mt-2 flex flex-wrap gap-2.5 pb-1 items-center">
                    {AVATAR_OPTIONS.slice(0,5).map(avatar => (
                        <img 
                            key={avatar} src={avatar} alt="avatar option"
                            onClick={() => { setSelectedAvatar(avatar); setCustomAvatarFile(null); setCustomAvatarPreview(null); }}
                            className={`w-14 h-14 rounded-full cursor-pointer object-cover border-2 transition-all duration-200 ${selectedAvatar === avatar && !customAvatarFile ? 'border-csp-accent dark:border-csp-accent-dark ring-2 ring-csp-accent dark:ring-csp-accent-dark shadow-lg' : 'border-transparent hover:border-csp-accent/70 dark:hover:border-csp-accent-dark/70'}`}
                        />
                    ))}
                     <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${customAvatarFile ? 'border-csp-accent dark:border-csp-accent-dark ring-2 ring-csp-accent dark:ring-csp-accent-dark shadow-lg' : 'border-dashed border-csp-secondary-text/50 dark:border-csp-secondary-dark-text/50 hover:border-csp-accent dark:hover:border-csp-accent-dark'} transition-all`}>
                        {customAvatarPreview ? <img src={customAvatarPreview} alt="Custom avatar preview" className="w-full h-full rounded-full object-cover" /> : <UploadIcon className="w-6 h-6 text-csp-secondary-text dark:text-csp-secondary-dark-text"/>}
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" />
                </div>
            </div>
            </>
          )}
          
          {isLoginView && (
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-csp-accent dark:text-csp-accent-dark bg-csp-primary dark:bg-csp-secondary-dark-bg border-csp-secondary-text/50 dark:border-csp-secondary-dark-text/50 rounded focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="ml-2 rtl:mr-2 block text-sm text-csp-primary-text dark:text-csp-primary-dark-text">
                {translate('rememberMe')}
              </label>
            </div>
          )}

          <div>
            <button type="submit" disabled={authLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-csp-accent dark:bg-csp-accent-dark hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-csp-primary dark:focus:ring-offset-csp-secondary-dark-bg focus:ring-csp-accent dark:focus:ring-csp-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 button-glow-effect relative"
            >
              {authLoading ? (language === 'ar' ? 'لحظات من فضلك...' : 'Processing...') : (isLoginView ? translate('loginButton') : translate('signupButton'))}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsLoginView(!isLoginView); setFormError(null);}}
            className="text-sm font-medium text-csp-accent dark:text-csp-accent-dark hover:underline"
          >
            {isLoginView ? translate('noAccount') : translate('alreadyAccount')} {isLoginView ? translate('signupButton') : translate('loginButton')}
          </button>
        </div>
      </div>
       <p className="mt-8 text-center text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text/70">
        &copy; {new Date().getFullYear()} {translate('appName')}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
      </p>
    </div>
  );
};

export default AuthPage;
