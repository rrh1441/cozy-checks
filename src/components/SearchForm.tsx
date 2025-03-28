
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useApi } from '../hooks/useApi';
import { GlassCard } from './ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Search as SearchIcon } from 'lucide-react';
import { Identifier } from '../types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFormProps {
  minimal?: boolean;
  className?: string;
}

const SearchForm = ({ minimal = false, className = '' }: SearchFormProps) => {
  const navigate = useNavigate();
  const { useRequestReport } = useApi();
  const { searchForm, updateSearchForm, addIdentifier, removeIdentifier, resetSearchForm } = useStore();
  
  const [newIdentifierType, setNewIdentifierType] = useState<Identifier['type']>('email');
  const [newIdentifierValue, setNewIdentifierValue] = useState('');
  
  const requestReportMutation = useRequestReport();
  
  const handleAddIdentifier = () => {
    if (!newIdentifierValue.trim()) return;
    
    addIdentifier(newIdentifierType, newIdentifierValue);
    setNewIdentifierValue('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchForm.fullName.trim()) return;
    
    try {
      const reportId = await requestReportMutation.mutateAsync(searchForm);
      resetSearchForm();
      navigate(`/results/${reportId}`);
    } catch (error) {
      console.error('Error requesting report:', error);
    }
  };
  
  const getIdentifierPlaceholder = (type: Identifier['type']) => {
    switch(type) {
      case 'email': return 'Enter email address';
      case 'employer': return 'Enter current employer';
      case 'domain': return 'Enter website/domain';
      case 'phone': return 'Enter phone number';
      default: return `Enter ${type}`;
    }
  };
  
  return (
    <GlassCard 
      className={`w-full max-w-3xl mx-auto overflow-hidden ${className}`}
      variant={minimal ? 'transparent' : 'default'}
      glowEffect={!minimal}
    >
      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        {!minimal && (
          <h2 className="text-2xl font-bold mb-6 text-center">
            Begin Your Investigation
          </h2>
        )}
        
        <div className="space-y-6">
          {/* Full Name Input */}
          <div>
            <Label htmlFor="fullName" className="text-foreground/90 mb-1.5 block">
              Full Name (required)
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              value={searchForm.fullName}
              onChange={(e) => updateSearchForm({ fullName: e.target.value })}
              className="bg-white/60 border-white/50"
              required
            />
          </div>
          
          {/* Identifiers */}
          {searchForm.identifiers.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-foreground/80">Added Identifiers:</p>
              <div className="space-y-2">
                {searchForm.identifiers.map((identifier) => (
                  <div key={identifier.id} className="flex items-center bg-white/40 rounded-lg p-2">
                    <span className="capitalize text-xs text-foreground/70 bg-muted px-2 py-1 rounded-md mr-2">
                      {identifier.type}
                    </span>
                    <span className="flex-1 text-sm">{identifier.value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIdentifier(identifier.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add Identifier Form */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <Select 
                value={newIdentifierType} 
                onValueChange={(value) => setNewIdentifierType(value as Identifier['type'])}
              >
                <SelectTrigger id="identifier-type" className="bg-white/60 border-white/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="email">Email Address</SelectItem>
                  <SelectItem value="employer">Current Employer</SelectItem>
                  <SelectItem value="domain">Website/Domain</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-6">
              <Input
                type="text"
                placeholder={getIdentifierPlaceholder(newIdentifierType)}
                value={newIdentifierValue}
                onChange={(e) => setNewIdentifierValue(e.target.value)}
                className="bg-white/60 border-white/50"
              />
            </div>
            
            <div className="col-span-2">
              <Button
                type="button"
                onClick={handleAddIdentifier}
                className="w-full"
                variant="outline"
                disabled={!newIdentifierValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-gradient"
            disabled={requestReportMutation.isPending || !searchForm.fullName.trim()}
          >
            {requestReportMutation.isPending ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <SearchIcon className="mr-2 h-4 w-4" />
                Begin Investigation
              </div>
            )}
          </Button>
          
          {!minimal && (
            <p className="text-sm text-center mt-2 text-foreground/70">
              Enter as much information as you have. More details lead to more accurate results.
            </p>
          )}
        </div>
      </form>
    </GlassCard>
  );
};

export default SearchForm;
