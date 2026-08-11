export type Locale = 'en' | 'pt';
export type Copy = { en: string; pt: string };

export const site = {
  name: 'Marcus Neves',
  domain: 'https://mvneves.dev',
  github: 'https://github.com/mneves75',
  linkedin: 'https://www.linkedin.com/in/mvneves',
  teaching: 'https://conhecendoia.com.br',
  x: 'https://x.com/mneves75',
};

export const localeConfig = {
  en: { code: 'en', html: 'en', prefix: '', label: 'English', short: 'EN' },
  pt: { code: 'pt-BR', html: 'pt-BR', prefix: '/pt-br', label: 'Português', short: 'PT' },
} as const;

export function href(locale: Locale, path = '') {
  // trailingSlash: 'always' — every internal URL ends with a slash, root included
  return `${localeConfig[locale].prefix}/${path}/`.replace(/\/+/g, '/');
}

export const nav = [
  { path: '/work/', en: 'Work', pt: 'Trabalho' },
  { path: '/about/', en: 'About', pt: 'Sobre' },
  { path: '/recommendations/', en: 'Recommendations', pt: 'Recomendações' },
  { path: '/contact/', en: 'Contact', pt: 'Contato' },
] as const;

export type Project = {
  slug: string;
  title: string;
  kicker: Copy;
  summary: Copy;
  problem: Copy;
  constraint: Copy;
  approach: Copy;
  outcome: Copy;
  caseStudyPending?: Copy;
  stack: string[];
  category: 'AI systems' | 'Privacy / local-first' | 'Developer tools' | 'Data / analytics' | 'Creative engineering' | 'Web apps' | 'Mobile apps' | 'Promotional';
  status: Copy;
  source?: string;
  live?: string;
  /** Omitted when no verified capture exists; the UI renders a terminal plate instead of inventing one. */
  image?: string;
  alt: Copy;
  featured: boolean;
  openSource: boolean;
  diagram: string[];
};

export const categoryLabels: Record<Project['category'], Copy> = {
  'AI systems': { en: 'AI systems', pt: 'Sistemas de IA' },
  'Privacy / local-first': { en: 'Privacy / local-first', pt: 'Privacidade / local-first' },
  'Developer tools': { en: 'Developer tools', pt: 'Ferramentas de desenvolvimento' },
  'Data / analytics': { en: 'Data / analytics', pt: 'Dados / analytics' },
  'Creative engineering': { en: 'Creative engineering', pt: 'Engenharia criativa' },
  'Web apps': { en: 'Web apps', pt: 'Apps web' },
  'Mobile apps': { en: 'Mobile apps', pt: 'Apps mobile' },
  Promotional: { en: 'Promotional', pt: 'Promocional' },
};

