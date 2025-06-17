
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { DailyTask, TaskPriority } from '../../types';
import { getTasksForUser, updateTaskInFirestore } from '../../services/firestoreService';

type KanbanColumnId = 'todo' | 'inprogress' | 'done';

interface KanbanTaskCardProps {
  task: DailyTask;
  onStatusChange: (taskId: string, newStatus: KanbanColumnId) => void;
  isOffline: boolean;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task, onStatusChange, isOffline }) => {
  const { translate } = useLocalization();
  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'border-red-500';
      case TaskPriority.MEDIUM: return 'border-yellow-500';
      case TaskPriority.LOW: return 'border-blue-500';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className={`bg-csp-primary dark:bg-csp-secondary-dark-bg p-3 rounded-lg shadow-md border-l-4 ${getPriorityColor(task.priority)} mb-3 transition-shadow hover:shadow-lg`}>
      <p className="text-sm font-medium text-csp-primary-text dark:text-csp-primary-dark-text break-words">{task.description}</p>
      {task.notes && <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1 italic">"{task.notes}"</p>}
      <div className="mt-2 text-xs">
        <select 
          value={task.kanbanColumn || 'todo'} 
          onChange={(e) => onStatusChange(task.id, e.target.value as KanbanColumnId)}
          disabled={isOffline}
          className={`w-full p-1 border rounded-md text-xs bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text border-csp-secondary-text/20 dark:border-csp-secondary-dark-text/30 focus:ring-1 focus:ring-csp-accent ${isOffline ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <option value="todo">{translate('kanbanToDo')}</option>
          <option value="inprogress">{translate('kanbanInProgress')}</option>
          <option value="done">{translate('kanbanDone')}</option>
        </select>
      </div>
    </div>
  );
};

const KanbanBoardPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      getTasksForUser(currentUser.uid)
        .then(fetchedTasks => {
          setTasks(fetchedTasks.map(t => ({ ...t, kanbanColumn: t.kanbanColumn || 'todo' }))); // Default to 'todo'
          handleFirestoreOutcome(null);
        })
        .catch(err => {
          console.error("Error fetching tasks for Kanban:", err);
          handleFirestoreOutcome(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentUser, handleFirestoreOutcome]);

  const handleTaskStatusChange = async (taskId: string, newStatus: KanbanColumnId) => {
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const oldStatus = taskToUpdate.kanbanColumn;
    // Optimistic update
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, kanbanColumn: newStatus } : t));
    
    try {
      await updateTaskInFirestore(taskId, { kanbanColumn: newStatus, isCompleted: newStatus === 'done' });
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error updating task status on Kanban:", err);
      handleFirestoreOutcome(err);
      // Revert optimistic update on error
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, kanbanColumn: oldStatus, isCompleted: oldStatus === 'done' } : t));
    }
  };

  const columns: { id: KanbanColumnId; titleKey: 'kanbanToDo' | 'kanbanInProgress' | 'kanbanDone' }[] = [
    { id: 'todo', titleKey: 'kanbanToDo' },
    { id: 'inprogress', titleKey: 'kanbanInProgress' },
    { id: 'done', titleKey: 'kanbanDone' },
  ];

  if (isLoading) return <p className="text-center p-4">{translate('loading')}</p>;

  return (
    <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto p-1" dir={language}>
      {columns.map(column => (
        <div key={column.id} className="flex-1 min-w-[280px] sm:min-w-[300px] bg-csp-secondary-bg dark:bg-csp-primary-dark p-3 rounded-xl shadow-md">
          <h3 className={`text-md font-semibold text-csp-primary-text dark:text-csp-primary-dark-text mb-3 pb-2 border-b-2 border-csp-accent dark:border-csp-accent-dark ${language==='ar' ? 'font-cairo text-right' : 'font-poppins text-left'}`}>
            {translate(column.titleKey)} ({tasks.filter(t => (t.kanbanColumn || 'todo') === column.id).length})
          </h3>
          <div className="space-y-3 h-[calc(100vh-18rem)] sm:h-[calc(100vh-16rem)] overflow-y-auto pr-1"> {/* Adjust height */}
            {tasks.filter(t => (t.kanbanColumn || 'todo') === column.id).map(task => (
              <KanbanTaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} isOffline={isFirestoreOffline} />
            ))}
            {tasks.filter(t => (t.kanbanColumn || 'todo') === column.id).length === 0 && <p className="text-xs text-center text-csp-secondary-text dark:text-csp-secondary-dark-text py-4">{language === 'ar' ? 'لا مهام هنا.' : 'No tasks here.'}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoardPage;
