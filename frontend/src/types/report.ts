import { ScanSummary } from './scan';

export interface Report {
  _id: string;
  scanId: string;
  userId: string;
  title: string;
  description?: string;
  summary: ScanSummary;
  createdAt: string;
  findings: Array<{
    module: string;
    count: number;
    highSeverityCount: number;
  }>;
  pdfUrl?: string;
}

export interface CreateReportRequest {
  scanId: string;
  title: string;
  description?: string;
}

export interface ReportResponse {
  success: boolean;
  report: Report;
}

export interface ReportsResponse {
  success: boolean;
  reports: Report[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}