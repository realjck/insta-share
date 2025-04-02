
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
    <Card className="p-4 border border-gray-200 rounded-lg mb-6 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 flex-shrink-0">
          <Link className="h-4 w-4 text-brand-blue" />
          <span>Lien de partage:</span>
        </div>
        <div className="flex-1 min-w-0 flex items-center space-x-2">
          <span className="text-gray-500 text-sm hidden sm:inline">insta.pxly.fr/</span>
          <Input
            value={shortCode}
            readOnly
            className="bg-gray-50 text-gray-900 text-sm font-mono"
          />
        </div>
        <Button
          className={`flex items-center gap-2 ${
            copied 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-brand-blue hover:bg-brand-darkBlue"
          }`}
          onClick={copyToClipboard}
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
    </Card>
  );
};

export default ShareLink;
