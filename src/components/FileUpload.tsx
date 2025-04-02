
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileUp } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Only accept PDFs for now
    if (file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png") {
      onFileSelected(file);
      toast.success(`File "${file.name}" uploaded successfully!`);
    } else {
      toast.error("Only PDF, JPEG, and PNG files are supported.");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card 
      className={`p-6 border-2 border-dashed ${
        isDragging ? "border-brand-blue bg-blue-50" : "border-gray-300"
      } rounded-lg transition-all duration-200 ease-in-out`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center py-6">
        <Upload 
          className={`w-16 h-16 mb-4 ${
            isDragging ? "text-brand-blue" : "text-gray-400"
          }`}
        />
        <h3 className="text-lg font-medium mb-2">Upload your file</h3>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Drag and drop your file here, or click to select a file
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={triggerFileInput}
            className="flex items-center gap-2 bg-brand-blue hover:bg-brand-darkBlue"
          >
            <FileUp className="h-4 w-4" />
            Select File
          </Button>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-400 mt-4">
          Supported files: PDF, JPEG, PNG
        </p>
      </div>
    </Card>
  );
};

export default FileUpload;
