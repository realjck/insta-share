
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ShareLink from "@/components/ShareLink";
import FilePreview from "@/components/FilePreview";
import DownloadCounter from "@/components/DownloadCounter";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const currentCodeRef = useRef<string | null>(null);

  // Cleanup function for WebSocket
  const cleanupWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  // Handle WebSocket connection and file upload
  const handleFileUpload = async (selectedFile: File) => {
    cleanupWebSocket(); // Clean up any existing connection
    
    socketRef.current = new WebSocket("ws://localhost:8765");
    
    socketRef.current.onopen = async () => {
      try {
        const data = await selectedFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
        
        socketRef.current?.send(JSON.stringify({
          action: "upload",
          name: selectedFile.name,
          data: base64
        }));
      } catch (error) {
        toast.error("Erreur lors du téléchargement du fichier");
        cleanupWebSocket();
      }
    };

    socketRef.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      
      if (msg.type === "link") {
        currentCodeRef.current = msg.code;
        const url = `insta.pxly.fr/${msg.code}`;
        setShareUrl(url);
        
        // Set up ping interval
        const pingInterval = setInterval(() => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "ping" }));
          }
        }, 500);

        // Store interval ID for cleanup
        (socketRef.current as WebSocket & { pingInterval?: NodeJS.Timeout }).pingInterval = pingInterval;
      }
      
      if (msg.type === "stats") {
        setDownloadCount(msg.downloads);
      }
    };

    socketRef.current.onerror = () => {
      toast.error("Erreur de connexion au serveur");
      cleanupWebSocket();
    };

    setFile(selectedFile);
  };

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      if ((socketRef.current as WebSocket & { pingInterval?: NodeJS.Timeout })?.pingInterval) {
        clearInterval((socketRef.current as WebSocket & { pingInterval?: NodeJS.Timeout }).pingInterval);
      }
      cleanupWebSocket();
    };
  }, []);

  // Clear page and reset state
  const clearPage = () => {
    setFile(null);
    setShareUrl(null);
    setDownloadCount(0);
    cleanupWebSocket();
    toast.info("Page effacée avec succès !");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚡ Partage de Fichiers Instantané
            </h1>
            <p className="text-gray-600">
              Partagez vos fichiers en direct • Le lien n'est actif que lorsque cette page est ouverte
            </p>
          </header>

          {!file ? (
            <FileUpload onFileSelected={handleFileUpload} />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Votre fichier est prêt à être partagé
                </h2>
                <Button
                  variant="orangeOutline"
                  onClick={clearPage}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              </div>

              {shareUrl && <ShareLink shareUrl={shareUrl} />}
              {shareUrl && <DownloadCounter count={downloadCount} />}
              <FilePreview file={file} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
