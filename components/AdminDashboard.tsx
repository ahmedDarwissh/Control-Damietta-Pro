
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { db, storage } from '../../firebase';
import { User, UserRole, AppConfiguration, AuditLogEntry, EmergencyContact, InternalNewsArticle, FeedbackSubmission, LearningResource, LeaveRequest, Language as AppLanguage } from '../../types';
import firebase from 'firebase/compat/app';
import { 
  addEmergencyContact, getEmergencyContacts, updateEmergencyContact, deleteEmergencyContact,
  addInternalNewsArticle, getInternalNewsArticles, updateInternalNewsArticle, deleteInternalNewsArticle,
  getFeedbackSubmissions, updateFeedbackSubmission,
  addLearningResource, getLearningResources, updateLearningResource, deleteLearningResource,
  getAllLeaveRequests, updateLeaveRequestStatus, uploadFileToStorage, getAuditLogEntries
} from '../../services/firestoreService';
import { EMERGENCY_CONTACT_DEPARTMENTS, INTERNAL_NEWS_CATEGORIES, FEEDBACK_TYPES_LIST } from '../../constants';

const SpinnerIcon: React.FC<{ className?: string }> = ({ className = "animate-spin -ml-1 mr-3 h-5 w-5 text-white" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIconAlert: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
  </svg>
);

const CloudOfflineIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 12.75l1.662-2.905M12.75 12.75L11.412 15.655m1.338-2.905L14.25 12l-1.662-2.905M12.75 12.75L14.25 12M12 12.75L10.338 9.845m1.662 2.905L12 12.75M5.01 16.342a4.495 4.495 0 004.234 2.158h7.512a4.5 4.5 0 004.234-2.158m-16.092-2.96A4.492 4.492 0 014.5 10.5H5.25a2.25 2.25 0 012.25 2.25v.01A4.507 4.507 0 0012 15.75h0a4.507 4.507 0 004.5-3.039v-.01a2.25 2.25 0 012.25-2.25H19.5a4.492 4.492 0 013.48 2.882M3 3l18 18" />
  </svg>
);


