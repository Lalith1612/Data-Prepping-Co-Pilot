import React, { useState, useCallback } from 'react';
import { Upload, Sparkles, Download, BarChart3, CheckCircle, AlertCircle, Database, Zap } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import DataProfile from './components/DataProfile';
import ResultsDashboard from './components/ResultsDashboard';
import { DataPipeline } from './utils/DataPipeline';
import { ProcessingOptions, ProcessingResults, DataRow } from './types';

function App() {
  const [uploadedData, setUploadedData] = useState<{
    data: DataRow[];
    fileName: string;
    fileType: string;
  } | null>(null);
  
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    mode: 'automated',
    handleDuplicates: true,
    sortColumn: null,
    sortOrder: 'ascending',
    dropHighMissingCols: true,
    missingThreshold: 90,
    textCase: 'lowercase',
    trimWhitespace: true,
    handleEmptyStrings: true,
    numericImputeStrategy: 'median',
    stringImputeValue: 'Unknown',
    convertDataTypes: true,
    outlierMethod: 'iqr',
    scalingMethod: 'none',
    performValidation: true
  });

  const [results, setResults] = useState<ProcessingResults | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ step: '', percent: 0 });

  const handleFileUpload = useCallback((data: DataRow[], fileName: string, fileType: string) => {
    setUploadedData({ data, fileName, fileType });
    setResults(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!uploadedData) return;

    setIsProcessing(true);
    setProgress({ step: 'Initializing...', percent: 0 });

    const pipeline = new DataPipeline();
    
    const progressCallback = (step: string, percent: number) => {
      setProgress({ step, percent: Math.round(percent * 100) });
    };

    try {
      const processingResults = await pipeline.process(
        uploadedData.data,
        processingOptions,
        progressCallback
      );
      
      setResults(processingResults);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setProgress({ step: '', percent: 0 });
    }
  }, [uploadedData, processingOptions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter">
      {/* Enhanced animated background with floating particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20 animate-gradient-xy"></div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-particle"></div>
        <div className="floating-particle" style={{ animationDelay: '2s', left: '20%' }}></div>
        <div className="floating-particle" style={{ animationDelay: '4s', left: '80%' }}></div>
        <div className="floating-particle" style={{ animationDelay: '6s', left: '60%' }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header with better spacing */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Data Prepping Co-Pilot
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Transform messy datasets into pristine, analysis-ready data with our intelligent preprocessing toolkit
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>AI-Powered Cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Multiple Formats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Production Ready</span>
            </div>
          </div>
        </div>

        {/* Improved Main Layout with better symmetry */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-8">
            {/* File Upload with enhanced design */}
            <div className="glass-container">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload & Configure</h2>
                  <p className="text-sm text-slate-400">Start by uploading your dataset</p>
                </div>
              </div>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>

            {/* Configuration Panel */}
            {uploadedData && (
              <div className="glass-container">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Processing Settings</h2>
                    <p className="text-sm text-slate-400">Customize your cleaning pipeline</p>
                  </div>
                </div>
                <ConfigPanel
                  options={processingOptions}
                  onChange={setProcessingOptions}
                  data={uploadedData.data}
                />
              </div>
            )}

            {/* Enhanced Process Button */}
            {uploadedData && (
              <div className="glass-container">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Execute Pipeline</h2>
                    <p className="text-sm text-slate-400">Run the data cleaning process</p>
                  </div>
                </div>
                
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 
                           disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-4 px-6 rounded-xl
                           transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 
                           shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{progress.step}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Start Processing</span>
                      <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                        {Object.values(processingOptions).filter(v => v && v !== 'none' && v !== false).length} steps
                      </div>
                    </>
                  )}
                </button>
                
                {isProcessing && (
                  <div className="mt-6 space-y-3">
                    <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-full transition-all duration-500 relative"
                        style={{ width: `${progress.percent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{progress.step}</span>
                      <span className="text-emerald-400 font-medium">{progress.percent}% Complete</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Data Display */}
          <div className="space-y-8">
            {/* Data Profile */}
            {uploadedData && (
              <div className="glass-container">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Database className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Data Profile</h2>
                    <p className="text-sm text-slate-400">Overview of your dataset</p>
                  </div>
                </div>
                <DataProfile data={uploadedData.data} fileName={uploadedData.fileName} />
              </div>
            )}

            {/* Results Dashboard */}
            {results && (
              <div className="glass-container">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Processing Results</h2>
                    <p className="text-sm text-slate-400">Your cleaned and processed data</p>
                  </div>
                </div>
                <ResultsDashboard
                  results={results}
                  originalFileName={uploadedData?.fileName || 'data'}
                  fileType={uploadedData?.fileType || 'csv'}
                />
              </div>
            )}

            {/* Enhanced Welcome Message */}
            {!uploadedData && !results && (
              <div className="glass-container text-center py-20">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center">
                    <Upload className="w-12 h-12 text-slate-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Data</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                  Upload your dataset to begin the intelligent cleaning and preprocessing journey.
                  We support CSV, Excel, JSON, and Parquet formats with advanced AI-powered cleaning.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Smart Analytics</p>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Fast Processing</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-700/50">
          <div className="text-center text-slate-400">
            <p className="text-sm">
              Built with ❤️ using React, TypeScript, and Tailwind CSS
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <span>© 2025 Data Prepping Co-Pilot</span>
              <span>•</span>
              <span>Intelligent Data Processing</span>
              <span>•</span>
              <span>Production Ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;