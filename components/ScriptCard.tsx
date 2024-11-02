"use client";

import { Script } from '@/types/script';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScriptCardProps {
  script: Script;
  isSelected: boolean;
  onClick: () => void;
}

export function ScriptCard({ script, isSelected, onClick }: ScriptCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-blue-500/5 border-blue-500/20 ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-blue-100">{script.name}</h3>
          <p className="text-sm text-blue-200/60">{script.description}</p>
        </div>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20">
          {script.language}
        </Badge>
      </div>
    </Card>
  );
}