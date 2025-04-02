
import React from "react";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

interface DownloadCounterProps {
  count: number;
}

const DownloadCounter: React.FC<DownloadCounterProps> = ({ count }) => {
  return (
    <Card className="p-4 border border-gray-200 rounded-lg mb-6 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-3 bg-brand-blue/10 rounded-full">
          <Download className="h-5 w-5 text-brand-blue" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Downloads</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </Card>
  );
};

export default DownloadCounter;
