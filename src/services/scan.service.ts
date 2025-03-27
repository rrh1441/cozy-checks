import { supabase } from '../config/database';
import { githubService } from './github.service';
import { claudeService } from './claude.service';
import { logger } from '../config/logger';
import { ApiError } from '../utils/api-error';

// Define scan types and enums
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

export interface IScan {
  id: string;
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
  results: IScanResult[];
  summary?: ISummary;
  rawOutput?: string;
  error?: string;
}

export class ScanService {
  /**
   * Create a new scan
   */
  public async createScan(
    userId: string,
    name: string,
    type: ScanType,
    target: string,
    description?: string,
    branch?: string
  ): Promise<IScan> {
    try {
      const now = new Date().toISOString();
      
      // Insert scan record
      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: userId,
          name,
          description,
          type,
          target,
          branch: branch || 'main',
          status: ScanStatus.PENDING,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(500, `Error creating scan: ${error.message}`);
      }

      if (!data) {
        throw new ApiError(500, 'Failed to create scan');
      }

      // Convert to IScan interface format
      const scan: IScan = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        status: data.status,
        target: data.target,
        branch: data.branch || undefined,
        commitSha: data.commit_sha || undefined,
        pullRequestId: data.pull_request_id || undefined,
        createdAt: data.created_at,
        startedAt: data.started_at || undefined,
        completedAt: data.completed_at || undefined,
        duration: data.duration || undefined,
        results: data.results || [],
        summary: data.summary || undefined,
        rawOutput: data.raw_output || undefined,
        error: data.error || undefined,
      };

      // Start the scan process asynchronously
      this.startScan(scan.id).catch(error => {
        logger.error(`Error starting scan ${scan.id}:`, error);
      });

      return scan;
    } catch (error) {
      logger.error('Error creating scan:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to create scan');
    }
  }

  /**
   * Get scan by ID
   */
  public async getScanById(scanId: string): Promise<IScan> {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (error) {
        throw new ApiError(404, 'Scan not found');
      }

      if (!data) {
        throw new ApiError(404, 'Scan not found');
      }

      // Convert to IScan interface format
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        status: data.status,
        target: data.target,
        branch: data.branch || undefined,
        commitSha: data.commit_sha || undefined,
        pullRequestId: data.pull_request_id || undefined,
        createdAt: data.created_at,
        startedAt: data.started_at || undefined,
        completedAt: data.completed_at || undefined,
        duration: data.duration || undefined,
        results: data.results || [],
        summary: data.summary || undefined,
        rawOutput: data.raw_output || undefined,
        error: data.error || undefined,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error fetching scan ${scanId}:`, error);
      throw new ApiError(500, 'Failed to fetch scan');
    }
  }

  /**
   * Get scans by user ID
   */
  public async getScansByUserId(userId: string, limit = 10, offset = 0): Promise<{ scans: IScan[]; total: number }> {
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        throw new ApiError(500, `Error counting scans: ${countError.message}`);
      }

      // Get scan data
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ApiError(500, `Error fetching scans: ${error.message}`);
      }

      // Convert to IScan interface format
      const scans: IScan[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.name,
        description: item.description || undefined,
        type: item.type,
        status: item.status,
        target: item.target,
        branch: item.branch || undefined,
        commitSha: item.commit_sha || undefined,
        pullRequestId: item.pull_request_id || undefined,
        createdAt: item.created_at,
        startedAt: item.started_at || undefined,
        completedAt: item.completed_at || undefined,
        duration: item.duration || undefined,
        results: item.results || [],
        summary: item.summary || undefined,
        rawOutput: item.raw_output || undefined,
        error: item.error || undefined,
      }));

      return { scans, total: count || 0 };
    } catch (error) {
      logger.error(`Error fetching scans for user ${userId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to fetch scans');
    }
  }

  /**
   * Start a scan
   */
  public async startScan(scanId: string): Promise<void> {
    try {
      const scan = await this.getScanById(scanId);
      
      if (scan.status !== ScanStatus.PENDING) {
        throw new ApiError(400, `Cannot start scan with status ${scan.status}`);
      }
      
      // Update scan status to in progress
      const now = new Date().toISOString();
      await supabase
        .from('scans')
        .update({
          status: ScanStatus.IN_PROGRESS,
          started_at: now,
          updated_at: now,
        })
        .eq('id', scanId);

      // Run the appropriate scan based on type
      let results: IScanResult[] = [];
      
      try {
        switch (scan.type) {
          case ScanType.GITHUB_REPO:
            results = await this.scanGithubRepo(scan);
            break;
          case ScanType.GITHUB_PR:
            // TODO: Implement GitHub PR scanning
            break;
          case ScanType.CUSTOM_CODE:
            // TODO: Implement custom code scanning
            break;
          case ScanType.URL:
            // TODO: Implement URL scanning
            break;
          default:
            throw new Error(`Unsupported scan type: ${scan.type}`);
        }

        // Generate summary using Claude
        const summary = await claudeService.generateSummary(results);
        
        // Calculate duration
        const completedAt = new Date().toISOString();
        const startedDate = scan.startedAt ? new Date(scan.startedAt) : new Date(scan.createdAt);
        const completedDate = new Date(completedAt);
        const duration = completedDate.getTime() - startedDate.getTime();
        
        // Update scan with results and summary
        await supabase
          .from('scans')
          .update({
            results,
            summary,
            status: ScanStatus.COMPLETED,
            completed_at: completedAt,
            duration,
            updated_at: completedAt,
          })
          .eq('id', scanId);
      } catch (error) {
        logger.error(`Error executing scan ${scanId}:`, error);
        
        // Update scan status to failed
        const completedAt = new Date().toISOString();
        await supabase
          .from('scans')
          .update({
            status: ScanStatus.FAILED,
            completed_at: completedAt,
            error: error instanceof Error ? error.message : 'Unknown error',
            updated_at: completedAt,
          })
          .eq('id', scanId);
      }
    } catch (error) {
      logger.error(`Error starting scan ${scanId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to start scan');
    }
  }

  /**
   * Scan a GitHub repository
   */
  private async scanGithubRepo(scan: IScan): Promise<IScanResult[]> {
    try {
      const results = await githubService.scanRepository(scan.target, scan.branch);
      return results;
    } catch (error) {
      logger.error(`Error scanning GitHub repository ${scan.target}:`, error);
      throw new Error(`Failed to scan GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const scanService = new ScanService();