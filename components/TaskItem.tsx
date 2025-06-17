import React from 'react';
import { DailyTask, TaskPriority, TaskCategory, SubTask } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

interface TaskItemProps {
  task: DailyTask;
  onToggleComplete: (taskId: string, currentStatus: boolean) => void;
  onEdit: (task: DailyTask) => void;
  onDelete: (taskId: string) => void;
  showDetails?: boolean;
  isOffline: boolean;
}

const getPriorityChipClass = (priority?: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH: return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
    case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300';
    case TaskPriority.LOW: return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300';
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onEdit, onDelete, showDetails = true, isOffline }) => {
  const { translate, language } = useLocalization();

  const handleToggle = () => {
    if (isOffline) return;
    onToggleComplete(task.id, task.isCompleted);
  };
  
  const handleEdit = () => {
    if (isOffline) return;
    onEdit(task);
  };

  const handleDelete = () => {
    if (isOffline) return;
    onDelete(task.id);
  };

  const priorityLabelKey = task.priority ? `priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` : 'priorityMedium';
  const categoryLabelKey = task.category ? `category${task.category.charAt(0).toUpperCase() + task.category.slice(1)}` : 'categoryGeneral';

  return (
    <li 
        className={`p-3.5 rounded-lg shadow-md flex flex-col space-y-2 transition-all duration-200 ease-in-out
                    ${task.isCompleted 
                        ? 'bg-csp-success/10 border-l-4 border-csp-success' 
                        : 'bg-csp-primary dark:bg-csp-secondary-dark-bg border-l-4 border-csp-accent dark:border-csp-accent-dark'} 
                    ${isOffline ? 'opacity-70 cursor-not-allowed' : ''}`} 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        aria-disabled={isOffline}
    >
      <div className="flex items-start space-x-3 rtl:space-x-reverse">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={handleToggle}
          disabled={isOffline}
          className={`form-checkbox h-5 w-5 rounded border-gray-300 dark:border-csp-secondary-dark-text/50 focus:ring-csp-accent mt-1 flex-shrink-0 
                      ${task.isCompleted ? 'text-csp-success focus:ring-csp-success' : 'text-csp-accent focus:ring-csp-accent'}
                      ${isOffline ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={`Mark task ${task.description} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <div className="flex-1 min-w-0">
          <p className={`font-medium break-words text-sm ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : `text-csp-primary-text dark:text-csp-primary-dark-text`}`}>
            {task.description}
          </p>
          {showDetails && task.notes && (
            <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1 italic break-words">"{task.notes}"</p>
          )}
        </div>
        <button 
            onClick={handleToggle}
            disabled={isOffline}
            className={`flex-shrink-0 ml-auto rtl:mr-auto rtl:ml-0 px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm transition-colors duration-150
            ${task.isCompleted 
                ? `bg-csp-secondary-text/80 text-white hover:bg-opacity-80` 
                : `bg-csp-accent text-white hover:bg-csp-accent-focus`}
            ${isOffline ? 'opacity-50 cursor-not-allowed' : ''}`}
             aria-live="polite"
        >
            {task.isCompleted ? translate('markIncomplete') : translate('markComplete')}
        </button>
      </div>

      {showDetails && (
        <div className="pl-8 rtl:pr-8 space-y-2 text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityChipClass(task.priority)}`}>
              {translate(priorityLabelKey as any)}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300">
              {translate(categoryLabelKey as any)}
            </span>
          </div>
          {task.dueDate && (
            <p><strong>{translate('taskDueDate')}:</strong> {new Date(task.dueDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          )}
          {task.estimatedTime !== undefined && (
            <p><strong>{translate('taskEstTime')}:</strong> {task.estimatedTime} {translate('minutesShort') || 'min'}</p>
          )}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mt-1.5">
              <strong className="block mb-0.5">{translate('taskSubTasks')}:</strong>
              <ul className="list-disc list-inside space-y-0.5 pl-2 rtl:pr-2">
                {task.subTasks.map(st => (
                  <li key={st.id} className={`${st.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                    {st.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse mt-2 pt-2 border-t border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10">
          <button 
              onClick={handleEdit} 
              disabled={isOffline}
              className={`text-xs px-2 py-1 rounded text-csp-info hover:bg-blue-500/10 ${isOffline ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={translate('editTask')}
          >
              ✏️ {translate('edit')}
          </button>
          <button 
              onClick={handleDelete} 
              disabled={isOffline}
              className={`text-xs px-2 py-1 rounded text-csp-error hover:bg-red-500/10 ${isOffline ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={translate('deleteTask')}
          >
              🗑️ {translate('delete')}
          </button>
      </div>
    </li>
  );
};

export default TaskItem;

// Add to constants.ts translations:
// EN: minutesShort: "min", editTask: "Edit Task", deleteTask: "Delete Task", edit: "Edit", delete: "Delete", saveChanges: "Save Changes"
// AR: minutesShort: "د", editTask: "تعديل المهمة", deleteTask: "حذف المهمة", edit: "تعديل", delete: "حذف", saveChanges: "حفظ التعديلات"
// Ensure TaskItem is updated in TaskManagementPage and Dashboard to pass onEdit and onDelete props.
// Ensure Dashboard's handleToggleTask matches the one in TaskManagementPage for consistency.
// Add editTask, deleteTask, saveChanges, minutesShort to constants.ts translations.
// Add translations for goal categories, expense categories, resource types
// Add translations for Pomodoro: pomodoroSessionDuration, pomodoroBreakDuration, pomodoroTaskLink, resetTimer, pauseTimer, resumeTimer
// Add translations for Leave Requests: noLeaveRequests
// Add translations for User Directory: searchUser
// Add translations for Notes: noNotes, saveNote
// Add translations for Learning Resources: resourceType, resourceTypeLink, resourceTypeDocument, resourceTypeVideo, resourceCategory, noLearningResources
// Add translations for Personal Expenses: expenseDescription, saveExpense, totalExpenses, noExpenses
// Add translations for Goal Setting: goalDescription, markAsAchieved, markAsInProgress, saveGoal, noGoals
// Add translations for Document Scanner: takePhoto, selectFromGallery, scannedDocumentPreview, saveScan
// Add translations for Data Export: exportMyData, importMyData