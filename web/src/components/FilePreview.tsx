
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Image, FileArchive, File, FilePen, FileCode } from "lucide-react";

interface FilePreviewProps {
  file: File | null;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canPreview, setCanPreview] = useState(false);

  // Détermine l'icône à afficher selon le type de fichier
  const getFileIcon = () => {
    if (!file) return <File className="text-gray-500 w-5 h-5" />;
    
    const fileType = file.type.toLowerCase();
    
    // Images
    if (fileType.includes('image')) {
      return <Image className="text-blue-500 w-5 h-5" />;
    }
    
    // PDFs
    if (fileType === 'application/pdf') {
      return <FileText className="text-red-500 w-5 h-5" />;
    }
    
    // Documents
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('text')) {
      return <FilePen className="text-blue-700 w-5 h-5" />;
    }
    
    // Code
    if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css') || 
        fileType.includes('json') || fileType.includes('xml')) {
      return <FileCode className="text-green-600 w-5 h-5" />;
    }
    
    // Archives
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || 
        fileType.includes('7z') || fileType.includes('gzip')) {
      return <FileArchive className="text-yellow-600 w-5 h-5" />;
    }
    
    // Default
    return <File className="text-gray-600 w-5 h-5" />;
  };

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Définir quels types de fichiers peuvent être prévisualisés (désactivé pour tout type)
      /*
      const fileType = file.type.toLowerCase();
      setCanPreview(
        fileType === 'application/pdf' || 
        fileType.includes('image/')
      );
      */

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!file || !previewUrl) {
    return null;
  }

  return (
    <Card className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {getFileIcon()}
        <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
          {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>
    </Card>
  );
};

export default FilePreview;
