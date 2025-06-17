
import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { LeaveRequest } from '../../types';
import { addLeaveRequest, getLeaveRequestsForUser } from '../../services/firestoreService';

const LeaveRequestPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchRequests = async () => {
        setIsLoading(true);
        try {
          const userRequests = await getLeaveRequestsForUser(currentUser.uid);
          setRequests(userRequests);
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching leave requests:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRequests();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const resetForm = () => {
    setStartDate(''); setEndDate(''); setReason('');
    setShowForm(false);
  };

  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !startDate || !endDate || !reason.trim()) {
        alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.');
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert(language === 'ar' ? 'تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء.' : 'Start date cannot be after end date.');
        return;
    }
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }

    const requestData = {
      userId: currentUser.uid,
      userName: currentUser.name,
      startDate,
      endDate,
      reason,
      status: 'pending' as 'pending',
    };
    
    setIsLoading(true);
    try {
      const newRequest = await addLeaveRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      resetForm();
      handleFirestoreOutcome(null);
      alert(translate('leaveRequestSubmitted'));
    } catch (err) {
      console.error("Error submitting leave request:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: LeaveRequest['status']) => {
    if (status === 'approved') return 'bg-csp-success/20 text-green-700 dark:text-green-300';
    if (status === 'rejected') return 'bg-csp-error/20 text-red-700 dark:text-red-400';
    return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'; // pending
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className="space-y-6" dir={language}>
      <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className={`${primaryButtonClasses} w-full`}>
        {showForm ? translate('cancel') : translate('submitLeaveRequest')}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitRequest} className={`${cardClasses} space-y-4`}>
          <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>{translate('submitLeaveRequest')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="startDate" className={labelBaseClasses}>{translate('leaveStartDateLabel')}</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputBaseClasses} required /></div>
            <div><label htmlFor="endDate" className={labelBaseClasses}>{translate('leaveEndDateLabel')}</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputBaseClasses} required /></div>
          </div>
          <div><label htmlFor="reason" className={labelBaseClasses}>{translate('leaveReasonLabel')}</label><textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} className={`${inputBaseClasses} min-h-[80px]`} required /></div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>{isLoading ? translate('loading') : translate('submitLeaveRequest')}</button>
        </form>
      )}

      {isLoading && requests.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && requests.length === 0 && <p className="text-center">{translate('noLeaveRequests')}</p>}

      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className={`${cardClasses}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-csp-primary-text dark:text-csp-primary-dark-text">
                  {translate('leaveStartDateLabel')}: {new Date(req.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}
                </p>
                <p className="text-sm text-csp-primary-text dark:text-csp-primary-dark-text">
                  {translate('leaveEndDateLabel')}: {new Date(req.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                {translate(`status${req.status.charAt(0).toUpperCase() + req.status.slice(1)}` as any)}
              </span>
            </div>
            <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1">{translate('leaveReasonLabel')}: {req.reason}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requested on: {new Date(req.requestedAt.toDate()).toLocaleDateString()}</p>
            {req.reviewedBy && <p className="text-xs mt-1 text-gray-400">Reviewed by: {req.reviewedByName} on {req.reviewedAt?.toDate().toLocaleDateString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveRequestPage;
