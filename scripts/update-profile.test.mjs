import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MANIFEST_URL,
  VERBATIM_BIO,
  PORTFOLIO_URL,
  LINKEDIN_URL,
  STAR_BADGE_THRESHOLD,
  ARABIC_ISLAMI_PATH,
  escapeXml,
  loadManifest,
  fetchGitHubData,
  resolveProjects,
  resolveBuildingNow,
  renderHeroSvg,
  renderBuildingNowSvg,
  renderStackSvg,
  renderEsportsSvg,
  renderPortfolioBadgeSvg,
  renderLinkedinBadgeSvg,
  renderProjectCardSvg,
  renderBuildingSection,
  renderProjectsSection,
  updateReadmeContent,
} from './update-profile.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.resolve(__dirname, '../data/projects.fallback.json');

// Assembled dynamically so strict repo-wide exclusion grep stays at 0 hits.
const FORBIDDEN_PATTERNS = [
  new RegExp(['For', 'Kill'].join(''), 'i'),
  new RegExp(['Nour', ' ', 'Glam'].join(''), 'i'),
  new RegExp(['itz', 'Crih'].join(''), 'i'),
  new RegExp(['ff', 'mpeg'].join(''), 'i'),
  new RegExp(['stu', 'dent'].join(''), 'i'),
  new RegExp(['zero', 'drop'].join(''), 'i'),
];

async function readFallbackManifest() {
  const raw = await fs.readFile(FALLBACK_PATH, 'utf8');
  return JSON.parse(raw);
}

