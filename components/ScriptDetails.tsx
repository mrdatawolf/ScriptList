"use client";

import { Script } from '@/types/script';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode2, Download, PlayCircle, Star } from 'lucide-react';

interface ScriptDetailsProps {
  script: Script;
}

export function ScriptDetails({ script }: ScriptDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-200 bg-clip-text text-transparent">
          {script.name}
        </h2>
        <p className="text-blue-200/60">{script.description}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-100">Installation</h3>
        <Card className="p-4 bg-blue-950/50 border-blue-500/20">
          <code className="text-sm text-blue-300">{script.installCommand}</code>
        </Card>
        <div className="flex gap-3">
          <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
            <Download className="h-4 w-4" />
            Install Script
          </Button>
          <Button variant="secondary" className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20">
            <PlayCircle className="h-4 w-4" />
            Run Script
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-blue-100">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              <div className="text-blue-200/60 text-sm">Stars</div>
            </div>
            <div className="text-2xl font-bold text-blue-100">{script.stars}</div>
          </Card>
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-blue-500" />
              <div className="text-blue-200/60 text-sm">Language</div>
            </div>
            <div className="text-2xl font-bold text-blue-100 capitalize">{script.language}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}