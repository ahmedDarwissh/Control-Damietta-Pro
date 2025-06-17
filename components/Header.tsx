import React from 'react';
import { NAV_ITEMS_AR, NAV_ITEMS_EN, DEFAULT_AVATAR_URL } from '../constants'; 
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { PageNavItemId } from '../types';

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);


const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const BackArrowIconRTL = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);


interface HeaderProps {
  currentPageTitle: PageNavItemId;
  setActivePage: (page: PageNavItemId) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPageTitle, setActivePage }) => {
  const { translate, language } = useLocalization();
  const { currentUser, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
      alert(language === 'ar' ? 'فشلت عملية تسجيل الخروج.' : 'Logout failed.');
    }
  };

  const userDisplayName = currentUser?.name || currentUser?.email || translate('profile');
  const userAvatar = currentUser?.avatarUrl || `${DEFAULT_AVATAR_URL}?u=${currentUser?.uid || 'default'}`;

  const navItems = language === 'ar' ? NAV_ITEMS_AR : NAV_ITEMS_EN;
  // Find the item by ID and translate its labelKey
  const pageItem = navItems.find(item => item.id === currentPageTitle);
  const titleToDisplay = pageItem ? translate(pageItem.labelKey as any) : translate(currentPageTitle as any);


  const secondaryPages: PageNavItemId[] = ['shifts', 'team', 'entertainment', 'pid', 'savings', 'butler', 'reports', 'admin', 'settings', 'profile', 'equipmentLog', 'safetyChecklist', 'emergencyContacts', 'unitConverter', 'documentViewer', 'feedback', 'userGuide', 'internalNews'];
  const isSecondaryPage = secondaryPages.includes(currentPageTitle);


  return (
    <header className={`bg-csp-primary-dark text-csp-primary-dark-text p-3 shadow-lg flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-16`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center">
        {isSecondaryPage && (
          <button 
            onClick={() => setActivePage('more')} 
            className="p-2 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-csp-primary-dark-text hover:bg-csp-secondary-dark-bg/70 rounded-full transition-colors"
            aria-label={translate('back')}
          >
            {language === 'ar' ? <BackArrowIconRTL /> : <BackArrowIcon />}
          </button>
        )}
        <h1 className={`text-lg font-semibold truncate ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>
          {titleToDisplay}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        {currentUser && (
          <div className="relative group">
              <img 
                src={userAvatar} 
                alt={userDisplayName} 
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-csp-accent-dark hover:opacity-90 object-cover shadow-sm transition-opacity"
              />
              <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-52 bg-csp-primary dark:bg-csp-secondary-dark-bg rounded-lg shadow-xl py-1 z-20 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-focus-within:scale-100 group-hover:scale-100 origin-top-${language === 'ar' ? 'left' : 'right'} border border-csp-secondary-text/20 dark:border-csp-primary-dark-text/20`}>
                  <div className={`block px-4 py-2.5 text-sm text-csp-primary-text dark:text-csp-primary-dark-text font-medium border-b border-csp-secondary-text/20 dark:border-csp-primary-dark-text/20 ${language === 'ar' ? 'text-right font-tajawal' : 'text-left font-poppins'}`}>
                    {userDisplayName}
                  </div>
                  <button 
                    onClick={() => setActivePage('profile')}
                    className={`w-full text-left rtl:text-right flex items-center px-4 py-2.5 text-sm text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-csp-secondary-bg dark:hover:bg-csp-primary-dark ${language === 'ar' ? 'font-tajawal' : 'font-poppins'} transition-colors duration-150`}
                  >
                     <ProfileIcon />
                     {translate('myProfile')}
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className={`w-full text-left rtl:text-right flex items-center px-4 py-2.5 text-sm text-csp-error hover:bg-red-500/10 dark:hover:bg-red-500/20 ${language === 'ar' ? 'font-tajawal' : 'font-poppins'} transition-colors duration-150`}
                  >
                    <LogoutIcon />
                    {translate('logout')}
                  </button>
              </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
