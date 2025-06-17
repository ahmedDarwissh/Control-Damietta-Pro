
export enum UserRole {
  ENGINEER = 'Engineer', // مهندس
  SHIFT_LEAD = 'ShiftLead', // رئيس ورديه
  UNIT_HEAD = 'UnitHead', // رئيس وحدة
  PRODUCTION_OPERATOR = 'ProductionOperator', // مشغل إنتاج
  ADMIN = 'Admin', // مدير النظام
}

export interface User {
  uid: string;
  name: string;
  email: string | null;
  role: UserRole;
  teamId?: string; 
  teamName?: string; 
  avatarUrl?: string;
  phone?: string;
  presence?: 'online' | 'offline' | 'busy' | string;
  birthDate?: string; // YYYY-MM-DD for birthday reminders
  points?: number; // For gamification
  userSettings?: UserSettings; // For individual preferences
  createdAt?: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
}

export interface UserSettings {
  doNotDisturb?: boolean;
  fontSize?: 'sm' | 'base' | 'lg';
  notificationSound?: NotificationSound;
  preferredTheme?: AppTheme;
  prayerTimeLocation?: string; // e.g., 'Damietta', 'Cairo'
}

export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
  OCEAN_BLUE = 'oceanBlue', // Example custom theme
  DESERT_GOLD = 'desertGold', // Example custom theme
}

export enum NotificationSound {
  DEFAULT = 'default',
  CHIME = 'chime',
  ALERT = 'alert',
  NONE = 'none',
}


export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  teamId: string;
  date: string; // YYYY-MM-DD
  shiftLeadName?: string;
  shiftLeadId?: string;
  teamAvatarUrl?: string;
  notes?: string; // New: Notes for the shift
  createdAt?: firebase.firestore.Timestamp;
  createdBy?: string; // User UID
}

export enum TaskPriority {
  LOW = 'low', // اختياري
  MEDIUM = 'medium', // مهم
  HIGH = 'high', // عاجل
}

export enum TaskCategory {
  GENERAL = 'general',
  MAINTENANCE = 'maintenance',
  SAFETY = 'safety',
  OPERATIONS = 'operations',
  PERSONAL = 'personal',
}

export interface SubTask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface DailyTask {
  id: string;
  userId: string;
  shiftId?: string;
  date: string; // YYYY-MM-DD
  description: string;
  isCompleted: boolean;
  notes?: string;
  priority?: TaskPriority; 
  category?: TaskCategory; 
  dueDate?: string; // YYYY-MM-DD HH:MM for reminders
  reminderSetAt?: firebase.firestore.Timestamp; 
  estimatedTime?: number; // in minutes
  timeSpent?: number; // in minutes, tracked by Pomodoro or manual entry
  subTasks?: SubTask[]; 
  recurrenceRule?: string; 
  templateId?: string; 
  sharedWith?: string[]; 
  kanbanColumn?: 'todo' | 'inprogress' | 'done'; // Added for Kanban Board
  createdAt?: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  estimatedTime?: number;
  subTasks?: Omit<SubTask, 'id' | 'isCompleted'>[];
  createdBy: string; // User UID
  createdAt: firebase.firestore.Timestamp;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  taskId?: string; 
  startTime: firebase.firestore.Timestamp;
  duration: number; // minutes
  isCompleted: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string; 
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: firebase.firestore.Timestamp;
  reviewedBy?: string; // Admin UID
  reviewedByName?: string; // Admin Name
  reviewedAt?: firebase.firestore.Timestamp;
}

export interface AuditLogEntry {
  id: string;
  timestamp: firebase.firestore.Timestamp;
  userId: string; 
  userName: string; 
  action: string; 
  details: string; 
  targetId?: string; 
  targetType?: string; // e.g., 'task', 'shift', 'user', 'appConfig'
}


export enum ShipStatus {
  IMPORT = 'Import',
  EXPORT = 'Export',
}

