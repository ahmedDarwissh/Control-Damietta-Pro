
import React from 'react';
import { Shift } from '../types';
import { TEAMS_DATA, DEFAULT_AVATAR_URL } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface ShiftCardProps {
  shift: Shift;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift }) => {
  const { translate, language } = useLocalization();
  const teamDetails = TEAMS_DATA.find(t => t.id === shift.teamId);
  const shiftLeadAvatar = shift.teamAvatarUrl || teamDetails?.avatarUrl || `${DEFAULT_AVATAR_URL}?id=${shift.shiftLeadId || shift.teamId}`;
  const shiftLeadName = shift.shiftLeadName || teamDetails?.shiftLeadName || translate('unknownLead');

  return (
    <div className={`bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg border-l-4 rtl:border-r-4 rtl:border-l-0 ${shift.startTime.startsWith('07') ? 'border-csp-accent' : 'border-csp-info'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
        <img src={shiftLeadAvatar} alt={shiftLeadName} className="w-12 h-12 rounded-full object-cover border-2 border-csp-base-300 dark:border-csp-secondary flex-shrink-0" />
        <div>
          <h3 className={`text-md font-semibold text-csp-primary dark:text-csp-base-dark-content ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{shift.name}</h3>
          <p className="text-xs text-csp-secondary dark:text-gray-400">
            {translate('shiftlead')}: {shiftLeadName}
          </p>
        </div>
      </div>
      <div className="text-xs space-y-1 text-csp-secondary-text dark:text-csp-secondary-dark-text">
        <p><strong>{translate('date' as any)}:</strong> {new Date(shift.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}</p>
        <p><strong>{translate('shiftTime')}:</strong> {shift.startTime} - {shift.endTime}</p>
        <p><strong>{translate('team')}:</strong> {teamDetails?.name || shift.teamId}</p>
      </div>
    </div>
  );
};

export default ShiftCard;
