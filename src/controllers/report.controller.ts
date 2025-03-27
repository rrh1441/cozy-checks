import { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { scanService } from '../services/scan.service';
import { logger } from '../config/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export const reportController = {
  /**
   * Generate a new report
   */
  generateReport: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { scanId, title, description } = req.body;
      const userId = req.user!.id;
      
      // Check if user has access to this scan
      const scan = await scanService.getScanById(scanId);
      if (scan.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      const report = await reportService.generateReport(
        userId,
        scanId,
        title,
        description
      );
      
      res.status(201).json({
        success: true,
        report,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get report by ID
   */
  getReportById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;
      
      const report = await reportService.getReportById(reportId);
      
      // Check if user has access to this report
      if (report.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      res.status(200).json({
        success: true,
        report,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get reports by user ID
   */
  getReports: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      
      const { reports, total } = await reportService.getReportsByUserId(userId, limit, offset);
      
      res.status(200).json({
        success: true,
        reports,
        pagination: {
          total,
          limit,
          offset,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};