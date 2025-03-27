import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/api-error';
import { config } from '../config/env';

// Extend Request type to include user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = {
  /**
   * Verify JWT token in Authorization header
   */
  authenticate: (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authentication required');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new ApiError(401, 'Authentication required');
      }

      // Verify token
      const decoded = authService.verifyToken(token);

      // Add user to request object
      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if user has admin role
   */
  isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (req.user.role !== 'admin') {
      return next(new ApiError(403, 'Admin access required'));
    }

    next();
  },

  /**
   * Validate GitHub webhook request
   */
  validateWebhook: (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-hub-signature-256'];
      
      // In a production environment, you would validate the signature using crypto
      // For simplicity, we'll just check for a predefined secret
      const webhookSecret = req.headers['x-webhook-secret'];
      
      if (!webhookSecret || webhookSecret !== config.githubWebhookSecret) {
        throw new ApiError(401, 'Invalid webhook signature');
      }

      next();
    } catch (error) {
      next(error);
    }
  },
};