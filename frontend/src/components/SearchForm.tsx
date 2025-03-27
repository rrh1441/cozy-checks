import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ScanType } from '../types/scan';

const SearchForm = () => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState<ScanType>(ScanType.GITHUB_REPO);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    navigate('/scans', { 
      state: { showCreateModal: true, initialValues: { target, type: scanType } }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-card rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="scanType" className="block text-sm font-medium mb-2">
          Scan Type
        </label>
        <select
          id="scanType"
          value={scanType}
          onChange={(e) => setScanType(e.target.value as ScanType)}
          className="w-full rounded-md border border-input bg-background p-2"
        >
          <option value={ScanType.GITHUB_REPO}>GitHub Repository</option>
          <option value={ScanType.GITHUB_PR}>GitHub Pull Request</option>
          <option value={ScanType.CUSTOM_CODE}>Custom Code</option>
          <option value={ScanType.URL}>URL</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="target" className="block text-sm font-medium mb-2">
          {scanType === ScanType.GITHUB_REPO && 'Repository URL or name (e.g., owner/repo)'}
          {scanType === ScanType.GITHUB_PR && 'Pull Request URL'}
          {scanType === ScanType.CUSTOM_CODE && 'Project Description'}
          {scanType === ScanType.URL && 'Website URL'}
        </label>
        <input
          id="target"
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={
            scanType === ScanType.GITHUB_REPO
              ? 'username/repository'
              : scanType === ScanType.GITHUB_PR
              ? 'https://github.com/username/repository/pull/123'
              : scanType === ScanType.URL
              ? 'https://example.com'
              : 'Enter details'
          }
          className="w-full rounded-md border border-input bg-background p-2"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Scan Now
      </Button>
    </form>
  );
};

export default SearchForm;