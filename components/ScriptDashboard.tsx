"use client";

import { useState, useEffect } from 'react';
import { Search, Terminal, FileCode2, BookOpen, Github, Database, RefreshCw, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ScriptCard } from './ScriptCard';
import { ScriptDetails } from './ScriptDetails';
import { ScriptReadme } from './ScriptReadme';
import { GitHubAuth } from './GitHubAuth';
import { GitHubSetup } from './GitHubSetup';
import { fetchAllRepositories, checkRateLimit } from '@/lib/api/github';
import { getSettings, updateSettings } from '@/lib/utils/settings';
import { GITHUB_USERNAME } from '@/lib/config/github';
import type { Script } from '@/lib/types/github';

export default function ScriptDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [githubToken, setGithubToken] = useState<string>('');
  const [githubUsername, setGithubUsername] = useState<string>(GITHUB_USERNAME);
  const [fromCache, setFromCache] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const settings = getSettings();
    if (settings.githubToken) {
      setGithubToken(settings.githubToken);
    }
    if (settings.githubUsername) {
      setGithubUsername(settings.githubUsername);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadScripts(username: string, token?: string) {
      try {
        setLoading(true);
        setError(null);

        const rateLimit = await checkRateLimit(token);
        if (rateLimit.remaining === 0) {
          setIsRateLimited(true);
          const resetTime = rateLimit.resetDate.toLocaleTimeString();
          setError(`API rate limit exceeded. Resets at ${resetTime}`);
          return;
        }

        const { scripts: loadedScripts, fromCache: isFromCache } = await fetchAllRepositories(username, token);
        
        if (!mounted) return;

        if (loadedScripts.length === 0) {
          setError('No scripts found for this username. Please check the username and try again.');
        } else {
          setScripts(loadedScripts);
          setSelectedScript(loadedScripts[0]);
          setFromCache(isFromCache);
          
          if (isFromCache) {
            toast({
              title: "Using cached data",
              description: "Click the cache indicator to refresh from GitHub API.",
              duration: 3000,
            });
          }
        }
      } catch (err) {
        if (!mounted) return;
        
        if (err instanceof Error) {
          switch (err.message) {
            case 'rate_limit_exceeded':
              setIsRateLimited(true);
              setError('GitHub API rate limit exceeded. Please authenticate to continue.');
              break;
            case 'invalid_token':
              setError('Invalid GitHub token. Please check your token and try again.');
              setGithubToken('');
              updateSettings({ githubToken: undefined });
              break;
            case 'invalid_token_format':
              setError('Invalid token format. Token should start with "ghp_" followed by 36 characters.');
              setGithubToken('');
              updateSettings({ githubToken: undefined });
              break;
            default:
              setError('Failed to load scripts. Please try again later.');
              console.error('Error fetching scripts:', err);
          }
        } else {
          setError('Failed to load scripts. Please try again later.');
          console.error('Error fetching scripts:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadScripts(githubUsername, githubToken);

    return () => {
      mounted = false;
    };
  }, [githubUsername, githubToken, toast]);

  const handleAuth = (token: string) => {
    setGithubToken(token);
    updateSettings({ githubToken: token });
    setIsRateLimited(false);
    setError(null);
  };

  const handleSetup = (username: string) => {
    setGithubUsername(username);
    updateSettings({ githubUsername: username });
    setError(null);
  };

  const handleRefreshCache = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();
      const { scripts: refreshedScripts } = await fetchAllRepositories(githubUsername, githubToken, timestamp);
      setScripts(refreshedScripts);
      setFromCache(false);
      toast({
        title: "Cache refreshed",
        description: "Successfully updated scripts from GitHub API.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh scripts from GitHub API.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredScripts = scripts.filter((script) => {
    if (!script?.name || !script?.description) return false;
    return (
      script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isRateLimited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
        <GitHubAuth onAuth={handleAuth} />
      </div>
    );
  }

  if (error && !isRateLimited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
        <Card className="p-6 bg-blue-500/5 border-blue-500/20">
          <p className="text-red-400">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Terminal className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-200 bg-clip-text text-transparent">
                Script Library
              </h1>
              <div className="flex items-center gap-2 text-blue-200/60">
                <p>Viewing scripts for {githubUsername}</p>
                {fromCache && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 gap-1 text-xs hover:bg-blue-500/10"
                    onClick={handleRefreshCache}
                  >
                    <Database className="h-3 w-3" />
                    <span>Cached</span>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-blue-500/20 hover:bg-blue-500/10"
              onClick={() => {
                const newUsername = prompt('Enter GitHub username:', githubUsername);
                if (newUsername && newUsername !== githubUsername) {
                  handleSetup(newUsername);
                }
              }}
            >
              <User className="h-4 w-4" />
              Change User
            </Button>
            {selectedScript && (
              <Button 
                variant="outline" 
                className="gap-2 border-blue-500/20 hover:bg-blue-500/10"
                onClick={() => window.open(selectedScript.url, '_blank')}
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Search scripts..."
                  className="pl-9 bg-blue-500/5 border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <ScrollArea className="h-[calc(100vh-12rem)] rounded-xl glass-card">
                <div className="p-4 space-y-2">
                  {loading ? (
                    <div className="text-center p-4">
                      <p className="text-blue-200/60">Loading scripts...</p>
                    </div>
                  ) : filteredScripts.length > 0 ? (
                    filteredScripts.map((script) => (
                      <ScriptCard
                        key={script.id}
                        script={script}
                        isSelected={selectedScript?.id === script.id}
                        onClick={() => setSelectedScript(script)}
                      />
                    ))
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-blue-200/60">No scripts found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)] glass-card">
              {selectedScript ? (
                <Tabs defaultValue="details" className="h-full">
                  <div className="p-6 border-b border-blue-500/20">
                    <TabsList className="bg-blue-500/10">
                      <TabsTrigger value="details" className="gap-2 data-[state=active]:bg-blue-500">
                        <FileCode2 className="h-4 w-4" />
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="readme" className="gap-2 data-[state=active]:bg-blue-500">
                        <BookOpen className="h-4 w-4" />
                        README
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="h-[calc(100%-8rem)]">
                    <TabsContent value="details" className="p-6 m-0">
                      <ScriptDetails script={selectedScript} />
                    </TabsContent>

                    <TabsContent value="readme" className="p-6 m-0">
                      <ScriptReadme content={selectedScript.readme} />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-blue-200/60">
                    {loading ? 'Loading scripts...' : 'Select a script to view details'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}