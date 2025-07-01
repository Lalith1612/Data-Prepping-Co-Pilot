import React, { useState } from 'react';
import { BarChart3, Download, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { ProcessingResults, DataRow } from '../types';
import { exportData } from '../utils/exportUtils';

interface ResultsDashboardProps {
  results: ProcessingResults;
  originalFileName: string;
  fileType: string;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  results, 
  originalFileName, 
  fileType 
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'data' | 'errors'>('summary');

  const handleDownload = () => {
    const cleanedFileName = `cleaned_${originalFileName}`;
    exportData(results.cleanedData, cleanedFileName, fileType);
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const renderStatsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Object.entries(results.stats).map(([key, value]) => (
        <div key={key} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">{key}</div>
          <div className="text-lg font-semibold text-white">
            {typeof value === 'number' ? formatNumber(value) : String(value)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDataTable = () => {
    if (results.cleanedData.length === 0) {
      return (
        <div className="text-center py-8 text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <p>No data available after processing</p>
        </div>
      );
    }

    const columns = Object.keys(results.cleanedData[0]);
    const displayColumns = columns.slice(0, 6);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-white">Cleaned Dataset</h4>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {displayColumns.map(col => (
                  <th key={col} className="text-left py-3 px-3 text-slate-300 font-medium">
                    {col}
                  </th>
                ))}
                {columns.length > 6 && (
                  <th className="text-left py-3 px-3 text-slate-400">
                    +{columns.length - 6} more
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.cleanedData.slice(0, 10).map((row, index) => (
                <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/30">
                  {displayColumns.map(col => (
                    <td key={col} className="py-2 px-3 text-slate-300">
                      {row[col] !== null && row[col] !== undefined && row[col] !== '' 
                        ? String(row[col]).slice(0, 30) + (String(row[col]).length > 30 ? '...' : '')
                        : <span className="text-slate-500 italic">null</span>
                      }
                    </td>
                  ))}
                  {columns.length > 6 && (
                    <td className="py-2 px-3 text-slate-500">...</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-slate-400">
          Showing 10 of {formatNumber(results.cleanedData.length)} rows
        </p>
      </div>
    );
  };

  const renderValidationErrors = () => {
    if (results.validationErrors.length === 0) {
      return (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-300 font-medium">No validation errors found</p>
          <p className="text-slate-400 text-sm mt-1">All data passed validation checks</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <p className="text-amber-300">
            {results.validationErrors.length} rows failed validation and were removed
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-3 text-slate-300 font-medium">Row</th>
                <th className="text-left py-3 px-3 text-slate-300 font-medium">Error</th>
                <th className="text-left py-3 px-3 text-slate-300 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {results.validationErrors.slice(0, 10).map((error, index) => (
                <tr key={index} className="border-b border-slate-800">
                  <td className="py-2 px-3 text-slate-300">{error.rowIndex}</td>
                  <td className="py-2 px-3 text-red-300">{error.error}</td>
                  <td className="py-2 px-3 text-slate-400 max-w-xs truncate">
                    {JSON.stringify(error.data)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Summary
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
            activeTab === 'data'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Cleaned Data
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
            activeTab === 'errors'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Validation
          {results.validationErrors.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {results.validationErrors.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && renderStatsGrid()}
        {activeTab === 'data' && renderDataTable()}
        {activeTab === 'errors' && renderValidationErrors()}
      </div>
    </div>
  );
};

export default ResultsDashboard;