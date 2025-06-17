import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { PageNavItemId } from '../types';
import { NAV_ITEMS_EN, NAV_ITEMS_AR } from '../constants';

// Refined Icons with consistent styling
const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-6 h-6 mb-0.5 flex items-center justify-center">{children}</div>
);

const IconDashboard = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg></IconWrapper>;
const IconTasks = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></IconWrapper>;
const IconChat = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.091A9.738 9.738 0 0112 15.75H8.25c-2.431 0-4.5-1.969-4.5-4.5V8.25c0-2.431 1.969-4.5 4.5-4.5h3.75a2.25 2.25 0 012.25 2.25v.75Z" /></svg></IconWrapper>;
const IconShips = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.841a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg></IconWrapper>;
const IconMore = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" /></svg></IconWrapper>;

const iconMap: Record<string, React.FC> = {
  dashboard: IconDashboard,
  tasks: IconTasks,
  chat: IconChat,
  ships: IconShips,
  more: IconMore,
};

interface BottomNavigationBarProps {
  activePage: PageNavItemId;
  setActivePage: (page: PageNavItemId) => void;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ activePage, setActivePage }) => {
  const { language, translate } = useLocalization();
  const navItemsConstants = language === 'ar' ? NAV_ITEMS_AR : NAV_ITEMS_EN;

  const bottomNavItems = navItemsConstants.filter(item => 
    ['dashboard', 'tasks', 'chat', 'ships', 'more'].includes(item.id)
  );
  
  const orderedBottomNavItems = ['dashboard', 'tasks', 'chat', 'ships', 'more'].map(id => 
    bottomNavItems.find(item => item.id === id)
  ).filter(item => item !== undefined) as {id: PageNavItemId, labelKey: string, icon: string}[];


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-csp-primary dark:bg-csp-secondary-dark-bg border-t border-csp-secondary-text/20 dark:border-csp-primary-dark-text/20 shadow-top-lg flex justify-around items-center z-50">
      {orderedBottomNavItems.map((item) => {
        const IconComponent = iconMap[item.icon];
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center justify-center h-full flex-1 p-1 focus:outline-none transition-colors duration-200 relative
                        ${isActive 
                            ? 'text-csp-accent dark:text-csp-accent-dark' 
                            : 'text-csp-secondary-text dark:text-csp-secondary-dark-text hover:text-csp-primary-text dark:hover:text-csp-primary-dark-text'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {IconComponent && <IconComponent />}
            <span className={`text-[0.6rem] sm:text-xs font-medium truncate ${isActive ? 'font-semibold' : ''}`}>{translate(item.labelKey as any)}</span>
            {isActive && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-csp-accent dark:bg-csp-accent-dark rounded-t-full"></div>}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigationBar;
