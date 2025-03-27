import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScanService } from '../hooks/use-scan';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScanStatus, ScanType, CreateScanRequest } from '../types/scan';
import { Plus, Search, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Helper to get status badge variants
const getStatusBadge = (status: ScanStatus) => {
  switch (status) {
    case ScanStatus.PENDING:
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        <Clock className="mr-1 h-3 w-3" /> Pending
      </Badge>;
    case ScanStatus.IN_PROGRESS:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">
        <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> In Progress
      </Badge>;
    case ScanStatus.COMPLETED:
      return <Badge variant="outline" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" /> Completed
      </Badge>;
    case ScanStatus.FAILED:
      return <Badge variant="outline" className="bg-red-100 text-red-800">
        <AlertCircle className="mr-1 h-3 w-3" /> Failed
      </Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper to get scan type label
const getScanTypeLabel = (type: ScanType) => {
  switch (type) {
    case ScanType.GITHUB_REPO:
      return 'GitHub Repository';
    case ScanType.GITHUB_PR:
      return 'GitHub Pull Request';
    case ScanType.CUSTOM_CODE:
      return 'Custom Code';
    case ScanType.URL:
      return 'URL';
    default:
      return type;
  }
};

const ScanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getScans, createScan, startScan } = useScanService();
  const { data, isLoading, refetch } = getScans();
  
  // New scan modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newScan, setNewScan] = useState<CreateScanRequest>({
    name: '',
    type: ScanType.GITHUB_REPO,
    target: '',
    description: '',
    branch: 'main',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract initial values from location state (if navigated from search form)
  useState(() => {
    const state = location.state as { showCreateModal: boolean; initialValues: Partial<CreateScanRequest> } | undefined;
    if (state?.showCreateModal) {
      setShowCreateModal(true);
      if (state.initialValues) {
        setNewScan(prev => ({ ...prev, ...state.initialValues }));
      }
      // Clear the location state
      navigate(location.pathname, { replace: true });
    }
  });

  const handleCreateScan = async () => {
    setIsSubmitting(true);
    try {
      const response = await createScan.mutateAsync(newScan);
      setShowCreateModal(false);
      refetch();
      // Redirect to the new scan details page
      if (response?.scan?._id) {
        navigate(`/scans/${response.scan._id}`);
      }
    } catch (error) {
      console.error('Failed to create scan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartScan = async (scanId: string) => {
    try {
      await startScan.mutateAsync(scanId);
      refetch();
    } catch (error) {
      console.error('Failed to start scan:', error);
    }
  };

  // Filter scans based on search query
  const filteredScans = data?.scans.filter(scan => 
    scan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    scan.target.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Security Scans</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Scan
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search scans..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredScans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredScans.map((scan) => (
            <Card key={scan._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{scan.name}</CardTitle>
                  {getStatusBadge(scan.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span> {getScanTypeLabel(scan.type)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Target:</span> {scan.target}
                  </div>
                  {scan.branch && (
                    <div className="text-sm">
                      <span className="font-medium">Branch:</span> {scan.branch}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Created:</span> {new Date(scan.createdAt).toLocaleString()}
                  </div>
                  {scan.summary && (
                    <div className="text-sm">
                      <span className="font-medium">Issues:</span> {scan.summary.totalIssues}
                    </div>
                  )}
                  <div className="flex justify-between pt-3">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/scans/${scan._id}`)}
                    >
                      View Details
                    </Button>
                    
                    {scan.status === ScanStatus.PENDING && (
                      <Button 
                        variant="secondary"
                        onClick={() => handleStartScan(scan._id)}
                        disabled={startScan.isPending}
                      >
                        {startScan.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Start Scan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl font-medium mb-4">No scans found</p>
          <Button onClick={() => setShowCreateModal(true)}>Create Your First Scan</Button>
        </div>
      )}

      {/* Create Scan Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Security Scan</DialogTitle>
            <DialogDescription>
              Configure your scan details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Scan Name</Label>
              <Input
                id="name"
                value={newScan.name}
                onChange={(e) => setNewScan({ ...newScan, name: e.target.value })}
                placeholder="My GitHub Repository Scan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Scan Type</Label>
              <Select
                value={newScan.type}
                onValueChange={(value) => setNewScan({ ...newScan, type: value as ScanType })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select scan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ScanType.GITHUB_REPO}>GitHub Repository</SelectItem>
                  <SelectItem value={ScanType.GITHUB_PR}>GitHub Pull Request</SelectItem>
                  <SelectItem value={ScanType.CUSTOM_CODE}>Custom Code</SelectItem>
                  <SelectItem value={ScanType.URL}>URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                value={newScan.target}
                onChange={(e) => setNewScan({ ...newScan, target: e.target.value })}
                placeholder={newScan.type === ScanType.GITHUB_REPO ? 'username/repository' : 'https://...'}
              />
            </div>
            {newScan.type === ScanType.GITHUB_REPO && (
              <div className="grid gap-2">
                <Label htmlFor="branch">Branch (Optional)</Label>
                <Input
                  id="branch"
                  value={newScan.branch}
                  onChange={(e) => setNewScan({ ...newScan, branch: e.target.value })}
                  placeholder="main"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newScan.description}
                onChange={(e) => setNewScan({ ...newScan, description: e.target.value })}
                placeholder="Brief description of this scan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateScan} 
              disabled={isSubmitting || !newScan.name || !newScan.target}
            >
              {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanPage;