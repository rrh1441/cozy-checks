
export interface User {
  id: string;
  email: string;
  name: string;
  freeReportUsed: boolean;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface Identifier {
  type: 'email' | 'employer' | 'domain' | 'phone';
  value: string;
  id: string;
}

export interface SearchRequest {
  fullName: string;
  identifiers: Identifier[];
}

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Report {
  id: string;
  subjectName: string;
  status: ReportStatus;
  createdAt: string;
  completedAt?: string;
  identifiers: Identifier[];
  sections?: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: 'identity' | 'social' | 'business' | 'geolocation' | 'darkweb' | 'summary';
  data: any;
  loading?: boolean;
}
