import React, { useState, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { FeedbackSubmission } from '../../types';
import { addFeedbackSubmission } from '../../services/firestoreService';
import { FEEDBACK_TYPES_LIST } from '../../constants';

const FeedbackPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'compliment' | 'other'>(FEEDBACK_TYPES_LIST[0].id as any);
  const [message, setMessage] = useState('');
  const [pageContext, setPageContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    const submissionData: Omit<FeedbackSubmission, 'id' | 'submittedAt'|'isRead'|'status'> = {
      userId: currentUser.uid,
      userName: currentUser.name,
      email: currentUser.email || undefined,
      type: feedbackType,
      message,
      pageContext: pageContext.trim() || undefined,
    };

    try {
      await addFeedbackSubmission(submissionData);
      setSubmitMessage(translate('feedbackSubmitted'));
      setMessage('');
      setPageContext('');
      setFeedbackType(FEEDBACK_TYPES_LIST[0].id as any);
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setSubmitMessage(language === 'ar' ? 'فشل إرسال الملاحظات.' : 'Failed to submit feedback.');
      handleFirestoreOutcome(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2.5 px-5 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <form onSubmit={handleSubmit} className={`${cardClasses} space-y-5`} dir={language}>
      <div>
        <label htmlFor="feedbackType" className={labelBaseClasses}>{translate('feedbackTypeLabel')}</label>
        <select id="feedbackType" value={feedbackType} onChange={e => setFeedbackType(e.target.value as any)} className={inputBaseClasses}>
          {FEEDBACK_TYPES_LIST.map(type => (
            <option key={type.id} value={type.id}>{translate(type.labelKey as any)}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="feedbackMessage" className={labelBaseClasses}>{translate('feedbackMessageLabel')}</label>
        <textarea id="feedbackMessage" value={message} onChange={e => setMessage(e.target.value)} rows={5} className={`${inputBaseClasses} min-h-[120px]`} required />
      </div>
      <div>
        <label htmlFor="pageContext" className={labelBaseClasses}>{translate('feedbackPageContextLabel')}</label>
        <input type="text" id="pageContext" value={pageContext} onChange={e => setPageContext(e.target.value)} className={inputBaseClasses} placeholder={language === 'ar' ? 'مثال: صفحة المهام' : 'e.g., Task Page'} />
      </div>
      
      {submitMessage && (
        <p className={`text-sm p-3 rounded-md ${submitMessage === translate('feedbackSubmitted') ? 'bg-csp-success/20 text-green-700 dark:text-green-300' : 'bg-csp-error/20 text-red-700 dark:text-red-400'}`}>
          {submitMessage}
        </p>
      )}

      <button type="submit" className={`${primaryButtonClasses} w-full`} disabled={isSubmitting || isFirestoreOffline}>
        {isSubmitting ? translate('loading') : translate('submitFeedback')}
      </button>
    </form>
  );
};

export default FeedbackPage;