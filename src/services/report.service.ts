import { supabase } from '../config/database';
import { scanService } from './scan.service';
import { logger } from '../config/logger';
import { ApiError } from '../utils/api-error';
import { ISummary } from './scan.service';

export interface IReport {
  id: string;
  scanId: string;
  userId: string;
  title: string;
  description?: string;
  summary: ISummary;
  createdAt: string;
  findings: Array<{
    module: string;
    count: number;
    highSeverityCount: number;
  }>;
  pdfUrl?: string;
}

export class ReportService {
  /**
   * Generate a report from a completed scan
   */
  public async generateReport(
    userId: string,
    scanId: string,
    title: string,
    description?: string
  ): Promise<IReport> {
    try {
      // Get scan data
      const scan = await scanService.getScanById(scanId);
      
      // Verify scan is completed
      if (scan.status !== 'completed') {
        throw new ApiError(400, 'Cannot generate report: scan is not completed');
      }
      
      // Verify scan has a summary
      if (!scan.summary) {
        throw new ApiError(400, 'Cannot generate report: scan has no summary');
      }
      
      // Group findings by module
      const moduleMap = new Map<string, { count: number; highSeverityCount: number }>();
      
      scan.results.forEach(result => {
        const module = result.module;
        if (!moduleMap.has(module)) {
          moduleMap.set(module, { count: 0, highSeverityCount: 0 });
        }
        
        const moduleStats = moduleMap.get(module)!;
        moduleStats.count += 1;
        
        if (result.severity === 'high' || result.severity === 'critical') {
          moduleStats.highSeverityCount += 1;
        }
      });
      
      // Convert map to array for Supabase
      const findings = Array.from(moduleMap.entries()).map(([module, stats]) => ({
        module,
        count: stats.count,
        highSeverityCount: stats.highSeverityCount,
      }));
      
      const now = new Date().toISOString();
      
      // Create report in database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          scan_id: scanId,
          user_id: userId,
          title,
          description,
          summary: scan.summary,
          findings,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();
      
      if (error) {
        throw new ApiError(500, `Error creating report: ${error.message}`);
      }
      
      if (!data) {
        throw new ApiError(500, 'Failed to create report');
      }
      
      // Format and return report data
      return {
        id: data.id,
        scanId: data.scan_id,
        userId: data.user_id,
        title: data.title,
        description: data.description || undefined,
        summary: data.summary,
        findings: data.findings,
        createdAt: data.created_at,
        pdfUrl: data.pdf_url || undefined,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error generating report:', error);
      throw new ApiError(500, 'Failed to generate report');
    }
  }

  /**
   * Get report by ID
   */
  public async getReportById(reportId: string): Promise<IReport> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) {
        throw new ApiError(404, 'Report not found');
      }

      if (!data) {
        throw new ApiError(404, 'Report not found');
      }

      // Format and return report data
      return {
        id: data.id,
        scanId: data.scan_id,
        userId: data.user_id,
        title: data.title,
        description: data.description || undefined,
        summary: data.summary,
        findings: data.findings,
        createdAt: data.created_at,
        pdfUrl: data.pdf_url || undefined,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error fetching report ${reportId}:`, error);
      throw new ApiError(500, 'Failed to fetch report');
    }
  }

  /**
   * Get reports by user ID
   */
  public async getReportsByUserId(userId: string, limit = 10, offset = 0): Promise<{ reports: IReport[]; total: number }> {
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        throw new ApiError(500, `Error counting reports: ${countError.message}`);
      }

      // Get report data
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ApiError(500, `Error fetching reports: ${error.message}`);
      }

      // Format and return report data
      const reports: IReport[] = data.map(item => ({
        id: item.id,
        scanId: item.scan_id,
        userId: item.user_id,
        title: item.title,
        description: item.description || undefined,
        summary: item.summary,
        findings: item.findings,
        createdAt: item.created_at,
        pdfUrl: item.pdf_url || undefined,
      }));

      return { reports, total: count || 0 };
    } catch (error) {
      logger.error(`Error fetching reports for user ${userId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to fetch reports');
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();