import mongoose, { Document, Schema } from 'mongoose';

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

export interface IScanResult {
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

export interface ISummary {
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

export interface IScan extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: ScanType;
  status: ScanStatus;
  target: string;
  branch?: string;
  commitSha?: string;
  pullRequestId?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  results: IScanResult[];
  summary?: ISummary;
  rawOutput?: string;
  error?: string;
}

const ScanSchema = new Schema<IScan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ScanType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ScanStatus),
      default: ScanStatus.PENDING,
    },
    target: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    commitSha: {
      type: String,
      trim: true,
    },
    pullRequestId: {
      type: Number,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    results: [
      {
        id: String,
        module: String,
        name: String,
        description: String,
        severity: {
          type: String,
          enum: Object.values(SeverityLevel),
        },
        location: String,
        lineNumber: Number,
        code: String,
        recommendation: String,
        references: [String],
      },
    ],
    summary: {
      totalIssues: Number,
      criticalCount: Number,
      highCount: Number,
      mediumCount: Number,
      lowCount: Number,
      topModules: [
        {
          name: String,
          count: Number,
        },
      ],
      shortSummary: String,
      detailedAnalysis: String,
      recommendations: [String],
    },
    rawOutput: String,
    error: String,
  },
  {
    timestamps: true,
  }
);

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);