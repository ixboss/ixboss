import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GITHUB_USERNAME = 'ixboss';
export const PORTFOLIO_URL = 'https://ixboss.vercel.app';
export const PORTFOLIO_DISPLAY = 'ixboss.vercel.app';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/hossam-mohamed-7932b0379';
export const MANIFEST_URL = 'https://ixboss.vercel.app/api/projects';
export const VERBATIM_BIO =
  'Just some nerd who loves to play with everything he sees.';
export const STAR_BADGE_THRESHOLD = 5;
export const FETCH_TIMEOUT_MS = 8000;

// HarfBuzz/PangoCairo-shaped RTL vector outline for "إسلامي" (Noto Sans Arabic Bold 19px).
// Normalized to left edge x=0, typographic baseline y=0 (width=61.66, top=-14, bottom=8.66).
export const ARABIC_ISLAMI_WIDTH = 61.66;
export const ARABIC_ISLAMI_PATH =
  'M0 -0.77C0 -1.19 0.05 -1.72 0.17 -2.36C0.3 -3 0.57 -3.77 0.98 -4.67L3.31 -3.86C3.1 -3.3 2.94 -2.81 2.83 -2.41C2.71 -2.01 2.66 -1.62 2.66 -1.23C2.66 -0.44 3.01 0.18 3.72 0.64C4.44 1.11 5.47 1.34 6.81 1.34C8.21 1.34 9.3 1.22 10.09 0.98C10.88 0.75 11.28 0.41 11.28 -0.05C11.28 -0.24 11.1 -0.44 10.75 -0.62C10.41 -0.82 9.81 -1.05 8.97 -1.33L9.59 -4C10.68 -3.55 11.66 -3.21 12.53 -2.98C13.41 -2.77 14.2 -2.66 14.89 -2.66C15.37 -2.66 15.71 -2.53 15.91 -2.28C16.11 -2.04 16.22 -1.73 16.22 -1.36C16.22 -0.97 16.08 -0.65 15.81 -0.39C15.55 -0.13 15.18 0 14.7 0L13.83 0C13.85 0.11 13.86 0.21 13.86 0.3C13.86 0.39 13.86 0.48 13.86 0.56C13.86 0.96 13.72 1.35 13.44 1.75C13.16 2.16 12.71 2.52 12.11 2.86C11.52 3.2 10.76 3.48 9.84 3.69C8.93 3.89 7.83 4 6.56 4C4.5 4 2.89 3.61 1.73 2.84C0.58 2.07 0 0.87 0 -0.77ZM8.44 8.66C8.06 8.66 7.74 8.52 7.48 8.27C7.22 8 7.09 7.7 7.09 7.34C7.09 6.98 7.22 6.66 7.48 6.39C7.74 6.13 8.06 6 8.44 6C8.79 6 9.09 6.13 9.34 6.39C9.59 6.66 9.72 6.98 9.72 7.34C9.72 7.7 9.59 8 9.34 8.27C9.09 8.52 8.79 8.66 8.44 8.66ZM5.14 8.66C4.77 8.66 4.46 8.52 4.2 8.27C3.94 8 3.81 7.7 3.81 7.34C3.81 6.98 3.94 6.66 4.2 6.39C4.46 6.13 4.77 6 5.14 6C5.49 6 5.8 6.13 6.05 6.39C6.3 6.66 6.44 6.98 6.44 7.34C6.44 7.7 6.3 8 6.05 8.27C5.8 8.52 5.49 8.66 5.14 8.66ZM14.5 0L14.69 -2.56C14.98 -2.56 15.23 -2.63 15.44 -2.78C15.64 -2.93 15.86 -3.18 16.09 -3.53C16.32 -3.88 16.59 -4.36 16.89 -4.97C17.46 -6.13 18.07 -6.93 18.72 -7.36C19.36 -7.79 20.02 -8 20.67 -8C21.42 -8 22.09 -7.79 22.69 -7.36C23.28 -6.94 23.75 -6.39 24.09 -5.72C24.44 -5.05 24.61 -4.34 24.61 -3.58C24.61 -2.91 24.46 -2.3 24.17 -1.77C23.89 -1.22 23.5 -0.79 23 -0.47C22.5 -0.16 21.93 0 21.28 0C20.8 0 20.25 -0.07 19.62 -0.2C19.01 -0.35 18.36 -0.64 17.67 -1.08C17.27 -0.67 16.84 -0.39 16.36 -0.23C15.88 -0.08 15.26 0 14.5 0ZM20.59 -5.34C20.23 -5.34 19.94 -5.15 19.72 -4.77C19.51 -4.39 19.26 -3.89 18.97 -3.27C19.35 -3.02 19.71 -2.83 20.05 -2.72C20.39 -2.61 20.68 -2.56 20.92 -2.56C21.3 -2.56 21.57 -2.62 21.75 -2.75C21.94 -2.88 22.03 -3.1 22.03 -3.39C22.03 -3.68 21.96 -3.97 21.83 -4.27C21.7 -4.55 21.54 -4.8 21.33 -5.02C21.12 -5.23 20.88 -5.34 20.59 -5.34ZM28.2 0C27.86 0 27.51 -0.02 27.16 -0.08C26.81 -0.14 26.57 -0.18 26.44 -0.2L26.8 -2.95C27.7 -2.82 28.59 -2.79 29.45 -2.88C30.32 -2.96 31.08 -3.2 31.73 -3.59C31.21 -4.35 30.49 -5.26 29.56 -6.31C28.63 -7.36 27.54 -8.48 26.27 -9.67L27.91 -11.47C29.02 -10.41 29.94 -9.5 30.66 -8.77C31.38 -8.02 31.97 -7.4 32.41 -6.89C32.84 -6.39 33.19 -5.95 33.44 -5.58C33.66 -6.14 33.77 -6.77 33.77 -7.47L33.52 -14L36.17 -14L36.58 -4.7C36.6 -4.13 36.66 -3.7 36.77 -3.41C36.87 -3.11 37.06 -2.91 37.34 -2.81C37.63 -2.71 38.05 -2.66 38.61 -2.66C39.09 -2.66 39.43 -2.53 39.64 -2.28C39.85 -2.04 39.95 -1.73 39.95 -1.36C39.95 -0.97 39.82 -0.65 39.55 -0.39C39.29 -0.13 38.91 0 38.42 0C37.42 0 36.62 -0.08 36.02 -0.25C35.41 -0.43 34.95 -0.69 34.64 -1.05C34.34 -1.41 34.13 -1.86 34.03 -2.41C33.68 -1.85 33.25 -1.41 32.75 -1.08C32.26 -0.75 31.74 -0.52 31.2 -0.36C30.66 -0.2 30.13 -0.1 29.61 -0.06C29.09 -0.02 28.62 0 28.2 0ZM38.5 0L38.69 -2.66C39.1 -2.66 39.44 -2.69 39.7 -2.77C39.97 -2.84 40.19 -2.99 40.36 -3.23C40.54 -3.48 40.69 -3.86 40.83 -4.36C40.96 -4.86 41.11 -5.54 41.28 -6.41L43.75 -5.95C43.7 -5.67 43.63 -5.32 43.55 -4.91C43.46 -4.49 43.42 -4.12 43.42 -3.81C43.42 -3.46 43.54 -3.18 43.77 -2.97C43.99 -2.76 44.43 -2.66 45.06 -2.66C45.38 -2.66 45.64 -2.69 45.88 -2.77C46.11 -2.84 46.32 -2.99 46.48 -3.23C46.66 -3.48 46.81 -3.87 46.94 -4.39C47.07 -4.92 47.2 -5.63 47.33 -6.53L49.84 -6.14C49.77 -5.69 49.69 -5.22 49.61 -4.72C49.54 -4.23 49.5 -3.86 49.5 -3.61C49.5 -3.37 49.61 -3.15 49.84 -2.95C50.08 -2.75 50.56 -2.66 51.28 -2.66C51.79 -2.66 52.19 -2.75 52.48 -2.95C52.79 -3.16 52.94 -3.52 52.94 -4.03C52.94 -4.5 52.83 -5.11 52.61 -5.88C52.4 -6.63 52.15 -7.43 51.86 -8.27L54.53 -9.06C54.74 -8.52 54.92 -7.94 55.08 -7.33C55.23 -6.71 55.36 -6.11 55.45 -5.53C55.55 -4.96 55.59 -4.46 55.59 -4.03C55.59 -2.72 55.21 -1.72 54.44 -1.03C53.68 -0.34 52.68 0 51.45 0C50.57 0 49.88 -0.1 49.38 -0.31C48.88 -0.52 48.54 -0.89 48.33 -1.44C48.07 -1 47.79 -0.68 47.48 -0.47C47.19 -0.27 46.84 -0.14 46.44 -0.08C46.03 -0.02 45.55 0 45 0C44.66 0 44.31 -0.02 43.97 -0.08C43.62 -0.14 43.3 -0.26 42.98 -0.44C42.68 -0.62 42.41 -0.92 42.19 -1.33C41.76 -0.74 41.23 -0.38 40.61 -0.22C39.98 -0.07 39.28 0 38.5 0ZM58.02 -0.09L57.62 -14L60.28 -14L60.69 -0.09ZM57.91 5.83L57.58 4.5C57.98 4.41 58.3 4.35 58.55 4.3C58.32 4.14 58.12 3.93 57.95 3.66C57.8 3.39 57.72 3.1 57.72 2.78C57.72 2.32 57.82 1.95 58.02 1.67C58.22 1.4 58.48 1.2 58.8 1.08C59.12 0.95 59.45 0.89 59.78 0.89C60.16 0.89 60.49 0.94 60.8 1.05L60.64 2.41C60.52 2.38 60.39 2.35 60.27 2.33C60.14 2.3 60 2.3 59.84 2.3C59.68 2.3 59.52 2.35 59.39 2.45C59.27 2.55 59.2 2.69 59.2 2.84C59.2 3.09 59.3 3.3 59.52 3.48C59.72 3.67 59.93 3.8 60.14 3.89C60.55 3.77 60.92 3.64 61.27 3.5L61.66 4.78C61.16 4.96 60.58 5.14 59.89 5.34C59.2 5.54 58.54 5.7 57.91 5.83Z';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_FALLBACK_PATH = path.join(REPO_ROOT, 'data/projects.fallback.json');
