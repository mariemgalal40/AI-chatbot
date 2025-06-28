
import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploaderProps {
  onUpload: (success: boolean) => void;
}

const DocumentUploader = ({ onUpload }: DocumentUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // You can change this to your FastAPI backend URL
  const API_BASE_URL = 'http://localhost:8000';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);
      
      onUpload(true);
      toast({
        title: "Document uploaded successfully!",
        description: "Your AI assistant is ready to help you explore the content.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please make sure your FastAPI server is running.",
        variant: "destructive"
      });
      onUpload(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        isDragOver 
          ? 'border-2 border-dashed border-purple-400 bg-purple-50/50 scale-105' 
          : 'border-2 border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <div className="mb-8">
          <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDragOver 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-110' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}>
            <Upload className="h-12 w-12 text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          {isDragOver ? 'Drop your document here' : 'Upload Your PDF Document'}
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Drag and drop your PDF file here, or click the button below to browse your files. 
          Make sure your FastAPI server is running on localhost:8000.
        </p>

        {!isUploading ? (
          <div className="space-y-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf"
              onChange={handleInputChange}
            />
            <label htmlFor="file-upload">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-medium cursor-pointer"
              >
                <span>
                  <FileText className="mr-2 h-5 w-5" />
                  Choose PDF File
                </span>
              </Button>
            </label>
            
            <p className="text-sm text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-purple-600 font-medium">Processing your document...</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentUploader;
