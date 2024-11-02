"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Github, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GitHubSetupProps {
  onSetup: (username: string) => void;
}

export function GitHubSetup({ onSetup }: GitHubSetupProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateAndSubmit = () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      setError('Invalid username format');
      return;
    }

    setError(null);
    onSetup(username);
  };

  return (
    <Card className="p-6 bg-blue-500/5 border-blue-500/20">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Github className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-100">GitHub Setup Required</h2>
            <p className="text-sm text-blue-200/60">
              Please provide your GitHub username to view your scripts.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <label htmlFor="username" className="text-sm font-medium text-blue-200">
              GitHub Username
            </label>
          </div>
          <Input
            id="username"
            placeholder="Enter your GitHub username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            className="bg-blue-950/50 border-blue-500/20"
          />
        </div>

        <Button
          className="w-full gap-2"
          onClick={validateAndSubmit}
          disabled={!username}
        >
          <Github className="h-4 w-4" />
          View Scripts
        </Button>
      </div>
    </Card>
  );
}