# Implementation Guide

This guide provides detailed instructions for implementing the Security Scanner application from start to finish.

## Project Setup

### 1. Initial Setup

1. **Create Project Directories**:

   ```bash
   # Create project directories
   mkdir -p security-scanner-project/{security-scanner-app,security-scanner-api}
   cd security-scanner-project
   ```

2. **Initialize Git Repository**:

   ```bash
   git init
   echo "node_modules/\n.env\ndist/\n.DS_Store" > .gitignore
   ```

3. **Create GitHub Repository**:
   - Create a new repository on GitHub
   - Add the repository as a remote:
     ```bash
     git remote add origin https://github.com/yourusername/security-scanner-project.git
     ```

### 2. Frontend Setup

1. **Create Lovable Frontend Project**:

   ```bash
   cd security-scanner-app
   npx create-lovable-app .
   ```

2. **Install Additional Dependencies**:

   ```bash
   npm install axios zustand react-router-dom @tanstack/react-query recharts
   ```

3. **Configure Environment Variables**:

   Create a `.env.local` file:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

### 3. Backend Setup

1. **Initialize Node.js Project**:

   ```bash
   cd ../security-scanner-api
   npm init -y
   ```

2. **Install Dependencies**:

   ```bash
   npm install express mongoose jsonwebtoken bcrypt cors helmet morgan dotenv winston express-validator axios
   npm install --save-dev typescript @types/express @types/node @types/cors @types/morgan @types/jsonwebtoken @types/bcrypt nodemon ts-node
   ```

3. **Initialize TypeScript**:

   ```bash
   npx tsc --init
   ```

4. **Create Environment Variables**:

   Create a `.env` file:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/security-scanner
   JWT_SECRET=your_development_jwt_secret
   JWT_EXPIRATION=24h
   CLAUDE_API_KEY=your_claude_api_key
   CLAUDE_API_URL=https://api.anthropic.com/v1/messages
   CHATGPT_API_KEY=your_chatgpt_api_key
   CHATGPT_API_URL=https://api.openai.com/v1/chat/completions
   GITHUB_WEBHOOK_SECRET=your_github_webhook_secret_dev
   GITHUB_PAT=your_github_personal_access_token
   GITHUB_REPOSITORY=yourusername/security-scanner-project
   LOG_LEVEL=debug
   ```

## Backend Implementation

### 1. Project Structure Setup

1. **Create Project Structure**:

   ```bash
   mkdir -p src/{config,controllers,middleware,models,routes,services,utils}
   touch src/{app.ts,server.ts}
   ```

2. **Configure TypeScript**:

   Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "es2018",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "**/*.spec.ts"]
   }
   ```

3. **Setup Nodemon for Development**:

   Create `nodemon.json`:
   ```json
   {
     "watch": ["src"],
     "ext": "ts",
     "ignore": ["src/**/*.spec.ts"],
     "exec": "ts-node src/server.ts"
   }
   ```

   Update `package.json` scripts:
   ```json
   "scripts": {
     "start": "node dist/server.js",
     "dev": "nodemon",
     "build": "tsc",
     "lint": "eslint src/**/*.ts",
     "lint:fix": "eslint src/**/*.ts --fix"
   }
   ```

### 2. Base Configuration

1. **Environment Configuration** (`src/config/env.ts`):

   ```typescript
   import dotenv from 'dotenv';
   
   // Load environment variables
   dotenv.config();
   
   export const config = {
     port: process.env.PORT || 3000,
     nodeEnv: process.env.NODE_ENV || 'development',
     mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/security-scanner',
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
   ```

2. **Logger Configuration** (`src/config/logger.ts`):

   ```typescript
   import winston from 'winston';
   import { config } from './env';
   
   const { format, transports } = winston;
   
   // Define log format
   const logFormat = format.combine(
     format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
     format.errors({ stack: true }),
     format.splat(),
     format.json()
   );
   
   // Create logger instance
   export const logger = winston.createLogger({
     level: config.logLevel,
     format: logFormat,
     defaultMeta: { service: 'security-scanner-api' },
     transports: [
       // Write to all logs with level 'info' and below to combined.log
       new transports.File({ filename: 'logs/combined.log' }),
       // Write all logs with level 'error' and below to error.log
       new transports.File({ filename: 'logs/error.log', level: 'error' }),
     ],
   });
   
   // If not in production, log to console as well
   if (config.nodeEnv !== 'production') {
     logger.add(
       new transports.Console({
         format: format.combine(
           format.colorize(),
           format.simple()
         ),
       })
     );
   }
   ```

3. **Database Configuration** (`src/config/database.ts`):

   ```typescript
   import mongoose from 'mongoose';
   import { config } from './env';
   import { logger } from './logger';
   
   // Connect to MongoDB
   export const connectDatabase = async (): Promise<void> => {
     try {
       await mongoose.connect(config.mongodbUri);
       logger.info('Connected to MongoDB successfully');
     } catch (error) {
       logger.error('Error connecting to MongoDB:', error);
       process.exit(1);
     }
   };
   ```

### 3. Models Implementation

1. **User Model** (`src/models/user.model.ts`):

   ```typescript
   import mongoose, { Document, Schema } from 'mongoose';
   import bcrypt from 'bcrypt';
   
   export enum UserRole {
     USER = 'user',
     ADMIN = 'admin',
   }
   
   export interface IUser extends Document {
     email: string;
     password: string;
     firstName: string;
     lastName: string;
     role: UserRole;
     isActive: boolean;
     lastLogin?: Date;
     comparePassword(candidatePassword: string): Promise<boolean>;
   }
   
   const UserSchema = new Schema<IUser>(
     {
       email: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
       },
       password: {
         type: String,
         required: true,
       },
       firstName: {
         type: String,
         required: true,
         trim: true,
       },
       lastName: {
         type: String,
         required: true,
         trim: true,
       },
       role: {
         type: String,
         enum: Object.values(UserRole),
         default: UserRole.USER,
       },
       isActive: {
         type: Boolean,
         default: true,
       },
       lastLogin: {
         type: Date,
       },
     },
     {
       timestamps: true,
     }
   );
   
   // Hash password before saving
   UserSchema.pre('save', async function (next) {
     if (!this.isModified('password')) return next();
   
     try {
       const salt = await bcrypt.genSalt(10);
       this.password = await bcrypt.hash(this.password, salt);
       next();
     } catch (error: any) {
       next(error);
     }
   });
   
   // Method to compare passwords
   UserSchema.methods.comparePassword = async function (
     candidatePassword: string
   ): Promise<boolean> {
     return bcrypt.compare(candidatePassword, this.password);
   };
   
   export const User = mongoose.model<IUser>('User', UserSchema);
   ```

2. **Scan Model** (implementation according to previously defined model)

3. **Report Model** (`src/models/report.model.ts`):

   ```typescript
   import mongoose, { Document, Schema } from 'mongoose';
   import { ISummary } from './scan.model';
   
   export interface IReport extends Document {
     scanId: mongoose.Types.ObjectId;
     userId: mongoose.Types.ObjectId;
     title: string;
     description?: string;
     summary: ISummary;
     createdAt: Date;
     findings: Array<{
       module: string;
       count: number;
       highSeverityCount: number;
     }>;
     pdfUrl?: string;
   }
   
   const ReportSchema = new Schema<IReport>(
     {
       scanId: {
         type: Schema.Types.ObjectId,
         ref: 'Scan',
         required: true,
       },
       userId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true,
       },
       title: {
         type: String,
         required: true,
         trim: true,
       },
       description: {
         type: String,
         trim: true,
       },
       summary: {
         type: Schema.Types.Mixed,
         required: true,
       },
       findings: [
         {
           module: String,
           count: Number,
           highSeverityCount: Number,
         },
       ],
       pdfUrl: String,
     },
     {
       timestamps: true,
     }
   );
   
   export const Report = mongoose.model<IReport>('Report', ReportSchema);
   ```

### 4. Services Implementation

