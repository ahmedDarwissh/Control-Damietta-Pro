import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';
import { getChatMessages, sendChatMessage } from '../services/firestoreService';
import firebase from 'firebase/compat/app'; 

const ChatPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline, error: globalAuthError } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general'); 
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      setLocalError(language === 'ar' ? 'الرجاء تسجيل الدخول للوصول إلى الدردشة.' : 'Please log in to access chat.');
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    const unsubscribe = getChatMessages(
      currentRoom, 
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setIsLoading(false);
        if (isFirestoreOffline) {
          handleFirestoreOutcome(null); 
        }
      },
      (err) => {
        handleFirestoreOutcome(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();

  }, [currentRoom, currentUser, language, handleFirestoreOutcome, isFirestoreOffline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newMessage.trim()) return;

    const messageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.name || currentUser.email || 'Unknown User',
      senderAvatar: currentUser.avatarUrl,
      roomId: currentRoom,
    };

    const optimisticMessage: ChatMessage = {
        ...messageData,
        id: `temp-${Date.now()}`, 
        timestamp: firebase.firestore.Timestamp.now() 
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      await sendChatMessage(messageData);
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error sending message:", err);
      handleFirestoreOutcome(err);
      alert(language === 'ar' ? 'فشل إرسال الرسالة.' : 'Failed to send message.');
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };
  
  if (!currentUser && !isLoading && !globalAuthError) { 
    return (
        <div className="p-4 text-center text-csp-error bg-red-50 dark:bg-red-900/30 rounded-lg">
          {localError || (language === 'ar' ? 'تحميل بيانات المستخدم...' : 'Loading user data...')}
        </div>
    );
  }

  if (isLoading && !globalAuthError) {
    return <div className="p-4 text-center text-csp-secondary dark:text-csp-base-dark-content">{translate('loading')}</div>;
  }
   if (localError && !globalAuthError && messages.length === 0) { 
    return <div className="p-4 text-center text-csp-error bg-red-50 dark:bg-red-900/30 rounded-lg">{localError}</div>;
  }

  return (
    <div className="flex flex-col flex-1 bg-csp-base-100 dark:bg-csp-base-dark-200 rounded-xl shadow-md overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title is now handled by the main Header component */}
      {/* <h1 className={`text-xl font-bold text-csp-primary dark:text-csp-accent p-4 border-b border-csp-base-200 dark:border-csp-base-dark-300 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>
        {currentRoom === 'general' ? translate('generalChat') : currentRoom}
      </h1> */}
      
      <div className="flex-grow overflow-y-auto p-3 space-y-4 bg-csp-base-200 dark:bg-csp-base-dark-100">
        {messages.length === 0 && !isLoading && !globalAuthError && (
            <p className="text-center text-sm text-csp-secondary dark:text-gray-400 py-8">
                {language === 'ar' ? 'لا توجد رسائل بعد. ابدأ المحادثة!' : 'No messages yet. Start the conversation!'}
            </p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end space-x-2 rtl:space-x-reverse ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
            {msg.senderId !== currentUser?.uid && (
              <img src={msg.senderAvatar || 'https://picsum.photos/seed/defaultchat/32/32'} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0"/>
            )}
            <div className={`max-w-[75%] px-3 py-2 rounded-lg shadow ${msg.senderId === currentUser?.uid ? 'bg-csp-accent text-white rounded-br-none rtl:rounded-bl-none rtl:rounded-br-lg' : 'bg-csp-base-100 text-csp-base-content dark:bg-csp-base-dark-300 dark:text-csp-base-dark-content rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-lg'}`}>
              {msg.senderId !== currentUser?.uid && <p className="text-xs font-semibold mb-0.5 text-csp-primary dark:text-csp-accent">{msg.senderName}</p>}
              <p className="text-sm break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.senderId === currentUser?.uid ? 'text-gray-200' : 'text-csp-secondary dark:text-gray-400'} ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute: '2-digit'}) : '...'}
              </p>
            </div>
             {msg.senderId === currentUser?.uid && (
              <img src={currentUser?.avatarUrl || 'https://picsum.photos/seed/mychat/32/32'} alt={currentUser?.name} className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0"/>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-csp-base-200 dark:border-csp-base-dark-300 bg-csp-base-100 dark:bg-csp-base-dark-200 flex items-center space-x-2 rtl:space-x-reverse">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={translate('typeMessage')}
          className="flex-grow p-2.5 border border-csp-base-300 dark:border-csp-secondary bg-csp-base-100 dark:bg-csp-base-dark-300 text-csp-base-content dark:text-csp-base-dark-content rounded-md focus:ring-1 focus:ring-csp-accent focus:border-csp-accent transition-shadow text-sm"
          disabled={!currentUser || isFirestoreOffline}
        />
        <button type="submit" className="p-2.5 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-csp-accent-focus transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-csp-accent disabled:opacity-60" disabled={!currentUser || !newMessage.trim() || isFirestoreOffline }>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11.5a1 1 0 011-1h.094a1 1 0 011 1v5.071a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatPage;