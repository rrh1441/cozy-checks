
import { useQuery, useMutation } from '@tanstack/react-query';
import { useStore } from '../store/store';
import { SearchRequest } from '../types';

export const useApi = () => {
  const { requestReport, fetchReport, fetchReports, login, signup } = useStore();
  
  // Request a new report
  const useRequestReport = () => {
    return useMutation({
      mutationFn: (searchRequest: SearchRequest) => requestReport(searchRequest),
    });
  };
  
  // Fetch a specific report
  const useFetchReport = (reportId: string | undefined) => {
    return useQuery({
      queryKey: ['report', reportId],
      queryFn: () => {
        if (!reportId) return null;
        return fetchReport(reportId);
      },
      enabled: !!reportId,
    });
  };
  
  // Fetch all reports for the current user
  const useReports = () => {
    return useQuery({
      queryKey: ['reports'],
      queryFn: fetchReports,
    });
  };
  
  // Login mutation
  const useLogin = () => {
    return useMutation({
      mutationFn: ({ email, password }: { email: string; password: string }) => 
        login(email, password),
    });
  };
  
  // Signup mutation
  const useSignup = () => {
    return useMutation({
      mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => 
        signup(name, email, password),
    });
  };
  
  return {
    useRequestReport,
    useFetchReport,
    useReports,
    useLogin,
    useSignup,
  };
};