1. **Auth Service** (`src/services/auth.service.ts`):

   ```typescript
   import jwt from 'jsonwebtoken';
   import { User, IUser, UserRole } from '../models/user.model';
   import { config } from '../config/env';
   import { ApiError } from '../utils/api-error';
   
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
       const existingUser = await User.findOne({ email });
       if (existingUser) {
         throw new ApiError(400, 'User with this email already exists');
       }
   
       // Create new user
       const user = new User({
         email,
         password,
         firstName,
         lastName,
         role,
       });
   
       return user.save();
     }
   
     /**
      * Login a user
      */
     public async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
       // Find user by email
       const user = await User.findOne({ email });
       if (!user) {
         throw new ApiError(401, 'Invalid credentials');
       }
   
       // Check if user is active
       if (!user.isActive) {
         throw new ApiError(401, 'Account is inactive');
       }
   
       // Check password
       const isPasswordValid = await user.comparePassword(password);
       if (!isPasswordValid) {
         throw new ApiError(401, 'Invalid credentials');
       }
   
       // Update last login
       user.lastLogin = new Date();
       await user.save();
   
       // Generate token
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
   ```

2. **Claude AI Service** and **ChatGPT Service** (per earlier implementations)

3. **GitHub Service** (per earlier implementation)

### 5. Controllers and Routes

Implement controllers and routes as described in the earlier files, following the pattern from the scan controller implementation.

### 6. Middleware

1. **Auth Middleware** (`src/middleware/auth.middleware.ts`):

   ```typescript
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
   ```

2. **Error Middleware** (`src/middleware/error.middleware.ts`):

   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { ApiError } from '../utils/api-error';
   import { logger } from '../config/logger';
   
   export const errorMiddleware = (
     error: Error,
     req: Request,
     res: Response,
     next: NextFunction
   ) => {
     logger.error(error);
   
     // If error is instance of ApiError, use its status code
     if (error instanceof ApiError) {
       return res.status(error.statusCode).json({
         success: false,
         message: error.message,
       });
     }
   
     // Default to 500 internal server error
     return res.status(500).json({
       success: false,
       message: 'Internal Server Error',
     });
   };
   ```

3. **Validation Middleware** (`src/middleware/validation.middleware.ts`):

   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { validationResult, ValidationChain } from 'express-validator';
   
   export const validate = (validations: ValidationChain[]) => {
     return async (req: Request, res: Response, next: NextFunction) => {
       // Run all validations
       await Promise.all(validations.map(validation => validation.run(req)));
   
       // Check if there are validation errors
       const errors = validationResult(req);
       if (errors.isEmpty()) {
         return next();
       }
   
       // Return validation errors
       return res.status(400).json({
         success: false,
         message: 'Validation error',
         errors: errors.array(),
       });
     };
   };
   ```

### 7. Application and Server Setup

1. **Express App** (`src/app.ts`):

   ```typescript
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import morgan from 'morgan';
   import { config } from './config/env';
   import { logger } from './config/logger';
   import { errorMiddleware } from './middleware/error.middleware';
   
   // Import routes
   import authRoutes from './routes/auth.routes';
   import scanRoutes from './routes/scan.routes';
   import reportRoutes from './routes/report.routes';
   
   // Initialize Express app
   const app = express();
   
   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ extended: true, limit: '50mb' }));
   app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
   
   // Routes
   app.use('/api/auth', authRoutes);
   app.use('/api/scans', scanRoutes);
   app.use('/api/reports', reportRoutes);
   
   // Health check endpoint
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'UP' });
   });
   
   // Error handling middleware
   app.use(errorMiddleware);
   
   export default app;
   ```

2. **Server Entry Point** (`src/server.ts`):

   ```typescript
   import app from './app';
   import { config } from './config/env';
   import { logger } from './config/logger';
   import { connectDatabase } from './config/database';
   
   // Connect to MongoDB
   connectDatabase()
     .then(() => {
       // Start Express server
       app.listen(config.port, () => {
         logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
       });
     })
     .catch(error => {
       logger.error('Failed to start server:', error);
       process.exit(1);
     });
   
   // Handle unhandled promise rejections
   process.on('unhandledRejection', (error: Error) => {
     logger.error('Unhandled Promise Rejection:', error);
     // Do not exit the process in production
     if (config.nodeEnv !== 'production') {
       process.exit(1);
     }
   });
   ```

