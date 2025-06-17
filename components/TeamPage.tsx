
import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { TEAMS_DATA, ENGINEERS_DATA, DEFAULT_AVATAR_URL, translations } from '../constants';
import { User, UserRole, Language, Team } from '../types';

interface UserCardProps {
  user: { name: string; role: UserRole; teamName?: string; id?: string, avatarUrl?: string };
  isEngineer?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, isEngineer }) => {
    const { language, translate } = useLocalization();
    
    let roleTextValue: string; 
    const roleStringValueFromEnum = user.role; 
    const roleKey = roleStringValueFromEnum.toLowerCase() as keyof typeof translations[Language.EN];

    if (translations[language] && translations[language][roleKey]) {
        roleTextValue = translate(roleKey);
    } else if (translations[Language.EN] && translations[Language.EN][roleKey]) { 
        roleTextValue = translations[Language.EN][roleKey]; 
    } else {
        roleTextValue = roleStringValueFromEnum; 
    }

    const avatar = user.avatarUrl || `${DEFAULT_AVATAR_URL}?id=${user.id || user.name.split(' ')[0]}`;

    return (
        <div className={`bg-csp-base-100 dark:bg-csp-base-dark-200 p-3 rounded-lg shadow-md flex items-center space-x-3 rtl:space-x-reverse transition-all duration-300 hover:shadow-lg ${isEngineer ? `border-l-4 rtl:border-r-4 rtl:border-l-0 border-csp-accent` : `border-l-4 rtl:border-r-4 rtl:border-l-0 border-csp-primary`}`}>
            <img src={avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-csp-base-300 dark:border-csp-secondary flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold text-csp-primary dark:text-csp-base-dark-content truncate ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{user.name}</h4>
                <p className="text-xs text-csp-secondary dark:text-gray-400">{roleTextValue}</p>
                {user.teamName && !isEngineer && <p className="text-xs text-csp-secondary dark:text-gray-500 truncate">{user.teamName}</p>}
            </div>
        </div>
    );
};


const TeamPage: React.FC = () => {
  const { translate, language } = useLocalization();

  return (
    <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className={`text-xl font-bold text-csp-primary dark:text-csp-accent mb-4 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>
            {translate('engineers')}
        </h2>
        <div className="space-y-3">
            {ENGINEERS_DATA.map(engineer => ( 
                <UserCard 
                    key={engineer.uid} 
                    user={{
                        id: engineer.uid, 
                        name: engineer.name, 
                        role: engineer.role, 
                        avatarUrl: engineer.avatarUrl 
                    }} 
                    isEngineer={true} 
                />
            ))}
        </div>
      </div>

      <div>
        <h2 className={`text-xl font-bold text-csp-primary dark:text-csp-accent mb-4 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>
            {translate('teamsAndSupervisors')}
        </h2>
        <div className="space-y-6">
            {TEAMS_DATA.map((team: Team) => (
                <div key={team.id} className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-lg shadow-lg">
                    <h3 className={`text-lg font-semibold text-csp-primary dark:text-csp-accent mb-3 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{team.name}</h3>
                    <div className="mb-3">
                        <h4 className={`text-sm font-medium text-csp-secondary dark:text-gray-300 mb-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{translate('shiftlead')}:</h4>
                        <UserCard user={{id: `sl-${team.id}`, name: team.shiftLeadName, role: team.shiftLeadRole, avatarUrl: team.avatarUrl}} />
                    </div>
                    <div>
                        <h4 className={`text-sm font-medium text-csp-secondary dark:text-gray-300 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{translate('teamMembers')}:</h4>
                        <div className="space-y-3">
                            {team.members?.map(member => (
                                <UserCard key={member.name} user={{ id: `member-${team.id}-${member.name.replace(new RegExp("\\s+", "g"), '')}`, name: member.name, role: member.role, teamName: team.name }} />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
