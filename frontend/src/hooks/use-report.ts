import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, API_ENDPOINTS } from '../lib/api-client';
import { 
  Report, 
  ReportResponse, 
  ReportsResponse, 
  CreateReportRequest 
} from '../types/report';

export const useReportService = () => {
  const queryClient = useQueryClient();

  // Get all reports with pagination
  const getReports = (limit = 10, offset = 0) => {
    return useQuery<ReportsResponse>({
      queryKey: ['reports', limit, offset],
      queryFn: () => apiService.get(`${API_ENDPOINTS.REPORTS.BASE}?limit=${limit}&offset=${offset}`),
    });
  };

  // Get report by ID
  const getReportById = (reportId: string) => {
    return useQuery<ReportResponse>({
      queryKey: ['report', reportId],
      queryFn: () => apiService.get(API_ENDPOINTS.REPORTS.DETAIL(reportId)),
      enabled: !!reportId,
    });
  };

  // Create new report
  const createReport = useMutation({
    mutationFn: (reportData: CreateReportRequest) => 
      apiService.post<ReportResponse>(API_ENDPOINTS.REPORTS.BASE, reportData),
    onSuccess: () => {
      // Invalidate reports list query
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    getReports,
    getReportById,
    createReport,
  };
};