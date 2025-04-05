
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
    // Accept all file types
    onFileSelected(file);
    toast.success(`Fichier "${file.name}" téléchargé avec succès !`);
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
        <h3 className="text-lg font-medium mb-2">Téléchargez votre fichier</h3>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Glissez et déposez votre fichier ici, ou cliquez pour sélectionner un fichier
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={triggerFileInput}
            className="flex items-center gap-2"
            variant="orange"
          >
            <FileUp className="h-4 w-4" />
            Sélectionner un fichier
          </Button>
        </div>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-400 mt-4">
          Tous types de fichiers acceptés
        </p>
      </div>
    </Card>
  );
};

export default FileUpload;
