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
- Primeira aceitação independente: 14/14 PASS no workerd, builder gpt-6.1-sol confirmado e verificador gpt-6-astra. Revisão Spec: nenhum defeito confirmado. Revisão Standards: dois P3 corrigidos (foco azul e bordas retas); conferência focal confirmou as correções.
- Gate permanente agora prova swipe nativo nos dois sentidos, ampliação real por pinça e pausa pelo cabeçalho durante a virada, nos dois idiomas. Tipos e regressão completa passaram após retirar do teste a restauração de zoom desnecessária. Build final com LASTMOD_CHECK: 110 páginas e 108 URLs, manifesto atual.
- Reaceitação final completa: 14/14 PASS, 32 combinações de largura/par/idioma, 16 links 200 e mais de seis minutos sem autoplay. Artefato inalterado, sem rebuild: hash dos 313 arquivos dist/ e worker/ f0b7d868aa2875fcd9f4a1c294170315fa122141e471671a99013a8168ea1a01.
- Dois CIs passaram install/audit/check/build, mas a pinça permaneceu em escala 1; esperar a ampliação não resolveu. Experimento seguinte: pinça nativa 2/200, com controle positivo de viewport simples e assertion de zoom real no livro. Tipos e todos os 34 checks locais no workerd passaram. App congelado inalterado; CI e releases ainda pendentes.

- Terceiro CI: o controle positivo simples também falhou antes de abrir o livro. Duração maior não resolveu. Experimento seguinte usa eventos nativos de dois dedos e afastamento gradual; mantém as assertions de escala real e ausência de virada acidental.

- CI Linux no commit ce325a6c: PASS, incluindo controle positivo e pinça real nos dois idiomas; a correção afeta somente testes. Staging beta1 publicado no Worker 632c9013-c330-452b-9605-a7a874e3788b, somente workers.dev.
- Aceitação de publicação (congelada antes da promoção): verificador novo, fonte cega, somente URLs públicas. Conferir (1) livro manual nos dois idiomas da home do estúdio; (2) livro manual nos dois índices work pessoais, capas, Beta e ledger de 49 itens em desktop/mobile; (3) fallback sem JS e destinos acessíveis. Esta prova de publicação complementa os 14 critérios completos já aceitos no artefato local congelado.

## Correção de publicação — 1.13.1

O smoke público 1.13.0 encontrou CLS de 0,009645/0,005116 ao hover de uma linha da home, acima do contrato 0,001. Diagnóstico independente da suíte mostrou padding 0→13,6 px e retângulos do texto deslocados; uma amostra isolada ficou abaixo do orçamento, mas confirmou a geometria variável. Escolha: retirar o padding variável do hover, preservar alinhamento inicial, destaque de fundo e seta. Reservar o inset em todos os estados alteraria o alinhamento padrão; mover o texto por transform esconderia CLS, mas manteria o deslocamento indesejado.

1. Provar o controle vermelho de geometria e adicionar guarda permanente de posição/largura no hover.
2. Corrigir somente a regra global index-row; versão 1.13.1 e changelog.
3. Rodar check/build/test, diagnóstico de geometria e revisão adversarial específica.
4. Congelar novo artefato, verificar efeitos visuais e critérios completos novamente em contexto independente.
5. CI no commit final; beta v1.13.1-beta1, smoke staging; produção v1.13.1, mesmos inputs, smokes apex/www e aceitação pública independente.
6. Atualizar recibos/docs; integrar main e limpar somente recursos criados pela tarefa. Tags 1.13.0 preservadas.
