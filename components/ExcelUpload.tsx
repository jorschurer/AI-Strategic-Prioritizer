import React, { useRef } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { UseCaseInput } from '../types';

interface ExcelUploadProps {
  onUseCasesExtracted: (useCases: UseCaseInput[]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUseCasesExtracted }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON - expect headers in first row
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      // Helper function for case-insensitive property access
      const getProperty = (obj: Record<string, any>, propName: string): string => {
        const key = Object.keys(obj).find(k => k.toLowerCase() === propName.toLowerCase());
        return key ? String(obj[key]).trim() : '';
      };

      // Transform to UseCaseInput format
      const useCases: UseCaseInput[] = jsonData
        .map((row, index) => {
          const title = getProperty(row, 'title');
          const department = getProperty(row, 'department');
          const description = getProperty(row, 'description');

          // Only include rows with title and description
          if (!title || !description) return null;

          return {
            id: `excel-${Date.now()}-${index}`,
            title,
            department: department || 'General',
            description,
          };
        })
        .filter((uc): uc is UseCaseInput => uc !== null);

      if (useCases.length === 0) {
        alert('No valid use cases found in the Excel file. Please ensure it has columns: Title, Department, Description (case-insensitive)');
        return;
      }

      onUseCasesExtracted(useCases);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert(`Successfully imported ${useCases.length} use case(s) from Excel!`);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      alert('Failed to parse Excel file. Please check the format and try again.');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-dashed border-emerald-200">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="bg-emerald-100 p-3 rounded-full">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-1">Bulk Import from Excel</h3>
          <p className="text-xs text-slate-500">
            Upload an Excel file with columns: <span className="font-mono font-bold">title</span>, <span className="font-mono font-bold">department</span>, <span className="font-mono font-bold">description</span> (case-insensitive)
          </p>
        </div>

        <button
          onClick={handleButtonClick}
          className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Upload className="w-4 h-4" /> Upload Excel File
        </button>
      </div>
    </div>
  );
};

export default ExcelUpload;