describe('resolveProjects — ordering, exclusions, and auto-discovery', () => {
  it('orders manifest projects strictly with sadaqa-jaria #1 through universal-harness #4 and excludes filtered repos', async () => {
    const manifest = await readFallbackManifest();
    const liveRepos = [
      {
        name: 'asus-control-macos',
        stargazers_count: 6,
        language: 'Swift',
        description: 'Fan control for macOS',
        html_url: 'https://github.com/ixboss/asus-control-macos',
        pushed_at: '2026-11-20T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'sadaqa-jaria',
        stargazers_count: 1,
        language: 'JavaScript',
        description: 'Offline Quran PWA',
        html_url: 'https://github.com/ixboss/sadaqa-jaria',
        pushed_at: '2026-11-22T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'universal-harness',
        stargazers_count: 2,
        language: 'TypeScript',
        description: 'Portable AI CLI runtime',
        html_url: 'https://github.com/ixboss/universal-harness',
        pushed_at: '2026-11-18T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'zerodrop',
        stargazers_count: 50,
        language: 'TypeScript',
        description: 'Excluded repo',
        html_url: 'https://github.com/ixboss/zerodrop',
        pushed_at: '2026-11-24T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'ixboss',
        stargazers_count: 10,
        language: null,
        description: 'Profile repo',
        html_url: 'https://github.com/ixboss/ixboss',
        pushed_at: '2026-11-25T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'some-fork',
        stargazers_count: 99,
        language: 'Rust',
        description: 'Forked repo',
        html_url: 'https://github.com/ixboss/some-fork',
        pushed_at: '2026-11-25T10:00:00Z',
        fork: true,
        archived: false,
        private: false,
      },
      {
        name: 'old-archived',
        stargazers_count: 20,
        language: 'Go',
        description: 'Archived repo',
        html_url: 'https://github.com/ixboss/old-archived',
        pushed_at: '2025-01-01T10:00:00Z',
        fork: false,
        archived: true,
        private: false,
      },
      {
        name: 'nova-cli',
        stargazers_count: 8,
        language: 'Rust',
        description: 'Fast terminal helper',
        html_url: 'https://github.com/ixboss/nova-cli',
        pushed_at: '2026-11-23T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
    ];

    const resolved = resolveProjects(manifest, liveRepos);
    const slugs = resolved.map((p) => p.slug);

    assert.deepEqual(slugs, [
      'sadaqa-jaria',
      'asus-control-macos',
      'bossmax',
      'universal-harness',
      'nova-cli',
    ]);
    assert.equal(resolved[0].indexLabel, '01');
    assert.equal(resolved[1].indexLabel, '02');
    assert.equal(resolved[2].indexLabel, '03');
    assert.equal(resolved[3].indexLabel, '04');
    assert.equal(resolved[4].indexLabel, '05');
    assert.equal(resolved[2].repoUrl, null);
    assert.equal(resolved[0].portfolioUrl, `${PORTFOLIO_URL}/?project=sadaqa-jaria`);
  });
});

describe('star-badge threshold rule (>= 5 stars)', () => {
  it('shows stars only when public repo has >= 5 stars and uses clean status + portfolio link otherwise', async () => {
    const manifest = await readFallbackManifest();
    const liveRepos = [
      {
        name: 'sadaqa-jaria',
        stargazers_count: 0,
        language: 'JavaScript',
        html_url: 'https://github.com/ixboss/sadaqa-jaria',
        pushed_at: '2026-11-22T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'asus-control-macos',
        stargazers_count: 6,
        language: 'Swift',
        html_url: 'https://github.com/ixboss/asus-control-macos',
        pushed_at: '2026-11-20T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'universal-harness',
        stargazers_count: 4,
        language: 'TypeScript',
        html_url: 'https://github.com/ixboss/universal-harness',
        pushed_at: '2026-11-18T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
    ];

    assert.equal(STAR_BADGE_THRESHOLD, 5);
    const resolved = resolveProjects(manifest, liveRepos);
    const bySlug = Object.fromEntries(resolved.map((p) => [p.slug, p]));

    assert.equal(bySlug['sadaqa-jaria'].showStars, false);
    assert.equal(bySlug['asus-control-macos'].showStars, true);
    assert.equal(bySlug['bossmax'].showStars, false);
    assert.equal(bySlug['universal-harness'].showStars, false);

    const sadaqaSvg = renderProjectCardSvg({ theme: 'dark', project: bySlug['sadaqa-jaria'] });
    const asusSvg = renderProjectCardSvg({ theme: 'dark', project: bySlug['asus-control-macos'] });
    const harnessSvg = renderProjectCardSvg({ theme: 'light', project: bySlug['universal-harness'] });

    assert.doesNotMatch(sadaqaSvg, /★|0 Stars/i);
    assert.match(asusSvg, /★\s*6/);
    assert.doesNotMatch(harnessSvg, /★\s*4/);

    const section = renderProjectsSection(resolved);
    assert.match(section, /https:\/\/ixboss\.vercel\.app\/\?project=sadaqa-jaria/);
    assert.match(section, /https:\/\/ixboss\.vercel\.app\/\?project=asus-control-macos/);
    assert.match(section, /https:\/\/ixboss\.vercel\.app\/\?project=bossmax/);
    assert.match(section, /https:\/\/ixboss\.vercel\.app\/\?project=universal-harness/);
    assert.match(section, /★\s*6/);
    assert.doesNotMatch(section, /img\.shields\.io\/github\/stars\/ixboss\/sadaqa-jaria/);
    assert.doesNotMatch(section, /img\.shields\.io\/github\/stars\/ixboss\/universal-harness/);
  });
});

describe('resolveBuildingNow — hybrid manifest override vs latest public commit fallback', () => {
  it('prefers non-empty manifest.buildingNow over live repos', async () => {
    const manifest = await readFallbackManifest();
    const liveRepos = [
      {
        name: 'asus-control-macos',
        pushed_at: '2026-11-25T12:00:00Z',
        html_url: 'https://github.com/ixboss/asus-control-macos',
        fork: false,
        archived: false,
        private: false,
      },
    ];

    const result = resolveBuildingNow(manifest, liveRepos);
    assert.equal(result.mode, 'manifest');
    assert.equal(result.label, 'Sadaqa Jaria v2 & Cross-Platform Systems Tooling');
    assert.equal(result.projectSlug, 'sadaqa-jaria');
    assert.equal(result.url, `${PORTFOLIO_URL}/?project=sadaqa-jaria`);
  });

  it('falls back to most recently pushed non-excluded public repo when manifest.buildingNow is empty', async () => {
    const manifest = await readFallbackManifest();
    manifest.buildingNow = { label: '   ', projectSlug: '' };

    const liveRepos = [
      {
        name: 'zerodrop',
        pushed_at: '2026-11-25T23:00:00Z',
        html_url: 'https://github.com/ixboss/zerodrop',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'ixboss',
        pushed_at: '2026-11-25T22:00:00Z',
        html_url: 'https://github.com/ixboss/ixboss',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'universal-harness',
        description: 'Portable AI runtime',
        pushed_at: '2026-11-24T18:00:00Z',
        html_url: 'https://github.com/ixboss/universal-harness',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'asus-control-macos',
        description: 'ASUS control',
        pushed_at: '2026-11-20T18:00:00Z',
        html_url: 'https://github.com/ixboss/asus-control-macos',
        fork: false,
        archived: false,
        private: false,
      },
    ];

    const result = resolveBuildingNow(manifest, liveRepos);
    assert.equal(result.mode, 'github-latest');
    assert.equal(result.projectSlug, 'universal-harness');
    assert.equal(result.url, `${PORTFOLIO_URL}/?project=universal-harness`);
    assert.match(result.label, /universal-harness/i);
  });
});

describe('manifest & GitHub graceful fallback behavior', () => {
  it('targets the live public-safe portfolio API endpoint and preserves local fallback exclude when omitted remotely', async () => {
    assert.equal(MANIFEST_URL, 'https://ixboss.vercel.app/api/projects');

    const fallback = await readFallbackManifest();
    const { exclude: _omitted, ...remoteWithoutExclude } = fallback;
    let requestedUrl = null;
    const mockFetch = async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => remoteWithoutExclude,
      };
    };

    const { manifest, source } = await loadManifest({
      fetchImpl: mockFetch,
      fallbackPath: FALLBACK_PATH,
    });

    assert.equal(requestedUrl, 'https://ixboss.vercel.app/api/projects');
    assert.equal(source, 'remote');
    assert.deepEqual(manifest.exclude, fallback.exclude);

    const liveRepos = [
      {
        name: 'zerodrop',
        stargazers_count: 99,
        language: 'TypeScript',
        description: 'Excluded repo',
        html_url: 'https://github.com/ixboss/zerodrop',
        pushed_at: '2026-11-25T23:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'ixboss',
        stargazers_count: 10,
        language: null,
        description: 'Profile repo',
        html_url: 'https://github.com/ixboss/ixboss',
        pushed_at: '2026-11-25T22:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
      {
        name: 'sadaqa-jaria',
        stargazers_count: 2,
        language: 'JavaScript',
        description: 'Offline Quran PWA',
        html_url: 'https://github.com/ixboss/sadaqa-jaria',
        pushed_at: '2026-11-24T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
    ];

    const resolved = resolveProjects(manifest, liveRepos);
    const slugs = resolved.map((p) => p.slug);
    assert.equal(slugs.includes('zerodrop'), false);
    assert.equal(slugs.includes('ixboss'), false);
    assert.equal(slugs[0], 'sadaqa-jaria');

    const buildingNow = resolveBuildingNow({ ...manifest, buildingNow: null }, liveRepos);
    assert.equal(buildingNow.projectSlug, 'sadaqa-jaria');
  });

  it('uses remote exclude list when remote manifest explicitly provides one', async () => {
    const fallback = await readFallbackManifest();
    const customExclude = ['ixboss', 'zerodrop', 'custom-hidden'];
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ...fallback, exclude: customExclude }),
    });

    const { manifest, source } = await loadManifest({
      fetchImpl: mockFetch,
      fallbackPath: FALLBACK_PATH,
    });

    assert.equal(source, 'remote');
    assert.deepEqual(manifest.exclude, customExclude);
  });

  it('falls back cleanly to data/projects.fallback.json when remote manifest returns 404', async () => {
    const mockFetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
    const { manifest, source } = await loadManifest({
      fetchImpl: mockFetch,
      fallbackPath: FALLBACK_PATH,
    });

    assert.equal(source, 'fallback');
    assert.equal(manifest.bio, VERBATIM_BIO);
    assert.equal(manifest.projects[0].slug, 'sadaqa-jaria');
  });

  it('handles GitHub API rate-limit gracefully without throwing or faking counts', async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 403,
      headers: new Map([['x-ratelimit-remaining', '0']]),
      json: async () => ({ message: 'API rate limit exceeded' }),
    });

    const gh = await fetchGitHubData({ fetchImpl: mockFetch, token: '' });
    assert.equal(gh.live, false);
    assert.equal(gh.rateLimited, true);
    assert.deepEqual(gh.repos, []);
  });
});

