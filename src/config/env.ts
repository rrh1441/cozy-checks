import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'default-dev-secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  claudeApiKey: process.env.CLAUDE_API_KEY || '',
  claudeApiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
  chatgptApiKey: process.env.CHATGPT_API_KEY || '',
  chatgptApiUrl: process.env.CHATGPT_API_URL || 'https://api.openai.com/v1/chat/completions',
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
  githubPat: process.env.GITHUB_PAT || '',
  githubRepository: process.env.GITHUB_REPOSITORY || '',
  logLevel: process.env.LOG_LEVEL || 'info',
};