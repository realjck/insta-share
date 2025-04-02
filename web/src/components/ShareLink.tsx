
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, Copy, Check } from "lucide-react";

interface ShareLinkProps {
  shareUrl: string | null;
}

const ShareLink: React.FC<ShareLinkProps> = ({ shareUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!shareUrl) {
    return null;
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié dans le presse-papier !");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Échec de la copie du lien.");
    }
  };

  // Extraire le code court du lien complet
  const shortCode = shareUrl.split('/').pop();

  return (
    <Card className="p-6 border-0 rounded-lg mb-8 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:scale-[1.01] transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 text-base font-semibold text-white w-full sm:w-auto">
          <Link className="h-5 w-5 text-blue-100" />
          <span>Lien de partage:</span>
        </div>
        <div className="flex-1 min-w-0 flex items-center space-x-2 w-full">
          <span className="text-blue-100 text-sm hidden sm:inline font-medium">insta.pxly.fr/</span>
          <Input
            value={shortCode}
            readOnly
            className="bg-white/90 text-blue-900 text-lg font-mono border-0 shadow-inner"
          />
        </div>
        <Button
          className={`flex items-center gap-1 px-3 py-2 h-auto text-sm font-medium ${
            copied 
              ? "bg-green-600 hover:bg-green-700 shadow-sm" 
              : "bg-white text-blue-700 hover:bg-blue-50 shadow-sm"
          } transition-colors`}
          onClick={copyToClipboard}
          size="sm"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copié!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copier
            </>
          )}
        </Button>
      </div>
      <p className="text-blue-100 text-sm mt-4 text-center">
        Partagez ce lien avec qui vous voulez pour leur donner accès à votre fichier
      </p>
    </Card>
  );
};

export default ShareLink;
