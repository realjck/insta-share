
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
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Card className="p-4 border border-gray-200 rounded-lg mb-6 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 flex-shrink-0">
          <Link className="h-4 w-4 text-brand-blue" />
          <span>Share Link:</span>
        </div>
        <div className="flex-1 min-w-0">
          <Input
            value={shareUrl}
            readOnly
            className="bg-gray-50 text-gray-900 text-sm"
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
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ShareLink;
