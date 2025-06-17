
import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserNote } from '../../types';
import { addUserNote, getUserNotes, updateUserNote, deleteUserNote } from '../../services/firestoreService';
import firebase from 'firebase/compat/app';

const NoteTakingPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [notes, setNotes] = useState<UserNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(''); // Optional
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);

  useEffect(() => {
    if (currentUser) {
      const fetchNotes = async () => {
        setIsLoading(true);
        try {
          const userNotes = await getUserNotes(currentUser.uid);
          setNotes(userNotes);
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching notes:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNotes();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const resetForm = () => {
    setTitle(''); setContent(''); setCategory('');
    setEditingNote(null); setShowForm(false);
  };

  const handleEditNote = (note: UserNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || '');
    setShowForm(true);
  };

  const handleSubmitNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !content.trim()) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }

    const noteData = {
      userId: currentUser.uid,
      title,
      content,
      category: category.trim() || undefined,
    };
    
    setIsLoading(true);
    try {
      if (editingNote) {
        await updateUserNote(editingNote.id, noteData);
        setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...editingNote, ...noteData, updatedAt: firebase.firestore.Timestamp.now() } : n));
      } else {
        const newNote = await addUserNote(noteData);
        setNotes(prev => [newNote, ...prev]);
      }
      resetForm();
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error saving note:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm(translate('confirmDeleteNote'))) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    setIsLoading(true);
    try {
      await deleteUserNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error deleting note:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className={`${primaryButtonClasses} w-full`}>
        {showForm ? translate('cancel') : translate('addNote')}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitNote} className={`${cardClasses} space-y-4`}>
          <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>{editingNote ? translate('editNote') : translate('addNote')}</h3>
          <div><label htmlFor="title" className={labelBaseClasses}>{translate('noteTitleLabel')}</label><input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses} required /></div>
          <div><label htmlFor="content" className={labelBaseClasses}>{translate('noteContentLabel')}</label><textarea id="content" value={content} onChange={e => setContent(e.target.value)} className={`${inputBaseClasses} min-h-[120px]`} required /></div>
          <div><label htmlFor="category" className={labelBaseClasses}>{translate('taskCategory')} (Optional)</label><input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputBaseClasses} /></div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>{isLoading ? translate('loading') : translate('saveNote')}</button>
        </form>
      )}

      {isLoading && notes.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && notes.length === 0 && <p className="text-center">{translate('noNotes')}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div key={note.id} className={cardClasses}>
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-csp-primary-text dark:text-csp-primary-dark-text truncate">{note.title}</h4>
              <div className="space-x-2 rtl:space-x-reverse flex-shrink-0">
                <button onClick={() => handleEditNote(note)} className="text-blue-500 hover:underline text-xs">✏️</button>
                <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:underline text-xs">🗑️</button>
              </div>
            </div>
            {note.category && <p className="text-xs text-csp-accent dark:text-csp-accent-dark mt-0.5">{note.category}</p>}
            <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1 whitespace-pre-wrap break-words h-20 overflow-y-auto">{note.content}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right rtl:text-left">
              {new Date(note.updatedAt.toDate()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteTakingPage;
    