import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScanService } from '../hooks/use-scan';
import { useReportService } from '../hooks/use-report';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScanResult, ScanStatus, SeverityLevel } from '../types/scan';
import { FileText, ArrowLeft, RefreshCw, Clock, CheckCircle, AlertCircle, Download, BarChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

// Status badge helper component
const StatusBadge = ({ status }: { status: ScanStatus }) => {
  switch (status) {
    case ScanStatus.PENDING:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case ScanStatus.IN_PROGRESS:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> In Progress
        </Badge>
      );
    case ScanStatus.COMPLETED:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </Badge>
      );
    case ScanStatus.FAILED:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <AlertCircle className="mr-1 h-3 w-3" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Severity badge helper component
const SeverityBadge = ({ severity }: { severity: SeverityLevel }) => {
  switch (severity) {
    case SeverityLevel.LOW:
      return <Badge className="bg-blue-500">Low</Badge>;
    case SeverityLevel.MEDIUM:
      return <Badge className="bg-amber-500">Medium</Badge>;
    case SeverityLevel.HIGH:
      return <Badge className="bg-red-500">High</Badge>;
    case SeverityLevel.CRITICAL:
      return <Badge className="bg-purple-600">Critical</Badge>;
    default:
      return <Badge>{severity}</Badge>;
  }
};

const ScanDetailsPage = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  
  const { getScanById, startScan } = useScanService();
  const { createReport } = useReportService();
  
  const { data, isLoading, error, refetch } = getScanById(scanId || '');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
  });
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [createReportError, setCreateReportError] = useState('');
  
  const handleStartScan = async () => {
    if (!scanId) return;
    try {
      await startScan.mutateAsync(scanId);
      refetch();
    } catch (error) {
      console.error('Failed to start scan:', error);
    }
  };
  
  const handleCreateReport = async () => {
    if (!scanId) return;
    
    setIsCreatingReport(true);
    setCreateReportError('');
    
    try {
      const response = await createReport.mutateAsync({
        scanId,
        title: newReport.title,
        description: newReport.description,
      });
      
      setShowCreateReportModal(false);
      
      // Navigate to the report details page
      if (response?.report?._id) {
        navigate(`/reports/${response.report._id}`);
      }
    } catch (error: any) {
      console.error('Failed to create report:', error);
      setCreateReportError(error?.message || 'Failed to create report');
    } finally {
      setIsCreatingReport(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !data?.scan) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Error Loading Scan</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'Failed to load scan details'}
        </p>
        <Button variant="outline" onClick={() => navigate('/scans')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scans
        </Button>
      </div>
    );
  }
  
  const { scan } = data;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/scans')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{scan.name}</h1>
          <StatusBadge status={scan.status} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {scan.status === ScanStatus.PENDING && (
            <Button onClick={handleStartScan} disabled={startScan.isPending}>
              {startScan.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start Scan
            </Button>
          )}
          
          {scan.status === ScanStatus.COMPLETED && (
            <Button 
              variant="secondary"
              onClick={() => setShowCreateReportModal(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results" disabled={!scan.results || scan.results.length === 0}>
            Results ({scan.results?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!scan.summary}>
            Summary
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Information</CardTitle>
              <CardDescription>Detailed information about this security scan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">General Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 items-baseline">
                      <span className="text-sm font-medium text-muted-foreground">Scan ID:</span>
                      <span className="col-span-2 text-sm font-mono">{scan._id}</span>
                    </div>
                    <div className="grid grid-cols-3 items-baseline">
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <span className="col-span-2 text-sm">
                        {scan.type === 'github_repo' && 'GitHub Repository'}
                        {scan.type === 'github_pr' && 'GitHub Pull Request'}
                        {scan.type === 'custom_code' && 'Custom Code'}
                        {scan.type === 'url' && 'URL'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-baseline">
                      <span className="text-sm font-medium text-muted-foreground">Target:</span>
                      <span className="col-span-2 text-sm font-mono break-all">{scan.target}</span>
                    </div>
                    {scan.branch && (
                      <div className="grid grid-cols-3 items-baseline">
                        <span className="text-sm font-medium text-muted-foreground">Branch:</span>
                        <span className="col-span-2 text-sm">{scan.branch}</span>
                      </div>
                    )}
                    {scan.description && (
                      <div className="grid grid-cols-3 items-baseline">
                        <span className="text-sm font-medium text-muted-foreground">Description:</span>
                        <span className="col-span-2 text-sm">{scan.description}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Timing Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 items-baseline">
                      <span className="text-sm font-medium text-muted-foreground">Created:</span>
                      <span className="col-span-2 text-sm">
                        {new Date(scan.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {scan.startedAt && (
                      <div className="grid grid-cols-3 items-baseline">
                        <span className="text-sm font-medium text-muted-foreground">Started:</span>
                        <span className="col-span-2 text-sm">
                          {new Date(scan.startedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {scan.completedAt && (
                      <div className="grid grid-cols-3 items-baseline">
                        <span className="text-sm font-medium text-muted-foreground">Completed:</span>
                        <span className="col-span-2 text-sm">
                          {new Date(scan.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {scan.duration && (
                      <div className="grid grid-cols-3 items-baseline">
                        <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                        <span className="col-span-2 text-sm">
                          {(scan.duration / 1000).toFixed(2)} seconds
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            {scan.error && (
              <CardFooter>
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Scan Failed</AlertTitle>
                  <AlertDescription>{scan.error}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                {scan.results?.length} issues found in this scan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scan.results && scan.results.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {scan.results.map((result: ScanResult, index: number) => (
                      <Card key={result.id || index} className="overflow-hidden border-l-4" style={{
                        borderLeftColor: result.severity === SeverityLevel.CRITICAL 
                          ? 'rgb(147, 51, 234)' 
                          : result.severity === SeverityLevel.HIGH 
                            ? 'rgb(239, 68, 68)' 
                            : result.severity === SeverityLevel.MEDIUM 
                              ? 'rgb(245, 158, 11)' 
                              : 'rgb(59, 130, 246)'
                      }}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{result.name}</CardTitle>
                            <SeverityBadge severity={result.severity} />
                          </div>
                          <CardDescription>{result.module}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium mb-1">Description</div>
                              <p className="text-sm text-muted-foreground">{result.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="font-medium mb-1">Location</div>
                                <p className="text-sm font-mono">
                                  {result.location}
                                  {result.lineNumber && `:${result.lineNumber}`}
                                </p>
                              </div>
                              
                              {result.recommendation && (
                                <div>
                                  <div className="font-medium mb-1">Recommendation</div>
                                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                                </div>
                              )}
                            </div>
                            
                            {result.code && (
                              <div>
                                <div className="font-medium mb-1">Code</div>
                                <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
                                  {result.code}
                                </pre>
                              </div>
                            )}
                            
                            {result.references && result.references.length > 0 && (
                              <div>
                                <div className="font-medium mb-1">References</div>
                                <ul className="text-sm space-y-1 list-disc pl-4">
                                  {result.references.map((ref, i) => (
                                    <li key={i}>
                                      {ref.startsWith('http') ? (
                                        <a 
                                          href={ref} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline"
                                        >
                                          {ref}
                                        </a>
                                      ) : (
                                        ref
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-muted-foreground">No results available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          {scan.summary ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" />
                    Summary Overview
                  </CardTitle>
                  <CardDescription>
                    AI-generated summary of scan results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-blue-50 dark:bg-blue-950">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{scan.summary.totalIssues}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 dark:bg-purple-950">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{scan.summary.criticalCount}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-950">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-medium">High</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{scan.summary.highCount}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 dark:bg-amber-950">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-medium">Medium</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{scan.summary.mediumCount}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Summary</h3>
                      <p className="text-muted-foreground">{scan.summary.shortSummary}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Detailed Analysis</h3>
                      <div className="text-muted-foreground">
                        {scan.summary.detailedAnalysis.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Recommendations</h3>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        {scan.summary.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCreateReportModal(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Detailed Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-xl font-medium mb-4">No summary available</p>
              <p className="text-muted-foreground mb-4">
                The scan needs to be completed to generate a summary.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Report Dialog */}
      <Dialog open={showCreateReportModal} onOpenChange={setShowCreateReportModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a detailed report from this scan's results.
            </DialogDescription>
          </DialogHeader>
          
          {createReportError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{createReportError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reportTitle">Report Title</Label>
              <Input
                id="reportTitle"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                placeholder={`Security Report: ${scan.name}`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reportDescription">Description (Optional)</Label>
              <Textarea
                id="reportDescription"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Brief description of this report"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateReportModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateReport} 
              disabled={isCreatingReport || !newReport.title}
            >
              {isCreatingReport ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanDetailsPage;