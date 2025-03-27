import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { config } from '../config/env';
import { ApiError } from '../utils/api-error';

// Define user role enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// Define user interface
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  public async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = UserRole.USER
  ): Promise<IUser> {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new ApiError(500, 'Database error checking for existing user');
    }
    
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Register user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        }
      }
    });

    if (authError) {
      throw new ApiError(500, `Error registering user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new ApiError(500, 'Error creating user');
    }

    // Insert user data in users table
    const { data: userData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new ApiError(500, `Error inserting user data: ${insertError.message}`);
    }

    // Format and return user data
    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role as UserRole,
      isActive: userData.is_active,
      lastLogin: userData.last_login ? new Date(userData.last_login) : undefined,
    };
  }

  /**
   * Login a user
   */
  public async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    // Login with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!authData.user) {
      throw new ApiError(401, 'Authentication failed');
    }

    // Get user profile from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      throw new ApiError(500, 'Error fetching user data');
    }

    // Check if user is active
    if (!userData.is_active) {
      throw new ApiError(401, 'Account is inactive');
    }

    // Update last login
    const now = new Date().toISOString();
    await supabase
      .from('users')
      .update({ last_login: now, updated_at: now })
      .eq('id', userData.id);

    // Format user data
    const user: IUser = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role as UserRole,
      isActive: userData.is_active,
      lastLogin: new Date(),
    };

    // Generate token using our JWT secret (instead of Supabase token)
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Generate JWT token
   */
  public generateToken(user: IUser): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiration,
    });
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new ApiError(401, 'Invalid token');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();