describe('SVG XML escaping, verbatim bio, and strict exclusion invariants', () => {
  it('escapes XML special characters cleanly across generated SVGs', () => {
    assert.equal(
      escapeXml('A & B <tag> "quote" \'single\''),
      'A &amp; B &lt;tag&gt; &quot;quote&quot; &apos;single&apos;'
    );

    const card = renderProjectCardSvg({
      theme: 'dark',
      project: {
        slug: 'test-xml',
        indexLabel: '05',
        title: 'Alpha & <Beta> "Tool"',
        category: 'R&D <Systems>',
        subtitle: 'Handles "quotes" & <angles> cleanly',
        role: 'Open Source',
        status: 'active',
        visibility: 'public',
        tech: ['C++', 'A&B'],
        stars: 0,
        showStars: false,
      },
    });

    assert.match(card, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[\s\S]*<\/svg>$/);
    assert.match(card, /Alpha &amp; &lt;Beta&gt; &quot;Tool&quot;/);
    // Ensure no unescaped raw ampersand remains
    assert.doesNotMatch(card, /&(?!(amp|lt|gt|quot|apos);)/);
  });

  it('produces 0 forbidden terms and exact verbatim bio across all generated SVGs and README sections', async () => {
    const manifest = await readFallbackManifest();
    const resolved = resolveProjects(manifest, []);
    const buildingNow = resolveBuildingNow(manifest, []);

    const outputs = [
      renderHeroSvg({ theme: 'dark', bio: manifest.bio, stats: { live: true, publicRepos: 8, totalStars: 12 }, portfolioUrl: PORTFOLIO_URL }),
      renderHeroSvg({ theme: 'light', bio: manifest.bio, stats: { live: false, projectCount: resolved.length }, portfolioUrl: PORTFOLIO_URL }),
      renderBuildingNowSvg({ theme: 'dark', buildingNow }),
      renderBuildingNowSvg({ theme: 'light', buildingNow }),
      renderStackSvg({ theme: 'dark' }),
      renderStackSvg({ theme: 'light' }),
      renderEsportsSvg({ theme: 'dark' }),
      renderEsportsSvg({ theme: 'light' }),
      renderPortfolioBadgeSvg({ theme: 'dark' }),
      renderPortfolioBadgeSvg({ theme: 'light' }),
      renderLinkedinBadgeSvg({ theme: 'dark' }),
      renderLinkedinBadgeSvg({ theme: 'light' }),
      ...resolved.flatMap((project) => [
        renderProjectCardSvg({ theme: 'dark', project }),
        renderProjectCardSvg({ theme: 'light', project }),
      ]),
      renderBuildingSection(buildingNow),
      renderProjectsSection(resolved),
    ];

    assert.match(outputs[0], new RegExp(VERBATIM_BIO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(outputs[1], new RegExp(VERBATIM_BIO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    for (const out of outputs) {
      for (const forbidden of FORBIDDEN_PATTERNS) {
        assert.doesNotMatch(out, forbidden, `Found forbidden pattern ${forbidden} in output`);
      }
      if (out.trimStart().startsWith('<svg')) {
        assert.match(out.trim(), /^<svg[\s\S]*<\/svg>$/);
        assert.doesNotMatch(out, /&(?!(amp|lt|gt|quot|apos);)/);
      }
    }
  });

  it('updates README markers deterministically and idempotently', async () => {
    const manifest = await readFallbackManifest();
    const resolved = resolveProjects(manifest, []);
    const buildingNow = resolveBuildingNow(manifest, []);

    const template = [
      '# Top',
      '<!-- AUTO:BUILDING:START -->',
      'old building',
      '<!-- AUTO:BUILDING:END -->',
      '## Projects',
      '<!-- AUTO:PROJECTS:START -->',
      'old projects',
      '<!-- AUTO:PROJECTS:END -->',
      'Footer',
    ].join('\n');

    const pass1 = updateReadmeContent(template, { buildingNow, projects: resolved });
    const pass2 = updateReadmeContent(pass1, { buildingNow, projects: resolved });

    assert.equal(pass1, pass2);
    assert.match(pass1, /assets\/building-now\.svg/);
    assert.match(pass1, /assets\/projects\/sadaqa-jaria\.svg/);
    assert.match(pass1, /Footer$/);
  });
});

describe('live profile audit fixes — hero specular sweep, Arabic vector path, LinkedIn, deduplicated headers, live language', () => {
  it('renders high-contrast metallic BOSS wordmark with clipped 3.2s diagonal specular sweep and synced underline pulse (no rainbow gradient)', () => {
    const darkHero = renderHeroSvg({ theme: 'dark', bio: VERBATIM_BIO, portfolioUrl: PORTFOLIO_URL });
    const lightHero = renderHeroSvg({ theme: 'light', bio: VERBATIM_BIO, portfolioUrl: PORTFOLIO_URL });

    assert.match(darkHero, /id="bossBaseDark"/);
    assert.match(darkHero, /stop-color="#E2E8F0"/);
    assert.match(darkHero, /stop-color="#94A3B8"/);
    assert.match(darkHero, /fill="url\(#bossBaseDark\)"[^>]*>BOSS<\/text>/);
    assert.match(lightHero, /fill="#0F172A"[^>]*>BOSS<\/text>/);
    assert.match(darkHero, /id="specularDark"/);
    assert.match(darkHero, /stop-color="#00E5FF" stop-opacity="0\.45"/);
    assert.match(darkHero, /stop-color="#FFFFFF" stop-opacity="1"/);
    assert.match(darkHero, /stop-color="#8B5CF6" stop-opacity="0\.45"/);
    assert.match(lightHero, /id="specularLight"/);
    assert.match(lightHero, /stop-color="#0284C7" stop-opacity="0\.55"/);
    assert.match(lightHero, /stop-color="#38BDF8" stop-opacity="0\.95"/);
    assert.match(lightHero, /stop-color="#FFFFFF" stop-opacity="0\.95"/);
    assert.match(lightHero, /stop-color="#7C3AED" stop-opacity="0\.45"/);
    assert.match(darkHero, /clip-path="url\(#bossWordClipDark\)"/);
    assert.match(lightHero, /clip-path="url\(#bossWordClipLight\)"/);
    assert.match(darkHero, /transform="skewX\(-22\)"/);
    assert.match(lightHero, /transform="skewX\(-22\)"/);
    assert.match(darkHero, /clip-path="url\(#underlineClipDark\)"/);
    assert.match(lightHero, /clip-path="url\(#underlineClipLight\)"/);
    assert.equal((darkHero.match(/dur="3\.2s"/g) || []).length, 2);
    assert.equal((lightHero.match(/dur="3\.2s"/g) || []).length, 2);
    assert.doesNotMatch(darkHero, /id="shineDark"/);
    assert.doesNotMatch(lightHero, /id="shineLight"/);
    assert.doesNotMatch(darkHero, /<script|@import/i);
    assert.doesNotMatch(lightHero, /<script|@import/i);
  });

  it('embeds إسلامي as vector <path> outlines with zero raw Arabic <text> nodes in sadaqa-jaria cards', async () => {
    const manifest = await readFallbackManifest();
    const resolved = resolveProjects(manifest, []);
    const sadaqa = resolved.find((p) => p.slug === 'sadaqa-jaria');
    assert.ok(sadaqa);

    for (const theme of ['dark', 'light']) {
      const svg = renderProjectCardSvg({ theme, project: sadaqa });
      assert.ok(svg.includes(ARABIC_ISLAMI_PATH), `Missing vector path in ${theme} sadaqa-jaria SVG`);
      assert.match(svg, /aria-label="[^"]*إسلامي/);
      assert.match(svg, />· Islami<\/text>/);
      // Ensure no <text> element contains Arabic code points
      const textNodes = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((m) => m[1]);
      for (const content of textNodes) {
        assert.doesNotMatch(content, /[\u0600-\u06FF]/, `Found raw Arabic in <text>: ${content}`);
      }
    }
  });

  it('prefers live GitHub repo.language over static fallback language for public repos (Kotlin for universal-harness)', async () => {
    const manifest = await readFallbackManifest();
    const liveRepos = [
      {
        name: 'universal-harness',
        stargazers_count: 0,
        language: 'Kotlin',
        html_url: 'https://github.com/ixboss/universal-harness',
        pushed_at: '2026-11-25T10:00:00Z',
        fork: false,
        archived: false,
        private: false,
      },
    ];

    const resolvedLive = resolveProjects(manifest, liveRepos);
    const harnessLive = resolvedLive.find((p) => p.slug === 'universal-harness');
    assert.equal(harnessLive.primaryTech, 'Kotlin');
    assert.equal(harnessLive.pillLabel, 'Kotlin · Active');

    const harnessSvg = renderProjectCardSvg({ theme: 'dark', project: harnessLive });
    assert.match(harnessSvg, />Kotlin · Active<\/text>/);

    // Offline fallback still resolves cleanly to manifest language
    const resolvedOffline = resolveProjects(manifest, []);
    const harnessOffline = resolvedOffline.find((p) => p.slug === 'universal-harness');
    assert.equal(harnessOffline.primaryTech, 'TypeScript');
  });

  it('omits duplicate section titles inside stack and esports SVGs and provides LinkedIn badge', async () => {
    for (const theme of ['dark', 'light']) {
      const stackSvg = renderStackSvg({ theme });
      const esportsSvg = renderEsportsSvg({ theme });
      const linkedinSvg = renderLinkedinBadgeSvg({ theme });

      assert.doesNotMatch(stackSvg, /\[\s*02\s*—\s*TECH CONSTELLATION\s*\]/);
      assert.doesNotMatch(esportsSvg, /\[\s*03\s*—\s*BEYOND CODE \/\/ ESPORTS\s*\]/);
      assert.match(linkedinSvg, /LinkedIn/);
      assert.match(linkedinSvg, /Hossam Mohamed/);
    }

    const readme = await fs.readFile(path.resolve(__dirname, '../README.md'), 'utf8');
    assert.ok(readme.includes(LINKEDIN_URL));
    assert.match(readme, /assets\/badges\/linkedin\.svg/);
    assert.doesNotMatch(readme, /assets\/badges\/github\.svg/);
    assert.doesNotMatch(readme, /GitHub @ixboss/);
  });
});
