import { Response, NextFunction } from 'express';
import { scanService, ScanType } from '../services/scan.service';
import { logger } from '../config/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export const scanController = {
  /**
   * Create a new scan
   */
  createScan: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, type, target, description, branch } = req.body;
      const userId = req.user!.id;
      
      const scan = await scanService.createScan(
        userId,
        name,
        type as ScanType,
        target,
        description,
        branch
      );
      
      res.status(201).json({
        success: true,
        scan,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get scan by ID
   */
  getScanById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { scanId } = req.params;
      
      const scan = await scanService.getScanById(scanId);
      
      // Check if user has access to this scan
      if (scan.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      res.status(200).json({
        success: true,
        scan,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get scans by user ID
   */
  getScans: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      
      const { scans, total } = await scanService.getScansByUserId(userId, limit, offset);
      
      res.status(200).json({
        success: true,
        scans,
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

  /**
   * Start a scan
   */
  startScan: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { scanId } = req.params;
      
      // Check if user has access to this scan
      const scan = await scanService.getScanById(scanId);
      if (scan.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      await scanService.startScan(scanId);
      
      res.status(200).json({
        success: true,
        message: 'Scan started successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};