const DEFAULT_README_PATH = path.join(REPO_ROOT, 'README.md');

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text, maxLen) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function sanitizeId(value) {
  return String(value ?? 'item').replace(/[^a-zA-Z0-9_-]/g, '');
}

async function fetchJsonWithTimeout(
  url,
  { fetchImpl = globalThis.fetch, headers = {}, timeoutMs = FETCH_TIMEOUT_MS } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadManifest({
  fetchImpl = globalThis.fetch,
  manifestUrl = MANIFEST_URL,
  fallbackPath = DEFAULT_FALLBACK_PATH,
  timeoutMs = FETCH_TIMEOUT_MS,
} = {}) {
  let fallbackManifest = null;
  const readFallback = async () => {
    if (!fallbackManifest) {
      const raw = await fs.readFile(fallbackPath, 'utf8');
      fallbackManifest = JSON.parse(raw);
    }
    return fallbackManifest;
  };

  try {
    const res = await fetchJsonWithTimeout(manifestUrl, {
      fetchImpl,
      headers: { Accept: 'application/json', 'User-Agent': 'ixboss-profile-updater' },
      timeoutMs,
    });
    if (res && res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.projects)) {
        const exclude = Array.isArray(data.exclude)
          ? data.exclude
          : (await readFallback()).exclude;
        return {
          manifest: {
            ...data,
            exclude: Array.isArray(exclude) ? exclude : [],
          },
          source: 'remote',
        };
      }
    }
  } catch {
    // Graceful fallback to local manifest below.
  }

  return { manifest: await readFallback(), source: 'fallback' };
}

function isRateLimitedResponse(res) {
  if (!res) return false;
  if (res.status === 429) return true;
  if (res.status === 403) {
    const remaining =
      typeof res.headers?.get === 'function'
        ? res.headers.get('x-ratelimit-remaining')
        : res.headers?.['x-ratelimit-remaining'];
    if (remaining === '0' || remaining === 0) return true;
    return true;
  }
  return false;
}