const AdminDashboard: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser } = useAuth();
  const { appConfig: currentAppConfig, loadingConfig, errorConfig, refreshConfig } = useAppConfig();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  
  const [configForm, setConfigForm] = useState<Partial<AppConfiguration>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loadingEmergencyContacts, setLoadingEmergencyContacts] = useState(true);
  const [editingEmergencyContact, setEditingEmergencyContact] = useState<EmergencyContact | null>(null);
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
  const [ecName, setEcName] = useState('');
  const [ecNumber, setEcNumber] = useState('');
  const [ecDepartment, setEcDepartment] = useState(EMERGENCY_CONTACT_DEPARTMENTS[0]?.id || 'safety');
  const [ecDescription, setEcDescription] = useState('');

  const [internalNews, setInternalNews] = useState<InternalNewsArticle[]>([]);
  const [loadingInternalNews, setLoadingInternalNews] = useState(true);
  const [editingNewsArticle, setEditingNewsArticle] = useState<InternalNewsArticle | null>(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState(INTERNAL_NEWS_CATEGORIES[0]?.id || 'announcements');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsIsPinned, setNewsIsPinned] = useState(false);

  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [loadingLearningResources, setLoadingLearningResources] = useState(true);
  const [editingLearningResource, setEditingLearningResource] = useState<LearningResource | null>(null);
  const [showLearningResourceForm, setShowLearningResourceForm] = useState(false);
  const [lrTitle, setLrTitle] = useState('');
  const [lrDescription, setLrDescription] = useState('');
  const [lrType, setLrType] = useState<'link' | 'document' | 'video'>('link');
  const [lrUrl, setLrUrl] = useState('');
  const [lrFile, setLrFile] = useState<File | null>(null);
  const [lrCategory, setLrCategory] = useState('');
  const [lrFilePathOrURL, setLrFilePathOrURL] = useState<string>('');
  const fileInputRefLr = useRef<HTMLInputElement>(null);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(true);

  useEffect(() => {
    if (currentUser?.role === UserRole.ADMIN) {
      const fetchData = async () => {
        setLoadingUsers(true);
        db.collection('users').orderBy('createdAt', 'desc').get()
          .then(snapshot => setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User))))
          .catch(error => console.error("Error fetching users:", error))
          .finally(() => setLoadingUsers(false));

        setLoadingLogs(true);
        getAuditLogEntries().then(setAuditLogs).catch(error => console.error("Error fetching audit logs:", error)).finally(() => setLoadingLogs(false));
        
        setLoadingEmergencyContacts(true);
        getEmergencyContacts().then(setEmergencyContacts).catch(error => console.error("Error fetching emergency contacts:", error)).finally(() => setLoadingEmergencyContacts(false));

        setLoadingInternalNews(true);
        getInternalNewsArticles().then(setInternalNews).catch(error => console.error("Error fetching internal news:", error)).finally(() => setLoadingInternalNews(false));

        setLoadingFeedback(true);
        getFeedbackSubmissions().then(setFeedbackSubmissions).catch(error => console.error("Error fetching feedback:", error)).finally(() => setLoadingFeedback(false));
        
        setLoadingLearningResources(true);
        getLearningResources().then(setLearningResources).catch(error => console.error("Error fetching learning resources:", error)).finally(() => setLoadingLearningResources(false));

        setLoadingLeaveRequests(true);
        getAllLeaveRequests().then(setLeaveRequests).catch(error => console.error("Error fetching leave requests:", error)).finally(() => setLoadingLeaveRequests(false));
      };
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => { if (currentAppConfig) setConfigForm(currentAppConfig); }, [currentAppConfig]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (window.confirm(translate('confirmRoleChangeMsg', translate(newRole.toLowerCase() as any)))) {
      try {
        await db.collection('users').doc(userId).update({ role: newRole, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        setUsers(prev => prev.map(u => u.uid === userId ? {...u, role: newRole} : u));
      } catch (error) { console.error("Error updating user role:", error); alert('Failed to update user role.'); }
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfigForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSaveAppConfig = async (e: FormEvent) => {
    e.preventDefault(); setSavingConfig(true); setConfigMessage(null);
    try {
      const configToSave = { ...configForm };
      const featureToggleKeys: (keyof AppConfiguration)[] = ['isShiftButlerEnabled', 'isSavingsPoolEnabled', 'isEntertainmentEnabled', 'isEquipmentLogEnabled', 'isSafetyChecklistEnabled', 'isEmergencyContactsEnabled', 'isUnitConverterEnabled', 'isDocumentViewerEnabled', 'isInternalNewsEnabled', 'isFeedbackEnabled', 'isUserGuideEnabled', 'isPomodoroEnabled', 'isLeaveRequestsEnabled', 'isNoteTakingEnabled', 'isLearningResourcesEnabled', 'isPersonalExpensesEnabled', 'isGoalSettingEnabled', 'isAdvancedCalculatorEnabled', 'isKanbanBoardEnabled', 'isDocumentScannerEnabled', 'isDataExportImportEnabled', 'isUserDirectoryEnabled', 'isPersonalCalendarEnabled', 'isAuditLogEnabled', 'isTaskTemplatesEnabled', 'isShoppingListEnabled'];
      featureToggleKeys.forEach(key => { if (configToSave[key] === undefined) configToSave[key] = false; });
      await db.collection('appSettings').doc('globalConfig').set(configToSave, { merge: true });
      setConfigMessage({ type: 'success', text: translate('settingsSaved') });
      await refreshConfig();
    } catch (error: any) { setConfigMessage({ type: 'error', text: translate('errorSavingSettings') + `: ${error.message}` }); }
    finally { setSavingConfig(false); }
  };

  const handleEmergencyContactSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!ecName || !ecNumber) return;
    const data = { name: ecName, number: ecNumber, department: ecDepartment, description: ecDescription || undefined };
    try {
      if (editingEmergencyContact) {
        await updateEmergencyContact(editingEmergencyContact.id, data);
        setEmergencyContacts(prev => prev.map(c => c.id === editingEmergencyContact.id ? { ...c, ...data } : c));
      } else {
        const newContact = await addEmergencyContact(data);
        setEmergencyContacts(prev => [newContact, ...prev]);
      }
      resetEmergencyContactForm();
    } catch (error) { console.error("Error saving emergency contact:", error); }
  };
  const resetEmergencyContactForm = () => {
    setEditingEmergencyContact(null); setShowEmergencyContactForm(false);
    setEcName(''); setEcNumber(''); setEcDepartment(EMERGENCY_CONTACT_DEPARTMENTS[0]?.id || 'safety'); setEcDescription('');
  };
  const handleEditEmergencyContact = (contact: EmergencyContact) => {
    setEditingEmergencyContact(contact); setShowEmergencyContactForm(true);
    setEcName(contact.name); setEcNumber(contact.number); setEcDepartment(contact.department); setEcDescription(contact.description || '');
  };
  const handleDeleteEmergencyContact = async (contactId: string) => {
    if (window.confirm(translate('confirmDeleteContact'))) {
      try { await deleteEmergencyContact(contactId); setEmergencyContacts(prev => prev.filter(c => c.id !== contactId)); } 
      catch (error) { console.error("Error deleting contact:", error); }
    }
  };

  const handleNewsSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!newsTitle || !newsContent || !currentUser) return;
    const data = { title: newsTitle, content: newsContent, category: newsCategory, imageUrl: newsImageUrl || undefined, isPinned: newsIsPinned, authorName: currentUser.name, authorUid: currentUser.uid };
    try {
      if (editingNewsArticle) {
        await updateInternalNewsArticle(editingNewsArticle.id, data);
        setInternalNews(prev => prev.map(n => n.id === editingNewsArticle.id ? { ...n, ...data, updatedAt: firebase.firestore.Timestamp.now() } : n));
      } else {
        const newArticle = await addInternalNewsArticle(data);
        setInternalNews(prev => [newArticle, ...prev]);
      }
      resetNewsForm();
    } catch (error) { console.error("Error saving news article:", error); }
  };
  const resetNewsForm = () => {
    setEditingNewsArticle(null); setShowNewsForm(false);
    setNewsTitle(''); setNewsContent(''); setNewsCategory(INTERNAL_NEWS_CATEGORIES[0]?.id || 'announcements'); setNewsImageUrl(''); setNewsIsPinned(false);
  };
  const handleEditNewsArticle = (article: InternalNewsArticle) => {
    setEditingNewsArticle(article); setShowNewsForm(true);
    setNewsTitle(article.title); setNewsContent(article.content); setNewsCategory(article.category || INTERNAL_NEWS_CATEGORIES[0]?.id || 'announcements'); setNewsImageUrl(article.imageUrl || ''); setNewsIsPinned(article.isPinned || false);
  };
  const handleDeleteNewsArticle = async (articleId: string) => {
    if (window.confirm(translate('confirmDeleteNews'))) {
      try { await deleteInternalNewsArticle(articleId); setInternalNews(prev => prev.filter(n => n.id !== articleId)); } 
      catch (error) { console.error("Error deleting news article:", error); }
    }
  };
  
  const handleUpdateFeedbackStatus = async (feedbackId: string, newStatus: FeedbackSubmission['status']) => {
    try {
      await updateFeedbackSubmission(feedbackId, {status: newStatus, isRead: true});
      setFeedbackSubmissions(prev => prev.map(f => f.id === feedbackId ? {...f, status: newStatus, isRead: true} : f));
    } catch (error) { console.error("Error updating feedback status:", error); }
  };

  const handleLrFileChange = (e: ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files && e.target.files[0]) {
        setLrFile(e.target.files[0]); 
        setLrFilePathOrURL(e.target.files[0].name); 
    }
  };

  const handleLearningResourceSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!lrTitle || !currentUser) return;
    
    let newFilePathOrURLValue: string | undefined = lrType === 'link' ? lrUrl : undefined;
    let newFileNameValue: string | undefined = lrType === 'link' ? undefined : editingLearningResource?.fileName;
    let newFileTypeValue: string | undefined = lrType === 'link' ? undefined : editingLearningResource?.fileType;

    if (lrType !== 'link') { // lrType is 'document' or 'video'
        if (lrFile) { // New file uploaded or file being changed
            try {
                const storagePath = `learningResources/${currentUser.uid}/${Date.now()}_${lrFile.name}`;
                newFilePathOrURLValue = await uploadFileToStorage(lrFile, storagePath);
                newFileNameValue = lrFile.name;
                newFileTypeValue = lrFile.type;
            } catch (error) { console.error("Error uploading LR file:", error); alert("File upload failed."); return; }
        } else if (editingLearningResource && editingLearningResource.filePath && (editingLearningResource.type === 'document' || editingLearningResource.type === 'video')) {
            // Keep existing file path if type is still document/video and no new file is uploaded
            newFilePathOrURLValue = editingLearningResource.filePath;
        } else if (!editingLearningResource && (lrType === 'document' || lrType === 'video')) {
             // New resource of type document/video, but no file provided
            alert("File is required for document or video type when creating a new resource.");
            return;
        }
    }

    const data: Omit<LearningResource, 'id' | 'createdAt'> = { 
        title: lrTitle, description: lrDescription || undefined, type: lrType, 
        addedByUid: currentUser.uid, addedByName: currentUser.name, category: lrCategory || undefined,
        url: lrType === 'link' ? newFilePathOrURLValue : undefined, 
        filePath: lrType !== 'link' ? newFilePathOrURLValue : undefined, 
        fileName: newFileNameValue,
        fileType: newFileTypeValue,
    };

    try {
      if (editingLearningResource) {
        const originalResourceType = editingLearningResource.type;
        const originalResourceHadFile = !!editingLearningResource.filePath;
        
        let shouldDeleteOldStorageFile = false;
        
        if (originalResourceHadFile) {
            if (lrType === 'link') { // Changed from file to link
                shouldDeleteOldStorageFile = true;
            } else if (lrFile) { // New file uploaded, replacing old one (even if type is same)
                 shouldDeleteOldStorageFile = true;
            }
        }

        if (shouldDeleteOldStorageFile && editingLearningResource.filePath) {
            try { 
                const oldFileRef = storage.refFromURL(editingLearningResource.filePath); 
                await oldFileRef.delete(); 
            } catch (delError: any) { 
                 if (delError.code !== 'storage/object-not-found') { // Don't warn if already deleted or path was wrong
                    console.warn("Old learning resource file deletion failed:", delError); 
                 }
            }
        }
        
        await updateLearningResource(editingLearningResource.id, data);
        setLearningResources(prev => prev.map(r => r.id === editingLearningResource.id ? { ...editingLearningResource, ...data, createdAt: editingLearningResource.createdAt } : r));
      } else {
        const newResource = await addLearningResource(data);
        setLearningResources(prev => [newResource, ...prev]);
      }
      resetLearningResourceForm();
    } catch (error) { console.error("Error saving learning resource:", error); }
  };

  const resetLearningResourceForm = () => {
    setEditingLearningResource(null); setShowLearningResourceForm(false);
    setLrTitle(''); setLrDescription(''); setLrType('link'); setLrUrl(''); setLrFile(null); setLrCategory('');
    setLrFilePathOrURL('');
    if(fileInputRefLr.current) fileInputRefLr.current.value = "";
  };
  const handleEditLearningResource = (resource: LearningResource) => {
    setEditingLearningResource(resource); setShowLearningResourceForm(true);
    setLrTitle(resource.title); setLrDescription(resource.description || ''); setLrType(resource.type);
    setLrUrl(resource.url || ''); 
    setLrFilePathOrURL(resource.filePath || resource.url || ''); 
    setLrFile(null); 
    if(fileInputRefLr.current) fileInputRefLr.current.value = "";
    setLrCategory(resource.category || '');
  };
  const handleDeleteLearningResource = async (resource: LearningResource) => {
    if (window.confirm(translate('confirmDeleteResource'))) {
      try { await deleteLearningResource(resource.id, resource.filePath); setLearningResources(prev => prev.filter(r => r.id !== resource.id)); } 
      catch (error) { console.error("Error deleting learning resource:", error); }
    }
  };

  const handleLeaveRequestReview = async (requestId: string, newStatus: LeaveRequest['status']) => {
    if (!currentUser) return;
    try {
      await updateLeaveRequestStatus(requestId, newStatus, currentUser.uid, currentUser.name);
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus, reviewedBy: currentUser.uid, reviewedByName: currentUser.name, reviewedAt: firebase.firestore.Timestamp.now() } : req));
    } catch (error) { console.error("Error updating leave request:", error); }
  };

  if (!currentUser || currentUser.role !== UserRole.ADMIN) return <div className="p-6 text-center text-lg text-csp-error bg-red-500/10 rounded-xl">Access Denied.</div>;

  const inputBaseClasses: string = "mt-1 block w-full px-3 py-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-primary dark:bg-csp-secondary-dark-bg text-csp-primary-text dark:text-csp-primary-dark-text transition-all duration-150";
  const labelBaseClasses: string = "block text-sm font-medium text-csp-primary-text dark:text-csp-primary-dark-text mb-1";
  const sectionCardClassesLocal: string = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 sm:p-6 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10"; 
  const titleClasses: string = `text-xl font-bold text-csp-primary-text dark:text-csp-primary-dark-text mb-4 pb-2 border-b-2 border-csp-accent dark:border-csp-accent-dark ${language === AppLanguage.AR ? 'text-right font-cairo' : 'text-left font-poppins'}`;
  const buttonClasses: string = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150 flex items-center justify-center";
  const primaryButtonClasses: string = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;
  const secondaryButtonClasses: string = `${buttonClasses} bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-opacity-80`;

  const allFeatureToggles = [
    {key: 'isShiftButlerEnabled', labelKey: 'butler'}, {key: 'isSavingsPoolEnabled', labelKey: 'savings'},
    {key: 'isEntertainmentEnabled', labelKey: 'entertainment'}, {key: 'isEquipmentLogEnabled', labelKey: 'equipmentLog'},
    {key: 'isSafetyChecklistEnabled', labelKey: 'safetyChecklist'}, {key: 'isEmergencyContactsEnabled', labelKey: 'emergencyContacts'},
    {key: 'isUnitConverterEnabled', labelKey: 'unitConverter'}, {key: 'isDocumentViewerEnabled', labelKey: 'documentViewer'},
    {key: 'isInternalNewsEnabled', labelKey: 'internalNews'}, {key: 'isFeedbackEnabled', labelKey: 'feedback'},
    {key: 'isUserGuideEnabled', labelKey: 'userGuide'}, {key: 'isPomodoroEnabled', labelKey: 'pomodoroTimer'},
    {key: 'isLeaveRequestsEnabled', labelKey: 'leaveRequests'}, {key: 'isNoteTakingEnabled', labelKey: 'noteTaking'},
    {key: 'isLearningResourcesEnabled', labelKey: 'learningResources'}, {key: 'isPersonalExpensesEnabled', labelKey: 'personalExpenses'},
    {key: 'isGoalSettingEnabled', labelKey: 'goalSetting'}, {key: 'isAdvancedCalculatorEnabled', labelKey: 'advancedCalculator'},
    {key: 'isKanbanBoardEnabled', labelKey: 'kanbanBoard'}, {key: 'isDocumentScannerEnabled', labelKey: 'documentScanner'},
    {key: 'isDataExportImportEnabled', labelKey: 'dataExportImport'},
    {key: 'isUserDirectoryEnabled', labelKey: 'userDirectory'},
    {key: 'isPersonalCalendarEnabled', labelKey: 'personalCalendar'},
    {key: 'isAuditLogEnabled', labelKey: 'auditLog'},
    {key: 'isTaskTemplatesEnabled', labelKey: 'taskTemplates'},
    {key: 'isShoppingListEnabled', labelKey: 'shoppingList'},
  ];

  return (
    <div className="space-y-8" dir={language === AppLanguage.AR ? 'rtl' : 'ltr'}>
      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('appSettings')}</h2>
        {loadingConfig && <p>{translate('loading')}...</p>}
        
        {errorConfig && (
          <div className={`text-sm p-3 rounded-md flex items-start mb-4 ${
            errorConfig.toLowerCase().includes('offline') 
            ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30' 
            : 'bg-csp-error/10 text-red-700 dark:text-red-400 border border-red-500/30'
          }`}>
            {errorConfig.toLowerCase().includes('offline') 
              ? <CloudOfflineIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0 mt-0.5" /> 
              : <ExclamationTriangleIconAlert className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0 mt-0.5" />
            }
            <span>{errorConfig}</span>
          </div>
        )}

        {!loadingConfig && currentAppConfig && (
          <form onSubmit={handleSaveAppConfig} className="space-y-6">
            <div>
              <label htmlFor="quranRadioUrl" className={labelBaseClasses}>{translate('quranRadioUrlLabel')}</label>
              <input type="url" name="quranRadioUrl" id="quranRadioUrl" value={configForm.quranRadioUrl || ''} onChange={handleConfigChange} className={inputBaseClasses} />
            </div>
            <h3 className={`text-lg font-semibold mt-6 mb-3 ${language === AppLanguage.AR ? 'font-cairo' : 'font-poppins'}`}>{translate('featureToggles')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFeatureToggles.map(feature => (
                    <div key={feature.key} className="flex items-center justify-between p-3 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md">
                        <label htmlFor={feature.key} className="text-sm text-csp-primary-text dark:text-csp-primary-dark-text flex-grow mr-2 rtl:ml-2 rtl:mr-0">
                          {translate(feature.labelKey as any)}
                        </label>
                        <input type="checkbox" name={feature.key} id={feature.key} checked={configForm[feature.key as keyof AppConfiguration] === true} onChange={handleConfigChange} className="form-checkbox h-5 w-5 text-csp-accent dark:text-csp-accent-dark rounded focus:ring-csp-accent dark:focus:ring-csp-accent-dark bg-transparent border-csp-secondary-text/40 flex-shrink-0"/>
                    </div>
                ))}
            </div>
            <button type="submit" disabled={savingConfig} className={`${primaryButtonClasses} w-full mt-6`}>
              {savingConfig && <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />}
              {savingConfig ? translate('loading') : translate('saveAppSettings')}
            </button>
            {configMessage && (
              <div className={`mt-4 text-sm p-3 rounded-md flex items-center ${configMessage.type === 'success' ? 'bg-csp-success/20 text-green-700 dark:text-green-300' : 'bg-csp-error/20 text-red-700 dark:text-red-400'}`}>
                {configMessage.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> : <ExclamationTriangleIconAlert className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />}
                {configMessage.text}
              </div>
            )}
          </form>
        )}
      </section>

      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('userManagementTitle')}</h2>
        {loadingUsers ? <p>{translate('loading')}...</p> : (
          users.length === 0 ? <p>{translate('noUsersFound')}</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-csp-secondary-text/20 dark:divide-csp-primary-dark-text/20">
                <thead className="bg-csp-secondary-bg dark:bg-csp-primary-dark">
                  <tr>
                    <th className="px-4 py-3 text-left rtl:text-right text-xs font-medium text-csp-secondary-text dark:text-csp-secondary-dark-text uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left rtl:text-right text-xs font-medium text-csp-secondary-text dark:text-csp-secondary-dark-text uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left rtl:text-right text-xs font-medium text-csp-secondary-text dark:text-csp-secondary-dark-text uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-csp-primary dark:bg-csp-secondary-dark-bg divide-y divide-csp-secondary-text/10 dark:divide-csp-primary-dark-text/10">
                  {users.map(user => (
                    <tr key={user.uid}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-csp-primary-text dark:text-csp-primary-dark-text">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-csp-primary-text dark:text-csp-primary-dark-text">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <select value={user.role} onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)} className={`${inputBaseClasses} !mt-0 !py-1.5`} disabled={user.uid === currentUser?.uid}>
                            {Object.values(UserRole).map(roleVal => (<option key={roleVal} value={roleVal}>{translate(roleVal.toLowerCase() as any)}</option>))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>
      
      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('emergencyContacts')}</h2>
        <button onClick={() => { setShowEmergencyContactForm(true); setEditingEmergencyContact(null); resetEmergencyContactForm(); }} className={`${primaryButtonClasses} mb-4`}>{translate('addContact')}</button>
        {showEmergencyContactForm && (
          <form onSubmit={handleEmergencyContactSubmit} className="space-y-4 mb-6 p-4 border border-csp-secondary-text/20 rounded-lg">
            <div><label className={labelBaseClasses}>{translate('contactNameLabel')}</label><input type="text" value={ecName} onChange={e => setEcName(e.target.value)} className={inputBaseClasses} required /></div>
            <div><label className={labelBaseClasses}>{translate('contactNumberLabel')}</label><input type="tel" value={ecNumber} onChange={e => setEcNumber(e.target.value)} className={inputBaseClasses} required /></div>
            <div><label className={labelBaseClasses}>{translate('contactDepartmentLabel')}</label>
              <select value={ecDepartment} onChange={e => setEcDepartment(e.target.value)} className={inputBaseClasses}>
                {EMERGENCY_CONTACT_DEPARTMENTS.map(dep => <option key={dep.id} value={dep.id}>{translate(dep.labelKey as any)}</option>)}
              </select>
            </div>
            <div><label className={labelBaseClasses}>{translate('contactDescriptionLabel')}</label><input type="text" value={ecDescription} onChange={e => setEcDescription(e.target.value)} className={inputBaseClasses} /></div>
            <div className="flex space-x-2 rtl:space-x-reverse"><button type="submit" className={primaryButtonClasses}>{editingEmergencyContact ? translate('saveChanges') : translate('saveContact')}</button><button type="button" onClick={resetEmergencyContactForm} className={secondaryButtonClasses}>{translate('cancel')}</button></div>
          </form>
        )}
        {loadingEmergencyContacts ? <p>{translate('loading')}...</p> : emergencyContacts.length === 0 ? <p className="text-sm">{translate('noEmergencyContacts')}</p> : (
          <div className="space-y-2">
            {emergencyContacts.map(contact => (
              <div key={contact.id} className="p-3 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md flex justify-between items-center">
                <div><p className="font-semibold">{contact.name} ({translate(EMERGENCY_CONTACT_DEPARTMENTS.find(d=>d.id===contact.department)?.labelKey as any || contact.department)})</p><p className="text-sm">{contact.number}</p>{contact.description && <p className="text-xs italic">{contact.description}</p>}</div>
                <div className="space-x-2 rtl:space-x-reverse"><button onClick={() => handleEditEmergencyContact(contact)} className="text-blue-500 hover:underline text-xs">✏️</button><button onClick={() => handleDeleteEmergencyContact(contact.id)} className="text-red-500 hover:underline text-xs">🗑️</button></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('internalNews')}</h2>
        <button onClick={() => { setShowNewsForm(true); setEditingNewsArticle(null); resetNewsForm();}} className={`${primaryButtonClasses} mb-4`}>{translate('addNewsArticle')}</button>
        {showNewsForm && (
            <form onSubmit={handleNewsSubmit} className="space-y-4 mb-6 p-4 border border-csp-secondary-text/20 rounded-lg">
                <div><label className={labelBaseClasses}>{translate('newsTitleLabel')}</label><input type="text" value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} className={inputBaseClasses} required/></div>
                <div><label className={labelBaseClasses}>{translate('newsContentLabel')}</label><textarea value={newsContent} onChange={e=>setNewsContent(e.target.value)} className={`${inputBaseClasses} min-h-[100px]`} required/></div>
                <div><label className={labelBaseClasses}>{translate('newsCategoryLabel')}</label>
                    <select value={newsCategory} onChange={e=>setNewsCategory(e.target.value)} className={inputBaseClasses}>
                        {INTERNAL_NEWS_CATEGORIES.map(cat=><option key={cat.id} value={cat.id}>{translate(cat.labelKey as any)}</option>)}
                    </select>
                </div>
                <div><label className={labelBaseClasses}>Image URL (Optional)</label><input type="url" value={newsImageUrl} onChange={e=>setNewsImageUrl(e.target.value)} className={inputBaseClasses}/></div>
                <div className="flex items-center"><input type="checkbox" checked={newsIsPinned} onChange={e=>setNewsIsPinned(e.target.checked)} id="newsIsPinned" className="form-checkbox h-4 w-4 text-csp-accent mr-2 rtl:ml-2 rtl:mr-0"/><label htmlFor="newsIsPinned" className="text-sm">Pin to top?</label></div>
                <div className="flex space-x-2 rtl:space-x-reverse"><button type="submit" className={primaryButtonClasses}>{editingNewsArticle ? translate('saveNewsChanges') : translate('publishNews')}</button><button type="button" onClick={resetNewsForm} className={secondaryButtonClasses}>{translate('cancel')}</button></div>
            </form>
        )}
        {loadingInternalNews ? <p>{translate('loading')}...</p> : internalNews.length === 0 ? <p className="text-sm">{translate('noNewsArticles')}</p> : (
            <div className="space-y-3">
                {internalNews.map(article=>(
                    <div key={article.id} className="p-3 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md">
                        <div className="flex justify-between items-start">
                            <div><h3 className="font-semibold">{article.title} {article.isPinned && "📌"}</h3><p className="text-xs text-gray-500">By {article.authorName} on {new Date(article.publishedAt.toDate()).toLocaleDateString()}</p></div>
                            <div className="space-x-2 rtl:space-x-reverse flex-shrink-0"><button onClick={()=>handleEditNewsArticle(article)} className="text-blue-500 hover:underline text-xs">✏️</button><button onClick={()=>handleDeleteNewsArticle(article.id)} className="text-red-500 hover:underline text-xs">🗑️</button></div>
                        </div>
                        <p className="text-sm mt-1 truncate">{article.content.substring(0,100)}...</p>
                    </div>
                ))}
            </div>
        )}
      </section>

      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('manageLearningResources')}</h2>
        <button onClick={() => { setShowLearningResourceForm(true); setEditingLearningResource(null); resetLearningResourceForm(); }} className={`${primaryButtonClasses} mb-4`}>{translate('addResource')}</button>
        {showLearningResourceForm && (
          <form onSubmit={handleLearningResourceSubmit} className="space-y-4 mb-6 p-4 border border-csp-secondary-text/20 rounded-lg">
            <div><label className={labelBaseClasses}>{translate('resourceTitleLabel')}</label><input type="text" value={lrTitle} onChange={e => setLrTitle(e.target.value)} className={inputBaseClasses} required /></div>
            <div><label className={labelBaseClasses}>{translate('resourceDescriptionLabel')}</label><textarea value={lrDescription} onChange={e => setLrDescription(e.target.value)} className={`${inputBaseClasses} min-h-[80px]`} /></div>
            <div><label className={labelBaseClasses}>{translate('resourceTypeLabel')}</label>
              <select value={lrType} onChange={e => { setLrType(e.target.value as any); setLrUrl(''); setLrFile(null); if(fileInputRefLr.current) fileInputRefLr.current.value = "";}} className={inputBaseClasses}>
                <option value="link">{translate('resourceTypeLink')}</option><option value="document">{translate('resourceTypeDocument')}</option><option value="video">{translate('resourceTypeVideo')}</option>
              </select>
            </div>
            {lrType === 'link' && <div><label className={labelBaseClasses}>{translate('resourceUrlLabel')}</label><input type="url" value={lrUrl} onChange={e => setLrUrl(e.target.value)} className={inputBaseClasses} /></div>}
            {lrType !== 'link' && <div><label className={labelBaseClasses}>{translate('resourceFileLabel')}</label><input type="file" ref={fileInputRefLr} onChange={handleLrFileChange} className={inputBaseClasses} />
              {editingLearningResource?.filePath && !lrFile && (editingLearningResource.type === 'document' || editingLearningResource.type === 'video') && <p className="text-xs mt-1">Current: <a href={editingLearningResource.filePath} target="_blank" rel="noopener noreferrer" className="text-csp-accent hover:underline">{editingLearningResource.fileName || 'View File'}</a></p>}
            </div>}
            <div><label className={labelBaseClasses}>{translate('resourceCategoryLabel')}</label><input type="text" value={lrCategory} onChange={e => setLrCategory(e.target.value)} className={inputBaseClasses} /></div>
            <div className="flex space-x-2 rtl:space-x-reverse"><button type="submit" className={primaryButtonClasses}>{editingLearningResource ? translate('saveChanges') : translate('addResource')}</button><button type="button" onClick={resetLearningResourceForm} className={secondaryButtonClasses}>{translate('cancel')}</button></div>
          </form>
        )}
        {loadingLearningResources ? <p>{translate('loading')}...</p> : learningResources.length === 0 ? <p className="text-sm">{translate('noLearningResources')}</p> : (
          <div className="space-y-2">
            {learningResources.map(res => (
              <div key={res.id} className="p-3 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md">
                <div className="flex justify-between items-start">
                  <div><p className="font-semibold">{res.title} <span className="text-xs text-gray-400">({res.type})</span></p>{res.description && <p className="text-sm italic">{res.description}</p>}</div>
                  <div className="space-x-2 rtl:space-x-reverse flex-shrink-0"><button onClick={() => handleEditLearningResource(res)} className="text-blue-500 hover:underline text-xs">✏️</button><button onClick={() => handleDeleteLearningResource(res)} className="text-red-500 hover:underline text-xs">🗑️</button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('manageLeaveRequests')}</h2>
        {loadingLeaveRequests ? <p>{translate('loading')}...</p> : leaveRequests.length === 0 ? <p className="text-sm">{translate('noLeaveRequests')}</p> : (
          <div className="space-y-3">
            {leaveRequests.map(req => (
              <div key={req.id} className={`p-3 rounded-md border-l-4 rtl:border-r-4 rtl:border-l-0 ${req.status === 'pending' ? 'border-yellow-500 bg-yellow-500/10' : req.status === 'approved' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                <p className="font-semibold">{req.userName}</p>
                <p className="text-sm my-0.5">{translate('leaveStartDateLabel')}: {req.startDate}</p>
                <p className="text-sm my-0.5">{translate('leaveEndDateLabel')}: {req.endDate}</p>
                <p className="text-sm my-0.5">{translate('leaveReasonLabel')}: {req.reason}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{translate('leaveStatusLabel')}: <span className="font-medium">{translate(`status${req.status.charAt(0).toUpperCase() + req.status.slice(1)}` as any)}</span></p>
                {req.status === 'pending' && (
                  <div className="mt-2 space-x-2 rtl:space-x-reverse">
                    <button onClick={() => handleLeaveRequestReview(req.id, 'approved')} className={`${buttonClasses} bg-green-500 text-white`}>{translate('approveLeave')}</button>
                    <button onClick={() => handleLeaveRequestReview(req.id, 'rejected')} className={`${buttonClasses} bg-red-500 text-white`}>{translate('rejectLeave')}</button>
                  </div>
                )}
                {req.reviewedBy && <p className="text-xs mt-1 text-gray-400">Reviewed by: {req.reviewedByName} on {req.reviewedAt?.toDate().toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('feedback')}</h2>
        {loadingFeedback ? <p>{translate('loading')}...</p> : feedbackSubmissions.length === 0 ? <p className="text-sm">{translate('noFeedbackFound')}</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {feedbackSubmissions.map(fb=>(
                    <div key={fb.id} className={`p-3 rounded-md ${fb.isRead ? 'bg-csp-secondary-bg/50 dark:bg-csp-primary-dark/50' : 'bg-csp-secondary-bg dark:bg-csp-primary-dark border-l-2 border-csp-accent'}`}>
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-sm">Feedback from: {fb.userName || fb.email || 'Anonymous'} ({translate(FEEDBACK_TYPES_LIST.find(f=>f.id===fb.type)?.labelKey as any || fb.type)})</h3>
                            <span className="text-xs text-gray-500">{new Date(fb.submittedAt.toDate()).toLocaleString()}</span>
                        </div>
                        <p className="text-sm mt-1">{fb.message}</p>
                        {fb.pageContext && <p className="text-xs text-gray-400">Context: {fb.pageContext}</p>}
                         <div className="mt-2 text-xs flex items-center space-x-2 rtl:space-x-reverse">
                            <span>Status:</span>
                            <select value={fb.status || 'new'} onChange={e => handleUpdateFeedbackStatus(fb.id, e.target.value as FeedbackSubmission['status'])} className={`${inputBaseClasses} !mt-0 !py-1 !px-1.5 text-xs w-auto`}>
                                <option value="new">{translate('statusNew')}</option>
                                <option value="in_progress">{translate('statusInProgress')}</option>
                                <option value="resolved">{translate('statusResolved')}</option>
                                <option value="archived">{translate('statusArchived')}</option>
                            </select>
                            {!fb.isRead && <button onClick={() => updateFeedbackSubmission(fb.id, {isRead: true})} className="text-blue-500 hover:underline">Mark Read</button>}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

      <section className={sectionCardClassesLocal}>
        <h2 className={titleClasses}>{translate('auditLog')}</h2>
        {loadingLogs ? <p>{translate('loading')}...</p> : (
            auditLogs.length === 0 ? <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('noAuditLogs')}</p> : (
                <div className="max-h-96 overflow-y-auto text-xs">
                    {auditLogs.map(log => (
                        <div key={log.id} className="p-2 border-b border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
                            <p><strong>{log.userName}</strong> ({new Date(log.timestamp.toDate()).toLocaleString()})</p>
                            <p>{log.action}: {log.details}</p>
                        </div>
                    ))}
                </div>
            )
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
