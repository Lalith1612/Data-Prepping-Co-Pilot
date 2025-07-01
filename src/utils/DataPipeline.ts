import { DataRow, ProcessingOptions, ProcessingResults, ValidationError } from '../types';

export class DataPipeline {
  private stats: { [key: string]: number | string } = {};
  private columnChanges: { dropped?: string[]; typeConversions?: Record<string, string> } = {};

  private updateStats(key: string, value: number | string) {
    this.stats[key] = value;
  }

  private handleDuplicates(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (!options.handleDuplicates) return data;
    
    const initialLength = data.length;
    const seen = new Set();
    const unique = data.filter(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    this.updateStats('Duplicates Removed', initialLength - unique.length);
    return unique;
  }

  private sortData(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (!options.sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[options.sortColumn!];
      const bVal = b[options.sortColumn!];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return options.sortOrder === 'ascending' ? comparison : -comparison;
    });
  }

  private dropHighMissingCols(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (!options.dropHighMissingCols || data.length === 0) return data;
    
    const threshold = options.missingThreshold / 100;
    const columns = Object.keys(data[0]);
    const columnsToKeep: string[] = [];
    const droppedCols: string[] = [];
    
    columns.forEach(col => {
      const missingCount = data.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === ''
      ).length;
      const missingRate = missingCount / data.length;
      
      if (missingRate <= threshold) {
        columnsToKeep.push(col);
      } else {
        droppedCols.push(col);
      }
    });
    
    this.columnChanges.dropped = droppedCols;
    this.updateStats('Columns Dropped (High Missing)', droppedCols.length);
    
