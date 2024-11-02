"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Github, Key, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GitHubAuthProps {
  onAuth: (token: string) => void;
}

const GITHUB_TOKEN_REGEX = /^ghp_[a-zA-Z0-9]{36}$/;

export function GitHubAuth({ onAuth }: GitHubAuthProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateAndSubmit = () => {
    if (!token) {
      setError('Token is required');
      return;
    }

    if (!GITHUB_TOKEN_REGEX.test(token)) {
      setError('Invalid token format. Token should start with "ghp_" followed by 36 characters');
      return;
    }

    setError(null);
    onAuth(token);
  };

  return (
    <Card className="p-6 bg-blue-500/5 border-blue-500/20">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Github className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-100">GitHub Authentication Required</h2>
            <p className="text-sm text-blue-200/60">
              API rate limit exceeded. Please provide a GitHub token to continue.
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
            <Key className="h-4 w-4 text-blue-500" />
            <label htmlFor="token" className="text-sm font-medium text-blue-200">
              Personal Access Token
            </label>
          </div>
          <Input
            id="token"
            type="password"
            placeholder="ghp_..."
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setError(null);
            }}
            className="bg-blue-950/50 border-blue-500/20"
          />
          <p className="text-xs text-blue-200/60">
            Create a token with 'repo' scope at{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              GitHub Settings
            </a>
          </p>
        </div>

        <Button
          className="w-full gap-2"
          onClick={validateAndSubmit}
          disabled={!token}
        >
          <Github className="h-4 w-4" />
          Authenticate with GitHub
        </Button>
      </div>
    </Card>
  );
}