export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  if (!username) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Shahriar-Creative-Platform',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`GitHub API returned status ${res.status}`);
      return [];
    }

    const repos: GitHubRepo[] = await res.json();
    if (!Array.isArray(repos)) return [];

    return repos.filter((r) => !r.fork);
  } catch (err) {
    // Fail gracefully without crashing the site
    console.warn('Unable to reach GitHub API, proceeding with fallback state.');
    return [];
  }
}

