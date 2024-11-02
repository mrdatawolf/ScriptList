import { Script, GitHubError, RateLimitInfo } from '@/lib/types/github';
import { GITHUB_API_BASE, GITHUB_TOKEN_REGEX, CACHE_KEY, CACHE_DURATION } from '@/lib/config/github';

interface CacheData {
  timestamp: number;
  scripts: Script[];
}

interface RateLimitResponse {
  resources: {
    core: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
  };
}

export async function getGitHubHeaders(token?: string): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Script-Library-App',
  };

  if (token) {
    if (!GITHUB_TOKEN_REGEX.test(token)) {
      throw new GitHubError('invalid_token_format', 'Invalid GitHub token format');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function fetchFromGitHub<T>(url: string, token?: string): Promise<T> {
  try {
    const headers = await getGitHubHeaders(token);
    const response = await fetch(url, { headers });

    if (response.status === 401) {
      throw new GitHubError('invalid_token', 'Invalid GitHub token');
    }

    if (response.status === 403) {
      throw new GitHubError('rate_limit_exceeded', 'GitHub API rate limit exceeded');
    }

    if (!response.ok) {
      throw new GitHubError('api_error', `GitHub API error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }
    throw new GitHubError('network_error', 'Failed to connect to GitHub API');
  }
}

export async function checkRateLimit(token?: string): Promise<RateLimitInfo> {
  const data = await fetchFromGitHub<RateLimitResponse>(`${GITHUB_API_BASE}/rate_limit`, token);
  
  return {
    remaining: data.resources.core.remaining,
    total: data.resources.core.limit,
    resetDate: new Date(data.resources.core.reset * 1000),
  };
}

export async function fetchUserRepositories(username: string, token?: string): Promise<Script[]> {
  if (!username) {
    throw new GitHubError('configuration_error', 'GitHub username not configured');
  }

  const repos = await fetchFromGitHub<any[]>(
    `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`,
    token
  );

  const scripts: Script[] = [];

  for (const repo of repos) {
    try {
      let readme = '';
      try {
        const readmeResponse = await fetchFromGitHub<{ content: string }>(
          `${GITHUB_API_BASE}/repos/${username}/${repo.name}/readme`,
          token
        );
        readme = Buffer.from(readmeResponse.content, 'base64').toString('utf-8');
      } catch (error) {
        console.warn(`Failed to fetch readme for ${repo.name}:`, error);
      }

      const installCommandMatch = readme.match(/<!--\s*INSTALL_COMMAND:\s*(.*?)\s*-->/);
      
      scripts.push({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description available',
        language: repo.language?.toLowerCase() || 'unknown',
        stars: repo.stargazers_count,
        readme: readme || '# No README available',
        installCommand: installCommandMatch?.[1] || 'No install command specified',
        url: repo.html_url,
      });
    } catch (error) {
      console.error(`Error processing repository ${repo.name}:`, error);
    }
  }

  return scripts;
}

function getCachedData(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp <= CACHE_DURATION) {
      return data;
    }
    
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

function setCachedData(scripts: Script[]) {
  try {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      scripts,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export async function fetchAllRepositories(
  username: string,
  token?: string,
  forceRefresh?: number
): Promise<{ scripts: Script[]; fromCache: boolean }> {
  if (!forceRefresh) {
    const cachedData = getCachedData();
    if (cachedData) {
      return { scripts: cachedData.scripts, fromCache: true };
    }
  }

  const scripts = await fetchUserRepositories(username, token);
  
  if (scripts.length > 0) {
    setCachedData(scripts);
  }

  return { scripts, fromCache: false };
}