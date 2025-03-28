import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';
import { UserRole } from '../models/user.model';

export const authController = {
  /**
   * Register a new user
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const user = await authService.register(
        email,
        password,
        firstName,
        lastName
      );
      
      // Generate token
      const token = authService.generateToken(user);
      
      // Return user data and token (exclude password)
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      
      res.status(201).json({
        success: true,
        user: userData,
        token,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login a user
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      const { user, token } = await authService.login(email, password);
      
      // Return user data and token (exclude password)
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      
      res.status(200).json({
        success: true,
        user: userData,
        token,
      });
    } catch (error) {
      next(error);
    }
  },
};