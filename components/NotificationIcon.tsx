import React from 'react';

interface NotificationIconProps {
  count: number;
}

// Bell Icon SVG
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7"> {/* Slightly larger icon */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);


const NotificationIcon: React.FC<NotificationIconProps> = ({ count }) => {
  return (
    <button className="relative p-2 rounded-full text-csp-secondary dark:text-csp-base-dark-content hover:bg-csp-base-200 dark:hover:bg-csp-base-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-csp-base-100 dark:focus:ring-offset-csp-base-dark-200 focus:ring-csp-accent transition-colors duration-150">
      <BellIcon />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-csp-error rounded-full shadow-sm"> {/* Updated badge color and positioning */}
          {count}
        </span>
      )}
    </button>
  );
};

export default NotificationIcon;