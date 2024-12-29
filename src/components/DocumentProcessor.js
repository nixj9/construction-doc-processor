import React, { useState, useEffect } from 'react';
import { processDrawing } from '../utils/drawingProcessor';
import { processText } from '../utils/textProcessor';
import { extractMetadata } from '../utils/metadataExtractor';

const DocumentProcessor = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
  };

  const processFiles = async () => {
    setProcessing(true);
    const processedResults = [];

    for (const file of files) {
      try {
        const fileType = determineFileType(file);
        const metadata = await extractMetadata(file);
        
        let processedContent;
        switch (fileType) {
          case 'drawing':
            processedContent = await processDrawing(file);
            break;
          case 'text':
            processedContent = await processText(file);
            break;
          default:
            throw new Error(`Unsupported file type: ${fileType}`);
        }

        processedResults.push({
          fileName: file.name,
          fileType,
          metadata,
          content: processedContent,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        processedResults.push({
          fileName: file.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    setResults(prevResults => [...prevResults, ...processedResults]);
    setProcessing(false);
  };

  const determineFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const drawingExtensions = ['dwg', 'dxf', 'rvt', 'ifc'];
    const textExtensions = ['pdf', 'doc', 'docx', 'txt'];

    if (drawingExtensions.includes(extension)) return 'drawing';
    if (textExtensions.includes(extension)) return 'text';
    return 'unknown';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Document Processor</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="fileInput"
            accept=".pdf,.dwg,.dxf,.doc,.docx,.rvt,.ifc,.txt"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Select Files
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Selected Files</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span>{file.name}</span>
                <span className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
          <button
            onClick={processFiles}
            disabled={processing}
            className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {processing ? 'Processing...' : 'Process Files'}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Processing Results</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium">{result.fileName}</h4>
                {result.error ? (
                  <p className="text-red-500 mt-2">{result.error}</p>
                ) : (
                  <div className="mt-2">
                    <p>Type: {result.fileType}</p>
                    <p>Processed: {new Date(result.timestamp).toLocaleString()}</p>
                    {result.metadata && (
                      <div className="mt-2">
                        <h5 className="font-medium">Metadata:</h5>
                        <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">
                          {JSON.stringify(result.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;