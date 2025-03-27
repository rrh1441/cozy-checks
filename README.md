# Security Scanner Application

A comprehensive security scanning application that helps identify vulnerabilities in code repositories using AI-powered analysis.

## Features

- GitHub repository scanning
- AI-powered security analysis using Claude and/or ChatGPT
- Detailed scan reports with severity ratings
- User authentication and authorization
- Dashboard with scan statistics
- Interactive UI for managing scans and reports

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Supabase for authentication and database
- JWT for session management
- Claude AI API
- ChatGPT API

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router
- Zustand for state management
- TanStack Query (React Query)
- Recharts for data visualization

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account
- Claude API key (optional)
- ChatGPT API key (optional)
- GitHub Personal Access Token (for repository scanning)

### Supabase Setup

1. Create a new Supabase project
2. Set up the database schema:
   - Go to the SQL editor in your Supabase dashboard
   - Copy the content from `database/schema.sql`
   - Run the SQL script to create all necessary tables and functions

3. Configure authentication:
   - Enable Email/Password sign-up method
   - Optionally enable other authentication providers

4. Get your Supabase URL and keys:
   - Project URL: Found in Project Settings > API
   - Service Role Key: Found in Project Settings > API (use for backend)
   - Public Anon Key: Found in Project Settings > API (use for frontend)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd security-scanner-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_secret_key_for_jwt
   JWT_EXPIRATION=24h
   CLAUDE_API_KEY=your_claude_api_key
   CLAUDE_API_URL=https://api.anthropic.com/v1/messages
   CHATGPT_API_KEY=your_chatgpt_api_key
   CHATGPT_API_URL=https://api.openai.com/v1/chat/completions
   GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
   GITHUB_PAT=your_github_personal_access_token
   GITHUB_REPOSITORY=yourusername/security-scanner-project
   LOG_LEVEL=debug
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Scans
- `POST /api/scans` - Create a new scan
- `GET /api/scans` - Get all scans for the authenticated user
- `GET /api/scans/:scanId` - Get scan details
- `POST /api/scans/:scanId/start` - Start a pending scan

### Reports
- `POST /api/reports` - Generate a report from a completed scan
- `GET /api/reports` - Get all reports for the authenticated user
- `GET /api/reports/:reportId` - Get report details

## License

[MIT](LICENSE)