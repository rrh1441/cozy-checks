import mongoose, { Document, Schema } from 'mongoose';
import { ISummary } from './scan.model';

export interface IReport extends Document {
  scanId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  summary: ISummary;
  createdAt: Date;
  findings: Array<{
    module: string;
    count: number;
    highSeverityCount: number;
  }>;
  pdfUrl?: string;
}

const ReportSchema = new Schema<IReport>(
  {
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'Scan',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    summary: {
      type: Schema.Types.Mixed,
      required: true,
    },
    findings: [
      {
        module: String,
        count: Number,
        highSeverityCount: Number,
      },
    ],
    pdfUrl: String,
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>('Report', ReportSchema);