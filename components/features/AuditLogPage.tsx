
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { AuditLogEntry } from '../../types';
import { getAuditLogEntries } from '../../services/firestoreService';

const AuditLogPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedLogs = await getAuditLogEntries(100); // Fetch last 100 logs
        setLogs(fetchedLogs);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError(language === 'ar' ? 'فشل تحميل سجلات التدقيق.' : 'Failed to load audit logs.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [language, translate]);

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 sm:p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";

  if (isLoading) return <p className="text-center p-4">{translate('loading')}</p>;
  if (error) return <p className="text-center p-4 text-csp-error">{error}</p>;

  return (
    <div className={cardClasses} dir={language}>
      {logs.length === 0 ? (
        <p className="text-center">{translate('noAuditLogs')}</p>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md shadow-sm">
              <div className="flex justify-between items-center text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mb-1">
                <span>{log.userName} ({log.userId.substring(0,6)}...)</span>
                <span>{new Date(log.timestamp.toDate()).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
              </div>
              <p className="text-sm font-medium text-csp-primary-text dark:text-csp-primary-dark-text">{log.action}</p>
              <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mt-0.5 break-all">Details: {log.details}</p>
              {log.targetType && log.targetId && (
                <p className="text-xs text-gray-400 dark:text-gray-500">Target: {log.targetType} ({log.targetId})</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
