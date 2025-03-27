import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportService } from '../hooks/use-report';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, FileText, RefreshCw, Download, ArrowUpRight } from 'lucide-react';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { getReports } = useReportService();
  const { data, isLoading } = getReports();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reports based on search query
  const filteredReports = data?.reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Security Reports</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
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
      ) : filteredReports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report._id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  {report.description && (
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(report.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Total Issues:</span>{' '}
                    {report.summary.totalIssues}
                  </div>
                  <div className="text-sm flex flex-wrap gap-1">
                    <span className="font-medium">Severity:</span>{' '}
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                      {report.summary.criticalCount} Critical
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                      {report.summary.highCount} High
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                      {report.summary.mediumCount} Medium
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                      {report.summary.lowCount} Low
                    </span>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6 pt-2 mt-auto">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/reports/${report._id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  {report.pdfUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl font-medium mb-4">No reports found</p>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Complete a security scan and generate a report to see it here.
          </p>
          <Button onClick={() => navigate('/scans')}>
            Go to Scans
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;