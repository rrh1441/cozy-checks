import { createClient } from '@supabase/supabase-js';
import { config } from './env';
import { logger } from './logger';

// Define Supabase types for your tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'user' | 'admin';
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'user' | 'admin';
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'user' | 'admin';
          is_active?: boolean;
          last_login?: string | null;
          updated_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: 'github_repo' | 'github_pr' | 'custom_code' | 'url';
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          target: string;
          branch: string | null;
          commit_sha: string | null;
          pull_request_id: number | null;
          started_at: string | null;
          completed_at: string | null;
          duration: number | null;
          results: any[] | null;
          summary: any | null;
          raw_output: string | null;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type: 'github_repo' | 'github_pr' | 'custom_code' | 'url';
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          target: string;
          branch?: string | null;
          commit_sha?: string | null;
          pull_request_id?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration?: number | null;
          results?: any[] | null;
          summary?: any | null;
          raw_output?: string | null;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          type?: 'github_repo' | 'github_pr' | 'custom_code' | 'url';
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          target?: string;
          branch?: string | null;
          commit_sha?: string | null;
          pull_request_id?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration?: number | null;
          results?: any[] | null;
          summary?: any | null;
          raw_output?: string | null;
          error?: string | null;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          scan_id: string;
          user_id: string;
          title: string;
          description: string | null;
          summary: any;
          findings: any[];
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scan_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          summary: any;
          findings: any[];
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scan_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          summary?: any;
          findings?: any[];
          pdf_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

// Create Supabase client
export const supabase = createClient<Database>(
  config.supabaseUrl,
  config.supabaseKey
);

// Initialize database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    logger.info('Connected to Supabase successfully');
  } catch (error) {
    logger.error('Error connecting to Supabase:', error);
    process.exit(1);
  }
};