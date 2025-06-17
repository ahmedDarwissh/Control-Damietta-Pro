import React from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';

interface GuideSectionProps {
  titleKey: string;
  contentKey: string;
}

const GuideSection: React.FC<GuideSectionProps> = ({ titleKey, contentKey }) => {
  const { translate, language } = useLocalization();
  return (
    <div className="mb-5">
      <h3 className={`text-lg font-semibold text-csp-accent dark:text-csp-accent-dark mb-1.5 ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>
        {translate(titleKey as any)}
      </h3>
      <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text leading-relaxed">
        {translate(contentKey as any)}
      </p>
    </div>
  );
};

const UserGuidePage: React.FC = () => {
  const { translate, language } = useLocalization();
  
  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";

  return (
    <div className={`${cardClasses} space-y-4`} dir={language}>
      <GuideSection titleKey="ug_welcome_title" contentKey="ug_welcome_content" />
      <hr className="my-3 border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10"/>
      <GuideSection titleKey="ug_tasks_title" contentKey="ug_tasks_content" />
      <hr className="my-3 border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10"/>
      <GuideSection titleKey="ug_shifts_title" contentKey="ug_shifts_content" />
      <hr className="my-3 border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10"/>
      <GuideSection titleKey="ug_chat_title" contentKey="ug_chat_content" />
      {/* Add more sections as needed */}
    </div>
  );
};

export default UserGuidePage;