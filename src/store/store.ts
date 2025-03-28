
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Report, AuthStatus, Identifier, SearchRequest } from '../types';

interface State {
  // Auth
  user: User | null;
  authStatus: AuthStatus;
  
  // Reports
  reports: Report[];
  currentReport: Report | null;
  
  // Search form
  searchForm: SearchRequest;
  
  // UI state
  isNavOpen: boolean;
}

interface Actions {
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  
  // Report actions
  requestReport: (searchRequest: SearchRequest) => Promise<string>;
  fetchReport: (reportId: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  clearHistory: () => void;
  
  // Search form actions
  updateSearchForm: (data: Partial<SearchRequest>) => void;
  addIdentifier: (type: Identifier['type'], value: string) => void;
  removeIdentifier: (id: string) => void;
  resetSearchForm: () => void;
  
  // UI actions
  setNavOpen: (isOpen: boolean) => void;
}

// Mock API functions - would be replaced with real API calls
const mockLogin = async () => {
  return {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    freeReportUsed: false,
  };
};

const mockRequestReport = async (name: string): Promise<string> => {
  // Simulate API request
  await new Promise(resolve => setTimeout(resolve, 1000));
  return uuidv4();
};

// Initial search form state
const initialSearchForm: SearchRequest = {
  fullName: '',
  identifiers: [],
};

// Create store with persistence
export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      authStatus: 'unauthenticated',
      reports: [],
      currentReport: null,
      searchForm: initialSearchForm,
      isNavOpen: false,
      
      // Auth actions
      login: async (email, password) => {
        try {
          set({ authStatus: 'loading' });
          // Here you would make an actual API call
          const user = await mockLogin();
          set({ user, authStatus: 'authenticated' });
        } catch (error) {
          set({ authStatus: 'unauthenticated' });
          throw error;
        }
      },
      
      signup: async (name, email, password) => {
        try {
          set({ authStatus: 'loading' });
          // Here you would make an actual API call
          const user = {
            id: uuidv4(),
            email,
            name,
            freeReportUsed: false,
          };
          set({ user, authStatus: 'authenticated' });
        } catch (error) {
          set({ authStatus: 'unauthenticated' });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, authStatus: 'unauthenticated' });
      },
      
      // Report actions
      requestReport: async (searchRequest) => {
        const { fullName, identifiers } = searchRequest;
        
        // Create a new report
        const reportId = await mockRequestReport(fullName);
        
        const newReport: Report = {
          id: reportId,
          subjectName: fullName,
          status: 'processing',
          createdAt: new Date().toISOString(),
          identifiers: [...identifiers],
          sections: [
            { title: 'Identity Information', type: 'identity', data: null, loading: true },
            { title: 'Social Media Presence', type: 'social', data: null, loading: true },
            { title: 'Business & Web Presence', type: 'business', data: null, loading: true },
            { title: 'Geolocation Details', type: 'geolocation', data: null, loading: true },
            { title: 'Dark Web Mentions', type: 'darkweb', data: null, loading: true },
            { title: 'AI-Generated Summary', type: 'summary', data: null, loading: true },
          ]
        };
        
        set((state) => ({ 
          reports: [newReport, ...state.reports],
          currentReport: newReport
        }));
        
        // If user is authenticated, mark free report as used
        if (get().user && !get().user!.freeReportUsed) {
          set((state) => ({
            user: state.user ? { ...state.user, freeReportUsed: true } : null
          }));
        }
        
        return reportId;
      },
      
      fetchReport: async (reportId) => {
        // Find report in current reports
        const report = get().reports.find(r => r.id === reportId);
        
        if (report) {
          set({ currentReport: report });
          
          // Simulate data arriving at different times
          setTimeout(() => {
            set((state) => ({
              reports: state.reports.map(r => 
                r.id === reportId
                  ? {
                      ...r,
                      sections: r.sections?.map(s => 
                        s.type === 'identity'
                          ? { ...s, loading: false, data: { emails: ['john.doe@example.com'], phones: ['+1 555-1234'] } }
                          : s
                      )
                    }
                  : r
              ),
              currentReport: state.currentReport?.id === reportId
                ? {
                    ...state.currentReport,
                    sections: state.currentReport.sections?.map(s => 
                      s.type === 'identity'
                        ? { ...s, loading: false, data: { emails: ['john.doe@example.com'], phones: ['+1 555-1234'] } }
                        : s
                    )
                  }
                : state.currentReport
            }));
          }, 2000);
          
          setTimeout(() => {
            set((state) => ({
              reports: state.reports.map(r => 
                r.id === reportId
                  ? {
                      ...r,
                      sections: r.sections?.map(s => 
                        s.type === 'social'
                          ? { ...s, loading: false, data: { profiles: [
                              { platform: 'Twitter', username: '@johndoe', url: 'https://twitter.com/johndoe' },
                              { platform: 'LinkedIn', username: 'John Doe', url: 'https://linkedin.com/in/johndoe' }
                            ] } }
                          : s
                      )
                    }
                  : r
              ),
              currentReport: state.currentReport?.id === reportId
                ? {
                    ...state.currentReport,
                    sections: state.currentReport.sections?.map(s => 
                      s.type === 'social'
                        ? { ...s, loading: false, data: { profiles: [
                            { platform: 'Twitter', username: '@johndoe', url: 'https://twitter.com/johndoe' },
                            { platform: 'LinkedIn', username: 'John Doe', url: 'https://linkedin.com/in/johndoe' }
                          ] } }
                        : s
                    )
                  }
                : state.currentReport
            }));
          }, 3500);
          
          // Complete all sections and mark report as completed after 8 seconds
          setTimeout(() => {
            set((state) => ({
              reports: state.reports.map(r => 
                r.id === reportId
                  ? {
                      ...r,
                      status: 'completed',
                      completedAt: new Date().toISOString(),
                      sections: r.sections?.map(s => ({ ...s, loading: false, data: s.data || { info: 'Data found' } }))
                    }
                  : r
              ),
              currentReport: state.currentReport?.id === reportId
                ? {
                    ...state.currentReport,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    sections: state.currentReport.sections?.map(s => ({ ...s, loading: false, data: s.data || { info: 'Data found' } }))
                  }
                : state.currentReport
            }));
          }, 8000);
        }
      },
      
      fetchReports: async () => {
        // In a real app, you would fetch reports from an API
        // For now, we'll just use what's in the store
      },
      
      clearHistory: () => {
        set({ reports: [], currentReport: null });
      },
      
      // Search form actions
      updateSearchForm: (data) => {
        set((state) => ({
          searchForm: { ...state.searchForm, ...data }
        }));
      },
      
      addIdentifier: (type, value) => {
        const newIdentifier: Identifier = {
          type,
          value,
          id: uuidv4()
        };
        
        set((state) => ({
          searchForm: {
            ...state.searchForm,
            identifiers: [...state.searchForm.identifiers, newIdentifier]
          }
        }));
      },
      
      removeIdentifier: (id) => {
        set((state) => ({
          searchForm: {
            ...state.searchForm,
            identifiers: state.searchForm.identifiers.filter(i => i.id !== id)
          }
        }));
      },
      
      resetSearchForm: () => {
        set({ searchForm: initialSearchForm });
      },
      
      // UI actions
      setNavOpen: (isOpen) => {
        set({ isNavOpen: isOpen });
      }
    }),
    {
      name: 'horizon-storage',
      partialize: (state) => ({
        user: state.user,
        reports: state.reports,
      }),
    }
  )
);
