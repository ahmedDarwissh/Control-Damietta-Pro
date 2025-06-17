
import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { TaskTemplate, TaskPriority, TaskCategory, SubTask } from '../../types';
import { addTaskTemplate, getTaskTemplatesForUser, updateTaskTemplate, deleteTaskTemplate } from '../../services/firestoreService';
import { TASK_PRIORITIES_LIST, TASK_CATEGORIES_LIST } from '../../constants';
import firebase from 'firebase/compat/app';

const TaskTemplatesPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templatePriority, setTemplatePriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [templateCategory, setTemplateCategory] = useState<TaskCategory>(TaskCategory.GENERAL);
  const [templateEstTime, setTemplateEstTime] = useState<string>(''); 
  const [templateSubTasks, setTemplateSubTasks] = useState<Omit<SubTask, 'id' | 'isCompleted'>[]>([]);
  const [currentSubTaskText, setCurrentSubTaskText] = useState('');

  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);

  const sortTemplatesLogic = (templateArray: TaskTemplate[]): TaskTemplate[] => {
    return [...templateArray].sort((a, b) => {
      const priorityOrder = { [TaskPriority.HIGH]: 1, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 3 };
      const priorityA = priorityOrder[a.priority || TaskPriority.MEDIUM];
      const priorityB = priorityOrder[b.priority || TaskPriority.MEDIUM];
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
  
      // Handle undefined estimatedTime for sorting, ensuring numerical comparison.
      // Treats undefined as a very large number to sort them last in an ascending sort by time.
      const timeA = a.estimatedTime !== undefined ? a.estimatedTime : Number.MAX_SAFE_INTEGER;
      const timeB = b.estimatedTime !== undefined ? b.estimatedTime : Number.MAX_SAFE_INTEGER;
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      
      return a.name.localeCompare(b.name); // Then by name
    });
  };


  useEffect(() => {
    if (currentUser) {
      const fetchTemplates = async () => {
        setIsLoading(true);
        try {
          const userTemplates = await getTaskTemplatesForUser(currentUser.uid);
          setTemplates(sortTemplatesLogic(userTemplates));
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching task templates:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const resetForm = () => {
    setTemplateName(''); setTemplateDesc(''); setTemplatePriority(TaskPriority.MEDIUM);
    setTemplateCategory(TaskCategory.GENERAL); setTemplateEstTime(''); setTemplateSubTasks([]);
    setCurrentSubTaskText(''); setEditingTemplate(null); setShowForm(false);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDesc(template.description);
    setTemplatePriority(template.priority || TaskPriority.MEDIUM);
    setTemplateCategory(template.category || TaskCategory.GENERAL);
    setTemplateEstTime(template.estimatedTime !== undefined ? String(template.estimatedTime) : ''); 
    setTemplateSubTasks(template.subTasks || []);
    setShowForm(true);
  };

  const handleSubmitTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !templateName.trim() || !templateDesc.trim()) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    
    let finalEstTime: number | undefined = undefined;
    const trimmedEstTime = templateEstTime.trim();
    if (trimmedEstTime !== '') {
        const parsed = parseFloat(trimmedEstTime);
        if (!isNaN(parsed)) {
            finalEstTime = parsed;
        }
    }

    const templateDataPayload = { // Renamed to avoid conflict with TaskTemplate type
      name: templateName,
      description: templateDesc,
      priority: templatePriority,
      category: templateCategory,
      estimatedTime: finalEstTime,
      subTasks: templateSubTasks,
      // createdBy is set in service or here if editingTemplate is null
    };
    
    setIsLoading(true);
    try {
      if (editingTemplate) {
        const updateData = { ...templateDataPayload, createdBy: editingTemplate.createdBy }; // Ensure createdBy is preserved
        await updateTaskTemplate(editingTemplate.id, updateData);
        setTemplates(prev => sortTemplatesLogic(prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...updateData } : t)));
      } else {
        const newTemplate = await addTaskTemplate({ ...templateDataPayload, createdBy: currentUser.uid });
        setTemplates(prev => sortTemplatesLogic([newTemplate, ...prev]));
      }
      resetForm();
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error saving task template:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm(translate('confirmDeleteTemplate'))) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    setIsLoading(true);
    try {
      await deleteTaskTemplate(templateId);
      setTemplates(prev => sortTemplatesLogic(prev.filter(t => t.id !== templateId)));
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error deleting task template:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddSubTaskToTemplate = () => {
    if (currentSubTaskText.trim()) {
      // For TaskTemplate, subTasks don't need id or isCompleted initially
      setTemplateSubTasks([...templateSubTasks, { text: currentSubTaskText }]);
      setCurrentSubTaskText('');
    }
  };

  const handleRemoveSubTaskFromTemplate = (index: number) => {
    setTemplateSubTasks(templateSubTasks.filter((_, i) => i !== index));
  };


  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className={`${primaryButtonClasses} w-full`}>
        {showForm ? translate('cancel') : translate('addTemplate')}
      </button>

      {showForm ? (
        <form onSubmit={handleSubmitTemplate} className={`${cardClasses} space-y-4`}>
          <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>{editingTemplate ? translate('editTemplate') : translate('addTemplate')}</h3>
          <div><label htmlFor="templateName" className={labelBaseClasses}>{translate('templateNameLabel')}</label><input type="text" id="templateName" value={templateName} onChange={e => setTemplateName(e.target.value)} className={inputBaseClasses} required /></div>
          <div><label htmlFor="templateDesc" className={labelBaseClasses}>{translate('taskDescription')}</label><textarea id="templateDesc" value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} className={`${inputBaseClasses} min-h-[80px]`} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="templatePriority" className={labelBaseClasses}>{translate('taskPriority')}</label>
                <select id="templatePriority" value={templatePriority} onChange={e => setTemplatePriority(e.target.value as TaskPriority)} className={inputBaseClasses}>
                    {TASK_PRIORITIES_LIST.map(p => <option key={p.id} value={p.id}>{translate(p.labelKey as any)}</option>)}
                </select>
            </div>
            <div><label htmlFor="templateCategory" className={labelBaseClasses}>{translate('taskCategory')}</label>
                <select id="templateCategory" value={templateCategory} onChange={e => setTemplateCategory(e.target.value as TaskCategory)} className={inputBaseClasses}>
                    {TASK_CATEGORIES_LIST.map(c => <option key={c.id} value={c.id}>{translate(c.labelKey as any)}</option>)}
                </select>
            </div>
          </div>
          <div>
            <label htmlFor="templateEstTime" className={labelBaseClasses}>{translate('taskEstTime')}</label>
            <input
              type="number"
              id="templateEstTime"
              value={templateEstTime} 
              onChange={e => setTemplateEstTime(e.target.value)}
              className={inputBaseClasses}
              placeholder="e.g., 30"
              min="0"
            />
          </div>
          <div>
            <label className={labelBaseClasses}>{translate('taskSubTasks')}</label>
            <div className="space-y-2">
              {templateSubTasks.map((st, index) => (
                <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse bg-csp-secondary-bg dark:bg-csp-primary-dark p-2 rounded">
                  <span className={`flex-grow text-sm text-csp-primary-text dark:text-csp-primary-dark-text`}>{st.text}</span>
                  <button type="button" onClick={() => handleRemoveSubTaskFromTemplate(index)} className="text-csp-error hover:text-red-700 text-xs px-1">{translate('delete')}</button>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-2 space-x-2 rtl:space-x-reverse">
              <input type="text" value={currentSubTaskText} onChange={e => setCurrentSubTaskText(e.target.value)} placeholder={translate('addSubTask')} className={`${inputBaseClasses} flex-grow !mt-0`} />
              <button type="button" onClick={handleAddSubTaskToTemplate} className="py-2 px-3 bg-csp-secondary dark:bg-csp-secondary-dark-text text-white text-xs rounded-md hover:bg-opacity-80">+</button>
            </div>
          </div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>{isLoading ? translate('loading') : (editingTemplate ? translate('saveChanges') : translate('addTemplate'))}</button>
        </form>
      ) : null}

      {isLoading && templates.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && templates.length === 0 && <p className="text-center">{translate('noTaskTemplates')}</p>}

      <div className="space-y-3">
        {templates.map(temp => (
          <div key={temp.id} className={cardClasses}>
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-csp-primary-text dark:text-csp-primary-dark-text">{temp.name}</h4>
              <div className="space-x-2 rtl:space-x-reverse">
                <button onClick={() => handleEditTemplate(temp)} className="text-blue-500 hover:underline text-xs">✏️ {translate('edit')}</button>
                <button onClick={() => handleDeleteTemplate(temp.id)} className="text-red-500 hover:underline text-xs">🗑️ {translate('delete')}</button>
              </div>
            </div>
            <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1 whitespace-pre-wrap">{temp.description}</p>
            {(temp.priority || temp.category || temp.estimatedTime !== undefined) && (
                <div className="mt-2 pt-2 border-t border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    {temp.priority && <p><strong>{translate('taskPriority')}:</strong> {translate(`priority${temp.priority.charAt(0).toUpperCase() + temp.priority.slice(1)}` as any)}</p>}
                    {temp.category && <p><strong>{translate('taskCategory')}:</strong> {translate(`category${temp.category.charAt(0).toUpperCase() + temp.category.slice(1)}` as any)}</p>}
                    {temp.estimatedTime !== undefined && <p><strong>{translate('taskEstTime')}:</strong> {temp.estimatedTime} {translate('minutesShort')}</p>}
                </div>
            )}
            {temp.subTasks && temp.subTasks.length > 0 && (
                <div className="mt-2">
                    <strong className="block text-xs text-csp-primary-text dark:text-csp-primary-dark-text mb-1">{translate('taskSubTasks')}:</strong>
                    <ul className="list-disc list-inside space-y-0.5 pl-4 rtl:pr-4 text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text">
                        {temp.subTasks.map((st, idx) => <li key={idx}>{st.text}</li>)}
                    </ul>
                </div>
            )}
            {/* Example: Button to use template - actual usage needs more logic (e.g., navigate to task creation with prefill) */}
            {/* <button className={`${primaryButtonClasses} mt-3 text-xs w-full sm:w-auto`} onClick={() => alert('Using template: ' + temp.name)}>{translate('useTemplate')}</button> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTemplatesPage;
