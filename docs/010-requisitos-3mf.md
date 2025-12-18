# Requisitos e Escopo

Este documento define objetivo, escopo e requisitos para gerar um arquivo 3MF “production ready” compatível com Bambu Studio.

## Objetivo
- Gerar um pacote 3MF válido (conforme especificações 3MF Core + extensões necessárias), pronto para ser aberto no Bambu Studio sem erros, com metadados e recursos suficientes para impressão.

## Escopo
- 3MF Core: modelo (`/3D/3dmodel.model`), `resources`, `build`, metadados, unidades e transformações.
- Extensões relevantes: Production (obrigatória para cenários com múltiplas referências/assemblies), Slice (se necessário para slicers que a utilizem), e materiais/cores quando aplicável.
- Estrutura OPC/ZIP: `[Content_Types].xml`, `/_rels/.rels`, relationships do part principal, thumbnails opcionais.
- Compatibilidade com Bambu Studio: metadados úteis, thumbnails, convenções de nomes e observações práticas.

## Requisitos Funcionais
- RF-1: Criar pacote 3MF válido com part principal em `/3D/3dmodel.model`.
- RF-2: Suportar objetos mesh e suas instâncias em `build` com transformações.
- RF-3: Incluir metadados essenciais (autor, criação, unidade, etc.).
- RF-4: Suportar múltiplos objetos e assemblies (Production extension quando necessário).
- RF-5: Opcionalmente anexar thumbnail e ícone conforme relationships e content types.
- RF-6: Opcionalmente declarar materiais/cores básicos.
- RF-7: Opcionalmente declarar informações úteis para Bambu Studio (metadados de projeto não proprietários).

## Requisitos Não Funcionais
- RNF-1: Saída deve validar em ferramentas/SDK `lib3mf` sem erros.
- RNF-2: Estrita conformidade a namespaces e content types oficiais:
  - Core: `http://schemas.microsoft.com/3dmanufacturing/core/2015/02`
  - Production: `http://schemas.microsoft.com/3dmanufacturing/production/2015/06`
  - Content Type: `application/vnd.ms-package.3dmanufacturing-3dmodel+xml`
- RNF-3: Quando Production Extension for usada, UUIDs (RFC 4122) DEVEM ser incluídos em build, items, objects e components.
- RNF-4: Código em JavaScript/TypeScript, sem dependências pesadas desnecessárias.
- RNF-5: Estrutura e API estáveis, com JSON Schema para a entrada de dados.

## Premissas e Limitações
- Não incluir conteúdo proprietário do Bambu Studio; onde necessário, usar metadados genéricos.
- A extensão Slice só será usada quando houver ganho real de compatibilidade/qualidade.
- Alguns detalhes específicos do Bambu Studio serão inferidos por inspeção de projetos de exemplo e ajustados iterativamente.

## Critérios de Aceite
- CA-1: Arquivo abre no Bambu Studio sem warnings críticos.
- CA-2: Modelo aparece corretamente com posicionamento e escala esperados.
- CA-3: `lib3mf` valida o arquivo sem erros.
- CA-4: Documentação descreve todos os elementos incluídos e como reproduzi-los.
