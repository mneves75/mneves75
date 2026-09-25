import { categoryLabels, site, type Locale, type Project } from './site';

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

/** Every project cover is 1600×1000; the route test compares this with the real file behind each og:image. */
export const projectCoverSize = { width: 1600, height: 1000 } as const;

export function projectPreview(project: Project, locale: Locale) {
  return project.image ? { path: project.image, alt: project.alt[locale], ...projectCoverSize } : undefined;
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
