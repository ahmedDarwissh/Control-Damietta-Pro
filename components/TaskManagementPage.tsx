import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { DailyTask, TaskPriority, TaskCategory, SubTask } from '../types';
import TaskItem from './TaskItem';
import { addTaskToFirestore, getTasksForUser, updateTaskCompletionInFirestore, updateTaskInFirestore, deleteTaskFromFirestore } from '../services/firestoreService';
import { TASK_PRIORITIES_LIST, TASK_CATEGORIES_LIST } from '../constants';
import firebase from 'firebase/compat/app';

const TaskManagementPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, error: globalAuthError, isFirestoreOffline } = useAuth();
  
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  // Form states
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>(TaskCategory.GENERAL);
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskEstTime, setNewTaskEstTime] = useState<number | ''>('');
  const [newSubTasks, setNewSubTasks] = useState<SubTask[]>([]);
  const [currentSubTaskText, setCurrentSubTaskText] = useState('');

  const sortTasks = (taskList: DailyTask[]) => {
    return taskList.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const priorityOrder = { [TaskPriority.HIGH]: 1, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 3 };
      if ((a.priority || TaskPriority.MEDIUM) !== (b.priority || TaskPriority.MEDIUM)) {
        return priorityOrder[a.priority || TaskPriority.MEDIUM] - priorityOrder[b.priority || TaskPriority.MEDIUM];
      }
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0);
    });
  };
  
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      const fetchTasks = async () => {
        try {
          const userTasks = await getTasksForUser(currentUser.uid);
          setTasks(sortTasks(userTasks)); 
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching tasks:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTasks();
    }
  }, [currentUser, language, handleFirestoreOutcome]);

  const resetForm = () => {
    setNewTaskDesc('');
    setNewTaskNotes('');
    setNewTaskPriority(TaskPriority.MEDIUM);
    setNewTaskCategory(TaskCategory.GENERAL);
    setNewTaskDueDate('');
    setNewTaskEstTime('');
    setNewSubTasks([]);
    setCurrentSubTaskText('');
    setEditingTask(null);
    setIsFormVisible(false);
  };

  const handleEditTask = (task: DailyTask) => {
    setEditingTask(task);
    setNewTaskDesc(task.description);
    setNewTaskNotes(task.notes || '');
    setNewTaskPriority(task.priority || TaskPriority.MEDIUM);
    setNewTaskCategory(task.category || TaskCategory.GENERAL);
    setNewTaskDueDate(task.dueDate ? task.dueDate.substring(0, 16) : ''); // Format for datetime-local
    setNewTaskEstTime(task.estimatedTime || '');
    setNewSubTasks(task.subTasks || []);
    setIsFormVisible(true);
  };
  
  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTaskDesc.trim()) {
        alert(language === 'ar' ? 'وصف المهمة مطلوب.' : 'Task description is required.');
        return;
    }
    if (isFirestoreOffline) {
        alert(language === 'ar' ? 'أنت غير متصل حالياً. لا يمكن حفظ المهمة.' : 'You are currently offline. Cannot save task.');
        return;
    }

    const taskDataPayload = { 
      userId: currentUser.uid,
      date: editingTask?.date || new Date().toISOString().split('T')[0], 
      description: newTaskDesc,
      notes: newTaskNotes,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
      estimatedTime: newTaskEstTime === '' ? undefined : Number(newTaskEstTime),
      subTasks: newSubTasks,
      isCompleted: editingTask ? editingTask.isCompleted : false,
    };

    try {
      if (editingTask) {
        await updateTaskInFirestore(editingTask.id, taskDataPayload);
        setTasks(prevTasks => sortTasks(prevTasks.map(t => t.id === editingTask.id ? {...t, ...taskDataPayload, id: editingTask.id, createdAt: editingTask.createdAt, updatedAt: firebase.firestore.Timestamp.now() } : t)));
      } else {
        const addedTask = await addTaskToFirestore(taskDataPayload);
        setTasks(prevTasks => sortTasks([addedTask, ...prevTasks]));
      }
      resetForm();
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error saving task:", err);
      handleFirestoreOutcome(err);
      alert(language === 'ar' ? 'فشل حفظ المهمة.' : 'Failed to save task.');
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    if (isFirestoreOffline) {
        alert(language === 'ar' ? 'أنت غير متصل حالياً. لا يمكن تحديث المهمة.' : 'You are currently offline. Cannot update task.');
        return;
    }
    try {
      await updateTaskCompletionInFirestore(taskId, !currentStatus);
      setTasks(prevTasks => sortTasks(
        prevTasks.map(task =>
          task.id === taskId ? { ...task, isCompleted: !currentStatus, updatedAt: firebase.firestore.Timestamp.now() } : task
        ))
      );
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error updating task completion:", err);
      handleFirestoreOutcome(err);
      alert(language === 'ar' ? 'فشل تحديث المهمة.' : 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isFirestoreOffline) {
        alert(language === 'ar' ? 'أنت غير متصل حالياً. لا يمكن حذف المهمة.' : 'You are currently offline. Cannot delete task.');
        return;
    }
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه المهمة؟' : 'Are you sure you want to delete this task?')) {
        try {
            await deleteTaskFromFirestore(taskId);
            setTasks(prevTasks => sortTasks(prevTasks.filter(task => task.id !== taskId)));
            handleFirestoreOutcome(null);
        } catch (err) {
            console.error("Error deleting task:", err);
            handleFirestoreOutcome(err);
            alert(language === 'ar' ? 'فشل حذف المهمة.' : 'Failed to delete task.');
        }
    }
  };

  const handleAddSubTask = () => {
    if (currentSubTaskText.trim()) {
      setNewSubTasks([...newSubTasks, { id: `st-${Date.now()}`, text: currentSubTaskText, isCompleted: false }]);
      setCurrentSubTaskText('');
    }
  };

  const handleToggleSubTask = (subTaskId: string) => {
    setNewSubTasks(newSubTasks.map(st => st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st));
  };

  const handleRemoveSubTask = (subTaskId: string) => {
    setNewSubTasks(newSubTasks.filter(st => st.id !== subTaskId));
  };

  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);
  
  const inputBaseClasses = "block w-full p-2.5 border border-csp-base-300 dark:border-csp-base-dark-300 bg-csp-primary dark:bg-csp-secondary-dark-bg text-csp-primary-text dark:text-csp-primary-dark-text rounded-md shadow-sm focus:ring-1 focus:ring-csp-accent focus:border-csp-accent text-sm transition-shadow";
  const labelBaseClasses = "block text-xs font-medium text-csp-primary-text dark:text-csp-primary-dark-text mb-1";


  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button
        onClick={() => { setIsFormVisible(!isFormVisible); if(isFormVisible) resetForm(); }}
        className={`w-full py-2.5 px-4 font-semibold rounded-md shadow flex items-center justify-center text-sm transition-colors duration-150
                    ${isFormVisible ? 'bg-csp-error text-white hover:bg-opacity-90' : 'bg-csp-accent text-white hover:bg-csp-accent-focus'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d={isFormVisible ? "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" : "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"} clipRule="evenodd" />
        </svg>
        {isFormVisible ? translate('cancel') : translate('addTask')}
      </button>

      {isFormVisible && (
        <form onSubmit={handleAddTaskSubmit} className="bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg space-y-4">
          <h2 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text mb-3 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>
            {editingTask ? translate('editTask') : translate('addTask')}
          </h2>
          
          <div>
            <label htmlFor="taskDesc" className={labelBaseClasses}>{translate('taskDescription')}</label>
            <textarea id="taskDesc" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} required className={`${inputBaseClasses} min-h-[80px]`} placeholder={translate('logPlaceholder')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskPriority" className={labelBaseClasses}>{translate('taskPriority')}</label>
              <select id="taskPriority" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as TaskPriority)} className={inputBaseClasses}>
                {TASK_PRIORITIES_LIST.map(p => <option key={p.id} value={p.id}>{translate(p.labelKey as any)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="taskCategory" className={labelBaseClasses}>{translate('taskCategory')}</label>
              <select id="taskCategory" value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value as TaskCategory)} className={inputBaseClasses}>
                 {TASK_CATEGORIES_LIST.map(c => <option key={c.id} value={c.id}>{translate(c.labelKey as any)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskDueDate" className={labelBaseClasses}>{translate('taskDueDate')}</label>
              <input type="datetime-local" id="taskDueDate" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} className={inputBaseClasses}/>
            </div>
            <div>
              <label htmlFor="taskEstTime" className={labelBaseClasses}>{translate('taskEstTime')}</label>
              <input type="number" id="taskEstTime" value={newTaskEstTime} onChange={e => setNewTaskEstTime(e.target.value === '' ? '' : Number(e.target.value))} className={inputBaseClasses} placeholder="e.g., 30"/>
            </div>
          </div>
          
          <div>
            <label htmlFor="taskNotes" className={labelBaseClasses}>{translate('taskNotes')}</label>
            <input type="text" id="taskNotes" value={newTaskNotes} onChange={(e) => setNewTaskNotes(e.target.value)} className={inputBaseClasses}/>
          </div>

          <div>
            <label className={labelBaseClasses}>{translate('taskSubTasks')}</label>
            <div className="space-y-2">
              {newSubTasks.map(st => (
                <div key={st.id} className="flex items-center space-x-2 rtl:space-x-reverse bg-csp-secondary-bg dark:bg-csp-primary-dark p-2 rounded">
                  <input type="checkbox" checked={st.isCompleted} onChange={() => handleToggleSubTask(st.id)} className="form-checkbox h-4 w-4 text-csp-accent dark:text-csp-accent-dark rounded focus:ring-csp-accent"/>
                  <span className={`flex-grow text-sm ${st.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-csp-primary-text dark:text-csp-primary-dark-text'}`}>{st.text}</span>
                  <button type="button" onClick={() => handleRemoveSubTask(st.id)} className="text-csp-error hover:text-red-700 text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-2 space-x-2 rtl:space-x-reverse">
              <input type="text" value={currentSubTaskText} onChange={e => setCurrentSubTaskText(e.target.value)} placeholder={translate('addSubTask')} className={`${inputBaseClasses} flex-grow !mt-0`} />
              <button type="button" onClick={handleAddSubTask} className="py-2 px-3 bg-csp-secondary dark:bg-csp-secondary-dark-text text-white text-xs rounded-md hover:bg-opacity-80">+</button>
            </div>
          </div>

          <button type="submit" disabled={isFirestoreOffline} className="w-full py-2.5 px-4 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-csp-accent-focus transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-csp-accent disabled:opacity-60 disabled:cursor-not-allowed text-sm">
            {editingTask ? translate('saveChanges') : translate('submitLog')}
          </button>
          {editingTask && <button type="button" onClick={resetForm} className="w-full mt-2 py-2 text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text hover:underline">{translate('cancel')}</button>}
        </form>
      )}

      {isLoading && !globalAuthError && <div className="p-4 text-center text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate('loading')}</div>}
      
      {!isLoading && tasks.length === 0 && !globalAuthError && (
         <p className="text-center text-sm text-csp-secondary-text dark:text-gray-400 py-4">
            {language === 'ar' ? 'لا توجد مهام حالياً. قم بإضافة مهمة جديدة!' : 'No tasks yet. Add a new one!'}
          </p>
      )}

      {tasks.length > 0 && !globalAuthError && (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <section>
              <h3 className={`text-md font-semibold text-csp-primary-text dark:text-csp-primary-dark-text mb-2 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{translate('pendingTasks')} ({pendingTasks.length})</h3>
              <ul className="space-y-3">
                {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggleComplete={() => handleToggleComplete(task.id, task.isCompleted)} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id)} isOffline={isFirestoreOffline} />)}
              </ul>
            </section>
          )}

          {completedTasks.length > 0 && (
            <section>
              <h3 className={`text-md font-semibold text-csp-primary-text dark:text-csp-primary-dark-text mb-2 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{translate('completedTasks')} ({completedTasks.length})</h3>
              <ul className="space-y-3">
                {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggleComplete={() => handleToggleComplete(task.id, task.isCompleted)} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id)} isOffline={isFirestoreOffline} />)}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagementPage;