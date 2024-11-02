import { Script } from '@/types/script';

const GITHUB_API_BASE = 'https://api.github.com';
export const GITHUB_USERNAME = 'mrdatawolf';
export const REPO_NAMES = ['PSGatherO365Data', 'PingGather', 'CoreSetup'];
const CACHE_KEY = 'github_scripts_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const GITHUB_TOKEN_REGEX = /^ghp_[a-zA-Z0-9]{36}$/;

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

interface CacheData {
  timestamp: number;
  scripts: Script[];
}

function validateConfiguration() {
  if (!GITHUB_USERNAME || GITHUB_USERNAME === 'mrdatawolf') {
    throw new Error('GitHub username not configured. Please update GITHUB_USERNAME in lib/github.ts');
  }

  if (!REPO_NAMES || REPO_NAMES.length === 0) {
    throw new Error('Repository names not configured. Please update REPO_NAMES in lib/github.ts');
  }

  if (REPO_NAMES.some(name => !name || typeof name !== 'string')) {
    throw new Error('Invalid repository name found. All REPO_NAMES must be non-empty strings.');
  }
}

export function validateGitHubToken(token: string): boolean {
  return GITHUB_TOKEN_REGEX.test(token);
}

export async function checkRateLimit(token?: string): Promise<{
  remaining: number;
  total: number;
  resetDate: Date;
}> {
  validateConfiguration();

  if (token && !validateGitHubToken(token)) {
    throw new Error('invalid_token_format');
  }

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Script-Library-App',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, { headers });
    
    if (response.status === 401) {
      throw new Error('invalid_token');
    }
    
    const data: RateLimitResponse = await response.json();

    return {
      remaining: data.resources.core.remaining,
      total: data.resources.core.limit,
      resetDate: new Date(data.resources.core.reset * 1000),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'invalid_token_format' || error.message === 'invalid_token') {
        throw error;
      }
    }
    throw new Error('Failed to check rate limit');
  }
}

function getCachedData(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp <= CACHE_DURATION) {
      return data;
    }
    
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
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

export async function fetchRepositoryData(
  repoName: string,
  token?: string
): Promise<Script | null> {
  validateConfiguration();

  if (token && !validateGitHubToken(token)) {
    throw new Error('invalid_token_format');
  }

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Script-Library-App',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const repoResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`,
      { headers }
    );
    
    if (repoResponse.status === 401) {
      throw new Error('invalid_token');
    }
    
    if (repoResponse.status === 403) {
      throw new Error('rate_limit_exceeded');
    }
    
    if (!repoResponse.ok) {
      console.error(`Failed to fetch repo ${repoName}:`, await repoResponse.text());
      return null;
    }
    
    const repoData = await repoResponse.json();

    let readme = '';
    try {
      const readmeResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/readme`,
        { headers }
      );
      
      if (readmeResponse.ok) {
        readme = await readmeResponse.text();
      }
    } catch (error) {
      console.error(`Failed to fetch readme for ${repoName}:`, error);
    }

    const installCommandMatch = readme.match(/<!--\s*INSTALL_COMMAND:\s*(.*?)\s*-->/);
    const installCommand = installCommandMatch ? installCommandMatch[1] : '';

    return {
      id: repoData.id,
      name: repoData.name,
      description: repoData.description || 'No description available',
      language: repoData.language?.toLowerCase() || 'unknown',
      stars: repoData.stargazers_count,
      readme: readme || '# No README available',
      installCommand: installCommand || 'No install command specified',
      url: repoData.html_url,
    };
  } catch (error) {
    if (error instanceof Error && ['rate_limit_exceeded', 'invalid_token', 'invalid_token_format'].includes(error.message)) {
      throw error;
    }
    console.error(`Error fetching repository ${repoName}:`, error);
    return null;
  }
}

export async function fetchAllRepositories(token?: string): Promise<{
  scripts: Script[];
  fromCache: boolean;
}> {
  validateConfiguration();

  if (token && !validateGitHubToken(token)) {
    throw new Error('invalid_token_format');
  }

  // Check cache first
  const cachedData = getCachedData();
  if (cachedData) {
    return { scripts: cachedData.scripts, fromCache: true };
  }

  try {
    // Check rate limit before making requests
    const { remaining } = await checkRateLimit(token);
    if (remaining === 0) {
      throw new Error('rate_limit_exceeded');
    }

    const scriptData = await Promise.all(
      REPO_NAMES.map((repo) => fetchRepositoryData(repo, token))
    );

    const validScripts = scriptData.filter((script): script is Script => script !== null);
    
    // Cache the results
    if (validScripts.length > 0) {
      setCachedData(validScripts);
    }

    return { scripts: validScripts, fromCache: false };
  } catch (error) {
    if (error instanceof Error && ['rate_limit_exceeded', 'invalid_token', 'invalid_token_format'].includes(error.message)) {
      throw error;
    }
    throw new Error('Failed to fetch repositories');
  }
}