export async function fetchGitHubData({
  fetchImpl = globalThis.fetch,
  username = GITHUB_USERNAME,
  token = process.env.GITHUB_TOKEN || '',
  timeoutMs = FETCH_TIMEOUT_MS,
} = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ixboss-profile-updater',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const userUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetchJsonWithTimeout(userUrl, { fetchImpl, headers, timeoutMs }),
      fetchJsonWithTimeout(reposUrl, { fetchImpl, headers, timeoutMs }),
    ]);

    if (isRateLimitedResponse(userRes) || isRateLimitedResponse(reposRes)) {
      return {
        live: false,
        rateLimited: true,
        user: null,
        repos: [],
        error: 'GitHub API rate limit reached',
      };
    }

    if (!userRes?.ok || !reposRes?.ok) {
      return {
        live: false,
        rateLimited: false,
        user: null,
        repos: [],
        error: `GitHub API returned status ${userRes?.status ?? 'ERR'}/${reposRes?.status ?? 'ERR'}`,
      };
    }

    const [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);
    return {
      live: true,
      rateLimited: false,
      user: user && typeof user === 'object' ? user : null,
      repos: Array.isArray(repos) ? repos : [],
      error: null,
    };
  } catch (err) {
    return {
      live: false,
      rateLimited: false,
      user: null,
      repos: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function buildExcludeSet(manifest) {
  const raw = Array.isArray(manifest?.exclude) ? manifest.exclude : [];
  return new Set(raw.map((slug) => String(slug).toLowerCase()));
}

function formatStatusBadge(project) {
  if (project.showStars) {
    return `★ ${project.stars} · ${project.primaryTech}`;
  }
  if (project.visibility === 'private') {
    return `${project.primaryTech} · Private Build`;
  }
  if (project.live) {
    return `${project.primaryTech} · Live App`;
  }
  const statusLabel = project.status
    ? `${project.status.charAt(0).toUpperCase()}${project.status.slice(1)}`
    : 'Active';
  return `${project.primaryTech} · ${statusLabel}`;
}

export function resolveProjects(manifest, liveRepos = []) {
  const excludeSet = buildExcludeSet(manifest);
  const publicRepoMap = new Map();

  for (const repo of Array.isArray(liveRepos) ? liveRepos : []) {
    if (!repo || !repo.name) continue;
    const key = String(repo.name).toLowerCase();
    if (excludeSet.has(key)) continue;
    if (repo.fork || repo.archived || repo.private) continue;
    publicRepoMap.set(key, repo);
  }

  const manifestProjects = [...(Array.isArray(manifest?.projects) ? manifest.projects : [])].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );

  const seen = new Set();
  const resolved = [];

  for (const item of manifestProjects) {
    const slug = String(item.slug);
    const key = slug.toLowerCase();
    if (excludeSet.has(key) || seen.has(key)) continue;
    seen.add(key);

    const isPrivate = item.visibility === 'private';
    const liveRepo = isPrivate ? null : publicRepoMap.get(key) || null;
    const stars = !isPrivate && typeof liveRepo?.stargazers_count === 'number'
      ? liveRepo.stargazers_count
      : 0;
    const showStars = !isPrivate && stars >= STAR_BADGE_THRESHOLD;
    const techList = Array.isArray(item.tech) && item.tech.length > 0
      ? item.tech
      : liveRepo?.language
        ? [liveRepo.language]
        : ['Engineering'];
    const liveLanguage =
      !isPrivate && typeof liveRepo?.language === 'string' && liveRepo.language.trim()
        ? liveRepo.language.trim()
        : null;
    const primaryTech = liveLanguage || techList[0].replace(/^Vanilla\s+/i, '');

    const project = {
      slug,
      order: item.order ?? resolved.length + 1,
      visibility: isPrivate ? 'private' : 'public',
      status: item.status || 'active',
      title: item.title || slug,
      category: item.category || 'Systems & Software',
      subtitle: item.subtitle || item.description || '',
      role: item.role || (isPrivate ? 'Product Build' : 'Open Source'),
      description: item.description || liveRepo?.description || '',
      tech: techList,
      primaryTech,
      live: item.live || null,
      repoUrl: isPrivate
        ? null
        : liveRepo?.html_url || `https://github.com/${GITHUB_USERNAME}/${slug}`,
      portfolioUrl: `${PORTFOLIO_URL}/?project=${encodeURIComponent(slug)}`,
      stars,
      showStars,
      pushedAt: liveRepo?.pushed_at || null,
    };
    project.pillLabel = formatStatusBadge(project);
    resolved.push(project);
  }

  // Append any auto-discovered public repos not listed in manifest (sorted by stars desc, pushed_at desc)
  const discovered = [...publicRepoMap.values()]
    .filter((repo) => !seen.has(String(repo.name).toLowerCase()))
    .sort((a, b) => {
      const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (starDiff !== 0) return starDiff;
      return String(b.pushed_at || '').localeCompare(String(a.pushed_at || ''));
    });

  for (const repo of discovered) {
    const slug = String(repo.name);
    const stars = typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0;
    const showStars = stars >= STAR_BADGE_THRESHOLD;
    const primaryTech = repo.language || 'Open Source';
    const project = {
      slug,
      order: resolved.length + 1,
      visibility: 'public',
      status: 'active',
      title: slug,
      category: repo.language ? `${repo.language} Repository` : 'Open Source Repository',
      subtitle: repo.description || 'Public GitHub project',
      role: 'Open Source',
      description: repo.description || 'Public open-source repository on GitHub.',
      tech: repo.language ? [repo.language] : ['Open Source'],
      primaryTech,
      live: repo.homepage && /^https?:\/\//i.test(repo.homepage) ? repo.homepage : null,
      repoUrl: repo.html_url || `https://github.com/${GITHUB_USERNAME}/${slug}`,
      portfolioUrl: `${PORTFOLIO_URL}/?project=${encodeURIComponent(slug)}`,
      stars,
      showStars,
      pushedAt: repo.pushed_at || null,
    };
    project.pillLabel = formatStatusBadge(project);
    resolved.push(project);
  }

  return resolved.map((project, idx) => ({
    ...project,
    indexLabel: String(idx + 1).padStart(2, '0'),
  }));
}

export function resolveBuildingNow(manifest, liveRepos = []) {
  const configuredLabel = String(manifest?.buildingNow?.label ?? '').trim();
  const configuredSlug = String(manifest?.buildingNow?.projectSlug ?? '').trim();

  if (configuredLabel) {
    const projectSlug = configuredSlug || manifest?.projects?.[0]?.slug || 'sadaqa-jaria';
    return {
      mode: 'manifest',
      label: configuredLabel,
      projectSlug,
      url: `${PORTFOLIO_URL}/?project=${encodeURIComponent(projectSlug)}`,
      badge: 'ACTIVE FOCUS',
    };
  }

  const excludeSet = buildExcludeSet(manifest);
  const candidates = (Array.isArray(liveRepos) ? liveRepos : [])
    .filter((repo) => {
      if (!repo || !repo.name) return false;
      const key = String(repo.name).toLowerCase();
      if (excludeSet.has(key)) return false;
      if (repo.fork || repo.archived || repo.private) return false;
      return true;
    })
    .sort((a, b) => String(b.pushed_at || '').localeCompare(String(a.pushed_at || '')));

  if (candidates.length > 0) {
    const latest = candidates[0];
    const slug = String(latest.name);
    const desc = latest.description ? ` — ${truncateText(latest.description, 46)}` : '';
    return {
      mode: 'github-latest',
      label: `${slug}${desc}`,
      projectSlug: slug,
      url: `${PORTFOLIO_URL}/?project=${encodeURIComponent(slug)}`,
      badge: 'LATEST PUSH',
    };
  }

  const fallbackSlug = manifest?.projects?.[0]?.slug || 'sadaqa-jaria';
  return {
    mode: 'fallback',
    label: manifest?.projects?.[0]?.title || 'Sadaqa Jaria',
    projectSlug: fallbackSlug,
    url: `${PORTFOLIO_URL}/?project=${encodeURIComponent(fallbackSlug)}`,
    badge: 'ACTIVE FOCUS',
  };
}

export function computeGitHubStats(githubData, resolvedProjects) {
  if (githubData?.live && githubData.user) {
    const repos = Array.isArray(githubData.repos) ? githubData.repos : [];
    const totalStars = repos.reduce(
      (sum, repo) => sum + (typeof repo?.stargazers_count === 'number' ? repo.stargazers_count : 0),
      0
    );
    const publicRepos =
      typeof githubData.user.public_repos === 'number'
        ? githubData.user.public_repos
        : repos.length;
    return {
      live: true,
      publicRepos,
      totalStars,
      projectCount: resolvedProjects.length,
    };
  }

  return {
    live: false,
    publicRepos: null,
    totalStars: null,
    projectCount: resolvedProjects.length,
  };
}

export function renderHeroSvg({
  theme = 'dark',
  bio = VERBATIM_BIO,
  stats = { live: false, projectCount: 4 },
  portfolioUrl = PORTFOLIO_URL,
} = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'Dark' : 'Light';
  const bg = isDark ? '#05070B' : '#F8FAFC';
  const surface = isDark ? '#0B0F17' : '#FFFFFF';
  const border = isDark ? '#18273A' : '#CBD5E1';
  const gridStroke = isDark ? '#38BDF8' : '#0284C7';
  const accent = isDark ? '#00E5FF' : '#0284C7';
  const accent2 = isDark ? '#8B5CF6' : '#7C3AED';
  const accentSoft = isDark ? '#38BDF8' : '#0284C7';
  const wordmarkFill = isDark ? '#FFFFFF' : '#0F172A';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#475569';
  const auraEnd = isDark ? '#05070B' : '#FFFFFF';

  const safeBio = VERBATIM_BIO;
  const host = String(portfolioUrl).replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const statLine = stats?.live
    ? `${stats.publicRepos} Public Repos · ★ ${stats.totalStars} Stars`
    : `${stats?.projectCount ?? 4} Featured Projects · Cairo, EG`;

  const wordmarkAttrs = `x="40" y="95" text-rendering="geometricPrecision" font-family="'Space Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, 'Segoe UI', Arial, sans-serif" font-size="54" font-weight="800" letter-spacing="-2"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 198" width="760" height="198" role="img" aria-label="${escapeXml(`BOSS (@ixboss) — ${safeBio}`)}">
  <defs>
    <linearGradient id="specular${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.36" stop-color="#FFFFFF" stop-opacity="${isDark ? '0.20' : '0.14'}"/>
      <stop offset="0.50" stop-color="#FFFFFF" stop-opacity="${isDark ? '1' : '0.62'}"/>
      <stop offset="0.64" stop-color="${isDark ? '#E0F2FE' : '#E2E8F0'}" stop-opacity="${isDark ? '0.24' : '0.18'}"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="bossWordClip${suffix}">
      <text ${wordmarkAttrs}>BOSS</text>
    </clipPath>
    <linearGradient id="horizon${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent2}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}" stop-opacity="${isDark ? '0.85' : '0.65'}"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="aura${suffix}" cx="78%" cy="22%" r="48%">
      <stop offset="0" stop-color="${accent}" stop-opacity="${isDark ? '0.12' : '0.08'}"/>
      <stop offset="0.55" stop-color="${accent2}" stop-opacity="${isDark ? '0.06' : '0.04'}"/>
      <stop offset="1" stop-color="${auraEnd}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="heroClip${suffix}"><rect x="0.6" y="0.6" width="758.8" height="196.8" rx="14"/></clipPath>
  </defs>

  <rect x="0.6" y="0.6" width="758.8" height="196.8" rx="14" fill="${bg}" stroke="${border}" stroke-width="1.2"/>

  <g clip-path="url(#heroClip${suffix})">
    <rect x="0" y="0" width="760" height="198" fill="url(#aura${suffix})"/>
    <g stroke="${gridStroke}" stroke-opacity="${isDark ? '0.045' : '0.055'}" stroke-width="1">
      <line x1="190" y1="0" x2="190" y2="198"/>
      <line x1="380" y1="0" x2="380" y2="198"/>
      <line x1="570" y1="0" x2="570" y2="198"/>
      <line x1="0" y1="66" x2="760" y2="66"/>
      <line x1="0" y1="132" x2="760" y2="132"/>
    </g>

    <path d="M 120 0 Q 380 42 640 0" fill="none" stroke="url(#horizon${suffix})" stroke-width="1.4"/>

    <g transform="translate(658, 76)" opacity="0.9">
      <line x1="-44" y1="0" x2="44" y2="0" stroke="${border}" stroke-opacity="0.55" stroke-width="0.9"/>
      <line x1="0" y1="-44" x2="0" y2="44" stroke="${border}" stroke-opacity="0.55" stroke-width="0.9"/>
      <circle cx="0" cy="0" r="38" fill="none" stroke="${border}" stroke-width="1"/>
      <circle cx="0" cy="0" r="26" fill="none" stroke="${accentSoft}" stroke-opacity="0.38" stroke-width="1" stroke-dasharray="4 4">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="28s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="14" fill="none" stroke="${accent}" stroke-opacity="0.72" stroke-width="1.2"/>
      <circle cx="0" cy="0" r="4.5" fill="${accent}" opacity="0.92">
        <animate attributeName="opacity" values="0.65;1;0.65" dur="3.6s" repeatCount="indefinite"/>
      </circle>
    </g>

    <g>
      <circle cx="44" cy="34" r="3" fill="${accent}">
        <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <text x="56" y="37.5" fill="${accentSoft}" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10.5" font-weight="600" letter-spacing="1.4">[ SYSTEM ONLINE // CAIRO, EGYPT · @IXBOSS ]</text>

      <text ${wordmarkAttrs} fill="${wordmarkFill}" fill-opacity="${isDark ? '0.88' : '1'}">BOSS</text>
      <g clip-path="url(#bossWordClip${suffix})" aria-hidden="true">
        <rect x="-40" y="34" width="60" height="72" fill="url(#specular${suffix})" transform="skewX(-24)">
          <animate attributeName="x" values="-40;-40;280;280" keyTimes="0;0.06;0.34;1" calcMode="spline" keySplines="0 0 1 1;0.23 1 0.32 1;0 0 1 1" dur="5s" repeatCount="indefinite"/>
        </rect>
      </g>
      <rect x="42" y="106" width="84" height="3" rx="1.5" fill="${accent}"/>
      <rect x="132" y="106" width="28" height="3" rx="1.5" fill="${accent2}"/>

      <text x="40" y="132" fill="${primaryText}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="${isDark ? '500' : '600'}">Full-Stack &amp; Systems Engineer · Hossam</text>
      <text x="40" y="152" fill="${mutedText}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="12.5" font-weight="400">${escapeXml(safeBio)}</text>

      <rect x="40" y="164" width="212" height="22" rx="6" fill="${surface}" stroke="${border}" stroke-width="1"/>
      <circle cx="52" cy="175" r="2.8" fill="${accent}"/>
      <text x="62" y="178.5" fill="${primaryText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="600">${escapeXml(host)} ↗</text>

      <rect x="262" y="164" width="248" height="22" rx="6" fill="${surface}" stroke="${border}" stroke-width="1"/>
      <circle cx="274" cy="175" r="2.8" fill="${accent2}"/>
      <text x="284" y="178.5" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="500">${escapeXml(statLine)}</text>
    </g>
  </g>
</svg>`;
}

export function renderBuildingNowSvg({ theme = 'dark', buildingNow } = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'D' : 'L';
  const bg = isDark ? '#05070B' : '#FFFFFF';
  const surface = isDark ? '#0B0F17' : '#F8FAFC';
  const border = isDark ? '#18273A' : '#CBD5E1';
  const accent = isDark ? '#00E5FF' : '#0284C7';
  const accent2 = isDark ? '#8B5CF6' : '#7C3AED';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#475569';

  const label = truncateText(
    buildingNow?.label || 'Sadaqa Jaria v2 & Cross-Platform Systems Tooling',
    54
  );
  const slug = buildingNow?.projectSlug || 'sadaqa-jaria';
  const badge = buildingNow?.badge || 'ACTIVE FOCUS';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 88" width="760" height="88" role="img" aria-label="${escapeXml(`Building Now — ${label}`)}">
  <defs>
    <clipPath id="bnClip${suffix}"><rect x="0.6" y="0.6" width="758.8" height="86.8" rx="14"/></clipPath>
    <linearGradient id="bnBeam${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect x="0.6" y="0.6" width="758.8" height="86.8" rx="14" fill="${bg}" stroke="${border}" stroke-width="1.2"/>

  <g clip-path="url(#bnClip${suffix})">
    <rect x="-150" y="0.8" width="150" height="1.5" fill="url(#bnBeam${suffix})">
      <animate attributeName="x" values="-150;760" dur="8s" repeatCount="indefinite"/>
    </rect>

    <circle cx="32" cy="27" r="4" fill="${accent}">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="45" y="30.5" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="700" letter-spacing="1.4">BUILDING NOW // ${escapeXml(badge)}</text>

    <text x="30" y="61" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="15.5" font-weight="700">${escapeXml(label)}</text>

    <rect x="572" y="28" width="160" height="32" rx="8" fill="${surface}" stroke="${accent}" stroke-opacity="0.45" stroke-width="1"/>
    <text x="652" y="48" text-anchor="middle" fill="${primaryText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="600">${escapeXml(truncateText(slug, 18))} ↗</text>
    <text x="732" y="20" text-anchor="end" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="9" font-weight="500">CASE STUDY</text>
  </g>
</svg>`;
}

export function renderPortfolioBadgeSvg({ theme = 'dark' } = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'D' : 'L';
  const bg = isDark ? '#05070B' : '#F8FAFC';
  const border = isDark ? '#00E5FF' : '#0284C7';
  const accent = isDark ? '#00E5FF' : '#0284C7';
  const mutedText = isDark ? '#94A3B8' : '#64748B';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 30" width="240" height="30" role="img" aria-label="Portfolio ixboss.vercel.app">
  <defs>
    <clipPath id="bPort${suffix}"><rect x="0.5" y="0.5" width="239" height="29" rx="8"/></clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="239" height="29" rx="8" fill="${bg}" stroke="${border}" stroke-opacity="${isDark ? '0.65' : '0.75'}" stroke-width="1"/>
  <g clip-path="url(#bPort${suffix})">
    <rect x="-60" y="0" width="42" height="30" fill="${accent}" opacity="0.10" transform="skewX(-20)">
      <animate attributeName="x" values="-60;300" dur="7s" begin="0s" repeatCount="indefinite"/>
    </rect>
    <g transform="translate(14, 7) scale(0.667)" fill="none" stroke="${accent}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5"/>
      <ellipse cx="12" cy="12" rx="4.2" ry="9.5"/>
      <line x1="2.8" y1="12" x2="21.2" y2="12"/>
    </g>
    <text x="38" y="19" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="600">Portfolio</text>
    <text x="104" y="19" fill="${primaryText}" font-family="'Inter', Arial, sans-serif" font-size="11.5" font-weight="700">${escapeXml(PORTFOLIO_DISPLAY)}</text>
  </g>
</svg>`;
}

export function renderLinkedinBadgeSvg({ theme = 'dark' } = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'D' : 'L';
  const bg = isDark ? '#05070B' : '#F8FAFC';
  const border = isDark ? '#18273A' : '#CBD5E1';
  const accent = isDark ? '#38BDF8' : '#0284C7';
  const mutedText = isDark ? '#94A3B8' : '#64748B';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 30" width="240" height="30" role="img" aria-label="LinkedIn Hossam Mohamed">
  <defs>
    <clipPath id="bLi${suffix}"><rect x="0.5" y="0.5" width="239" height="29" rx="8"/></clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="239" height="29" rx="8" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <g clip-path="url(#bLi${suffix})">
    <rect x="-60" y="0" width="42" height="30" fill="${accent}" opacity="0.08" transform="skewX(-20)">
      <animate attributeName="x" values="-60;300" dur="8s" begin="3s" repeatCount="indefinite"/>
    </rect>
    <g transform="translate(14, 7) scale(0.667)">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="${accent}"/>
    </g>
    <text x="38" y="19" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="500">LinkedIn</text>
    <text x="102" y="19" fill="${primaryText}" font-family="'Inter', Arial, sans-serif" font-size="11.5" font-weight="600">Hossam Mohamed</text>
  </g>
</svg>`;
}

export function renderStackSvg({ theme = 'dark' } = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'D' : 'L';
  const bg = isDark ? '#05070B' : '#F8FAFC';
  const surface = isDark ? '#0B0F17' : '#FFFFFF';
  const border = isDark ? '#18273A' : '#CBD5E1';
  const cardBorder = isDark ? '#18273A' : '#E2E8F0';
  const accent = isDark ? '#00E5FF' : '#0284C7';
  const accentMid = isDark ? '#38BDF8' : '#0369A1';
  const accent2 = isDark ? '#8B5CF6' : '#7C3AED';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#475569';

  const columns = [
    {
      x: 24,
      width: 170,
      kicker: '01 // FRONTEND',
      kickerColor: accent,
      title: 'Frontend & Motion',
      items: ['Next.js · React', 'TypeScript · Tailwind', 'Framer Motion · GSAP', 'Lenis · Three.js'],
    },
    {
      x: 204,
      width: 170,
      kicker: '02 // SYSTEMS',
      kickerColor: accentMid,
      title: 'Systems & Native',
      items: ['Swift · IOKit · Kext', 'ACPI / EC0.SFTC', 'Kotlin · Android', 'LAN TLS · USB Bridge'],
    },
    {
      x: 384,
      width: 170,
      kicker: '03 // MOBILE',
      kickerColor: accent2,
      title: 'Mobile & Media',
      items: ['Flutter · Dart', 'Media Optimization', 'Ed25519 Licensing', 'Capacitor · Liquid UI'],
    },
    {
      x: 564,
      width: 172,
      kicker: '04 // PWA & CI',
      kickerColor: accent,
      title: 'PWA & DevOps',
      items: ['Service Workers', 'Offline-First Core', 'GitHub Actions CI/CD', 'Supabase · WebGL'],
    },
  ];

  const colMarkup = columns
    .map(
      (col) => `    <g transform="translate(${col.x}, 20)">
      <rect x="0" y="0" width="${col.width}" height="132" rx="10" fill="${surface}" stroke="${cardBorder}" stroke-width="1"/>
      <text x="14" y="22" fill="${col.kickerColor}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="9.5" font-weight="600" letter-spacing="1">${escapeXml(col.kicker)}</text>
      <text x="14" y="42" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="13.5" font-weight="700">${escapeXml(col.title)}</text>
      <text x="14" y="64" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5">${escapeXml(col.items[0])}</text>
      <text x="14" y="82" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5">${escapeXml(col.items[1])}</text>
      <text x="14" y="100" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5">${escapeXml(col.items[2])}</text>
      <text x="14" y="118" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5">${escapeXml(col.items[3])}</text>
    </g>`
    )
    .join('\n\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 172" width="760" height="172" role="img" aria-label="Tech Constellation — Frontend and Motion, Systems and Native, Mobile and Media, Backend PWA and DevOps">
  <defs>
    <linearGradient id="stackBeam${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="stackClip${suffix}"><rect x="0.6" y="0.6" width="758.8" height="170.8" rx="14"/></clipPath>
  </defs>

  <rect x="0.6" y="0.6" width="758.8" height="170.8" rx="14" fill="${bg}" stroke="${border}" stroke-width="1.2"/>

  <g clip-path="url(#stackClip${suffix})">
    <rect x="-160" y="0.8" width="160" height="1.5" fill="url(#stackBeam${suffix})">
      <animate attributeName="x" values="-160;760" dur="10s" repeatCount="indefinite"/>
    </rect>

${colMarkup}
  </g>
</svg>`;
}

export function renderEsportsSvg({ theme = 'dark' } = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'D' : 'L';
  const bg = isDark ? '#05070B' : '#F8FAFC';
  const surface = isDark ? '#0B0F17' : '#FFFFFF';
  const border = isDark ? '#18273A' : '#CBD5E1';
  const rowBorder = isDark ? '#18273A' : '#E2E8F0';
  const accent = isDark ? '#00E5FF' : '#0284C7';
  const accentMid = isDark ? '#38BDF8' : '#0369A1';
  const accent2 = isDark ? '#8B5CF6' : '#7C3AED';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#475569';
  const secondaryText = isDark ? '#CBD5E1' : '#334155';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 136" width="760" height="136" role="img" aria-label="Verified Esports Career — Boss (Hossam Mohamed Abdo), PMNC Egypt 2026 Spring Champion">
  <defs>
    <linearGradient id="espBeam${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent2}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="espClip${suffix}"><rect x="0.6" y="0.6" width="758.8" height="134.8" rx="14"/></clipPath>
  </defs>

  <rect x="0.6" y="0.6" width="758.8" height="134.8" rx="14" fill="${bg}" stroke="${border}" stroke-width="1.2"/>

  <g clip-path="url(#espClip${suffix})">
    <rect x="-150" y="0.8" width="150" height="1.5" fill="url(#espBeam${suffix})">
      <animate attributeName="x" values="-150;760" dur="10s" begin="1s" repeatCount="indefinite"/>
    </rect>

    <text x="24" y="36" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="18" font-weight="700">Boss</text>
    <text x="74" y="36" fill="${mutedText}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="400">(Hossam Mohamed Abdo) · Competitive PUBG Mobile</text>
    <text x="736" y="35" text-anchor="end" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="9.5" font-weight="600" letter-spacing="1">VERIFIED ON LIQUIPEDIA ↗</text>

    <g transform="translate(24, 52)">
      <rect x="0" y="0" width="230" height="32" rx="8" fill="${surface}" stroke="${accent}" stroke-opacity="${isDark ? '0.45' : '0.5'}" stroke-width="1"/>
      <text x="12" y="20" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="700">1ST</text>
      <text x="44" y="20" fill="${primaryText}" font-family="Inter, Arial, sans-serif" font-size="11.5" font-weight="${isDark ? '500' : '600'}">PMNC Egypt 2026 Spring</text>

      <rect x="241" y="0" width="230" height="32" rx="8" fill="${surface}" stroke="${accentMid}" stroke-opacity="0.35" stroke-width="1"/>
      <text x="253" y="20" fill="${accentMid}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="700">2ND</text>
      <text x="285" y="20" fill="${primaryText}" font-family="Inter, Arial, sans-serif" font-size="11.5" font-weight="${isDark ? '500' : '600'}">PMNC Egypt Fall 2025</text>

      <rect x="482" y="0" width="230" height="32" rx="8" fill="${surface}" stroke="${accent2}" stroke-opacity="0.4" stroke-width="1"/>
      <text x="494" y="20" fill="${accent2}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="700">3RD</text>
      <text x="526" y="20" fill="${primaryText}" font-family="Inter, Arial, sans-serif" font-size="11.5" font-weight="${isDark ? '500' : '600'}">PMNC Egypt Spring 2025</text>
    </g>

    <g transform="translate(24, 92)">
      <rect x="0" y="0" width="350" height="28" rx="8" fill="${surface}" stroke="${rowBorder}" stroke-width="1"/>
      <text x="12" y="18" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10" font-weight="600">14TH · A-TIER</text>
      <text x="112" y="18" fill="${secondaryText}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="400">PMGO 2026 Season 1 - MENA Finals</text>

      <rect x="362" y="0" width="350" height="28" rx="8" fill="${surface}" stroke="${rowBorder}" stroke-width="1"/>
      <text x="374" y="18" fill="${mutedText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10" font-weight="600">14TH · A-TIER</text>
      <text x="474" y="18" fill="${secondaryText}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="400">PMSL - MENA Fall 2025</text>
    </g>
  </g>
</svg>`;
}

export function renderProjectCardSvg({ theme = 'dark', project } = {}) {
  const isDark = theme === 'dark';
  const suffix = isDark ? 'D' : 'L';
  const idBase = `p${sanitizeId(project.indexLabel || '01')}${sanitizeId(project.slug)}${suffix}`;

  const bg = isDark ? '#05070B' : '#FFFFFF';
  const surface = isDark ? '#0B0F17' : '#F1F5F9';
  const border = isDark ? '#18273A' : '#CBD5E1';
  const isPurple = project.visibility === 'private' || project.slug === 'universal-harness';
  const accent = isDark
    ? isPurple
      ? '#8B5CF6'
      : '#00E5FF'
    : isPurple
      ? '#7C3AED'
      : '#0284C7';
  const accentAlt = isDark
    ? isPurple
      ? '#00E5FF'
      : '#8B5CF6'
    : isPurple
      ? '#0284C7'
      : '#7C3AED';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#475569';

  const indexLabel = project.indexLabel || '01';
  const kicker = `${indexLabel} // ${truncateText(String(project.category || 'PROJECT').toUpperCase(), 44)}`;
  const title = truncateText(project.title || project.slug, 34);
  const subtitle = truncateText(project.subtitle || project.description || '', 72);
  const pill = truncateText(project.pillLabel || formatStatusBadge(project), 24);
  const delaySec = ((Number.parseInt(indexLabel, 10) || 1) - 1) * 1.5;

  const hasArabicIslami = title.includes('إسلامي');
  const titleRemainder = hasArabicIslami ? title.replace('إسلامي', '').trim() : '';
  const titleMarkup = hasArabicIslami
    ? [
        `    <g transform="translate(36, 55.5)" aria-hidden="true">`,
        `      <path d="${ARABIC_ISLAMI_PATH}" fill="${primaryText}"/>`,
        `    </g>`,
        titleRemainder
          ? `    <text x="${(36 + ARABIC_ISLAMI_WIDTH + 9).toFixed(1)}" y="57" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.3">${escapeXml(titleRemainder)}</text>`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    : `    <text x="36" y="57" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.3">${escapeXml(title)}</text>`;
  const underlineY = hasArabicIslami ? '68' : '66';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 112" width="760" height="112" role="img" aria-label="${escapeXml(`${indexLabel} ${project.title || project.slug} — ${subtitle}`)}">
  <defs>
    <clipPath id="${idBase}Clip"><rect x="0.5" y="0.5" width="759" height="111" rx="14"/></clipPath>
    <linearGradient id="${idBase}Grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accentAlt}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="759" height="111" rx="14" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <g clip-path="url(#${idBase}Clip)">
    <rect x="-140" y="0.75" width="140" height="1.5" fill="url(#${idBase}Grad)">
      <animate attributeName="x" values="-140;760" dur="9s" begin="${delaySec}s" repeatCount="indefinite"/>
    </rect>
    <text x="36" y="30" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10" font-weight="600" letter-spacing="1.2">${escapeXml(kicker)}</text>
${titleMarkup}
    <rect x="36" y="${underlineY}" width="44" height="2.5" rx="1.25" fill="${accent}">
      <animate attributeName="width" values="44;72;44" dur="7s" begin="${delaySec}s" repeatCount="indefinite"/>
    </rect>
    <text x="36" y="92" fill="${mutedText}" font-family="Inter, Arial, sans-serif" font-size="12.5" font-weight="400">${escapeXml(subtitle)}</text>
    <rect x="528" y="42" width="196" height="28" rx="8" fill="${surface}" stroke="${border}" stroke-width="1"/>
    <circle cx="544" cy="56" r="3.2" fill="${accent}"/>
    <text x="556" y="60" fill="${primaryText}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="500">${escapeXml(pill)}</text>
  </g>
</svg>`;
}

export function renderBuildingSection(buildingNow) {
  const url = buildingNow?.url || `${PORTFOLIO_URL}/?project=sadaqa-jaria`;
  const alt = escapeXml(`Building Now — ${buildingNow?.label || 'Active Focus'}`);
  return [
    '<p align="center">',
    `  <a href="${url}">`,
    '    <picture>',
    '      <source media="(prefers-color-scheme: dark)" srcset="assets/building-now.svg">',
    '      <source media="(prefers-color-scheme: light)" srcset="assets/building-now-light.svg">',
    `      <img src="assets/building-now.svg" alt="${alt}" width="760">`,
    '    </picture>',
    '  </a>',
    '</p>',
  ].join('\n');
}

export function renderProjectsSection(projects) {
  return projects
    .map((project) => {
      const darkSrc = `assets/projects/${project.slug}.svg`;
      const lightSrc = `assets/projects/${project.slug}-light.svg`;
      const alt = escapeXml(
        `${project.indexLabel} ${project.title} — ${project.subtitle || project.category}`
      );
      const primaryLink = project.portfolioUrl;
      const techSummary = project.tech.slice(0, 3).map((t) => `\`${t}\``).join(' · ');

      const metaLinks = [];
      metaLinks.push(`[Case Study ↗](${project.portfolioUrl})`);
      if (project.live) {
        metaLinks.push(`[Live App ↗](${project.live})`);
      }
      if (project.repoUrl) {
        metaLinks.push(`[GitHub Repo ↗](${project.repoUrl})`);
      } else {
        metaLinks.push(`**Status:** Private Product Build`);
      }
      if (project.showStars) {
        metaLinks.push(`**★ ${project.stars} Stars**`);
      } else if (project.visibility === 'public') {
        metaLinks.push(`**Status:** Active`);
      }

      return [
        '<p align="center">',
        `  <a href="${primaryLink}">`,
        '    <picture>',
        `      <source media="(prefers-color-scheme: dark)" srcset="${darkSrc}">`,
        `      <source media="(prefers-color-scheme: light)" srcset="${lightSrc}">`,
        `      <img src="${darkSrc}" alt="${alt}" width="760">`,
        '    </picture>',
        '  </a>',
        '</p>',
        '',
        `> <sub>${escapeXml(project.description)}</sub>`,
        '>',
        `> <sub>${techSummary} — ${metaLinks.join(' · ')}</sub>`,
      ].join('\n');
    })
    .join('\n\n');
}

