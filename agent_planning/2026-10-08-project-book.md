# Livro de projetos — mvneves.dev, v1.13.0

## O que a revisão mudou

Revisão adversarial específica (gpt-6-astra, contexto novo, somente leitura): colocar o livro em WorkIndex, fora dos filtros, e preservar HomePage. Usar os oito registros canônicos e links para estudos de caso; falhar se faltar algum. Adaptar movimento positivamente para `data-motion=on`, inclusive CSS quando o dono pausa durante a virada. Reutilizar capas responsivas e ignorar no gate de lazy loading somente imagens sem caixas renderizadas. Aceitar também a largura de 320 CSS px. Zoom nativo (`pan-y pinch-zoom`), fallback HTML, foco e ausência de autoplay continuam obrigatórios.

## Objetivo e escolha

Aplicar a apresentação de livro aos oito projetos escolhidos pelo dono, em português e inglês, mantendo o índice completo e os estudos de caso. Duas capas por abertura, quatro aberturas, botões, teclado e gesto horizontal. Rótulos Beta continuam explícitos.

Escolha: Astro estático e CSS/TypeScript nativos, aproveitando o comportamento já verificado no estúdio. Alternativa conservadora: carrossel por scroll-snap, mais simples mas sem a virada solicitada. Alternativa que desafia a premissa: manter a grade inteira, melhor para comparar todos simultaneamente; rejeitada porque o dono pediu livro. Em cinco anos, a lista HTML sem JavaScript continua navegável; não há biblioteca de animação a manter.

Fontes: [W3C WAI](https://www.w3.org/WAI/tutorials/carousels/), [APG](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/), [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).

## Execução e aceitação

1. Trabalhar em worktree limpo de origin/main; preservar integralmente feat/perf-security-1.13 e seus arquivos não commitados.
2. Ler HomePage, dados, WorkIndex, CSS, browser gate e política de deploy. Escrever teste de comportamento no gate existente e provar falha na versão anterior.
3. Adicionar componente e montagem nativa; adaptar tokens, motion e imagens 400/800/1600 existentes, sem novas dependências. Manter HomePage e índice completo; livro rotulado como seleção antes do índice em WorkIndex, com atalho para os filtros. As folhas não participam de data-project-row nem de seus contadores.
4. Executar check, build completo, test, audit e build com LASTMOD_CHECK. Conferir CSP real, desktop/mobile, duas línguas, foco, limites, gestos reais e zoom, estado pausado/reduced motion, limpeza das viradas rápidas, fallback sem JavaScript.
5. Revisão adversarial em contexto novo e mneves-verify independente pela superfície servida. Corrigir defeitos confirmados. Falhas do ambiente não contam como aprovação.
6. Atualizar versão, changelog, docs de design/produto/agentes e estado. Commit com caminhos próprios, push, integrar main sem reescrever histórico do bot. Tags beta e produção no commit do código.
7. Deploy staging Cloudflare no projeto e conta existentes, smoke público, promover os mesmos bytes a produção, smoke. Não migrar o site pessoal para o VPS.
8. Registrar commit, versões Worker, resultados e limitações. Remover apenas worktree, branch, recursos e temporários próprios depois da integração.

## Estado

- Worktree de origin/main 9f3f0b22 preparado; alterações anteriores preservadas.
- Chrome aborta dentro do sandbox; o mesmo comando com perfil temporário isolado fora do sandbox passou no teste público do estúdio. Gates do site pessoal usarão esse ambiente autorizado.
- Implementação e gates completos: check/build/test exit 0; 110 páginas, 108 URLs de sitemap, duas datas significativas alteradas. Duas auditorias exit 0, 321 pacotes sem vulnerabilidades, sem ignores. Versão 1.13.0; Astro resolve 7.3.8 no lockfile de Bun 1.3.14.
- Aceitação independente pelo workerd real em andamento; artefato estável durante a verificação. Revisão do código, CI e releases pendentes.
