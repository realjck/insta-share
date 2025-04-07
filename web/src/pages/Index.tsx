
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const CHUNK_SIZE = 64 * 1024; // 64KB chunks

  const cleanupWebSocket = () => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  };

  const setupWebSocket = async () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    
    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => resolve(ws);
      ws.onerror = () => reject(new Error("WebSocket connection failed"));
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket connection timeout"));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        resolve(ws);
      };
    });
  };

  const handleFileUpload = async (selectedFile: File) => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("Le fichier est trop volumineux (maximum 100 Mo)");
      return;
    }

    cleanupWebSocket();
    setUploadProgress(0);
    setFile(selectedFile);

    try {
      socketRef.current = await setupWebSocket();
      
      socketRef.current.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        
        if (msg.type === "error") {
          toast.error(msg.message);
          cleanupWebSocket();
          return;
        }
        
        if (msg.type === "link") {
          setUploadProgress(100);
          currentCodeRef.current = msg.code;
          const url = `${import.meta.env.VITE_APP_BASE_URL}/${msg.code}`;
          setShareUrl(url);
          
          const pingInterval = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ action: "ping" }));
            }
          }, 500);
          
          (socketRef.current as WebSocket & { pingInterval?: NodeJS.Timeout }).pingInterval = pingInterval;
        }
        
        if (msg.type === "stats") {
          setDownloadCount(msg.downloads);
        }
      };

      const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
      
      for (let currentChunk = 0; currentChunk < totalChunks; currentChunk++) {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket connection lost");
        }

        const start = currentChunk * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunk = selectedFile.slice(start, end);
        
        const chunkData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const bytes = new Uint8Array(arrayBuffer);
            const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
            resolve(btoa(binary));
          };
          reader.readAsArrayBuffer(chunk);
        });
        
        socketRef.current.send(JSON.stringify({
          action: "upload_chunk",
          name: selectedFile.name,
          chunk: chunkData,
          chunkIndex: currentChunk,
          totalChunks: totalChunks
        }));
        
        setUploadProgress(Math.round((currentChunk + 1) / totalChunks * 95));
      }
    } catch (error) {
      toast.error("Erreur lors du téléchargement du fichier");
      cleanupWebSocket();
      setFile(null);
      setUploadProgress(0);
    }
  };

  React.useEffect(() => {
    return () => {
      if ((socketRef.current as WebSocket & { pingInterval?: NodeJS.Timeout })?.pingInterval) {
        clearInterval((socketRef.current as WebSocket & { pingInterval?: NodeJS.Timeout }).pingInterval);
      }
      cleanupWebSocket();
    };
  }, []);

  const clearPage = () => {
    setFile(null);
    setShareUrl(null);
    setDownloadCount(0);
    cleanupWebSocket();
    toast.info("Page effacée avec succès !");
  };

  // Rest of the JSX remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-4">
              <img 
                src="/insta-share_logo.png" 
                alt="Insta Share Logo" 
                className="w-16 h-16 object-contain -mr-2"
              />
              Partage de Fichiers Instantané
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
                  {uploadProgress < 100 
                    ? `Upload en cours... ${uploadProgress}%`
                    : "Votre fichier est prêt à être partagé"
                  }
                </h2>
                <Button
                  variant="orangeOutline"
                  onClick={clearPage}
                  disabled={uploadProgress < 100}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              </div>
  
              {/* Progress bar */}
              {uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${uploadProgress}%`,
                      backgroundColor: '#eda417'
                    }}
                  />
                </div>
              )}
  
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
