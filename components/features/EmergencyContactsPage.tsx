import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { EmergencyContact } from '../../types';
import { getEmergencyContacts } from '../../services/firestoreService';
import { EMERGENCY_CONTACT_DEPARTMENTS } from '../../constants';

const EmergencyContactsPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const fetchedContacts = await getEmergencyContacts();
        setContacts(fetchedContacts);
      } catch (err) {
        console.error("Error fetching emergency contacts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";

  if (isLoading) return <p className="text-center">{translate('loading')}</p>;

  return (
    <div className="space-y-6" dir={language}>
      {contacts.length === 0 ? (
        <p className="text-center">{translate('noEmergencyContacts')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map(contact => (
            <div key={contact.id} className={cardClasses}>
              <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>{contact.name}</h3>
              <p className="text-sm text-csp-accent dark:text-csp-accent font-medium">
                <a href={`tel:${contact.number}`} className="hover:underline">{contact.number}</a>
              </p>
              <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1">
                {translate(EMERGENCY_CONTACT_DEPARTMENTS.find(d => d.id === contact.department)?.labelKey as any || contact.department)}
              </p>
              {contact.description && (
                <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">{contact.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsPage;