
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { LearningResource } from '../../types';
import { getLearningResources } from '../../services/firestoreService';

const LearningResourcesPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const fetchedResources = await getLearningResources();
        setResources(fetchedResources);
      } catch (err) {
        console.error("Error fetching learning resources:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const buttonClasses = "py-2 px-3 rounded-md font-semibold text-xs transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;


  if (isLoading) return <p className="text-center">{translate('loading')}</p>;

  return (
    <div className="space-y-4" dir={language}>
      {resources.length === 0 ? (
        <p className="text-center">{translate('noLearningResources')}</p>
      ) : (
        resources.map(res => (
          <div key={res.id} className={cardClasses}>
            <h3 className={`font-semibold text-csp-primary-text dark:text-csp-primary-dark-text ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{res.title}</h3>
            {res.category && <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('resourceCategoryLabel')}: {res.category}</p>}
            {res.description && <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1">{res.description}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {translate('resourceTypeLabel')}: {translate(`resourceType${res.type.charAt(0).toUpperCase() + res.type.slice(1)}` as any)} | Added by: {res.addedByName || 'Admin'}
            </p>
            <div className="mt-3">
              {res.type === 'link' && res.url && (
                <a href={res.url} target="_blank" rel="noopener noreferrer" className={`${primaryButtonClasses}`}>
                  {translate('openLink')}
                </a>
              )}
              {(res.type === 'document' || res.type === 'video') && res.filePath && (
                <a href={res.filePath} target="_blank" rel="noopener noreferrer" download={res.fileName || res.title} className={`${primaryButtonClasses}`}>
                  {translate('downloadResource')} {res.fileName && `(${res.fileName})`}
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LearningResourcesPage;