function replaceMarkerBlock(content, startMarker, endMarker, replacement) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Missing README markers: ${startMarker} .. ${endMarker}`);
  }
  const before = content.slice(0, startIdx + startMarker.length);
  const after = content.slice(endIdx);
  return `${before}\n${replacement}\n${after}`;
}

export function updateReadmeContent(readmeContent, { buildingNow, projects }) {
  let updated = replaceMarkerBlock(
    readmeContent,
    '<!-- AUTO:BUILDING:START -->',
    '<!-- AUTO:BUILDING:END -->',
    renderBuildingSection(buildingNow)
  );
  updated = replaceMarkerBlock(
    updated,
    '<!-- AUTO:PROJECTS:START -->',
    '<!-- AUTO:PROJECTS:END -->',
    renderProjectsSection(projects)
  );
  return updated;
}

export async function runUpdate({
  repoRoot = REPO_ROOT,
  readmePath = DEFAULT_README_PATH,
  fallbackPath = DEFAULT_FALLBACK_PATH,
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN || '',
} = {}) {
  const { manifest, source: manifestSource } = await loadManifest({
    fetchImpl,
    fallbackPath,
  });

  const githubData = await fetchGitHubData({ fetchImpl, token });
  const projects = resolveProjects(manifest, githubData.repos);
  const buildingNow = resolveBuildingNow(manifest, githubData.repos);
  const stats = computeGitHubStats(githubData, projects);

  const assetsDir = path.join(repoRoot, 'assets');
  const badgesDir = path.join(assetsDir, 'badges');
  const projectsDir = path.join(assetsDir, 'projects');

  await Promise.all([
    fs.mkdir(assetsDir, { recursive: true }),
    fs.mkdir(badgesDir, { recursive: true }),
    fs.mkdir(projectsDir, { recursive: true }),
  ]);

  const filesToWrite = [
    [
      path.join(assetsDir, 'boss.svg'),
      renderHeroSvg({ theme: 'dark', bio: VERBATIM_BIO, stats, portfolioUrl: PORTFOLIO_URL }),
    ],
    [
      path.join(assetsDir, 'boss-light.svg'),
      renderHeroSvg({ theme: 'light', bio: VERBATIM_BIO, stats, portfolioUrl: PORTFOLIO_URL }),
    ],
    [
      path.join(assetsDir, 'building-now.svg'),
      renderBuildingNowSvg({ theme: 'dark', buildingNow }),
    ],
    [
      path.join(assetsDir, 'building-now-light.svg'),
      renderBuildingNowSvg({ theme: 'light', buildingNow }),
    ],
    [path.join(assetsDir, 'stack.svg'), renderStackSvg({ theme: 'dark' })],
    [path.join(assetsDir, 'stack-light.svg'), renderStackSvg({ theme: 'light' })],
    [path.join(assetsDir, 'esports.svg'), renderEsportsSvg({ theme: 'dark' })],
    [path.join(assetsDir, 'esports-light.svg'), renderEsportsSvg({ theme: 'light' })],
    [path.join(badgesDir, 'portfolio.svg'), renderPortfolioBadgeSvg({ theme: 'dark' })],
    [path.join(badgesDir, 'portfolio-light.svg'), renderPortfolioBadgeSvg({ theme: 'light' })],
    [path.join(badgesDir, 'linkedin.svg'), renderLinkedinBadgeSvg({ theme: 'dark' })],
    [path.join(badgesDir, 'linkedin-light.svg'), renderLinkedinBadgeSvg({ theme: 'light' })],
    ...projects.flatMap((project) => [
      [
        path.join(projectsDir, `${project.slug}.svg`),
        renderProjectCardSvg({ theme: 'dark', project }),
      ],
      [
        path.join(projectsDir, `${project.slug}-light.svg`),
        renderProjectCardSvg({ theme: 'light', project }),
      ],
    ]),
  ];

  await Promise.all(filesToWrite.map(([filePath, content]) => fs.writeFile(filePath, content, 'utf8')));

  const currentReadme = await fs.readFile(readmePath, 'utf8');
  const nextReadme = updateReadmeContent(currentReadme, { buildingNow, projects });
  await fs.writeFile(readmePath, nextReadme, 'utf8');

  return {
    manifestSource,
    githubLive: githubData.live,
    rateLimited: githubData.rateLimited,
    githubError: githubData.error,
    projectSlugs: projects.map((p) => p.slug),
    buildingNow,
    stats,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runUpdate()
    .then((summary) => {
      console.log(
        JSON.stringify(
          {
            manifestSource: summary.manifestSource,
            githubLive: summary.githubLive,
            rateLimited: summary.rateLimited,
            githubError: summary.githubError,
            projects: summary.projectSlugs,
            buildingNow: summary.buildingNow,
            stats: summary.stats,
          },
          null,
          2
        )
      );
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