export enum CargoType {
  LPG = 'LPG',
  LNG = 'LNG',
  PROPANE = 'Propane',
}

export interface ShipInfo {
  id: string;
  name: string;
  status: ShipStatus;
  cargoType: CargoType;
  eta?: string;
  etd?: string;
  currentQuantity?: number;
  hourlyRate?: number;
  pumpStatus?: { [key: string]: 'Operational' | 'Offline' | 'Maintenance' };
  createdAt?: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
}

export enum Language {
  AR = 'ar',
  EN = 'en',
}

export interface Team {
  id: string;
  name: string;
  shiftLeadName: string;
  shiftLeadRole: UserRole.SHIFT_LEAD;
  members?: { name: string, role: UserRole.PRODUCTION_OPERATOR | UserRole.UNIT_HEAD }[];
  avatarUrl?: string;
}

export enum DisclaimerAgreementStatus {
  NOT_AGREED = 'not_agreed',
  AGREED = 'agreed',
}

export interface AuthState {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  isFirestoreOffline: boolean;
}

export interface AuthContextType extends AuthState {
  signUp: (name: string, email: string, pass: string, role: UserRole, teamId?: string, teamName?: string, avatarUrl?: string) => Promise<void>;
  logIn: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logOut: () => Promise<void>;
  handleFirestoreOutcome: (error: any | null) => void;
  updateUserPresence: (status: User['presence']) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

declare global {
  interface Window { firebase: any; }
}
export declare namespace firebase.firestore {
    export class Timestamp {
        static now(): Timestamp;
        static fromDate(date: Date): Timestamp;
        static fromMillis(milliseconds: number): Timestamp;
        toDate(): Date;
        toMillis(): number;
        isEqual(other: Timestamp): boolean;
        valueOf(): string;
    }
    export class FieldValue {
        static serverTimestamp(): Timestamp;
        static delete(): FieldValue;
        static arrayUnion(...elements: any[]): FieldValue;
        static arrayRemove(...elements: any[]): FieldValue;
        static increment(n: number): FieldValue;
    }
}


export type PageNavItemId =
  'dashboard' |
  'shifts' |
  'tasks' |
  'ships' |
  'team' |
  'entertainment' |
  'reports' |
  'settings' |
  'admin' |
  'pid' |
  'savings' | 
  'butler' |
  'chat' |
  'more' |
  'profile' |
  'equipmentLog' | 
  'safetyChecklist' | 
  'emergencyContacts' | 
  'unitConverter' | 
  'documentViewer' | 
  'feedback'| 
  'userGuide' | 
  'internalNews' |
  'taskTemplates' | 
  'pomodoroTimer' | 
  'personalCalendar' | 
  'leaveRequests' | 
  'userDirectory' | 
  'auditLog' | 
  'noteTaking' | 
  'learningResources' | 
  'personalExpenses' | 
  'goalSetting' | 
  'advancedCalculator' | 
  'kanbanBoard' | 
  'documentScanner' | 
  'dataExportImport' |
  'shoppingList';


export interface PrayerTime {
  nameKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  time: string;
}

export interface ChatMessage {
  id: string;
  roomId: string; 
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text?: string;
  fileUrl?: string; 
  fileType?: string; 
  fileName?: string; 
  fileSize?: number; 
  reactions?: { [emoji: string]: string[] }; 
  timestamp: firebase.firestore.Timestamp;
  isOptimistic?: boolean; 
}

export interface AppConfiguration {
  quranRadioUrl: string;
  isShiftButlerEnabled: boolean;
  isSavingsPoolEnabled: boolean; 
  isEntertainmentEnabled: boolean;
  isEquipmentLogEnabled: boolean;
  isSafetyChecklistEnabled: boolean;
  isEmergencyContactsEnabled: boolean;
  isUnitConverterEnabled: boolean;
  isDocumentViewerEnabled: boolean;
  isInternalNewsEnabled: boolean;
  isFeedbackEnabled: boolean;
  isUserGuideEnabled: boolean;
  isPomodoroEnabled?: boolean;
  isLeaveRequestsEnabled?: boolean;
  isNoteTakingEnabled?: boolean;
  isLearningResourcesEnabled?: boolean;
  isPersonalExpensesEnabled?: boolean;
  isGoalSettingEnabled?: boolean;
  isAdvancedCalculatorEnabled?: boolean;
  isKanbanBoardEnabled?: boolean;
  isDocumentScannerEnabled?: boolean;
  isDataExportImportEnabled?: boolean;
  isPersonalCalendarEnabled?: boolean; 
  isAuditLogEnabled?: boolean; 
  isTaskTemplatesEnabled?: boolean;
  isUserDirectoryEnabled?: boolean; 
  isShoppingListEnabled?: boolean; // New feature toggle
  [key: string]: any;
}

export interface GeminiContent {
  id: string;
  type: 'wisdom' | 'riddle' | 'joke';
  language: Language;
  text: string;
  answer?: string;
  generatedAt: firebase.firestore.Timestamp;
}

export interface EquipmentLogEntry {
  id: string;
  equipmentName: string;
  issueDescription: string;
  reportedByUid: string; 
  reporterName: string; 
  reportedAt: firebase.firestore.Timestamp;
  status: 'reported' | 'in_progress' | 'resolved';
  resolvedAt?: firebase.firestore.Timestamp;
  resolvedByUid?: string; 
  adminNotes?: string;
}

export interface SafetyChecklistItemDef { 
  id: string;
  textKey: string; 
  category: string; 
}

export interface SafetyChecklistSubmissionItem { 
  itemId: string; 
  text: string; 
  isChecked: boolean;
  notes?: string;
}

export interface SafetyChecklistSubmission {
  id: string;
  userId: string; 
  userName: string; 
  shiftId?: string; 
  date: string; // YYYY-MM-DD
  items: SafetyChecklistSubmissionItem[];
  overallNotes?: string;
  completedAt: firebase.firestore.Timestamp;
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  department: string; 
  description?: string;
  order?: number; 
}

export interface InternalNewsArticle {
  id: string;
  title: string;
  content: string; 
  authorName: string; 
  authorUid: string; 
  publishedAt: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
  imageUrl?: string; 
  category?: string; 
  isPinned?: boolean;
}

export interface FeedbackSubmission {
  id: string;
  userId: string; 
  userName?: string; 
  email?: string; 
  type: 'bug' | 'suggestion' | 'compliment' | 'other';
  message: string;
  pageContext?: string; 
  submittedAt: firebase.firestore.Timestamp;
  isRead?: boolean;
  adminNotes?: string;
  status?: 'new' | 'in_progress' | 'resolved' | 'archived';
}

export interface UserNote {
  id: string;
  userId: string;
  title: string;
  content: string; 
  category?: string;
  tags?: string[];
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  color?: string; 
}

export interface LearningResource {
  id: string;
  title: string;
  url?: string; // For links
  filePath?: string; // For uploaded files (path in Firebase Storage)
  fileName?: string; // Original file name for display
  fileType?: string; // MIME type
  description?: string;
  type: 'link' | 'document' | 'video'; // 'document' can be PDF, DOCX, etc. 'video' can be MP4, etc.
  addedByUid: string; 
  addedByName?: string; 
  createdAt: firebase.firestore.Timestamp;
  category?: string; 
  tags?: string[];
}

export interface PersonalExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string; 
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: firebase.firestore.Timestamp;
}

export interface PersonalGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetDate?: string; // YYYY-MM-DD
  isAchieved: boolean;
  category: 'personal' | 'professional' | 'health' | 'finance' | 'learning';
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  progress?: number; // 0-100 
}

export interface UserContact { 
    uid: string;
    name: string;
    role: UserRole;
    teamName?: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
    presence?: User['presence'];
    birthDate?: string; // Added for birthday reminders
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: string; // e.g., "2 kg", "1 box"
  isPurchased: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}
