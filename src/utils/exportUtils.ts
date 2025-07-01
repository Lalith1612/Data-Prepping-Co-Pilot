import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataRow } from '../types';

export const exportData = (data: DataRow[], fileName: string, format: string) => {
  let blob: Blob;
  let mimeType: string;
  let fileExtension: string;

  switch (format.toLowerCase()) {
    case 'csv':
      const csvString = Papa.unparse(data);
      blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      mimeType = 'text/csv';
      fileExtension = '.csv';
      break;

    case 'xlsx':
    case 'xls':
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExtension = '.xlsx';
      break;

    case 'json':
      const jsonString = JSON.stringify(data, null, 2);
      blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      mimeType = 'application/json';
      fileExtension = '.json';
      break;

    default:
      // Default to CSV
      const defaultCsvString = Papa.unparse(data);
      blob = new Blob([defaultCsvString], { type: 'text/csv;charset=utf-8;' });
      mimeType = 'text/csv';
      fileExtension = '.csv';
  }

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.replace(/\.[^/.]+$/, '') + fileExtension;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};