
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/store';
import { useApi } from '@/hooks/useApi';
import { Clock, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const History = () => {
  const navigate = useNavigate();
  const { reports, clearHistory, authStatus } = useStore();
  const { useReports } = useApi();
  
  const { refetch } = useReports();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (authStatus === 'unauthenticated') {
      navigate('/login');
    }
    
    refetch();
  }, [authStatus, navigate, refetch]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-horizon-amber animate-pulse" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500">Completed</span>;
      case 'failed':
        return <span className="text-destructive">Failed</span>;
      default:
        return <span className="text-horizon-amber">Processing</span>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search History</h1>
            <p className="text-foreground/70">
              View and manage your previous background check requests
            </p>
          </div>
          
          {reports.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-panel">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear search history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your search history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <GlassCard 
                key={report.id}
                className="hover:shadow-md transition-all animate-fade-in"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{report.subjectName}</h2>
                      <div className="flex items-center mb-3">
                        <span className="text-sm text-foreground/70 mr-4">
                          {formatDate(report.createdAt)}
                        </span>
                        <div className="flex items-center">
                          {getStatusIcon(report.status)}
                          <span className="text-sm ml-1">{getStatusText(report.status)}</span>
                        </div>
                      </div>
                      
                      {report.identifiers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {report.identifiers.map((identifier) => (
                            <div key={identifier.id} className="inline-flex items-center bg-white/40 px-2 py-0.5 rounded-full text-xs">
                              <span className="capitalize text-foreground/70 mr-1">
                                {identifier.type}:
                              </span>
                              <span>{identifier.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Link to={`/results/${report.id}`}>
                        <Button>
                          <Search className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-foreground/40" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No search history yet</h2>
              <p className="text-foreground/70 mb-6">
                When you perform background checks, they'll appear here for easy access.
              </p>
              <Link to="/">
                <Button className="btn-gradient">
                  Start a Search
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default History;