const curatedProjects: Project[] = [
  {
    slug: 'dnschat',
    title: 'DNSChat',
    kicker: { en: 'AI / NETWORKS', pt: 'IA / REDES' },
    summary: { en: 'Chat with an LLM over DNS TXT queries.', pt: 'Converse com um LLM por consultas DNS TXT.' },
    problem: { en: 'Most AI chat assumes a conventional HTTPS API, an account, and a network path that is easy to take for granted.', pt: 'A maior parte do chat com IA pressupõe uma API HTTPS convencional, uma conta e um caminho de rede fácil de ignorar.' },
    constraint: { en: 'Prompts must fit DNS label rules. Native DNS, UDP, TCP, and browser preview do not share the same capabilities.', pt: 'Os prompts precisam caber nas regras de labels DNS. DNS nativo, UDP, TCP e preview no navegador não têm as mesmas capacidades.' },
    approach: { en: 'An Expo app combines native resolvers with JavaScript UDP/TCP fallback transports, encrypted local history, multiple servers, and an inspectable logs screen.', pt: 'Um app Expo combina resolvers nativos com fallbacks UDP/TCP em JavaScript, histórico local criptografado, múltiplos servidores e uma tela de logs inspecionável.' },
    outcome: { en: 'An open-source experiment where the unusual transport is the product constraint, not a visual gimmick.', pt: 'Um experimento open source em que o transporte incomum é a restrição do produto, não um efeito visual.' },
    stack: ['React Native', 'Expo', 'TypeScript', 'DNS'],
    category: 'AI systems',
    status: { en: 'Open source · active', pt: 'Open source · ativo' },
    source: 'https://github.com/mneves75/dnschat',
    live: 'https://conhecendotudo.com.br/dnschat/',
    image: '/images/projects/dnschat.webp',
    alt: { en: 'DNSChat project interface from the supplied portfolio asset.', pt: 'Interface do projeto DNSChat a partir do asset fornecido no portfólio.' },
    featured: true,
    openSource: true,
    diagram: ['prompt', 'DNS TXT', 'resolver', 'LLM reply'],
  },
  {
    slug: 'ai-health-sync',
    title: 'AI Health Sync',
    kicker: { en: 'PRIVACY / HEALTH', pt: 'PRIVACIDADE / SAÚDE' },
    summary: { en: 'HealthKit data moves from iPhone to Mac over the local network.', pt: 'Dados do HealthKit vão do iPhone para o Mac pela rede local.' },
    problem: { en: 'Health data is useful across devices, but sending it through a hosted service creates a trust boundary that does not need to exist.', pt: 'Dados de saúde são úteis em vários dispositivos, mas enviá-los por um serviço hospedado cria uma fronteira de confiança que não precisa existir.' },
    constraint: { en: 'The system has to remain useful without turning personal health context into a cloud dataset.', pt: 'O sistema precisa continuar útil sem transformar contexto pessoal de saúde em um dataset na nuvem.' },
    approach: { en: 'A Swift tool syncs Apple HealthKit data between an iPhone and a Mac over the local network.', pt: 'Uma ferramenta em Swift sincroniza dados do Apple HealthKit entre iPhone e Mac pela rede local.' },
    outcome: { en: 'The privacy decision is visible in the architecture: your health data stays on your machines.', pt: 'A decisão de privacidade aparece na arquitetura: seus dados de saúde ficam nos seus aparelhos.' },
    stack: ['Swift', 'HealthKit', 'Local network'],
    category: 'Privacy / local-first',
    status: { en: 'Open source · local-first', pt: 'Open source · local-first' },
    source: 'https://github.com/mneves75/ai-health-sync-ios',
    image: '/images/projects/ai-health-sync.webp',
    alt: { en: 'AI Health Sync project interface from the supplied portfolio asset.', pt: 'Interface do projeto AI Health Sync a partir do asset fornecido no portfólio.' },
    featured: true,
    openSource: true,
    diagram: ['iPhone', 'HealthKit', 'local network', 'Mac'],
  },
  {
    slug: 'ffts-grep',
    title: 'ffts-grep',
    kicker: { en: 'RUST / SEARCH', pt: 'RUST / BUSCA' },
    summary: { en: 'Fast full-text file search using SQLite FTS5 and BM25 ranking.', pt: 'Busca full-text rápida usando SQLite FTS5 e ranking BM25.' },
    problem: { en: 'Searching a codebase is a relevance problem, not just a string-matching problem.', pt: 'Buscar em um codebase é um problema de relevância, não apenas de encontrar strings.' },
    constraint: { en: 'The index must stay small, incremental, git-aware, and fast enough to sit inside an AI coding workflow.', pt: 'O índice precisa ser pequeno, incremental, compatível com git e rápido o bastante para um fluxo de programação com IA.' },
    approach: { en: 'A single Rust binary indexes filenames, paths, and content into SQLite FTS5, ranks with BM25, updates only changed files, and prunes deletions.', pt: 'Um binário Rust indexa nomes, caminhos e conteúdo em SQLite FTS5, ranqueia com BM25, atualiza apenas arquivos alterados e remove exclusões.' },
    outcome: { en: 'The README reports approximately 10 ms queries on 10K-file codebases after the first index.', pt: 'O README reporta consultas de aproximadamente 10 ms em codebases com 10 mil arquivos após o primeiro índice.' },
    stack: ['Rust', 'SQLite FTS5', 'BM25', 'CLI'],
    category: 'Developer tools',
    status: { en: 'Open source · measured', pt: 'Open source · medido' },
    source: 'https://github.com/mneves75/ffts-grep',
    image: '/images/projects/ffts-grep.webp',
    alt: { en: 'ffts-grep project visual from the supplied portfolio asset.', pt: 'Visual do projeto ffts-grep a partir do asset fornecido no portfólio.' },
    featured: true,
    openSource: true,
    diagram: ['filesystem', 'incremental index', 'SQLite FTS5', 'BM25 results'],
  },
  {
    slug: 'open-profile-manager',
    title: 'Open Profile Manager',
    kicker: { en: 'MACOS / OPERATIONS', pt: 'MACOS / OPERAÇÕES' },
    summary: { en: 'A local-first launcher for explicit Codex profiles on macOS.', pt: 'Um launcher local-first para perfis explícitos do Codex no macOS.' },
    problem: { en: 'Switching between Codex profiles is easy to get wrong when it depends on remembering environment variables and separate app state.', pt: 'Alternar entre perfis do Codex é fácil de errar quando depende de lembrar variáveis de ambiente e estados separados do app.' },
    constraint: { en: 'The tool must isolate profiles without reading or exporting credentials, rotating accounts, or pretending to be the official app.', pt: 'A ferramenta precisa isolar perfis sem ler ou exportar credenciais, rotacionar contas ou fingir ser o app oficial.' },
    approach: { en: 'A native macOS app and stable `opm` CLI use named CODEX_HOME directories, explicit launch selection, read-only status, and owner-only local storage.', pt: 'Um app macOS nativo e uma CLI `opm` usam diretórios CODEX_HOME nomeados, seleção explícita, status somente leitura e armazenamento local com acesso do proprietário.' },
    outcome: { en: 'A small operator tool that makes account boundaries visible instead of automating a risky choice.', pt: 'Uma ferramenta operacional pequena que torna os limites de conta visíveis em vez de automatizar uma escolha arriscada.' },
    stack: ['Swift', 'macOS', 'CLI', 'CODEX_HOME'],
    category: 'Privacy / local-first',
    status: { en: 'Open source · macOS', pt: 'Open source · macOS' },
    source: 'https://github.com/mneves75/open-profile-manager',
    live: 'https://mneves75.github.io/open-profile-manager/',
    image: '/images/projects/open-profile-manager.webp',
    alt: { en: 'Open Profile Manager project visual from the supplied portfolio asset.', pt: 'Visual do projeto Open Profile Manager a partir do asset fornecido no portfólio.' },
    featured: true,
    openSource: true,
    diagram: ['profile label', 'CODEX_HOME', 'read-only status', 'explicit launch'],
  },
  {
    slug: 'llmdeepdive',
    title: 'llmdeepdive',
    kicker: { en: 'TEACHING / AI', pt: 'ENSINO / IA' },
    summary: { en: 'A free bilingual course that keeps going past the analogy.', pt: 'Um curso bilíngue gratuito que vai além da analogia.' },
    problem: { en: 'Many LLM explainers stop at a metaphor. Understanding requires mechanism, evidence, practice, and a way to explain back.', pt: 'Muitos conteúdos sobre LLM param na metáfora. Entender exige mecanismo, evidência, prática e uma forma de ensinar de volta.' },
    constraint: { en: 'The course has to stay open, bilingual, and honest where public numbers do not reconcile.', pt: 'O curso precisa permanecer aberto, bilíngue e honesto quando os números públicos não fecham.' },
    approach: { en: 'Each lesson moves through concept, analogy, lab, teach-back, and quiz, with cited claims and a transformer anatomy explorer as the course map.', pt: 'Cada lição passa por conceito, analogia, laboratório, teach-back e quiz, com afirmações citadas e um explorador da anatomia de transformers como mapa do curso.' },
    outcome: { en: 'Open knowledge with enough structure to make the learner do the work.', pt: 'Conhecimento aberto com estrutura suficiente para fazer o aluno realizar o trabalho.' },
    stack: ['Astro', 'TypeScript', 'Cloudflare', 'LLMs'],
    category: 'AI systems',
    status: { en: 'Open source · bilingual', pt: 'Open source · bilíngue' },
    source: 'https://github.com/mneves75/llmdeepdive',
    live: 'https://llmdeepdive.com/',
    image: '/images/projects/llmdeepdive.webp',
    alt: { en: 'LLM Deep Dive project visual from the supplied portfolio asset.', pt: 'Visual do projeto LLM Deep Dive a partir do asset fornecido no portfólio.' },
    featured: true,
    openSource: true,
    diagram: ['concept', 'lab', 'teach-back', 'evidence'],
  },
  {
    slug: 'msx-expert-xp800',
    title: 'Gradiente Expert XP-800',
    kicker: { en: '3D / EMULATION', pt: '3D / EMULAÇÃO' },
    summary: { en: 'A procedural 3D reconstruction of a 1985 Brazilian MSX with a working emulator.', pt: 'Uma reconstrução 3D procedural de um MSX brasileiro de 1985 com emulador funcionando.' },
    problem: { en: 'A historical computer is more than a model: its materials, controls, screen, software, and limitations are part of the object.', pt: 'Um computador histórico é mais do que um modelo: materiais, controles, tela, software e limitações fazem parte do objeto.' },
    constraint: { en: 'The scene must stay lightweight, interactive, and honest about user-owned ROMs and third-party runtime dependencies.', pt: 'A cena precisa ser leve, interativa e honesta sobre ROMs do usuário e dependências de runtime de terceiros.' },
    approach: { en: 'Procedural Three.js geometry, a CRT treatment, a built-in original Z80 game, and browser-only user ROM handling create a working reconstruction.', pt: 'Geometria procedural em Three.js, tratamento CRT, um jogo Z80 original e ROMs do usuário apenas no navegador criam uma reconstrução funcional.' },
    outcome: { en: 'Creative engineering that treats performance, provenance, and interaction as one problem.', pt: 'Engenharia criativa que trata performance, proveniência e interação como um único problema.' },
    stack: ['Three.js', 'TypeScript', 'WebMSX', 'Cloudflare'],
    category: 'Creative engineering',
    status: { en: 'Open source · live demo', pt: 'Open source · demo ao vivo' },
    source: 'https://github.com/mneves75/msx-expert-xp800',
    live: 'https://msx-expert-xp800.mvneves.workers.dev',
    image: '/images/projects/msx-expert.webp',
    alt: { en: 'Gradiente Expert XP-800 project visual from the supplied portfolio asset.', pt: 'Visual do projeto Gradiente Expert XP-800 a partir do asset fornecido no portfólio.' },
    featured: true,
    openSource: true,
    diagram: ['procedural scene', 'CRT signal', 'emulator', 'user-owned ROM'],
  },
  {
    slug: 'cf-toolkit',
    title: 'cf-toolkit',
    kicker: { en: 'CLOUDFLARE / SAFETY', pt: 'CLOUDFLARE / SEGURANÇA' },
    summary: { en: 'Multi-account Wrangler without a wrapper around every command.', pt: 'Wrangler multi-conta sem embrulhar cada comando.' },
    problem: { en: 'The dangerous deployment is the one that looks normal while targeting the wrong Cloudflare account.', pt: 'O deploy perigoso é o que parece normal enquanto aponta para a conta Cloudflare errada.' },
    constraint: { en: 'Target and credential boundaries need to remain independent so one bad configuration does not erase the other guard.', pt: 'Os limites de alvo e credencial precisam ser independentes para que uma configuração errada não elimine a outra guarda.' },
    approach: { en: 'A pinned account_id plus a scoped Keychain-loaded token create two locks, with a local guard before Wrangler runs.', pt: 'Um account_id fixado mais um token restrito carregado do Keychain criam duas travas, com uma guarda local antes do Wrangler rodar.' },
    outcome: { en: 'A deployment workflow that turns “wrong account” into a preflight failure.', pt: 'Um fluxo de deploy que transforma “conta errada” em falha de preflight.' },
    stack: ['Bash', 'Keychain', 'direnv', 'Wrangler'],
    category: 'Developer tools',
    status: { en: 'Open source · operational', pt: 'Open source · operacional' },
    source: 'https://github.com/mneves75/cf-toolkit',
    image: '/images/projects/ffts-grep.webp',
    alt: { en: 'Abstract project visual used for cf-toolkit in the supplied portfolio.', pt: 'Visual abstrato usado para cf-toolkit a partir do asset fornecido no portfólio.' },
    featured: false,
    openSource: true,
    diagram: ['project config', 'account_id', 'Keychain token', 'guard'],
  },
  {
    slug: 'megasena-analyzer',
    title: 'Mega-Sena Analyzer',
    kicker: { en: 'DATA / STATISTICS', pt: 'DADOS / ESTATÍSTICA' },
    summary: { en: 'Educational analysis of the official Mega-Sena draw history.', pt: 'Análise educacional do histórico oficial da Mega-Sena.' },
    problem: { en: 'People ask for predictions; the useful answer is a transparent view of the data and its limits.', pt: 'As pessoas pedem previsões; a resposta útil é uma visão transparente dos dados e dos seus limites.' },
    constraint: { en: 'The dataset must refresh from the official API and the experience must distinguish statistics from prediction.', pt: 'O dataset precisa ser atualizado pela API oficial e a experiência precisa distinguir estatística de previsão.' },
    approach: { en: 'Local processing turns the official draw history into frequency views, pattern analysis, and an educational bet generator.', pt: 'O processamento local transforma o histórico oficial em frequência, análise de padrões e um gerador de apostas educacional.' },
    outcome: { en: 'Data science for the masses, without pretending math can predict a lottery draw.', pt: 'Ciência de dados para mais pessoas, sem fingir que a matemática prevê um sorteio.' },
    stack: ['Next.js', 'Statistics', 'Data', 'Docker'],
    category: 'Data / analytics',
    status: { en: 'Open source · educational', pt: 'Open source · educacional' },
    source: 'https://github.com/mneves75/megasena-analyser-webapp',
    live: 'https://megasena-analyzer.com.br/',
    image: '/images/projects/megasena.webp',
    alt: { en: 'Abstract data project visual used for Mega-Sena Analyzer.', pt: 'Visual abstrato de dados usado para o Mega-Sena Analyzer.' },
    featured: false,
    openSource: true,
    diagram: ['official API', 'local data', 'statistics', 'honest limits'],
  },
];

