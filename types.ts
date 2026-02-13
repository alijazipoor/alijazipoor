
export enum RepairStatus {
  PENDING = 'در انتظار',
  REPAIRING = 'در حال تعمیر',
  COMPLETED = 'تعمیر شده',
  UNREPAIRABLE = 'غیر قابل تعمیر',
  DELIVERED = 'تحویل داده شده'
}

export enum AppLanguage {
  FA = 'fa',
  EN = 'en'
}

export enum AppTheme {
  DARK = 'dark',
  WHITE_ORANGE = 'white-orange',
  ORANGE_WHITE = 'orange-white'
}

export interface AppSettings {
  defaultReceiver: string;
  defaultTechnician: string;
  language: AppLanguage;
  theme: AppTheme;
}

export interface CallLog {
  id: string;
  date: string;
  callerName: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  modemModel: string;
  serialNumber: string;
  issue: string;
  accessories: string;
  status: RepairStatus;
  createdAt: string;
  estimatedCost?: string;
  finalCost?: string;
  furtherDetails?: string;
  reminderDateTime?: string; // Format: YYYY-MM-DDTHH:mm
  receiverName: string;
  technicianName: string;
  callLogs: CallLog[];
}

export interface DiagnosisResult {
  possibleCauses: string[];
  suggestedSteps: string[];
}