## Frontend Implementation

### 1. Project Structure Setup

1. **Create Project Structure**:

   ```bash
   cd ../security-scanner-app
   mkdir -p src/{components,hooks,lib,pages,store,types}
   ```

2. **Configure Routing** (`src/App.tsx`):

   ```tsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import HomePage from './pages/HomePage';
   import LoginPage from './pages/LoginPage';
   import DashboardPage from './pages/DashboardPage';
   import ScanPage from './pages/ScanPage';
   import ScanDetailsPage from './pages/ScanDetailsPage';
   import ReportsPage from './pages/ReportsPage';
   import NotFoundPage from './pages/NotFoundPage';
   import Layout from './components/layout/Layout';
   import ProtectedRoute from './components/auth/ProtectedRoute';
   
   // Create Query Client
   const queryClient = new QueryClient();
   
   function App() {
     return (
       <QueryClientProvider client={queryClient}>
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path="/login" element={<LoginPage />} />
             <Route path="/register" element={<RegisterPage />} />
             <Route element={<ProtectedRoute />}>
               <Route element={<Layout />}>
                 <Route path="/dashboard" element={<DashboardPage />} />
                 <Route path="/scans" element={<ScanPage />} />
                 <Route path="/scans/:scanId" element={<ScanDetailsPage />} />
                 <Route path="/reports" element={<ReportsPage />} />
               </Route>
             </Route>
             <Route path="*" element={<NotFoundPage />} />
           </Routes>
         </BrowserRouter>
       </QueryClientProvider>
     );
   }
   
   export default App;
   ```

### 2. Authentication Implementation

1. **Auth Store** (`src/store/auth-store.ts`):

   ```typescript
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   import { apiService, API_ENDPOINTS } from '../lib/api-client';
   
   interface User {
     id: string;
     email: string;
     firstName: string;
     lastName: string;
     role: string;
   }
   
   interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     error: string | null;
     login: (email: string, password: string) => Promise<void>;
     register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
     logout: () => void;
     clearError: () => void;
   }
   
   export const useAuthStore = create<AuthState>()(
     persist(
       (set, get) => ({
         user: null,
         token: null,
         isAuthenticated: false,
         isLoading: false,
         error: null,
   
         login: async (email: string, password: string) => {
           set({ isLoading: true, error: null });
           try {
             const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
             set({
               user: response.user,
               token: response.token,
               isAuthenticated: true,
               isLoading: false,
             });
             // Store token in localStorage for API client
             localStorage.setItem('auth_token', response.token);
           } catch (error: any) {
             set({
               isLoading: false,
               error: error.response?.data?.message || 'Login failed',
             });
           }
         },
   
         register: async (email: string, password: string, firstName: string, lastName: string) => {
           set({ isLoading: true, error: null });
           try {
             const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, {
               email,
               password,
               firstName,
               lastName,
             });
             set({
               user: response.user,
               token: response.token,
               isAuthenticated: true,
               isLoading: false,
             });
             // Store token in localStorage for API client
             localStorage.setItem('auth_token', response.token);
           } catch (error: any) {
             set({
               isLoading: false,
               error: error.response?.data?.message || 'Registration failed',
             });
           }
         },
   
         logout: () => {
           // Remove token from localStorage
           localStorage.removeItem('auth_token');
           set({
             user: null,
             token: null,
             isAuthenticated: false,
           });
         },
   
         clearError: () => {
           set({ error: null });
         },
       }),
       {
         name: 'auth-storage',
         // Only persist these fields
         partialize: (state) => ({
           user: state.user,
           token: state.token,
           isAuthenticated: state.isAuthenticated,
         }),
       }
     )
   );
   ```

2. **Protected Route Component** (`src/components/auth/ProtectedRoute.tsx`):

   ```tsx
   import { Navigate, Outlet } from 'react-router-dom';
   import { useAuthStore } from '../../store/auth-store';
   
   const ProtectedRoute = () => {
     const { isAuthenticated } = useAuthStore();
   
     if (!isAuthenticated) {
       return <Navigate to="/login" replace />;
     }
   
     return <Outlet />;
   };
   
   export default ProtectedRoute;
   ```

