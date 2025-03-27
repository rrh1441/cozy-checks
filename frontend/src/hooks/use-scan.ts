import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, API_ENDPOINTS } from '../lib/api-client';
import { 
  Scan, 
  ScanResponse, 
  ScansResponse, 
  CreateScanRequest 
} from '../types/scan';

export const useScanService = () => {
  const queryClient = useQueryClient();

  // Get all scans with pagination
  const getScans = (limit = 10, offset = 0) => {
    return useQuery<ScansResponse>({
      queryKey: ['scans', limit, offset],
      queryFn: () => apiService.get(`${API_ENDPOINTS.SCANS.BASE}?limit=${limit}&offset=${offset}`),
    });
  };

  // Get scan by ID
  const getScanById = (scanId: string) => {
    return useQuery<ScanResponse>({
      queryKey: ['scan', scanId],
      queryFn: () => apiService.get(API_ENDPOINTS.SCANS.DETAIL(scanId)),
      enabled: !!scanId,
    });
  };

  // Create new scan
  const createScan = useMutation({
    mutationFn: (scanData: CreateScanRequest) => 
      apiService.post<ScanResponse>(API_ENDPOINTS.SCANS.BASE, scanData),
    onSuccess: () => {
      // Invalidate scans list query
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  // Start scan
  const startScan = useMutation({
    mutationFn: (scanId: string) => 
      apiService.post(API_ENDPOINTS.SCANS.START(scanId)),
    onSuccess: (_data, scanId) => {
      // Invalidate specific scan query
      queryClient.invalidateQueries({ queryKey: ['scan', scanId] });
      // Also invalidate scans list
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  return {
    getScans,
    getScanById,
    createScan,
    startScan,
  };
};