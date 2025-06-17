
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db, storage } from '../firebase'; 
import { User, Shift, DailyTask, ShipInfo, ChatMessage, Team, TaskTemplate, PomodoroSession, LeaveRequest, AuditLogEntry, UserNote, LearningResource, PersonalExpense, PersonalGoal, UserSettings, SubTask, UserRole, CargoType, ShipStatus, Language, AppTheme, NotificationSound, TaskPriority, TaskCategory, PrayerTime, GeminiContent, EquipmentLogEntry, SafetyChecklistItemDef, SafetyChecklistSubmission, EmergencyContact, InternalNewsArticle, FeedbackSubmission, UserContact, ShoppingList, ShoppingListItem } from '../types';
import { TEAMS_DATA } 
from '../constants';

// USER SERVICE FUNCTIONS
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return { uid: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<UserContact[]> => {
  try {
    const snapshot = await db.collection('users').orderBy('name', 'asc').get();
    return snapshot.docs.map(doc => {
        const data = doc.data() as User; // Assume full User data is fetched
        return { 
            uid: doc.id, 
            name: data.name,
            email: data.email || undefined,
            role: data.role,
            teamName: data.teamName,
            avatarUrl: data.avatarUrl,
            phone: data.phone,
            presence: data.presence,
            birthDate: data.birthDate, // Include birthDate
        } as UserContact;
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    await db.collection('users').doc(uid).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateUserSettingsInFirestore = async (uid: string, settings: Partial<UserSettings>): Promise<void> => {
    try {
        const userRef = db.collection('users').doc(uid);
        // Make sure to merge with existing settings if not all are provided
        await userRef.set({ userSettings: settings }, { merge: true });
        await userRef.update({updatedAt: firebase.firestore.FieldValue.serverTimestamp()});

    } catch (error) {
        console.error("Error updating user settings in Firestore:", error);
        throw error;
    }
};


// SHIFT SERVICE FUNCTIONS
export const addShiftToFirestore = async (shiftData: Omit<Shift, 'id' | 'createdAt' | 'createdBy'>, createdByUid: string): Promise<Shift> => {
  try {
    const docRef = await db.collection('shifts').add({
      ...shiftData,
      createdBy: createdByUid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { ...shiftData, id: docRef.id, createdBy: createdByUid, createdAt: firebase.firestore.Timestamp.now() };
  } catch (error) {
    console.error("Error adding shift to Firestore:", error);
    throw error;
  }
};

export const getAllShifts = async (): Promise<Shift[]> => {
  try {
    const snapshot = await db.collection('shifts').orderBy('date', 'desc').orderBy('startTime', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
  } catch (error) {
    console.error("Error getting all shifts:", error);
    throw error;
  }
};

export const getShiftsForUserTeam = async (teamId: string, date: string): Promise<Shift[]> => {
  try {
    const snapshot = await db.collection('shifts')
      .where('teamId', '==', teamId)
      .where('date', '==', date)
      .orderBy('startTime', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
  } catch (error) {
    console.error("Error getting shifts for team on date:", error);
    throw error;
  }
};

export const updateShiftInFirestore = async (shiftId: string, data: Partial<Shift>): Promise<void> => {
  try {
    await db.collection('shifts').doc(shiftId).update({
      ...data,
      // updatedAt: firebase.firestore.FieldValue.serverTimestamp(), 
    });
  } catch (error) {
    console.error("Error updating shift:", error);
    throw error;
  }
};

// TASK SERVICE FUNCTIONS
export const addTaskToFirestore = async (taskData: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyTask> => {
  try {
    const subTasksWithIds = taskData.subTasks?.map(st => ({
        ...st,
        id: st.id || db.collection('tasks').doc().id 
    })) || [];

    const docRef = await db.collection('tasks').add({
      ...taskData,
      subTasks: subTasksWithIds,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { ...taskData, subTasks: subTasksWithIds, id: docRef.id, createdAt: firebase.firestore.Timestamp.now(), updatedAt: firebase.firestore.Timestamp.now() };
  } catch (error) {
    console.error("Error adding task to Firestore:", error);
    throw error;
  }
};

export const getTasksForUser = async (userId: string): Promise<DailyTask[]> => {
  try {
    const snapshot = await db.collection('tasks')
      .where('userId', '==', userId)
      // .orderBy('isCompleted', 'asc') // We will sort client-side based on preference
      // .orderBy('priority', 'desc') 
      // .orderBy('dueDate', 'asc')    
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyTask));
  } catch (error) {
    console.error("Error getting tasks for user:", error);
    throw error;
  }
};

export const updateTaskInFirestore = async (taskId: string, data: Partial<DailyTask>): Promise<void> => {
  try {
    let subTasksWithIds: SubTask[] | undefined = undefined;
    if (data.subTasks) {
        subTasksWithIds = data.subTasks.map(st => ({
            ...st,
            id: st.id || db.collection('tasks').doc().id
        }));
    }

    await db.collection('tasks').doc(taskId).update({
      ...data,
      ...(subTasksWithIds && { subTasks: subTasksWithIds }),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const updateTaskCompletionInFirestore = async (taskId: string, isCompleted: boolean): Promise<void> => {
  try {
    await db.collection('tasks').doc(taskId).update({
      isCompleted,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating task completion:", error);
    throw error;
  }
};

export const deleteTaskFromFirestore = async (taskId: string): Promise<void> => {
  try {
    await db.collection('tasks').doc(taskId).delete();
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// TASK TEMPLATE SERVICE FUNCTIONS
export const addTaskTemplate = async (templateData: Omit<TaskTemplate, 'id' | 'createdAt'>): Promise<TaskTemplate> => {
    try {
        const docRef = await db.collection('taskTemplates').add({
            ...templateData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...templateData, id: docRef.id, createdAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding task template:", error);
        throw error;
    }
};

export const getTaskTemplatesForUser = async (userId: string): Promise<TaskTemplate[]> => {
    try {
        const snapshot = await db.collection('taskTemplates')
            .where('createdBy', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskTemplate));
    } catch (error) {
        console.error("Error getting task templates for user:", error);
        throw error;
    }
};

export const updateTaskTemplate = async (templateId: string, data: Partial<TaskTemplate>): Promise<void> => {
    try {
        await db.collection('taskTemplates').doc(templateId).update(data);
    } catch (error) {
        console.error("Error updating task template:", error);
        throw error;
    }
};

export const deleteTaskTemplate = async (templateId: string): Promise<void> => {
    try {
        await db.collection('taskTemplates').doc(templateId).delete();
    } catch (error) {
        console.error("Error deleting task template:", error);
        throw error;
    }
};


// SHIP SERVICE FUNCTIONS
export const addShipToFirestore = async (shipData: Omit<ShipInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShipInfo> => {
  try {
    const docRef = await db.collection('ships').add({
      ...shipData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { ...shipData, id: docRef.id, createdAt: firebase.firestore.Timestamp.now(), updatedAt: firebase.firestore.Timestamp.now() };
  } catch (error) {
    console.error("Error adding ship to Firestore:", error);
    throw error;
  }
};

export const getAllShips = async (): Promise<ShipInfo[]> => {
  try {
    const snapshot = await db.collection('ships').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShipInfo));
  } catch (error) {
    console.error("Error getting all ships:", error);
    throw error;
  }
};

// TEAM SERVICE FUNCTIONS
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const teamFromConstants = TEAMS_DATA.find(t => t.id === teamId);
    if (teamFromConstants) {
      return Promise.resolve(teamFromConstants);
    }
    // If teams were in Firestore:
    // const teamDoc = await db.collection('teams').doc(teamId).get();
    // if (teamDoc.exists) return { id: teamDoc.id, ...teamDoc.data() } as Team;
    console.warn(`Team with ID ${teamId} not found in constants.`);
    return null;
  } catch (error) {
    console.error(`Error getting team by ID ${teamId}:`, error);
    const teamFromConstants = TEAMS_DATA.find(t => t.id === teamId);
     if (teamFromConstants) return Promise.resolve(teamFromConstants);
    throw error;
  }
};


// CHAT SERVICE FUNCTIONS
export const getChatMessages = (
  roomId: string,
  onSuccess: (messages: ChatMessage[]) => void,
  onError: (error: any) => void
): (() => void) => {
  return db.collection('chatRooms').doc(roomId).collection('messages')
    .orderBy('timestamp', 'asc')
    .limitToLast(50) 
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      onSuccess(messages);
    }, err => {
      console.error("Error in chat messages snapshot listener:", err);
      onError(err);
    });
};

export const sendChatMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'isOptimistic'>): Promise<ChatMessage> => {
  try {
    const messageToSend = {
      ...messageData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('chatRooms').doc(messageData.roomId).collection('messages').add(messageToSend);
    return {
        ...messageData,
        id: docRef.id,
        timestamp: firebase.firestore.Timestamp.now() 
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

// POMODORO SESSION SERVICE
export const addPomodoroSession = async (sessionData: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession> => {
    try {
        const docRef = await db.collection('pomodoroSessions').add(sessionData);
        return { ...sessionData, id: docRef.id };
    } catch (error) {
        console.error("Error adding Pomodoro session:", error);
        throw error;
    }
};

// LEAVE REQUEST SERVICE
export const addLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'requestedAt'>): Promise<LeaveRequest> => {
    try {
        const docRef = await db.collection('leaveRequests').add({
            ...requestData,
            requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...requestData, id: docRef.id, requestedAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding leave request:", error);
        throw error;
    }
};

export const getLeaveRequestsForUser = async (userId: string): Promise<LeaveRequest[]> => {
    try {
        const snapshot = await db.collection('leaveRequests')
            .where('userId', '==', userId)
            .orderBy('requestedAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
    } catch (error) {
        console.error("Error getting leave requests for user:", error);
        throw error;
    }
};

export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
    try {
        const snapshot = await db.collection('leaveRequests').orderBy('requestedAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
    } catch (error) {
        console.error("Error fetching all leave requests:", error);
        throw error;
    }
};

export const updateLeaveRequestStatus = async (requestId: string, status: LeaveRequest['status'], adminId: string, adminName: string): Promise<void> => {
    try {
        await db.collection('leaveRequests').doc(requestId).update({
            status,
            reviewedBy: adminId,
            reviewedByName: adminName,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating leave request status:", error);
        throw error;
    }
};


// AUDIT LOG SERVICE
export const addAuditLog = async (logData: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> => {
    try {
        await db.collection('auditLog').add({
            ...logData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding audit log:", error);
    }
};

export const getAuditLogEntries = async (limit: number = 50): Promise<AuditLogEntry[]> => {
    try {
        const snapshot = await db.collection('auditLog')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        throw error;
    }
};


// USER NOTE SERVICE
export const addUserNote = async (noteData: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserNote> => {
    try {
        const docRef = await db.collection('userNotes').add({
            ...noteData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...noteData, id: docRef.id, createdAt: firebase.firestore.Timestamp.now(), updatedAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding user note:", error);
        throw error;
    }
};
export const getUserNotes = async (userId: string): Promise<UserNote[]> => {
    try {
        const snapshot = await db.collection('userNotes')
            .where('userId', '==', userId)
            .orderBy('updatedAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserNote));
    } catch (error) {
        console.error("Error fetching user notes:", error);
        throw error;
    }
};
export const updateUserNote = async (noteId: string, data: Partial<UserNote>): Promise<void> => {
    try {
        await db.collection('userNotes').doc(noteId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating user note:", error);
        throw error;
    }
};
export const deleteUserNote = async (noteId: string): Promise<void> => {
    try {
        await db.collection('userNotes').doc(noteId).delete();
    } catch (error) {
        console.error("Error deleting user note:", error);
        throw error;
    }
};

// LEARNING RESOURCE SERVICE
export const addLearningResource = async (resourceData: Omit<LearningResource, 'id' | 'createdAt'>): Promise<LearningResource> => {
    try {
        const docRef = await db.collection('learningResources').add({
            ...resourceData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...resourceData, id: docRef.id, createdAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding learning resource:", error);
        throw error;
    }
};
export const getLearningResources = async (): Promise<LearningResource[]> => {
    try {
        const snapshot = await db.collection('learningResources').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningResource));
    } catch (error) {
        console.error("Error fetching learning resources:", error);
        throw error;
    }
};
export const updateLearningResource = async (resourceId: string, data: Partial<LearningResource>): Promise<void> => {
    try {
        await db.collection('learningResources').doc(resourceId).update(data);
    } catch (error) {
        console.error("Error updating learning resource:", error);
        throw error;
    }
};
export const deleteLearningResource = async (resourceId: string, filePath?: string): Promise<void> => {
    try {
        await db.collection('learningResources').doc(resourceId).delete();
        if (filePath) { 
             // Attempt to delete from Firebase Storage if filePath is a gs:// path or full URL
            try {
                if (filePath.startsWith("gs://") || filePath.startsWith("http")) {
                    const fileRef = storage.refFromURL(filePath);
                    await fileRef.delete();
                    console.log("Associated file deleted from storage:", filePath);
                } else {
                    // If it's just a path, construct ref
                    const fileRef = storage.ref(filePath);
                    await fileRef.delete();
                     console.log("Associated file deleted from storage by path:", filePath);
                }
            } catch (storageError) {
                console.warn("Error deleting associated file from storage:", storageError);
                // Don't let storage deletion failure stop the overall process if DB deletion succeeded
            }
        }
    } catch (error) {
        console.error("Error deleting learning resource:", error);
        throw error;
    }
};


// PERSONAL EXPENSE SERVICE
export const addPersonalExpense = async (expenseData: Omit<PersonalExpense, 'id' | 'createdAt'>): Promise<PersonalExpense> => {
    try {
        const docRef = await db.collection('personalExpenses').add({
            ...expenseData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...expenseData, id: docRef.id, createdAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding personal expense:", error);
        throw error;
    }
};
export const getPersonalExpensesForUser = async (userId: string): Promise<PersonalExpense[]> => {
    try {
        const snapshot = await db.collection('personalExpenses')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PersonalExpense));
    } catch (error) {
        console.error("Error fetching personal expenses for user:", error);
        throw error;
    }
};
export const updatePersonalExpense = async (expenseId: string, data: Partial<PersonalExpense>): Promise<void> => {
    try {
        await db.collection('personalExpenses').doc(expenseId).update(data);
    } catch (error) {
        console.error("Error updating personal expense:", error);
        throw error;
    }
};
export const deletePersonalExpense = async (expenseId: string): Promise<void> => {
    try {
        await db.collection('personalExpenses').doc(expenseId).delete();
    } catch (error) {
        console.error("Error deleting personal expense:", error);
        throw error;
    }
};

// PERSONAL GOAL SERVICE
export const addPersonalGoal = async (goalData: Omit<PersonalGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalGoal> => {
    try {
        const docRef = await db.collection('personalGoals').add({
            ...goalData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...goalData, id: docRef.id, createdAt: firebase.firestore.Timestamp.now(), updatedAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding personal goal:", error);
        throw error;
    }
};
export const getPersonalGoalsForUser = async (userId: string): Promise<PersonalGoal[]> => {
    try {
        const snapshot = await db.collection('personalGoals')
            .where('userId', '==', userId)
            .orderBy('targetDate', 'asc')
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PersonalGoal));
    } catch (error) {
        console.error("Error fetching personal goals for user:", error);
        throw error;
    }
};
export const updatePersonalGoal = async (goalId: string, data: Partial<PersonalGoal>): Promise<void> => {
    try {
        await db.collection('personalGoals').doc(goalId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating personal goal:", error);
        throw error;
    }
};
export const deletePersonalGoal = async (goalId: string): Promise<void> => {
    try {
        await db.collection('personalGoals').doc(goalId).delete();
    } catch (error) {
        console.error("Error deleting personal goal:", error);
        throw error;
    }
};


// FILE UPLOAD SERVICE
export const uploadFileToStorage = async (file: File, filePath: string): Promise<string> => {
  try {
    const fileRef = storage.ref(filePath);
    const uploadTask = await fileRef.put(file);
    const downloadURL = await uploadTask.ref.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
};

// EQUIPMENT LOG SERVICE
export const addEquipmentLogEntry = async (entryData: Omit<EquipmentLogEntry, 'id' | 'reportedAt'>): Promise<EquipmentLogEntry> => {
    try {
        const docRef = await db.collection('equipmentLog').add({
            ...entryData,
            reportedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...entryData, id: docRef.id, reportedAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding equipment log entry:", error);
        throw error;
    }
};

export const getEquipmentLogEntries = async (): Promise<EquipmentLogEntry[]> => {
    try {
        const snapshot = await db.collection('equipmentLog').orderBy('reportedAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EquipmentLogEntry));
    } catch (error) {
        console.error("Error fetching equipment log entries:", error);
        throw error;
    }
};

export const updateEquipmentLogEntry = async (entryId: string, data: Partial<EquipmentLogEntry>): Promise<void> => {
    try {
        await db.collection('equipmentLog').doc(entryId).update(data);
    } catch (error) {
        console.error("Error updating equipment log entry:", error);
        throw error;
    }
};

// SAFETY CHECKLIST SUBMISSION SERVICE
export const addSafetyChecklistSubmission = async (submissionData: Omit<SafetyChecklistSubmission, 'id' | 'completedAt'>): Promise<SafetyChecklistSubmission> => {
    try {
        const docRef = await db.collection('safetyChecklistSubmissions').add({
            ...submissionData,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { ...submissionData, id: docRef.id, completedAt: firebase.firestore.Timestamp.now() };
    } catch (error) {
        console.error("Error adding safety checklist submission:", error);
        throw error;
    }
};

export const getSafetyChecklistSubmissions = async (userId?: string): Promise<SafetyChecklistSubmission[]> => {
    try {
        let query: firebase.firestore.Query = db.collection('safetyChecklistSubmissions').orderBy('completedAt', 'desc');
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SafetyChecklistSubmission));
    } catch (error) {
        console.error("Error fetching safety checklist submissions:", error);
        throw error;
    }
};

// EMERGENCY CONTACTS SERVICE (Admin Managed)
export const addEmergencyContact = async (contactData: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> => {
    try {
        const docRef = await db.collection('emergencyContacts').add(contactData);
        return { ...contactData, id: docRef.id };
    } catch (error) {
        console.error("Error adding emergency contact:", error);
        throw error;
    }
};

export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
    try {
        const snapshot = await db.collection('emergencyContacts').orderBy('order', 'asc').orderBy('name', 'asc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyContact));
    } catch (error) {
        console.error("Error fetching emergency contacts:", error);
        throw error;
    }
};

export const updateEmergencyContact = async (contactId: string, data: Partial<EmergencyContact>): Promise<void> => {
    try {
        await db.collection('emergencyContacts').doc(contactId).update(data);
    } catch (error) {
        console.error("Error updating emergency contact:", error);
        throw error;
    }
};

export const deleteEmergencyContact = async (contactId: string): Promise<void> => {
    try {
        await db.collection('emergencyContacts').doc(contactId).delete();
    } catch (error) {
        console.error("Error deleting emergency contact:", error);
        throw error;
    }
};

// INTERNAL NEWS SERVICE (Admin Managed)
export const addInternalNewsArticle = async (articleData: Omit<InternalNewsArticle, 'id' | 'publishedAt' | 'updatedAt'>): Promise<InternalNewsArticle> => {
    try {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('internalNews').add({
            ...articleData,
            publishedAt: timestamp,
            updatedAt: timestamp,
        });
        const now = firebase.firestore.Timestamp.now();
        return { ...articleData, id: docRef.id, publishedAt: now, updatedAt: now };
    } catch (error) {
        console.error("Error adding internal news article:", error);
        throw error;
    }
};

export const getInternalNewsArticles = async (): Promise<InternalNewsArticle[]> => {
    try {
        const snapshot = await db.collection('internalNews').orderBy('isPinned', 'desc').orderBy('publishedAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternalNewsArticle));
    } catch (error) {
        console.error("Error fetching internal news articles:", error);
        throw error;
    }
};

export const updateInternalNewsArticle = async (articleId: string, data: Partial<InternalNewsArticle>): Promise<void> => {
    try {
        await db.collection('internalNews').doc(articleId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating internal news article:", error);
        throw error;
    }
};

export const deleteInternalNewsArticle = async (articleId: string): Promise<void> => {
    try {
        await db.collection('internalNews').doc(articleId).delete();
    } catch (error) {
        console.error("Error deleting internal news article:", error);
        throw error;
    }
};

// FEEDBACK SUBMISSION SERVICE
export const addFeedbackSubmission = async (feedbackData: Omit<FeedbackSubmission, 'id' | 'submittedAt' | 'isRead' | 'status'>): Promise<FeedbackSubmission> => {
    try {
        const docRef = await db.collection('feedbackSubmissions').add({
            ...feedbackData,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            isRead: false,
            status: 'new',
        });
        return { ...feedbackData, id: docRef.id, submittedAt: firebase.firestore.Timestamp.now(), isRead: false, status: 'new' };
    } catch (error) {
        console.error("Error adding feedback submission:", error);
        throw error;
    }
};

export const getFeedbackSubmissions = async (): Promise<FeedbackSubmission[]> => {
    try {
        const snapshot = await db.collection('feedbackSubmissions').orderBy('submittedAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackSubmission));
    } catch (error) {
        console.error("Error fetching feedback submissions:", error);
        throw error;
    }
};

export const updateFeedbackSubmission = async (feedbackId: string, data: Partial<FeedbackSubmission>): Promise<void> => {
    try {
        await db.collection('feedbackSubmissions').doc(feedbackId).update(data);
    } catch (error) {
        console.error("Error updating feedback submission:", error);
        throw error;
    }
};

// SHOPPING LIST SERVICE
export const addShoppingList = async (listData: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShoppingList> => {
    try {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('shoppingLists').add({
            ...listData,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        const now = firebase.firestore.Timestamp.now();
        return { ...listData, id: docRef.id, createdAt: now, updatedAt: now };
    } catch (error) {
        console.error("Error adding shopping list:", error);
        throw error;
    }
};

export const getShoppingListsForUser = async (userId: string): Promise<ShoppingList[]> => {
    try {
        const snapshot = await db.collection('shoppingLists')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingList));
    } catch (error) {
        console.error("Error fetching shopping lists for user:", error);
        throw error;
    }
};

export const updateShoppingList = async (listId: string, data: Partial<Omit<ShoppingList, 'userId' | 'createdAt'>>): Promise<void> => {
    try {
        await db.collection('shoppingLists').doc(listId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating shopping list:", error);
        throw error;
    }
};

export const deleteShoppingList = async (listId: string): Promise<void> => {
    try {
        await db.collection('shoppingLists').doc(listId).delete();
    } catch (error) {
        console.error("Error deleting shopping list:", error);
        throw error;
    }
};
