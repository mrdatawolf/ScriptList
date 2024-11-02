import { GITHUB_USERNAME } from '../config/github';
import { GitHubError } from '../types/github';

export function validateConfiguration(): void {
  if (!GITHUB_USERNAME || GITHUB_USERNAME.trim() === '') {
    throw new GitHubError(
      'configuration_error',
      'GitHub username not configured'
    );
  }
}