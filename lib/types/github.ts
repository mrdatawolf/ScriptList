export interface Script {
  id: number;
  name: string;
  description: string;
  language: string;
  stars: number;
  readme: string;
  installCommand: string;
  url: string;
}

export interface CacheData {
  timestamp: number;
  scripts: Script[];
}

export class GitHubError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'GitHubError';
  }
}

export interface RateLimitInfo {
  remaining: number;
  total: number;
  resetDate: Date;
}