    return data.map(row => {
      const newRow: DataRow = {};
      columnsToKeep.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });
  }

  private normalizeTextCase(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (options.textCase === 'none' || data.length === 0) return data;
    
    return data.map(row => {
      const newRow: DataRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string') {
          newRow[key] = options.textCase === 'lowercase' 
            ? value.toLowerCase() 
            : value.toUpperCase();
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });
  }

  private trimWhitespace(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (!options.trimWhitespace) return data;
    
    return data.map(row => {
      const newRow: DataRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string') {
          newRow[key] = value.trim();
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });
  }

  private handleEmptyStrings(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (!options.handleEmptyStrings) return data;
    
    return data.map(row => {
      const newRow: DataRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value === '' || (typeof value === 'string' && value.trim() === '')) {
          newRow[key] = null;
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });
  }

  private imputeMissingValues(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (data.length === 0) return data;

    const columns = Object.keys(data[0]);
    let imputedCount = 0;

    // Calculate imputation values for each column
    const imputationValues: Record<string, any> = {};
    
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => 
        val !== null && val !== undefined && val !== ''
      );
      
      if (values.length === 0) return;
      
      // Check if column is numeric
      const numericValues = values.filter(val => !isNaN(Number(val))).map(val => Number(val));
      
      if (numericValues.length > values.length * 0.8 && options.numericImputeStrategy !== 'none') {
        // Treat as numeric column
        if (options.numericImputeStrategy === 'mean') {
          imputationValues[col] = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        } else if (options.numericImputeStrategy === 'median') {
          const sorted = [...numericValues].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          imputationValues[col] = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        } else if (options.numericImputeStrategy === 'mode') {
          const freq: Record<number, number> = {};
          numericValues.forEach(val => freq[val] = (freq[val] || 0) + 1);
          imputationValues[col] = Object.keys(freq).reduce((a, b) => freq[Number(a)] > freq[Number(b)] ? a : b);
        }
      } else if (options.stringImputeValue) {
        // Treat as string column
        imputationValues[col] = options.stringImputeValue;
      }
    });

    // Apply imputation
    const result = data.map(row => {
      const newRow: DataRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if ((value === null || value === undefined || value === '') && key in imputationValues) {
          newRow[key] = imputationValues[key];
          imputedCount++;
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });

    this.updateStats('Missing Values Imputed', imputedCount);
    return result;
  }

  private convertDataTypes(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (!options.convertDataTypes || data.length === 0) return data;
    
    const columns = Object.keys(data[0]);
    const typeConversions: Record<string, string> = {};
    
    return data.map((row, index) => {
      const newRow: DataRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          newRow[key] = value;
          return;
        }
        
        const strValue = String(value);
        
        // Try to convert to number
        if (!isNaN(Number(strValue)) && strValue.trim() !== '') {
          const numValue = Number(strValue);
          if (Number.isInteger(numValue)) {
            newRow[key] = numValue;
            if (index === 0) typeConversions[key] = 'string → integer';
          } else {
            newRow[key] = numValue;
            if (index === 0) typeConversions[key] = 'string → float';
          }
        } else {
          newRow[key] = strValue;
        }
      });
      return newRow;
    });
  }

  private handleOutliers(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (options.outlierMethod !== 'iqr' || data.length === 0) return data;
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
      return values.length > 0 && values.every(val => !isNaN(Number(val)));
    });
    
    let filteredData = [...data];
    
    numericColumns.forEach(col => {
      const values = filteredData.map(row => Number(row[col])).filter(val => !isNaN(val));
      if (values.length < 4) return; // Need at least 4 values for IQR
      
      values.sort((a, b) => a - b);
      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      const q1 = values[q1Index];
      const q3 = values[q3Index];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      filteredData = filteredData.filter(row => {
        const val = Number(row[col]);
        return isNaN(val) || (val >= lowerBound && val <= upperBound);
      });
    });
    
    this.updateStats('Outlier Rows Removed (IQR)', data.length - filteredData.length);
    return filteredData;
  }

  private scaleFeatures(data: DataRow[], options: ProcessingOptions): DataRow[] {
    if (options.scalingMethod === 'none' || data.length === 0) return data;
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
      return values.length > 0 && values.every(val => !isNaN(Number(val)));
    });
    
    const scalingStats: Record<string, { mean?: number; std?: number; min?: number; max?: number }> = {};
    
    // Calculate scaling parameters
    numericColumns.forEach(col => {
      const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
      
      if (options.scalingMethod === 'standardization') {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
        scalingStats[col] = { mean, std };
      } else if (options.scalingMethod === 'normalization') {
        const min = Math.min(...values);
        const max = Math.max(...values);
        scalingStats[col] = { min, max };
      }
    });
    
    // Apply scaling
    const result = data.map(row => {
      const newRow: DataRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if (numericColumns.includes(key) && !isNaN(Number(value))) {
          const numValue = Number(value);
          const stats = scalingStats[key];
          
          if (options.scalingMethod === 'standardization' && stats.std !== 0) {
            newRow[key] = (numValue - stats.mean!) / stats.std!;
          } else if (options.scalingMethod === 'normalization' && stats.max !== stats.min) {
            newRow[key] = (numValue - stats.min!) / (stats.max! - stats.min!);
          } else {
            newRow[key] = numValue;
          }
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });
    
    this.updateStats('Feature Scaling Applied', options.scalingMethod);
    return result;
  }

  private validateData(data: DataRow[], options: ProcessingOptions): { data: DataRow[]; errors: ValidationError[] } {
    if (!options.performValidation) return { data, errors: [] };
    
    const validRows: DataRow[] = [];
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      let hasError = false;
      const rowErrors: string[] = [];
      
      // Basic validation rules
      Object.entries(row).forEach(([key, value]) => {
        // Check for negative ages (if column looks like age)
        if (key.toLowerCase().includes('age') && !isNaN(Number(value)) && Number(value) < 0) {
          rowErrors.push(`Invalid age: ${value}`);
          hasError = true;
        }
        
        // Check for invalid email format (if column looks like email)
        if (key.toLowerCase().includes('email') && typeof value === 'string' && value.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            rowErrors.push(`Invalid email format: ${value}`);
            hasError = true;
          }
        }
        
        // Check for extremely large or small numeric values
        if (!isNaN(Number(value)) && Number(value) !== 0) {
          const numValue = Number(value);
          if (Math.abs(numValue) > 1e15) {
            rowErrors.push(`Extremely large value: ${value}`);
            hasError = true;
          }
        }
      });
      
      if (hasError) {
        errors.push({
          rowIndex: index,
          error: rowErrors.join(', '),
          data: row
        });
      } else {
        validRows.push(row);
      }
    });
    
    this.updateStats('Rows Failing Validation', errors.length);
    return { data: validRows, errors };
  }

  async process(
    data: DataRow[], 
    options: ProcessingOptions, 
    progressCallback: (step: string, progress: number) => void
  ): Promise<ProcessingResults> {
    this.stats = {};
    this.columnChanges = {};
    
    this.updateStats('Initial Rows', data.length);
    this.updateStats('Initial Columns', data.length > 0 ? Object.keys(data[0]).length : 0);
    
    let processedData = [...data];
    
    const steps = [
      { name: 'Handling Duplicates', fn: (d: DataRow[]) => this.handleDuplicates(d, options) },
      { name: 'Dropping High Missing Columns', fn: (d: DataRow[]) => this.dropHighMissingCols(d, options) },
      { name: 'Handling Empty Strings', fn: (d: DataRow[]) => this.handleEmptyStrings(d, options) },
      { name: 'Trimming Whitespace', fn: (d: DataRow[]) => this.trimWhitespace(d, options) },
      { name: 'Normalizing Text Case', fn: (d: DataRow[]) => this.normalizeTextCase(d, options) },
      { name: 'Converting Data Types', fn: (d: DataRow[]) => this.convertDataTypes(d, options) },
      { name: 'Imputing Missing Values', fn: (d: DataRow[]) => this.imputeMissingValues(d, options) },
      { name: 'Handling Outliers', fn: (d: DataRow[]) => this.handleOutliers(d, options) },
      { name: 'Sorting Data', fn: (d: DataRow[]) => this.sortData(d, options) },
      { name: 'Scaling Features', fn: (d: DataRow[]) => this.scaleFeatures(d, options) }
    ];
    
    let validationErrors: ValidationError[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      progressCallback(step.name, (i + 1) / (steps.length + 1));
      
      // Add small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 100));
      
      processedData = step.fn(processedData);
    }
    
    // Validation step
    progressCallback('Validating Data', 1);
    const validationResult = this.validateData(processedData, options);
    processedData = validationResult.data;
    validationErrors = validationResult.errors;
    
    this.updateStats('Final Rows', processedData.length);
    this.updateStats('Final Columns', processedData.length > 0 ? Object.keys(processedData[0]).length : 0);
    
    return {
      cleanedData: processedData,
      stats: this.stats,
      validationErrors,
      columnChanges: this.columnChanges
    };
  }
}