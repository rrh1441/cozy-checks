export enum ScanStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ScanType {
  GITHUB_REPO = 'github_repo',
  GITHUB_PR = 'github_pr',
  CUSTOM_CODE = 'custom_code',
  URL = 'url',
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ScanResult {
  id: string;
  module: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  location: string;
  lineNumber?: number;
  code?: string;
  recommendation?: string;
  references?: string[];
}

export interface ScanSummary {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topModules: Array<{
    name: string;
    count: number;
  }>;
  shortSummary: string;
  detailedAnalysis: string;
  recommendations: string[];
}

export interface Scan {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  type: ScanType;
  status: ScanStatus;
  target: string;
  branch?: string;
  commitSha?: string;
  pullRequestId?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  results: ScanResult[];
  summary?: ScanSummary;
  rawOutput?: string;
  error?: string;
}

export interface CreateScanRequest {
  name: string;
  type: ScanType;
  target: string;
  description?: string;
  branch?: string;
}

export interface ScanResponse {
  success: boolean;
  scan: Scan;
}

export interface ScansResponse {
  success: boolean;
  scans: Scan[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}