### 3. API and Services

1. **API Client Configuration** (`src/lib/api-client.ts` - use the previously defined implementation)

2. **Scan Types** (`src/types/scan.ts` - use the previously defined scan types)

3. **Scan Service Hook** (`src/hooks/use-scan.ts` - use the previously defined implementation)

### 4. Main Pages

Implement the main pages according to your requirements:

- `HomePage.tsx`: Landing page with basic information
- `LoginPage.tsx`: Login form
- `DashboardPage.tsx`: Dashboard with scan statistics
- `ScanPage.tsx`: Page to create and list scans
- `ScanDetailsPage.tsx`: Detailed view of a scan
- `ReportsPage.tsx`: Page to view and generate reports

### 5. Components

Develop the necessary components:

- Layout components
- Scan components
- Report components
- Form components
- UI components

## GitHub Actions Setup

### 1. GitHub Repository Configuration

1. **Create GitHub Repository**:
   - Create a new repository on GitHub
   - Configure repository settings
   - Add required secrets

2. **GitHub Secrets Configuration**:
   - `API_URL`: URL of your deployed API
   - `API_KEY`: Secret key for API authentication
   - `CLAUDE_API_KEY`: Claude AI API key
   - `CHATGPT_API_KEY`: ChatGPT API key
   - Spiderfoot API keys

### 2. GitHub Actions Workflow

1. **Create Workflow Directory**:

   ```bash
   mkdir -p .github/workflows
   ```

2. **Create Security Scan Workflow**:

   Create `.github/workflows/security-scan.yml` file using the previously defined implementation.

3. **Create CI/CD Workflow**:

   Create `.github/workflows/ci-cd.yml`:
   ```yaml
   name: CI/CD Pipeline
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: |
             cd security-scanner-api
             npm ci
             cd ../security-scanner-app
             npm ci
         - name: Run tests
           run: |
             cd security-scanner-api
             npm test
             cd ../security-scanner-app
             npm test
   
     build:
       needs: test
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Build API
           run: |
             cd security-scanner-api
             npm ci
             npm run build
         - name: Build App
           run: |
             cd security-scanner-app
             npm ci
             npm run build
   
     deploy:
       needs: build
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         # Add deployment steps based on your chosen deployment method
   ```

## Docker Setup

### 1. Frontend Dockerfile

Create `security-scanner-app/Dockerfile.frontend` using the previously defined implementation.

### 2. Backend Dockerfile

Create `security-scanner-api/Dockerfile.backend` using the previously defined implementation.

### 3. Nginx Configuration

Create `security-scanner-app/nginx.conf` using the previously defined implementation.

### 4. Docker Compose

Create `docker-compose.yml` in the root directory using the previously defined implementation.

## Deployment

Follow the steps in the Deployment Guide for deploying to your chosen environment.

## Testing

1. **Local Testing**:
   ```bash
   # Start MongoDB (if not using Docker)
   mongod --dbpath=/data/db
   
   # Start backend in development mode
   cd security-scanner-api
   npm run dev
   
   # Start frontend in development mode
   cd ../security-scanner-app
   npm run dev
   ```

2. **Docker Testing**:
   ```bash
   # Build and start with Docker Compose
   docker-compose up --build
   ```

3. **Integration Testing**:
   - Test authentication flow
   - Test scan creation
   - Test GitHub Actions integration
   - Test AI summary generation
   - Test web search functionality

## Maintenance and Updates

1. **Regular Updates**:
   - Keep dependencies updated
   - Apply security patches
   - Monitor for issues

2. **Monitoring**:
   - Set up logging and monitoring
   - Configure alerts for critical issues
   - Regularly review logs

3. **Backups**:
   - Configure regular MongoDB backups
   - Store backups securely
   - Test recovery procedures

## Troubleshooting

See the "Troubleshooting" section in the Deployment Guide for common issues and solutions.
