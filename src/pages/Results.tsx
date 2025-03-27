
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useApi } from '@/hooks/useApi';
import { ReportSection } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';

const Results = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { currentReport, reports } = useStore();
  const { useFetchReport } = useApi();
  
  // Fetch report data
  const { refetch } = useFetchReport(reportId);
  
  useEffect(() => {
    refetch();
  }, [reportId, refetch]);
  
  if (!currentReport) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-medium mb-4">Report Not Found</h2>
          <p className="text-foreground/70 mb-6">
            The report you're looking for could not be found or is still loading.
          </p>
          <Link to="/">
            <Button className="btn-gradient">
              Return Home
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }
  
  const isProcessing = currentReport.status === 'pending' || currentReport.status === 'processing';
  
  // Render section content based on section type
  const renderSectionContent = (section: ReportSection) => {
    if (section.loading) {
      return (
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-horizon-orange/30 border-t-horizon-orange rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/70">Analyzing data...</p>
        </div>
      );
    }
    
    if (!section.data) {
      return <p className="text-foreground/70 py-4">No information found.</p>;
    }
    
    switch (section.type) {
      case 'identity':
        return (
          <div className="space-y-4">
            {section.data.emails && section.data.emails.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground/70 mb-2">Email Addresses</h4>
                <ul className="space-y-2">
                  {section.data.emails.map((email: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-horizon-orange" />
                      <span>{email}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {section.data.phones && section.data.phones.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground/70 mb-2">Phone Numbers</h4>
                <ul className="space-y-2">
                  {section.data.phones.map((phone: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-horizon-orange" />
                      <span>{phone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        
      case 'social':
        return (
          <div>
            {section.data.profiles && section.data.profiles.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground/70 mb-2">Social Profiles</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.data.profiles.map((profile: any, i: number) => (
                    <div key={i} className="flex items-center p-3 bg-white/40 rounded-lg">
                      <Globe className="h-5 w-5 mr-3 text-horizon-orange" />
                      <div>
                        <p className="font-medium">{profile.platform}</p>
                        <p className="text-sm text-foreground/70">
                          {profile.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-foreground/70">No social profiles found.</p>
            )}
          </div>
        );
        
      // Add more cases for other section types
        
      default:
        return (
          <div className="py-2">
            <p className="text-foreground/70 mb-2">Information retrieved:</p>
            <pre className="bg-white/40 p-3 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(section.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center text-foreground/70 hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        {/* Report header */}
        <GlassCard className="mb-6 overflow-hidden animate-fade-in">
          <GlassCardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{currentReport.subjectName}</h1>
              <p className="text-foreground/70 text-sm">
                Investigation started {new Date(currentReport.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center">
              {isProcessing ? (
                <div className="flex items-center px-3 py-1 bg-horizon-amber/20 text-horizon-amber rounded-full">
                  <Clock className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Processing</span>
                </div>
              ) : (
                <div className="flex items-center px-3 py-1 bg-green-500/20 text-green-600 rounded-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </GlassCardHeader>
          
          <GlassCardContent>
            <h2 className="text-lg font-medium mb-3">Identifiers</h2>
            {currentReport.identifiers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentReport.identifiers.map((identifier) => (
                  <div key={identifier.id} className="inline-flex items-center bg-white/40 px-3 py-1 rounded-full text-sm">
                    <span className="capitalize text-xs text-foreground/70 mr-2">
                      {identifier.type}:
                    </span>
                    <span>{identifier.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/70 text-sm">No additional identifiers</p>
            )}
            
            {isProcessing && (
              <div className="mt-4 p-4 bg-horizon-amber/10 rounded-lg">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-horizon-amber" />
                  Investigation in Progress
                </h3>
                <p className="text-foreground/80">
                  We're searching across hundreds of sources to build a comprehensive profile. Sections will update automatically as data becomes available.
                </p>
                <div className="w-full h-2 bg-white/30 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-horizon-amber animate-pulse-slow rounded-full"></div>
                </div>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
        
        {/* Report sections */}
        {currentReport.sections && (
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {currentReport.sections.map((section, index) => (
                <AccordionItem 
                  key={section.type} 
                  value={section.type}
                  className="glass-card overflow-hidden border-none animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center text-left">
                      <div className="mr-3">
                        {section.loading ? (
                          <div className="w-5 h-5 border-2 border-horizon-orange/30 border-t-horizon-orange rounded-full animate-spin"></div>
                        ) : section.data ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-foreground/50" />
                        )}
                      </div>
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <Separator className="bg-white/20" />
                  <AccordionContent className="px-6 py-4">
                    {renderSectionContent(section)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
