export interface DataRow {
  [key: string]: any;
}

export interface ProcessingOptions {
  mode: 'automated' | 'interactive';
  handleDuplicates: boolean;
  sortColumn: string | null;
  sortOrder: 'ascending' | 'descending';
  dropHighMissingCols: boolean;
  missingThreshold: number;
  textCase: 'none' | 'lowercase' | 'uppercase';
  trimWhitespace: boolean;
  handleEmptyStrings: boolean;
  numericImputeStrategy: 'none' | 'mean' | 'median' | 'mode';
  stringImputeValue: string;
  convertDataTypes: boolean;
  outlierMethod: 'none' | 'iqr';
  scalingMethod: 'none' | 'standardization' | 'normalization';
  performValidation: boolean;
}

export interface ProcessingStats {
  [key: string]: number | string;
}

export interface ValidationError {
  rowIndex: number;
  error: string;
  data: DataRow;
}

export interface ProcessingResults {
  cleanedData: DataRow[];
  stats: ProcessingStats;
  validationErrors: ValidationError[];
  columnChanges: {
    dropped?: string[];
    typeConversions?: Record<string, string>;
  };
}