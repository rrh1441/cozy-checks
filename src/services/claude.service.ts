import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { IScanResult, ISummary, SeverityLevel } from '../models/scan.model';
import { ApiError } from '../utils/api-error';

interface ClaudeCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
}

export class ClaudeService {
  /**
   * Generate a summary of scan results using Claude AI
   */
  public async generateSummary(scanResults: IScanResult[]): Promise<ISummary> {
    try {
      // Format the scan results for Claude
      const formattedResults = scanResults.map((result) => {
        return `- Module: ${result.module}
  - Name: ${result.name}
  - Description: ${result.description}
  - Severity: ${result.severity}
  - Location: ${result.location}
  - Line Number: ${result.lineNumber || 'N/A'}
  - Code: ${result.code || 'N/A'}
  - Recommendation: ${result.recommendation || 'N/A'}
  - References: ${result.references?.join(', ') || 'N/A'}
`;
      }).join('\n');

      // Create the prompt for Claude
      const prompt = `
You are a cybersecurity expert. Analyze the following security scan results and provide a detailed summary.

Security Scan Results:
${formattedResults}

Please provide a JSON response with the following structure:
{
  "totalIssues": number,
  "criticalCount": number,
  "highCount": number,
  "mediumCount": number,
  "lowCount": number,
  "topModules": [{ "name": string, "count": number }],
  "shortSummary": string,
  "detailedAnalysis": string,
  "recommendations": [string]
}

- Count the issues by severity level
- Identify the top 3 modules with the most issues
- Provide a brief summary of the scan results (1-2 sentences)
- Provide a detailed analysis of the security issues found (2-3 paragraphs)
- Provide concrete recommendations to address the issues (at least 3)
- Ensure your response is ONLY valid JSON, no additional text
`;

      // Make the API request to Claude
      const response = await axios.post<ClaudeCompletionResponse>(
        config.claudeApiUrl,
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 4000,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.claudeApiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      // Extract the JSON response from Claude
      const responseText = response.data.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response from Claude');
      }
      
      const jsonResponse = JSON.parse(jsonMatch[0]) as ISummary;
      
      return jsonResponse;
    } catch (error) {
      logger.error('Error generating summary with Claude:', error);
      throw new ApiError(500, 'Failed to generate scan summary');
    }
  }

  /**
   * Analyze code and identify security issues
   */
  public async analyzeCode(code: string, language: string): Promise<IScanResult[]> {
    try {
      // Create the prompt for Claude
      const prompt = `
You are a cybersecurity expert. Analyze the following ${language} code for security vulnerabilities.

\`\`\`${language}
${code}
\`\`\`

Please provide a JSON response with an array of security issues found. Each issue should have this structure:
{
  "id": string,
  "module": "CodeAnalysis",
  "name": string,
  "description": string,
  "severity": "low" | "medium" | "high" | "critical",
  "location": string,
  "lineNumber": number,
  "code": string,
  "recommendation": string,
  "references": [string]
}

- For each issue, provide a clear name and description
- Assign an appropriate severity level
- Specify the location (file, function, method, etc.)
- Identify the line number if possible
- Include the vulnerable code snippet
- Provide a specific recommendation to fix the issue
- Include references to security standards, best practices, or documentation
- Only include actual security issues, not code style or performance issues
- If no security issues are found, return an empty array
- Ensure your response is ONLY valid JSON, no additional text
`;

      // Make the API request to Claude
      const response = await axios.post<ClaudeCompletionResponse>(
        config.claudeApiUrl,
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 4000,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.claudeApiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      // Extract the JSON response from Claude
      const responseText = response.data.content[0].text;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        return []; // No issues found
      }
      
      const jsonResponse = JSON.parse(jsonMatch[0]) as IScanResult[];
      
      return jsonResponse;
    } catch (error) {
      logger.error('Error analyzing code with Claude:', error);
      throw new ApiError(500, 'Failed to analyze code');
    }
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();