import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GITHUB_USERNAME = 'ixboss';
export const PORTFOLIO_URL = 'https://ixboss.vercel.app';
export const PORTFOLIO_DISPLAY = 'ixboss.vercel.app';
export const MANIFEST_URL = 'https://ixboss.vercel.app/api/projects';
export const VERBATIM_BIO =
  'Just some nerd who loves to play with everything he sees.';
export const STAR_BADGE_THRESHOLD = 5;
export const FETCH_TIMEOUT_MS = 8000;

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
    const primaryTech = techList[0].replace(/^Vanilla\s+/i, '');

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
  const titleBase = isDark ? '#F8FAFC' : '#05070B';
  const primaryText = isDark ? '#F8FAFC' : '#0F172A';
  const mutedText = isDark ? '#94A3B8' : '#475569';
  const auraEnd = isDark ? '#05070B' : '#FFFFFF';

  const safeBio = VERBATIM_BIO;
  const host = String(portfolioUrl).replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const statLine = stats?.live
    ? `${stats.publicRepos} Public Repos · ★ ${stats.totalStars} Stars`
    : `${stats?.projectCount ?? 4} Featured Projects · Cairo, EG`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 198" width="760" height="198" role="img" aria-label="${escapeXml(`BOSS (@ixboss) — ${safeBio}`)}">
  <defs>
    <linearGradient id="shine${suffix}" x1="-0.4" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${titleBase}"/>
      <stop offset="0.45" stop-color="${accent}"/>
      <stop offset="0.55" stop-color="${accent2}"/>
      <stop offset="1" stop-color="${titleBase}"/>
      <animate attributeName="x1" values="-0.4;1" dur="6s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="0;1.4" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="horizon${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent2}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}" stop-opacity="${isDark ? '0.85' : '0.65'}"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="aura${suffix}" cx="76%" cy="22%" r="48%">
      <stop offset="0" stop-color="${accent}" stop-opacity="${isDark ? '0.16' : '0.10'}"/>
      <stop offset="0.55" stop-color="${accent2}" stop-opacity="${isDark ? '0.08' : '0.06'}"/>
      <stop offset="1" stop-color="${auraEnd}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="heroClip${suffix}"><rect x="0.6" y="0.6" width="758.8" height="196.8" rx="14"/></clipPath>
  </defs>

  <rect x="0.6" y="0.6" width="758.8" height="196.8" rx="14" fill="${bg}" stroke="${border}" stroke-width="1.2"/>

  <g clip-path="url(#heroClip${suffix})">
    <rect x="0" y="0" width="760" height="198" fill="url(#aura${suffix})"/>
    <g stroke="${gridStroke}" stroke-opacity="${isDark ? '0.05' : '0.06'}" stroke-width="1">
      <line x1="190" y1="0" x2="190" y2="198"/>
      <line x1="380" y1="0" x2="380" y2="198"/>
      <line x1="570" y1="0" x2="570" y2="198"/>
      <line x1="0" y1="66" x2="760" y2="66"/>
      <line x1="0" y1="132" x2="760" y2="132"/>
    </g>

    <path d="M 120 0 Q 380 42 640 0" fill="none" stroke="url(#horizon${suffix})" stroke-width="1.4"/>

    <g>
      <circle cx="150" cy="155" r="1.4" fill="${accent}" opacity="0.16">
        <animate attributeName="cy" values="184;18" dur="22s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.22;0" dur="22s" repeatCount="indefinite"/>
      </circle>
      <circle cx="430" cy="34" r="1.2" fill="${accent2}" opacity="0.15">
        <animate attributeName="cy" values="188;22" dur="28s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.18;0" dur="28s" repeatCount="indefinite"/>
      </circle>
      <circle cx="600" cy="130" r="1.6" fill="${accent}" opacity="0.15">
        <animate attributeName="cy" values="184;20" dur="25s" begin="5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.20;0" dur="25s" begin="5s" repeatCount="indefinite"/>
      </circle>
    </g>

    <g transform="translate(658, 76)" opacity="0.88">
      <circle cx="0" cy="0" r="38" fill="none" stroke="${border}" stroke-width="1"/>
      <circle cx="0" cy="0" r="26" fill="none" stroke="${accentSoft}" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="4 4">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="28s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="15" fill="none" stroke="${accent}" stroke-opacity="0.7" stroke-width="1.2"/>
      <circle cx="0" cy="0" r="5.5" fill="${accent}" opacity="0.9">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3.6s" repeatCount="indefinite"/>
      </circle>
    </g>

    <g>
      <circle cx="44" cy="34" r="3" fill="${accent}">
        <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <text x="56" y="37.5" fill="${accentSoft}" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10.5" font-weight="600" letter-spacing="1.4">[ SYSTEM ONLINE // CAIRO, EGYPT · @IXBOSS ]</text>

      <text x="40" y="94" fill="url(#shine${suffix})" text-rendering="geometricPrecision" font-family="'Space Grotesk', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="800" letter-spacing="-1.5">BOSS</text>
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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 156" width="760" height="156" role="img" aria-label="Beyond Code // Verified Esports Career — Boss (Hossam Mohamed Abdo), PMNC Egypt 2026 Spring Champion">
  <defs>
    <linearGradient id="espBeam${suffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent2}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="espClip${suffix}"><rect x="0.6" y="0.6" width="758.8" height="154.8" rx="14"/></clipPath>
  </defs>

  <rect x="0.6" y="0.6" width="758.8" height="154.8" rx="14" fill="${bg}" stroke="${border}" stroke-width="1.2"/>

  <g clip-path="url(#espClip${suffix})">
    <rect x="-150" y="0.8" width="150" height="1.5" fill="url(#espBeam${suffix})">
      <animate attributeName="x" values="-150;760" dur="10s" begin="1s" repeatCount="indefinite"/>
    </rect>

    <text x="24" y="28" fill="${accentMid}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="10.5" font-weight="600" letter-spacing="1.4">[ 03 — BEYOND CODE // ESPORTS ]</text>
    <text x="736" y="28" text-anchor="end" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="9.5" font-weight="600" letter-spacing="1">VERIFIED ON LIQUIPEDIA ↗</text>

    <text x="24" y="56" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="18" font-weight="700">Boss</text>
    <text x="74" y="56" fill="${mutedText}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="400">(Hossam Mohamed Abdo) · Competitive PUBG Mobile · Liquipedia Verified</text>

    <g transform="translate(24, 74)">
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

    <g transform="translate(24, 114)">
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
    <text x="36" y="57" fill="${primaryText}" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.3">${escapeXml(title)}</text>
    <rect x="36" y="66" width="44" height="2.5" rx="1.25" fill="${accent}">
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
    [path.join(assetsDir, 'esports.svg'), renderEsportsSvg({ theme: 'dark' })],
    [path.join(assetsDir, 'esports-light.svg'), renderEsportsSvg({ theme: 'light' })],
    [path.join(badgesDir, 'portfolio.svg'), renderPortfolioBadgeSvg({ theme: 'dark' })],
    [path.join(badgesDir, 'portfolio-light.svg'), renderPortfolioBadgeSvg({ theme: 'light' })],
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
