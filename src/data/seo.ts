import { categoryLabels, href, site, workIndexOrder, type Locale, type Project } from './site';

/** Search results cut long titles; the route test holds every title to this. */
export const TITLE_MAX = 60;

/**
 * "<Project> · <category> — Marcus Neves": the category label is the short descriptor the page already shows.
 * When that exceeds TITLE_MAX the title stays "<Project> — Marcus Neves".
 */
export function projectTitle(project: Project, locale: Locale) {
  const described = `${project.title} · ${categoryLabels[project.category][locale]} — ${site.name}`;
  return [...described].length <= TITLE_MAX ? described : `${project.title} — ${site.name}`;
}

/** A description shorter than this is a weak search snippet; the route test holds indexable pages to it. */
const DESCRIPTION_MIN = 100;

/**
 * The meta description: the summary, followed by the page's own problem statement when the summary alone is too
 * short to say what the project is for. Both sentences are visible on the page, so nothing new is claimed.
 */
export function projectDescription(project: Project, locale: Locale) {
  const summary = project.summary[locale];
  return [...summary].length >= DESCRIPTION_MIN ? summary : `${summary} ${project.problem[locale]}`;
}

/**
 * Link previews use a 1200×750 JPEG share copy of the cover (scripts/og-covers.sh): the WebP cover stays in the page,
 * but LinkedIn documents no WebP support. The route test compares this size with the real file behind each og:image.
 */
export const projectShareSize = { width: 1200, height: 750 } as const;

export function projectPreview(project: Project, locale: Locale) {
  if (!project.image) return undefined;
  const path = project.image.replace(/^\/images\/projects\/([^/]+)\.webp$/, '/images/projects/og/$1.jpg');
  if (path === project.image) throw new Error(`cover ${project.image} is not /images/projects/<slug>.webp; add its share copy`);
  return { path, alt: project.alt[locale], ...projectShareSize };
}

/**
 * srcset for a 1600px project cover with the 400w and 800w copies scripts/og-covers.sh writes beside it; a phone
 * otherwise downloads the original for a 300-360px cover. The route test checks each file's real width.
 */
export function coverSrcset(image: string) {
  const name = image.match(/^\/images\/projects\/([^/]+\.webp)$/)?.[1];
  if (!name) throw new Error(`cover ${image} is not /images/projects/<slug>.webp; run scripts/og-covers.sh`);
  return `/images/projects/400/${name} 400w, /images/projects/800/${name} 800w, ${image} 1600w`;
}

// Stack chips that are programming languages; everything else there is a framework, service or topic.
const languages = new Set(['Bash', 'C', 'Rust', 'Swift', 'TypeScript', 'V', 'Zig']);

/**
 * JSON-LD for the project a work page is about, from data the page shows: an open-source repository linked from
 * the page, otherwise a creative work. Never offers, prices or ratings. Apps are CreativeWork, not
 * SoftwareApplication: Google's Software app rich result requires offers.price plus aggregateRating or review,
 * which this site cannot state truthfully, so SoftwareApplication nodes would only be invalid items in Search
 * Console. The page text names the platform.
 */
export function projectEntity(project: Project, locale: Locale, pageUrl: string) {
  const base = {
    name: project.title,
    description: project.summary[locale],
    url: project.live ?? project.appStore?.[locale] ?? project.source ?? pageUrl,
    ...(project.image ? { image: `${site.domain}${project.image}` } : {}),
  };
  if (project.openSource && project.source) {
    const programmingLanguage = project.stack.filter((item) => languages.has(item));
    return { '@type': 'SoftwareSourceCode', ...base, codeRepository: project.source, ...(programmingLanguage.length ? { programmingLanguage } : {}) };
  }
  return { '@type': 'CreativeWork', ...base };
}

/** The work index's mainEntity: the project rows it shows, in the order it shows them. */
export function workItemList(locale: Locale) {
  const { current, archive } = workIndexOrder();
  const rows = [...current, ...archive];
  return {
    '@type': 'ItemList',
    numberOfItems: rows.length,
    itemListElement: rows.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${site.domain}${href(locale, `/work/${project.slug}/`)}`,
      name: project.title,
    })),
  };
}
