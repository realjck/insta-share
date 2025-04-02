
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ShareLink from "@/components/ShareLink";
import PdfPreview from "@/components/PdfPreview";
import DownloadCounter from "@/components/DownloadCounter";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Simulate generating a random share link
  const generateShareLink = () => {
    setIsGeneratingLink(true);
    
    // Simulate a network delay
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 10);
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/share/${randomId}`;
      setShareUrl(url);
      setIsGeneratingLink(false);
      
      // Start simulating download count increases
      startSimulatingDownloads();
    }, 1500);
  };

  // Clear all data and reset the page
  const clearPage = () => {
    setFile(null);
    setShareUrl(null);
    setDownloadCount(0);
    stopSimulatingDownloads();
    toast.info("Page cleared successfully!");
  };

  // Simulate real-time download count increases
  let downloadInterval: number | null = null;
  const startSimulatingDownloads = () => {
    stopSimulatingDownloads();
    
    downloadInterval = window.setInterval(() => {
      setDownloadCount((prev) => prev + 1);
    }, 5000 + Math.random() * 10000); // Random interval between 5 and 15 seconds
  };

  const stopSimulatingDownloads = () => {
    if (downloadInterval) {
      clearInterval(downloadInterval);
      downloadInterval = null;
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      stopSimulatingDownloads();
    };
  }, []);

  // Handle file upload
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setShareUrl(null);
    setDownloadCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simple File Sharing
            </h1>
            <p className="text-gray-600">
              Upload, preview, and share files with ease
            </p>
          </header>

          {!file ? (
            <FileUpload onFileSelected={handleFileSelected} />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Your File is Ready to Share
                </h2>
                <div className="flex gap-3">
                  {!shareUrl && (
                    <Button
                      className="bg-brand-blue hover:bg-brand-darkBlue"
                      onClick={generateShareLink}
                      disabled={isGeneratingLink}
                    >
                      {isGeneratingLink ? "Generating..." : "Generate Share Link"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={clearPage}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              {shareUrl && <ShareLink shareUrl={shareUrl} />}
              
              {shareUrl && <DownloadCounter count={downloadCount} />}
              
              <PdfPreview file={file} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
