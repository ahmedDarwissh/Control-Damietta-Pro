
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserContact, UserRole } from '../../types';
import { getAllUsers } from '../../services/firestoreService';
import { DEFAULT_AVATAR_URL, translations } from '../../constants';

const UserDirectoryPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser } = useAuth(); // For potential filtering or actions
  const [users, setUsers] = useState<UserContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error("Error fetching user directory:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRoleDisplayName = (role: UserRole) => {
    const roleKey = role.toLowerCase() as keyof typeof translations.en;
    return translate(roleKey);
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleDisplayName(user.role).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.teamName && user.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const buttonClasses = "py-1.5 px-2.5 rounded-md font-semibold text-xs transition-colors duration-150 shadow";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className="space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <input 
        type="text" 
        placeholder={translate('searchUser')} 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className={inputBaseClasses}
      />

      {isLoading && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && filteredUsers.length === 0 && <p className="text-center">{translate('noUsersFoundInDirectory')}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div key={user.uid} className={cardClasses}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
              <img src={user.avatarUrl || `${DEFAULT_AVATAR_URL}?name=${user.name.split(' ')[0]}`} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-csp-accent dark:border-csp-accent-dark"/>
              <div>
                <h3 className={`font-semibold text-csp-primary-text dark:text-csp-primary-dark-text ${language==='ar'?'font-cairo':'font-poppins'}`}>{user.name}</h3>
                <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text">{getRoleDisplayName(user.role)}</p>
                {user.teamName && <p className="text-xs text-gray-400 dark:text-gray-500">{user.teamName}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {user.phone && <a href={`tel:${user.phone}`} className={`${primaryButtonClasses} bg-green-500 hover:bg-green-600`}>{translate('callUser', user.name.split(' ')[0])}</a>}
              {user.email && <a href={`mailto:${user.email}`} className={`${primaryButtonClasses} bg-blue-500 hover:bg-blue-600`}>{translate('emailUser', user.name.split(' ')[0])}</a>}
              {/* Chat with user could navigate to a DM chat page if implemented */}
              {/* <button className={`${primaryButtonClasses} bg-purple-500 hover:bg-purple-600`}>{translate('chatWithUser', user.name.split(' ')[0])}</button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDirectoryPage;
    