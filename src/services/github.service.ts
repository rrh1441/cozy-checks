import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/api-error';
import { IScanResult, SeverityLevel } from '../models/scan.model';
import { claudeService } from './claude.service';

interface GithubRepoInfo {
  name: string;
  full_name: string;
  default_branch: string;
  language: string;
  languages_url: string;
}

interface GithubContent {
  type: string;
  name: string;
  path: string;
  content: string;
  encoding: string;
  sha: string;
  url: string;
}

export class GithubService {
  private baseUrl = 'https://api.github.com';
  private headers = {
    'Authorization': `token ${config.githubPat}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  /**
   * Get repository information
   */
  public async getRepoInfo(repoFullName: string): Promise<GithubRepoInfo> {
    try {
      const response = await axios.get<GithubRepoInfo>(
        `${this.baseUrl}/repos/${repoFullName}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching repository information:', error);
      throw new ApiError(500, 'Failed to fetch repository information');
    }
  }

  /**
   * Get repository languages
   */
  public async getRepoLanguages(repoFullName: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get<Record<string, number>>(
        `${this.baseUrl}/repos/${repoFullName}/languages`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching repository languages:', error);
      throw new ApiError(500, 'Failed to fetch repository languages');
    }
  }

  /**
   * Get file content from a repository
   */
  public async getFileContent(repoFullName: string, path: string, ref = 'main'): Promise<string> {
    try {
      const response = await axios.get<GithubContent>(
        `${this.baseUrl}/repos/${repoFullName}/contents/${path}?ref=${ref}`,
        { headers: this.headers }
      );
      
      if (response.data.encoding === 'base64') {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
      
      return response.data.content;
    } catch (error) {
      logger.error(`Error fetching file content for ${path}:`, error);
      throw new ApiError(500, `Failed to fetch file content for ${path}`);
    }
  }

  /**
   * List files in a repository directory
   */
  public async listFiles(repoFullName: string, path = '', ref = 'main'): Promise<GithubContent[]> {
    try {
      const response = await axios.get<GithubContent[]>(
        `${this.baseUrl}/repos/${repoFullName}/contents/${path}?ref=${ref}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      logger.error(`Error listing files in ${path}:`, error);
      throw new ApiError(500, `Failed to list files in ${path}`);
    }
  }

  /**
   * Recursively scan a repository for security issues
   */
  public async scanRepository(repoFullName: string, branch = 'main'): Promise<IScanResult[]> {
    try {
      const allResults: IScanResult[] = [];
      const languages = await this.getRepoLanguages(repoFullName);
      const primaryLanguage = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b, '');
      
      // Get all files in the repository
      await this.scanDirectory(repoFullName, '', branch, primaryLanguage, allResults);
      
      return allResults;
    } catch (error) {
      logger.error('Error scanning repository:', error);
      throw new ApiError(500, 'Failed to scan repository');
    }
  }

  /**
   * Recursively scan a directory in a repository
   */
  private async scanDirectory(
    repoFullName: string,
    path: string,
    branch: string,
    primaryLanguage: string,
    results: IScanResult[]
  ): Promise<void> {
    try {
      const contents = await this.listFiles(repoFullName, path, branch);
      
      for (const item of contents) {
        // Skip directories we don't want to scan
        if (this.shouldSkipPath(item.path)) {
          continue;
        }
        
        if (item.type === 'dir') {
          // Recursively scan subdirectories
          await this.scanDirectory(repoFullName, item.path, branch, primaryLanguage, results);
        } else if (item.type === 'file' && this.shouldScanFile(item.name)) {
          // Get file content and analyze it
          const fileContent = await this.getFileContent(repoFullName, item.path, branch);
          const fileExtension = item.name.split('.').pop() || primaryLanguage;
          
          // Analyze code with Claude
          const fileResults = await claudeService.analyzeCode(fileContent, fileExtension);
          
          // Add file path to results
          const mappedResults = fileResults.map(result => ({
            ...result,
            location: item.path
          }));
          
          results.push(...mappedResults);
        }
      }
    } catch (error) {
      logger.error(`Error scanning directory ${path}:`, error);
      // Don't throw error, just log it and continue with other directories
    }
  }

  /**
   * Check if a file should be scanned based on its extension
   */
  private shouldScanFile(fileName: string): boolean {
    const scanExtensions = [
      // JavaScript/TypeScript
      '.js', '.jsx', '.ts', '.tsx',
      // Python
      '.py',
      // Java
      '.java',
      // C/C++
      '.c', '.cpp', '.h', '.hpp',
      // C#
      '.cs',
      // PHP
      '.php',
      // Ruby
      '.rb',
      // Go
      '.go',
      // Rust
      '.rs',
      // Swift
      '.swift',
      // Shell scripts
      '.sh', '.bash',
      // Configuration files
      '.json', '.yml', '.yaml', '.xml', '.toml',
      // Web
      '.html', '.css', '.scss', '.less',
      // SQL
      '.sql'
    ];
    
    const extension = '.' + (fileName.split('.').pop() || '');
    return scanExtensions.includes(extension.toLowerCase());
  }

  /**
   * Check if a path should be skipped
   */
  private shouldSkipPath(path: string): boolean {
    const skipPaths = [
      'node_modules',
      'dist',
      'build',
      '.git',
      'vendor',
      'packages',
      'target',
      'bin',
      'obj'
    ];
    
    return skipPaths.some(skipPath => path.includes(skipPath));
  }
}

// Export singleton instance
export const githubService = new GithubService();