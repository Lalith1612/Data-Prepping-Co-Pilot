import React from 'react';
import { Settings, Zap } from 'lucide-react';
import { ProcessingOptions, DataRow } from '../types';

interface ConfigPanelProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  data: DataRow[];
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ options, onChange, data }) => {
  const numericColumns = React.useMemo(() => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return !isNaN(Number(value)) && value !== '' && value !== null;
    });
  }, [data]);

  const updateOption = (key: keyof ProcessingOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const toggleMode = () => {
    const newMode = options.mode === 'automated' ? 'interactive' : 'automated';
    updateOption('mode', newMode);
    
    if (newMode === 'automated') {
      // Reset to automated defaults
      onChange({
        ...options,
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
    }
  };

  const countActiveOptions = () => {
    let count = 0;
    if (options.handleDuplicates) count++;
    if (options.sortColumn) count++;
    if (options.dropHighMissingCols) count++;
    if (options.textCase !== 'none') count++;
    if (options.trimWhitespace) count++;
    if (options.handleEmptyStrings) count++;
    if (options.numericImputeStrategy !== 'none') count++;
    if (options.stringImputeValue) count++;
    if (options.convertDataTypes) count++;
    if (options.outlierMethod !== 'none') count++;
    if (options.scalingMethod !== 'none') count++;
    if (options.performValidation) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Cleaning Configuration</h3>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Processing Mode</label>
        <div className="flex gap-2">
          <button
            onClick={toggleMode}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              options.mode === 'automated'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Zap className="w-4 h-4" />
            One-Click
          </button>
          <button
            onClick={toggleMode}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              options.mode === 'interactive'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            Interactive
          </button>
        </div>
      </div>

      {options.mode === 'automated' && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            Automated mode applies {countActiveOptions()} optimized cleaning operations using industry best practices.
          </p>
        </div>
      )}

      {options.mode === 'interactive' && (
        <div className="space-y-6">
          {/* Basic Operations */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white border-b border-slate-700 pb-2">
              Basic Operations
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.handleDuplicates}
                  onChange={(e) => updateOption('handleDuplicates', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Remove Duplicates</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.trimWhitespace}
                  onChange={(e) => updateOption('trimWhitespace', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Trim Whitespace</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.handleEmptyStrings}
                  onChange={(e) => updateOption('handleEmptyStrings', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Handle Empty Strings</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.convertDataTypes}
                  onChange={(e) => updateOption('convertDataTypes', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Convert Data Types</span>
              </label>
            </div>
          </div>

          {/* Text Processing */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white border-b border-slate-700 pb-2">
              Text Processing
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Text Case</label>
                <select
                  value={options.textCase}
                  onChange={(e) => updateOption('textCase', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Change</option>
                  <option value="lowercase">Lowercase</option>
                  <option value="uppercase">Uppercase</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Missing String Values</label>
                <input
                  type="text"
                  value={options.stringImputeValue}
                  onChange={(e) => updateOption('stringImputeValue', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Unknown"
                />
              </div>
            </div>
          </div>

          {/* Numeric Processing */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white border-b border-slate-700 pb-2">
              Numeric Processing
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Missing Numeric Values</label>
                <select
                  value={options.numericImputeStrategy}
                  onChange={(e) => updateOption('numericImputeStrategy', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Imputation</option>
                  <option value="mean">Mean</option>
                  <option value="median">Median</option>
                  <option value="mode">Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Outlier Handling</label>
                <select
                  value={options.outlierMethod}
                  onChange={(e) => updateOption('outlierMethod', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Handling</option>
                  <option value="iqr">IQR Method</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Feature Scaling</label>
                <select
                  value={options.scalingMethod}
                  onChange={(e) => updateOption('scalingMethod', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Scaling</option>
                  <option value="standardization">Z-Score Standardization</option>
                  <option value="normalization">Min-Max Normalization</option>
                </select>
              </div>

              {numericColumns.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sort by Column</label>
                  <select
                    value={options.sortColumn || ''}
                    onChange={(e) => updateOption('sortColumn', e.target.value || null)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No Sorting</option>
                    {numericColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white border-b border-slate-700 pb-2">
              Advanced Options
            </h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.dropHighMissingCols}
                onChange={(e) => updateOption('dropHighMissingCols', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Drop High Missing Rate Columns</span>
            </label>

            {options.dropHighMissingCols && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Missing Threshold: {options.missingThreshold}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={options.missingThreshold}
                  onChange={(e) => updateOption('missingThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.performValidation}
                onChange={(e) => updateOption('performValidation', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Perform Data Validation</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;