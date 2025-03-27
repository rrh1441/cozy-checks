import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useScanService } from '../hooks/use-scan';
import { useReportService } from '../hooks/use-report';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ScanStatus, SeverityLevel } from '../types/scan';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowRight, Cpu, FileText, AlertTriangle, Zap, Plus } from 'lucide-react';

const SEVERITY_COLORS = {
  [SeverityLevel.LOW]: '#3498db',
  [SeverityLevel.MEDIUM]: '#f39c12',
  [SeverityLevel.HIGH]: '#e74c3c',
  [SeverityLevel.CRITICAL]: '#9b59b6',
};

const STATUS_COLORS = {
  [ScanStatus.PENDING]: '#f39c12',
  [ScanStatus.IN_PROGRESS]: '#3498db',
  [ScanStatus.COMPLETED]: '#2ecc71',
  [ScanStatus.FAILED]: '#e74c3c',
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { getScans } = useScanService();
  const { getReports } = useReportService();
  const [totalIssues, setTotalIssues] = useState(0);
  const [severityData, setSeverityData] = useState<{ name: string; value: number; }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ date: Date; type: 'scan' | 'report'; name: string; id: string; }[]>([]);

  const { data: scansData } = getScans(5, 0);
  const { data: reportsData } = getReports(5, 0);

  useEffect(() => {
    if (scansData?.scans && reportsData?.reports) {
      // Calculate total issues from completed scans
      let totalIssuesCount = 0;
      const severityCounts = {
        [SeverityLevel.LOW]: 0,
        [SeverityLevel.MEDIUM]: 0,
        [SeverityLevel.HIGH]: 0,
        [SeverityLevel.CRITICAL]: 0,
      };
      
      const statusCounts = {
        [ScanStatus.PENDING]: 0,
        [ScanStatus.IN_PROGRESS]: 0,
        [ScanStatus.COMPLETED]: 0,
        [ScanStatus.FAILED]: 0,
      };

      // Process scan data
      scansData.scans.forEach(scan => {
        statusCounts[scan.status]++;
        
        if (scan.status === ScanStatus.COMPLETED && scan.summary) {
          totalIssuesCount += scan.summary.totalIssues;
          severityCounts[SeverityLevel.LOW] += scan.summary.lowCount;
          severityCounts[SeverityLevel.MEDIUM] += scan.summary.mediumCount;
          severityCounts[SeverityLevel.HIGH] += scan.summary.highCount;
          severityCounts[SeverityLevel.CRITICAL] += scan.summary.criticalCount;
        }
      });

      // Set state with processed data
      setTotalIssues(totalIssuesCount);
      
      // Transform for charts
      setSeverityData([
        { name: 'Critical', value: severityCounts[SeverityLevel.CRITICAL] },
        { name: 'High', value: severityCounts[SeverityLevel.HIGH] },
        { name: 'Medium', value: severityCounts[SeverityLevel.MEDIUM] },
        { name: 'Low', value: severityCounts[SeverityLevel.LOW] },
      ]);
      
      setStatusData([
        { name: 'Pending', value: statusCounts[ScanStatus.PENDING] },
        { name: 'In Progress', value: statusCounts[ScanStatus.IN_PROGRESS] },
        { name: 'Completed', value: statusCounts[ScanStatus.COMPLETED] },
        { name: 'Failed', value: statusCounts[ScanStatus.FAILED] },
      ]);

      // Combine recent activity
      const activity = [
        ...scansData.scans.map(scan => ({
          date: new Date(scan.createdAt),
          type: 'scan' as const,
          name: scan.name,
          id: scan._id,
        })),
        ...reportsData.reports.map(report => ({
          date: new Date(report.createdAt),
          type: 'report' as const,
          name: report.title,
          id: report._id,
        })),
      ];
      
      // Sort by date (most recent first)
      activity.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentActivity(activity.slice(0, 5));
    }
  }, [scansData, reportsData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/scans">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scansData?.scans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statusData.find(item => item.name === 'In Progress')?.value || 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData?.reports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {statusData.find(item => item.name === 'Completed')?.value || 0} completed scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {severityData.find(item => item.name === 'Critical')?.value || 0} critical issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {severityData.find(item => item.name === 'High')?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((severityData.find(item => item.name === 'High')?.value || 0) / totalIssues * 100).toFixed(1)}% of all issues
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Scan Status</CardTitle>
            <CardDescription>Distribution of scan statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name.toLowerCase().replace(' ', '_') as ScanStatus] || '#999'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Issue Severity</CardTitle>
            <CardDescription>Distribution of issue severity levels</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {severityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SEVERITY_COLORS[entry.name.toLowerCase() as SeverityLevel] || '#999'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest scans and reports</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type === 'scan' ? 'Scan' : 'Report'} created on {activity.date.toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={activity.type === 'scan' ? `/scans/${activity.id}` : `/reports/${activity.id}`}>
                    <Button variant="ghost" size="sm">
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No activity yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;