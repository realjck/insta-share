
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ShareLink from "@/components/ShareLink";
import FilePreview from "@/components/FilePreview";
import DownloadCounter from "@/components/DownloadCounter";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

// Fonction pour générer un code aléatoire de 4 caractères
const generateShortCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);

  // Simulation d'augmentation du nombre de téléchargements
  let downloadInterval: number | null = null;
  
  const startSimulatingDownloads = () => {
    if (downloadInterval) {
      clearInterval(downloadInterval);
    }
    
    downloadInterval = window.setInterval(() => {
      setDownloadCount((prev) => prev + 1);
    }, 5000 + Math.random() * 10000); // Intervalle aléatoire entre 5 et 15 secondes
  };

  const stopSimulatingDownloads = () => {
    if (downloadInterval) {
      clearInterval(downloadInterval);
      downloadInterval = null;
    }
  };

  // Nettoyage à la destruction du composant
  React.useEffect(() => {
    return () => {
      stopSimulatingDownloads();
    };
  }, []);

  // Générer instantanément un lien court lorsqu'un fichier est sélectionné
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Générer immédiatement un lien court
    const shortCode = generateShortCode();
    const url = `insta.pxly.fr/${shortCode}`;
    setShareUrl(url);
    setDownloadCount(0);
    
    // Démarrer la simulation des téléchargements
    startSimulatingDownloads();
  };

  // Effacer la page et réinitialiser
  const clearPage = () => {
    setFile(null);
    setShareUrl(null);
    setDownloadCount(0);
    stopSimulatingDownloads();
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
              Téléchargez et partagez des fichiers facilement
            </p>
          </header>

          {!file ? (
            <FileUpload onFileSelected={handleFileSelected} />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Votre fichier est prêt à être partagé
                </h2>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
