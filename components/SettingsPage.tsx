import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Language, UserSettings, AppTheme, NotificationSound } from '../types';
import { useAuth } from '../contexts/AuthContext';
import useDateTime from '../hooks/useDateTime';
import { APP_THEMES, NOTIFICATION_SOUNDS, EGYPTIAN_CITIES_FOR_PRAYER_TIMES } from '../constants';

interface ToggleSwitchProps {
    label: string;
    icon?: React.ReactNode;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, icon, enabled, onChange, description }) => {
  const { language } = useLocalization();
  return (
    <div className={`flex items-center justify-between py-4 ${language === 'ar' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'}`}>
      <div className={`${language === 'ar' ? 'text-right' : 'text-left'} flex-grow`}>
        <div className="flex items-center">
            {icon && <span className={`mr-2.5 rtl:ml-2.5 rtl:mr-0 text-csp-accent dark:text-csp-accent-dark`}>{icon}</span>}
            <span className="text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text">{label}</span>
        </div>
        {description && <p className={`text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1 ${icon ? (language === 'ar' ? 'mr-7 rtl:mr-8' : 'ml-7 rtl:ml-8') : ''}`}>{description}</p>}
      </div>
      <button
        type="button"
        className={`${enabled ? 'bg-csp-accent dark:bg-csp-accent-dark' : 'bg-csp-secondary-text/30 dark:bg-csp-secondary-dark-text/30'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 ring-offset-2 focus:ring-offset-csp-primary dark:focus:ring-offset-csp-secondary-dark-bg focus:ring-csp-accent dark:focus:ring-csp-accent-dark`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? (language === 'ar' ? '-translate-x-[1.125rem]' : 'translate-x-[1.125rem]') : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

// ... (Keep existing Icon SVGs: SunIconSvg, MoonIconSvg, GlobeIcon, CalendarClockIcon)
const SunIconSvg = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
const MoonIconSvg = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.186 7.05 13 7.5 13 8c0 .5.186 1 .432 1.636m-1.414-1.414A3.939 3.939 0 0112 6c.995 0 1.921.356 2.607.936m0 0A3.913 3.913 0 0116.5 6c1.328 0 2.555.722 3.235 1.833m-2.822 4.675A3.91 3.91 0 0015 12c-1.328 0-2.555-.722-3.235-1.833M12 18.75a4.5 4.5 0 01-4.5-4.5H3m14.25 4.5a4.5 4.5 0 00-4.5-4.5H12m0 0V15" /></svg>;
const CalendarClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-12.75-5.625A2.25 2.25 0 1112.75 15a2.25 2.25 0 01-4.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v4.5l3.75 2.25" /></svg>;
const FontSizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>; // Placeholder, better icon needed
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
const NoBellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M17.25 9.75h.008v.008h-.008V9.75z" /></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.223 5.223h5.228l-.631 2.225L13.684 16.6zm-1.704-5.228L5.162 5.162A2.25 2.25 0 002.342 6.72l6.095 6.095M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.223 5.223h5.228l-.631 2.225L13.684 16.6zm-1.704-5.228L5.162 5.162A2.25 2.25 0 002.342 6.72l6.095 6.095" /></svg>;

const sectionCardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 sm:p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
const sectionTitleClasses = (lang: Language) => `text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text ${lang === 'ar' ? 'font-cairo' : 'font-poppins'}`;
const selectBaseClasses = "block w-full p-2.5 border border-csp-base-300 dark:border-csp-base-dark-300 bg-csp-primary dark:bg-csp-secondary-dark-bg text-csp-primary-text dark:text-csp-primary-dark-text rounded-md shadow-sm focus:ring-1 focus:ring-csp-accent focus:border-csp-accent text-sm transition-shadow";


const SettingsPage: React.FC = () => {
  const { translate, language: currentLanguageVal, setLanguage: setAppLanguage } = useLocalization();
  const { currentUser, updateUserSettings } = useAuth();
  const { dateString, timeString } = useDateTime();

  const [settings, setSettings] = useState<UserSettings>(currentUser?.userSettings || {
    doNotDisturb: false,
    fontSize: 'base',
    notificationSound: NotificationSound.DEFAULT,
    preferredTheme: AppTheme.LIGHT,
    prayerTimeLocation: 'Damietta',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.userSettings) {
      setSettings(currentUser.userSettings);
    }
  }, [currentUser?.userSettings]);

  const handleSettingChange = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings); // Optimistic UI update
    setIsSaving(true);
    try {
      await updateUserSettings(newSettings);
      // Apply theme immediately if changed
      if (key === 'preferredTheme') {
        document.documentElement.classList.remove(AppTheme.LIGHT, AppTheme.DARK, AppTheme.OCEAN_BLUE, AppTheme.DESERT_GOLD);
        document.documentElement.classList.add(value as string);
        document.documentElement.setAttribute('data-theme', value as string);
        localStorage.theme = value as string;
      }
      // Apply font size immediately
      if (key === 'fontSize') {
        document.documentElement.style.fontSize =
          value === 'sm' ? '14px' :
          value === 'lg' ? '18px' : '16px';
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Revert UI or show error message
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setAppLanguage(lang);
  };

  return (
    <div className="space-y-6" dir={currentLanguageVal === 'ar' ? 'rtl' : 'ltr'}>
      {/* Language Setting */}
      <div className={sectionCardClasses}>
        <div className="flex items-center mb-3">
            <span className={`mr-2.5 rtl:ml-2.5 rtl:mr-0 text-csp-accent dark:text-csp-accent-dark`}><GlobeIcon/></span>
            <h2 className={sectionTitleClasses(currentLanguageVal)}>{translate('language')}</h2>
        </div>
        <div className="flex items-center justify-between py-3">
            <span className="text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text">{translate('selectLanguage')}</span>
            <div className="flex space-x-2.5 rtl:space-x-reverse">
                 <button
                    onClick={() => handleLanguageChange(Language.EN)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${currentLanguageVal === Language.EN ? 'bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark shadow-md' : 'bg-csp-secondary-bg text-csp-primary-text hover:bg-opacity-80 dark:bg-csp-primary-dark dark:text-csp-primary-dark-text dark:hover:bg-opacity-80'}`}
                >
                    {translate('english')}
                </button>
                <button
                    onClick={() => handleLanguageChange(Language.AR)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${currentLanguageVal === Language.AR ? 'bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark shadow-md' : 'bg-csp-secondary-bg text-csp-primary-text hover:bg-opacity-80 dark:bg-csp-primary-dark dark:text-csp-primary-dark-text dark:hover:bg-opacity-80'}`}
                >
                    {translate('arabic')}
                </button>
            </div>
        </div>
      </div>

      {/* Display & Sound Settings */}
      <div className={`${sectionCardClasses} divide-y divide-csp-secondary-text/10 dark:divide-csp-primary-dark-text/10`}>
        <div className="py-3">
            <label htmlFor="preferredTheme" className="block text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text mb-2 flex items-center">
                <PaletteIcon /> <span className="mx-2">{translate('theme')}</span>
            </label>
            <select
                id="preferredTheme"
                value={settings.preferredTheme}
                onChange={(e) => handleSettingChange('preferredTheme', e.target.value as AppTheme)}
                className={selectBaseClasses}
            >
                {APP_THEMES.map(theme => (
                    <option key={theme.id} value={theme.id}>{translate(theme.nameKey as any)}</option>
                ))}
            </select>
        </div>
        <div className="py-3">
            <label htmlFor="fontSize" className="block text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text mb-2 flex items-center">
                <FontSizeIcon /> <span className="mx-2">{translate('fontSize')}</span>
            </label>
            <select
                id="fontSize"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', e.target.value as 'sm' | 'base' | 'lg')}
                className={selectBaseClasses}
            >
                <option value="sm">{translate('fontSizeSmall')}</option>
                <option value="base">{translate('fontSizeMedium')}</option>
                <option value="lg">{translate('fontSizeLarge')}</option>
            </select>
        </div>
        <ToggleSwitch
          label={translate('doNotDisturb')}
          icon={settings.doNotDisturb ? <NoBellIcon/> : <BellIcon/>}
          enabled={settings.doNotDisturb || false}
          onChange={(val) => handleSettingChange('doNotDisturb', val)}
          description={currentLanguageVal === 'ar' ? "إيقاف جميع الإشعارات مؤقتًا." : "Temporarily pause all notifications."}
        />
        <div className="py-3">
            <label htmlFor="notificationSound" className="block text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text mb-2 flex items-center">
                <BellIcon /> <span className="mx-2">{translate('notificationSound')}</span>
            </label>
            <select
                id="notificationSound"
                value={settings.notificationSound}
                onChange={(e) => handleSettingChange('notificationSound', e.target.value as NotificationSound)}
                className={selectBaseClasses}
                disabled={settings.doNotDisturb}
            >
                {NOTIFICATION_SOUNDS.map(sound => (
                    <option key={sound.id} value={sound.id}>{translate(sound.nameKey as any)}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Prayer Time Settings */}
      <div className={sectionCardClasses}>
        <div className="flex items-center mb-3">
            <span className={`mr-2.5 rtl:ml-2.5 rtl:mr-0 text-csp-accent dark:text-csp-accent-dark`}><CalendarClockIcon/></span>
            <h2 className={sectionTitleClasses(currentLanguageVal)}>{translate('prayerTimes')}</h2>
        </div>
        <ToggleSwitch
          label={translate('prayerTimes')}
          enabled={settings.prayerTimeLocation !== undefined} // Example: enable if a location is set
          onChange={(val) => handleSettingChange('prayerTimeLocation', val ? (settings.prayerTimeLocation || 'Damietta') : undefined)}
          description={currentLanguageVal === 'ar' ? "إشعار قبل الصلاة بعشر دقايق، عشان تلحق." : "Notification 10 mins before prayer."}
        />
        {settings.prayerTimeLocation !== undefined && (
            <div className="mt-3">
                <label htmlFor="prayerTimeLocation" className="block text-md font-medium text-csp-primary-text dark:text-csp-primary-dark-text mb-2">{translate('prayerTimeLocation')}</label>
                <select
                    id="prayerTimeLocation"
                    value={settings.prayerTimeLocation || 'Damietta'}
                    onChange={(e) => handleSettingChange('prayerTimeLocation', e.target.value)}
                    className={selectBaseClasses}
                >
                    {EGYPTIAN_CITIES_FOR_PRAYER_TIMES.map(city => (
                        <option key={city.name} value={city.name}>
                            {currentLanguageVal === 'ar' ? city.nameAr : city.name}
                        </option>
                    ))}
                </select>
            </div>
        )}
      </div>


      {/* Current Date & Time (moved from header) */}
      <div className={sectionCardClasses}>
        <div className="flex items-center mb-3">
            <span className={`mr-2.5 rtl:ml-2.5 rtl:mr-0 text-csp-accent dark:text-csp-accent-dark`}><CalendarClockIcon/></span>
            <h2 className={sectionTitleClasses(currentLanguageVal)}>{translate('currentDateTime')}</h2>
        </div>
        <div className={`text-sm text-center text-csp-secondary-text dark:text-csp-secondary-dark-text py-2`}>
          <div className="font-semibold text-csp-accent dark:text-csp-accent-dark">{dateString}</div>
          <div>{timeString}</div>
        </div>
      </div>
       {isSaving && <p className="text-center text-xs text-csp-accent dark:text-csp-accent-dark mt-2">{translate('loading')}</p>}
    </div>
  );
};

export default SettingsPage;
