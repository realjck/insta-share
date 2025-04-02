
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface PdfPreviewProps {
  file: File | null;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsPdf(file.type === "application/pdf");
      
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
        <FileText className="text-red-500 w-5 h-5" />
        <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
          {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>
      
      <div className="w-full rounded-lg overflow-hidden border border-gray-200">
        {isPdf ? (
          <iframe
            src={previewUrl}
            title="PDF preview"
            className="w-full h-[500px]"
          />
        ) : (
          <img 
            src={previewUrl} 
            alt="File preview" 
            className="max-h-[500px] mx-auto"
          />
        )}
      </div>
    </Card>
  );
};

export default PdfPreview;