type PortfolioProjectInput = Pick<Project, 'slug' | 'title' | 'kicker' | 'summary' | 'stack' | 'category' | 'status' | 'openSource'> & {
  image?: string;
  source?: string;
  live?: string;
};

const portfolioDetailPending: Copy = {
  en: 'The public portfolio listing is the verified source for this project. A longer case study is still a content TODO.',
  pt: 'A listagem pública do portfólio é a fonte verificada deste projeto. Um case study mais longo ainda é um TODO de conteúdo.',
};

function portfolioProject(input: PortfolioProjectInput): Project {
  return {
    ...input,
    problem: portfolioDetailPending,
    constraint: portfolioDetailPending,
    approach: portfolioDetailPending,
    outcome: portfolioDetailPending,
    caseStudyPending: portfolioDetailPending,
    alt: {
      en: `${input.title} project preview from the public studio portfolio.`,
      pt: `Preview do projeto ${input.title} a partir do portfólio público do estúdio.`,
    },
    featured: false,
    diagram: ['public portfolio listing', 'verified source link', 'case study pending'],
  };
}

export const portfolioProjects: Project[] = [
  portfolioProject({ slug: 'bolao-2026', title: 'Bolão 2026', kicker: { en: 'WEB APPS', pt: 'APPS WEB' }, summary: { en: 'Free web app for 2026 World Cup predictions with automatic rankings among friends and groups. Existing participants can still reach groups, predictions and rankings; new sign-ups and pools are closed.', pt: 'App web gratuito para palpites da Copa do Mundo de 2026 com rankings automáticos entre amigos e grupos. Participantes existentes ainda podem acessar grupos, palpites e rankings; novos cadastros e bolões estão fechados.' }, stack: ['React 19', 'TypeScript', 'Cloudflare Workers', 'D1'], category: 'Web apps', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://bolao2026.net/', image: '/images/projects/portfolio-bolao2026.webp', openSource: false }),
  portfolioProject({ slug: 'diario-neutro', title: 'O Diário Neutro', kicker: { en: 'AI SOLUTIONS', pt: 'SOLUÇÕES DE IA' }, summary: { en: 'A low-friction daily digest of Brazilian news, anchored in what Brazilian outlets reported up to the cut-off time, with links back to every source.', pt: 'Um resumo diário de notícias brasileiras, baseado no que os veículos brasileiros publicaram até o horário de corte, com links para todas as fontes.' }, stack: ['News', 'Automation', 'Editorial', 'PT-BR'], category: 'AI systems', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://odiarioneutro.com/', image: '/images/projects/portfolio-odiarioneutro.webp', openSource: false }),
  portfolioProject({ slug: 'openclaw-club-brasil', title: 'OpenClaw Club Brasil', kicker: { en: 'AI SOLUTIONS', pt: 'SOLUÇÕES DE IA' }, summary: { en: 'Community hub for Brazilian users of OpenClaw, the open-source AI assistant that runs tasks over chat — ready-made templates, tutorials and use cases in Portuguese.', pt: 'Hub comunitário para usuários brasileiros do OpenClaw, o assistente de IA open source que executa tarefas pelo chat — com templates prontos, tutoriais e casos de uso em português.' }, stack: ['OpenClaw', 'Open source', 'Community', 'WhatsApp'], category: 'AI systems', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://openclawclubbrasil.com.br/', image: '/images/projects/portfolio-openclawclub.webp', openSource: false }),
  portfolioProject({ slug: 'conhecendo-ia', title: 'Conhecendo IA', kicker: { en: 'PROMOTIONAL', pt: 'PROMOCIONAL' }, summary: { en: 'Sister site of the studio: a 30-day course that takes you from zero to intermediate with ChatGPT, Gemini and Claude, with a complete PDF guide.', pt: 'Site irmão do estúdio: um curso de 30 dias que leva do zero ao intermediário com ChatGPT, Gemini e Claude, acompanhado de um guia PDF completo.' }, stack: ['Astro', 'Course', 'PT-BR', 'SEO'], category: 'Promotional', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://conhecendoia.com.br/', image: '/images/projects/portfolio-conhecendoia.webp', openSource: false }),
  portfolioProject({ slug: 'terroir-atelier', title: 'Terroir Atelier', kicker: { en: 'WEB APPS', pt: 'APPS WEB' }, summary: { en: 'Wine exploration built on traceable evidence: compare real terroirs and follow every sensory explanation back to its source. Public preview environment.', pt: 'Exploração de vinhos baseada em evidências rastreáveis: compare terroirs reais e siga cada explicação sensorial até sua fonte. Ambiente de preview público.' }, stack: ['Cloudflare Workers', 'Wine', 'Evidence', 'Preview'], category: 'Web apps', status: { en: 'Portfolio listing · preview', pt: 'Listagem do portfólio · preview' }, live: 'https://terroir-atelier-staging.mvneves.workers.dev/pt/', image: '/images/projects/portfolio-terroir.webp', openSource: false }),
  portfolioProject({ slug: 'whatsimovel', title: 'WhatsImovel', kicker: { en: 'AI SOLUTIONS', pt: 'SOLUÇÕES DE IA' }, summary: { en: 'WhatsApp automation for real estate, with intelligent lead tracking and conversion analytics.', pt: 'Automação de WhatsApp para o mercado imobiliário, com acompanhamento inteligente de leads e analytics de conversão.' }, stack: ['WhatsApp', 'Automation', 'Real estate'], category: 'AI systems', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://whatsimovel.com.br/', image: '/images/projects/portfolio-whatsimovel.webp', openSource: false }),
  portfolioProject({ slug: 'ia-travel', title: 'IA Travel', kicker: { en: 'AI SOLUTIONS', pt: 'SOLUÇÕES DE IA' }, summary: { en: 'AI travel planning assistant that builds personalised itineraries and recommendations.', pt: 'Assistente de planejamento de viagens com IA que cria itinerários e recomendações personalizados.' }, stack: ['AI', 'Travel', 'Next.js'], category: 'AI systems', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://iatravel.conhecendotudo.com.br/', image: '/images/projects/portfolio-iatravel.webp', openSource: false }),
  portfolioProject({ slug: 'event-management-system', title: 'Event Management System', kicker: { en: 'WEB APPS', pt: 'APPS WEB' }, summary: { en: 'Complete event management platform with RSVP, payments and an admin dashboard.', pt: 'Plataforma completa de gestão de eventos com RSVP, pagamentos e dashboard administrativo.' }, stack: ['Next.js', 'RSVP', 'PIX'], category: 'Web apps', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://conhecendotudo.com.br/eventos-app/', image: '/images/projects/portfolio-eventos-app.webp', openSource: false }),
  portfolioProject({ slug: 'event-services-platform', title: 'Event Services Platform', kicker: { en: 'WEB APPS', pt: 'APPS WEB' }, summary: { en: 'Services platform for events: a professional site with automatic RSVP and PIX collection without intermediaries.', pt: 'Plataforma de serviços para eventos: site profissional com RSVP automático e coleta de PIX sem intermediários.' }, stack: ['Astro', 'Events', 'PIX'], category: 'Web apps', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://eventoservicos.conhecendotudo.com.br/', image: '/images/projects/portfolio-eventoservicos.webp', openSource: false }),
  portfolioProject({ slug: 'maturity-toolbox', title: 'Maturity Toolbox', kicker: { en: 'WEB APPS', pt: 'APPS WEB' }, summary: { en: 'Business maturity assessment tool with actionable insights and recommendations.', pt: 'Ferramenta de avaliação de maturidade empresarial com insights e recomendações acionáveis.' }, stack: ['Assessment', 'Business', 'Analytics'], category: 'Web apps', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://caixa-ferramentas-maturidade.pages.dev/', image: '/images/projects/portfolio-caixa-ferramentas.webp', openSource: false }),
  portfolioProject({ slug: 'babimakeup', title: 'Babimakeup', kicker: { en: 'PROMOTIONAL', pt: 'PROMOCIONAL' }, summary: { en: 'Brand site for a professional make-up artist in Brasília — portfolio for brides, film, fashion and events, with booking straight through WhatsApp.', pt: 'Site de marca para uma maquiadora profissional em Brasília — portfólio para noivas, cinema, moda e eventos, com agendamento direto pelo WhatsApp.' }, stack: ['Brand site', 'Portfolio', 'WhatsApp', 'SEO'], category: 'Promotional', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://babimakeup.com.br/', image: '/images/projects/portfolio-babimakeup.webp', openSource: false }),
  portfolioProject({ slug: 'weathersunscreen', title: 'WeatherSunscreen', kicker: { en: 'MOBILE APPS', pt: 'APPS MOBILE' }, summary: { en: 'Smart UV protection app with real-time sunscreen reminders.', pt: 'App inteligente de proteção UV com lembretes de protetor solar em tempo real.' }, stack: ['React Native', 'Expo', 'iOS', 'Android'], category: 'Mobile apps', status: { en: 'Open source · public', pt: 'Open source · público' }, source: 'https://github.com/mneves75/weather-sunscreen-app', live: 'https://conhecendotudo.com.br/weathersunscreen/', image: '/images/projects/portfolio-weathersunscreen.webp', openSource: true }),
  portfolioProject({ slug: 'cigarinfo-ai', title: 'CigarInfo AI', kicker: { en: 'MOBILE APPS', pt: 'APPS MOBILE' }, summary: { en: 'Cigar information and recommendation app with AI-powered authenticity checks for enthusiasts.', pt: 'App de informação e recomendação de charutos com verificações de autenticidade baseadas em IA para entusiastas.' }, stack: ['iOS', 'Android', 'AI', 'Lifestyle'], category: 'Mobile apps', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://conhecendotudo.com.br/cigarinfoai/', image: '/images/projects/portfolio-cigarinfo.webp', openSource: false }),
  portfolioProject({ slug: 'ai-pedometer', title: 'AI Pedometer', kicker: { en: 'MOBILE APPS', pt: 'APPS MOBILE' }, summary: { en: 'Open-source iOS pedometer app that turns step data into AI-generated insights. Written in Swift.', pt: 'App de pedômetro open source para iOS que transforma dados de passos em insights gerados por IA. Escrito em Swift.' }, stack: ['Swift', 'iOS', 'HealthKit', 'Open source'], category: 'Mobile apps', status: { en: 'Open source · public', pt: 'Open source · público' }, source: 'https://github.com/mneves75/ai-pedometer', image: '/images/projects/portfolio-ai-pedometer.webp', openSource: true }),
  portfolioProject({ slug: 'swift-fast-markdown', title: 'swift-fast-markdown', kicker: { en: 'DEVELOPER TOOLS', pt: 'FERRAMENTAS DEV' }, summary: { en: 'High-performance SwiftUI markdown parser built on md4c, with streaming support and iOS 26 Liquid Glass rendering.', pt: 'Parser de Markdown de alta performance para SwiftUI, baseado em md4c, com suporte a streaming e renderização Liquid Glass do iOS 26.' }, stack: ['Swift', 'SwiftUI', 'md4c', 'Open source'], category: 'Developer tools', status: { en: 'Open source · public', pt: 'Open source · público' }, source: 'https://github.com/mneves75/swift-fast-markdown', image: '/images/projects/portfolio-swift-fast-markdown.webp', openSource: true }),
  portfolioProject({ slug: 'cruzadas-rubro-negras', title: 'Cruzadas Rubro-Negras', kicker: { en: 'PROMOTIONAL', pt: 'PROMOCIONAL' }, summary: { en: 'Interactive crossword game for Flamengo supporters.', pt: 'Jogo de palavras cruzadas interativo para torcedores do Flamengo.' }, stack: ['Games', 'Football', 'PWA'], category: 'Promotional', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://cruzadas-rubro-negras.pages.dev/', image: '/images/projects/portfolio-cruzadas-flamengo.webp', openSource: false }),
  portfolioProject({ slug: 'cruzadas-tricolores', title: 'Cruzadas Tricolores', kicker: { en: 'PROMOTIONAL', pt: 'PROMOCIONAL' }, summary: { en: 'Interactive crossword game for São Paulo supporters.', pt: 'Jogo de palavras cruzadas interativo para torcedores do São Paulo.' }, stack: ['Games', 'Football', 'PWA'], category: 'Promotional', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://cruzadas-tricolores.pages.dev/', image: '/images/projects/portfolio-cruzadas-tricolor.webp', openSource: false }),
  portfolioProject({ slug: 'cruzadas-alvinegras', title: 'Cruzadas Alvinegras', kicker: { en: 'PROMOTIONAL', pt: 'PROMOCIONAL' }, summary: { en: 'Interactive crossword game for Corinthians supporters.', pt: 'Jogo de palavras cruzadas interativo para torcedores do Corinthians.' }, stack: ['Games', 'Football', 'PWA'], category: 'Promotional', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://cruzadas-alvinegras.pages.dev/', image: '/images/projects/portfolio-cruzadas-alvinegras.webp', openSource: false }),
  portfolioProject({ slug: 'cruzadas-fluminense', title: 'Cruzadas Fluminense', kicker: { en: 'PROMOTIONAL', pt: 'PROMOCIONAL' }, summary: { en: 'Interactive crossword game for Fluminense supporters.', pt: 'Jogo de palavras cruzadas interativo para torcedores do Fluminense.' }, stack: ['Games', 'Football', 'PWA'], category: 'Promotional', status: { en: 'Portfolio listing · public', pt: 'Listagem do portfólio · pública' }, live: 'https://cruzadas-fluminense.pages.dev/', image: '/images/projects/portfolio-cruzadas-fluminense.webp', openSource: false }),
  portfolioProject({ slug: 'skills', title: 'Skills', kicker: { en: 'AGENTS / TOOLING', pt: 'AGENTES / FERRAMENTAS' }, summary: { en: 'Tool-agnostic skills for AI coding agents: codebase readiness assessment, a model-routing policy, and spaced-repetition teach-back over your own code.', pt: 'Skills tool-agnostic para agentes de programação com IA: avaliação de prontidão do codebase, política de roteamento de modelos e teach-back com repetição espaçada sobre o próprio código.' }, stack: ['TypeScript', 'Claude Code', 'SQLite', 'Apache-2.0'], category: 'Developer tools', status: { en: 'Open source · public', pt: 'Open source · público' }, source: 'https://github.com/mneves75/skills', openSource: true }),
  portfolioProject({ slug: 'language-benchmarks', title: 'OU Benchmark', kicker: { en: 'BENCHMARK / LANGUAGES', pt: 'BENCHMARK / LINGUAGENS' }, summary: { en: 'A methodology-fixed Ornstein–Uhlenbeck benchmark across C, Zig, Rust, Swift, V and TypeScript on Bun, with the same algorithm and checksum in every language.', pt: 'Um benchmark de processo de Ornstein–Uhlenbeck com metodologia fixa em C, Zig, Rust, Swift, V e TypeScript no Bun, com o mesmo algoritmo e checksum em todas as linguagens.' }, stack: ['Zig', 'Rust', 'C', 'Swift', 'MIT'], category: 'Data / analytics', status: { en: 'Open source · measured', pt: 'Open source · medido' }, source: 'https://github.com/mneves75/language-benchmarks', openSource: true }),
  portfolioProject({ slug: 'polymarket-analyzer', title: 'Polymarket Analyzer', kicker: { en: 'MARKETS / REALTIME', pt: 'MERCADOS / TEMPO REAL' }, summary: { en: 'Realtime terminal dashboard over Polymarket public APIs — Gamma discovery, CLOB REST and WebSocket, and the Data API — with live prices and automatic reconnection.', pt: 'Dashboard de terminal em tempo real sobre as APIs públicas da Polymarket — descoberta Gamma, CLOB REST e WebSocket, e Data API — com preços ao vivo e reconexão automática.' }, stack: ['TypeScript', 'Bun', 'WebSocket', 'TUI'], category: 'Data / analytics', status: { en: 'Open source · public', pt: 'Open source · público' }, source: 'https://github.com/mneves75/polymarket-analyzer', openSource: true }),
];

export const projects: Project[] = [...curatedProjects, ...portfolioProjects];

export const recommendations = [
  { name: 'Décio Sousa', role: { en: 'Former colleague', pt: 'Ex-colega' }, quote: { en: 'For everyone who’s seen Pulp Fiction, Marcus is like this guy Wolf. He is basically the guy who arrives, draws the plan and solves the problem. Extremely pragmatic, focused and business-oriented, Marcus is one of the most perspicacious persons I know. He’s a great leader and very wary about transmitting feedback. He’s one I will always be available to work with.', pt: 'Para quem já viu Pulp Fiction, Marcus é como aquele cara, o Wolf. Ele é basicamente o cara que chega, traça o plano e resolve o problema. Extremamente pragmático, focado e orientado ao negócio, Marcus é uma das pessoas mais perspicazes que conheço. Ele é um ótimo líder e muito cuidadoso ao transmitir feedback. É alguém com quem sempre estarei disponível para trabalhar.' } },
  { name: 'Isabel Lopes Margarido, PhD', role: { en: 'Former teammate', pt: 'Ex-colega de equipe' }, quote: { en: 'Marcus detailed the expectations and stated the requirements objectively which simplified my specs and planning. Working with his teams he chose the right leadership style according with people\'s seniority. In my case we worked well as a team, as I had the independence I needed and just fed him the necessary outputs without a need of supervision or direct control. Marcus is attentive to people\'s needs and very supportive and friendly, which makes him a good team leader.', pt: 'Marcus detalhou as expectativas e apresentou os requisitos de forma objetiva, o que simplificou minhas especificações e meu planejamento. Ao trabalhar com suas equipes, ele escolheu o estilo de liderança adequado à senioridade das pessoas. No meu caso, trabalhamos bem como equipe, pois eu tinha a independência de que precisava e apenas lhe entregava os resultados necessários, sem necessidade de supervisão ou controle direto. Marcus está atento às necessidades das pessoas e é muito solidário e amigável, o que faz dele um bom líder de equipe.' } },
  { name: 'Bernardo Cabral Betim Paes Leme', role: { en: 'Former colleague', pt: 'Ex-colega' }, quote: { en: 'Marcus is a very smart person with deep technical skill, much focus on business and very reliable as well. He is always searching and researching new IT stuff. It was great to work with him.', pt: 'Marcus é uma pessoa muito inteligente, com profundo conhecimento técnico, muito foco no negócio e também muito confiável. Ele está sempre buscando e pesquisando coisas novas de TI. Foi ótimo trabalhar com ele.' } },
  { name: 'Paulo Grácio', role: { en: 'Former colleague', pt: 'Ex-colega' }, quote: { en: 'Marcus inspires a shared vision, always with a can-do attitude that people tend to follow. His enthusiasm and commitment to project goals easily spreads to the team, knowing how to keep the team together in common purpose toward the right objective. Excellent team-building skills, Marcus is a project leader that really knows how to progress from a group of strangers to single cohesive unit.', pt: 'Marcus inspira uma visão compartilhada, sempre com uma atitude de fazer acontecer que as pessoas tendem a seguir. Seu entusiasmo e comprometimento com os objetivos do projeto se espalham facilmente pela equipe, e ele sabe manter o time unido em torno do objetivo certo. Excelentes habilidades de formação de equipes; Marcus é um líder de projetos que realmente sabe transformar um grupo de desconhecidos em uma unidade coesa.' } },
  { name: 'Roberto Cortez', role: { en: 'Former colleague', pt: 'Ex-colega' }, quote: { en: 'Marcus is an extremely dedicated professional, always ready to aim high and to take the next challenge. He does a great job on balancing all the different views of the work he has in hands. Because of his large IT experience, he is able to consistently achieve excellent results for his clients as well as insightful expertise for his team. It has been a pleasure and privilege to work with Marcus, and I look forward to doing so again in the future.', pt: 'Marcus é um profissional extremamente dedicado, sempre pronto para mirar alto e aceitar o próximo desafio. Ele faz um ótimo trabalho equilibrando todas as diferentes perspectivas do trabalho que tem em mãos. Por causa de sua vasta experiência em TI, consegue alcançar resultados excelentes de forma consistente para seus clientes, além de oferecer conhecimento valioso à sua equipe. Foi um prazer e um privilégio trabalhar com Marcus, e espero voltar a fazê-lo no futuro.' } },
  { name: 'Francisco Veiga', role: { en: 'Former colleague', pt: 'Ex-colega' }, quote: { en: 'Marcus is a very pragmatic guy, always aiming for the end goal. Full-filling the client\'s needs is its main objective, while at the same time being able to bring the expected value to the company. I have been learning a lot from his valuable experience as a project manager. He is also a relaxed and outgoing person, bringing a positive attitude to every one around. Very pleased to work with him! A++', pt: 'Marcus é um cara muito pragmático, sempre buscando o objetivo final. Atender às necessidades do cliente é seu principal objetivo, ao mesmo tempo em que consegue trazer o valor esperado para a empresa. Tenho aprendido muito com sua valiosa experiência como gerente de projetos. Ele também é uma pessoa descontraída e extrovertida, trazendo uma atitude positiva para todos ao seu redor. Muito satisfeito por trabalhar com ele! A++' } },
  { name: 'Marcus Pereira', role: { en: 'Former colleague', pt: 'Ex-colega' }, quote: { en: 'Brilliant professional with multiple skills, technical accuracy and always in an easy-going approach.', pt: 'Profissional brilhante, com múltiplas habilidades, precisão técnica e sempre com uma abordagem tranquila.' } },
];

export const principles = [
  { en: 'Ship beats perfect.', pt: 'Entregar o bom é melhor que não entregar o perfeito.' },
  { en: 'Clarity over cleverness.', pt: 'Clareza acima de esperteza.' },
  { en: 'Privacy is baseline, not feature.', pt: 'Privacidade é base, não feature.' },
  { en: 'Mobile-first is not optional.', pt: 'Mobile-first não é opcional.' },
] as Copy[];

export const range = [
  { en: 'Software engineering', pt: 'Engenharia de software', note: { en: 'Systems that survive contact with reality.', pt: 'Sistemas que sobrevivem ao contato com a realidade.' } },
  { en: 'Data & analytics', pt: 'Dados & analytics', note: { en: 'Evidence, not decorative dashboards.', pt: 'Evidência, não dashboards decorativos.' } },
  { en: 'AI systems', pt: 'Sistemas de IA', note: { en: 'Models inside useful constraints.', pt: 'Modelos dentro de restrições úteis.' } },
  { en: 'Mobile & local-first', pt: 'Mobile & local-first', note: { en: 'The device is often the right boundary.', pt: 'O dispositivo muitas vezes é a fronteira certa.' } },
  { en: 'Cloud & edge', pt: 'Cloud & edge', note: { en: 'Deployments with guardrails.', pt: 'Deploys com guardrails.' } },
];

export function projectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
