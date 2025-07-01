import React from 'react';
import { FileText, Database, AlertTriangle } from 'lucide-react';
import { DataRow } from '../types';

interface DataProfileProps {
  data: DataRow[];
  fileName: string;
}

const DataProfile: React.FC<DataProfileProps> = ({ data, fileName }) => {
  const profileData = React.useMemo(() => {
    if (data.length === 0) return null;

    const columns = Object.keys(data[0]);
    const totalCells = data.length * columns.length;
    let missingCells = 0;
    const columnTypes: Record<string, string> = {};
    const columnMissing: Record<string, number> = {};

    columns.forEach(col => {
      let numericCount = 0;
      let stringCount = 0;
      let missing = 0;

      data.forEach(row => {
        const value = row[col];
        if (value === null || value === undefined || value === '') {
          missing++;
          missingCells++;
        } else if (!isNaN(Number(value))) {
          numericCount++;
        } else {
          stringCount++;
        }
      });

      columnMissing[col] = missing;
      columnTypes[col] = numericCount > stringCount ? 'Numeric' : 'Text';
    });

    return {
      rows: data.length,
      columns: columns.length,
      totalCells,
      missingCells,
      columnTypes,
      columnMissing,
      columnNames: columns
    };
  }, [data]);

  if (!profileData) return null;

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <Database className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatNumber(profileData.rows)}</div>
          <div className="text-sm text-slate-400">Rows</div>
        </div>
        
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{profileData.columns}</div>
          <div className="text-sm text-slate-400">Columns</div>
        </div>
        
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatNumber(profileData.missingCells)}</div>
          <div className="text-sm text-slate-400">Missing</div>
        </div>
      </div>

      {/* File Info */}
      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
        <h4 className="font-medium text-white mb-2">File Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Filename:</span>
            <span className="text-white ml-2">{fileName}</span>
          </div>
          <div>
            <span className="text-slate-400">Data Quality:</span>
            <span className={`ml-2 ${
              profileData.missingCells / profileData.totalCells < 0.1 
                ? 'text-emerald-400' 
                : profileData.missingCells / profileData.totalCells < 0.3 
                ? 'text-amber-400' 
                : 'text-red-400'
            }`}>
              {((1 - profileData.missingCells / profileData.totalCells) * 100).toFixed(1)}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div>
        <h4 className="font-medium text-white mb-3">Data Preview</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {profileData.columnNames.slice(0, 6).map(col => (
                  <th key={col} className="text-left py-2 px-3 text-slate-300 font-medium">
                    {col}
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      profileData.columnTypes[col] === 'Numeric' 
                        ? 'bg-blue-500/20 text-blue-300' 
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {profileData.columnTypes[col]}
                    </span>
                  </th>
                ))}
                {profileData.columnNames.length > 6 && (
                  <th className="text-left py-2 px-3 text-slate-400">
                    +{profileData.columnNames.length - 6} more
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, index) => (
                <tr key={index} className="border-b border-slate-800">
                  {profileData.columnNames.slice(0, 6).map(col => (
                    <td key={col} className="py-2 px-3 text-slate-300">
                      {row[col] !== null && row[col] !== undefined && row[col] !== '' 
                        ? String(row[col]).slice(0, 30) + (String(row[col]).length > 30 ? '...' : '')
                        : <span className="text-slate-500 italic">null</span>
                      }
                    </td>
                  ))}
                  {profileData.columnNames.length > 6 && (
                    <td className="py-2 px-3 text-slate-500">...</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > 5 && (
          <p className="text-xs text-slate-400 mt-2">
            Showing 5 of {formatNumber(data.length)} rows
          </p>
        )}
      </div>
    </div>
  );
};

export default DataProfile;