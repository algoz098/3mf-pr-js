# 3MF Core — Estrutura e Elementos

Este documento descreve os elementos essenciais do 3MF Core necessários para gerar um projeto "production-ready".

**Nota**: Os valores de namespaces e content types aqui listados são oficiais da especificação 3MF Consortium versão 1.3+ e devem ser usados exatamente como especificado.

## Arquivo principal e namespaces
- Part principal: `/3D/3dmodel.model` (XML).
- Root element: `model`.
- Atributos comuns do root: `unit` (por ex.: `millimeter`), `xml:lang` (opcional), `requiredextensions` (opcional).
- Namespaces:
  - Core (default): `http://schemas.microsoft.com/3dmanufacturing/core/2015/02`
  - Extensões — declaradas com prefixos (ex.: `p:` para Production, `s:` para Slice), quando usadas:
    - Production: `http://schemas.microsoft.com/3dmanufacturing/production/2015/06`
    - Slice: `http://schemas.microsoft.com/3dmanufacturing/slice/2015/07` (raramente necessário)
    - Triangle Sets: `http://schemas.microsoft.com/3dmanufacturing/trianglesets/2021/07`

## Seções do `model`
- `metadata` (0..N): pares chave/valor. Convenções úteis: autor, app, data, descrição.
- `resources` (0..1): define objetos reutilizáveis (meshes, componentes, materiais, texturas, etc.).
  - `object` (0..N): entidade geométrica. Atributos:
    - `id` (obrigatório, único no documento)
    - `type` (ex.: `model`, `support`, etc.)
    - `pid`/`pindex` (opcional, para cores/materiais)
    - Conteúdo: `mesh` OU `components`.
  - `mesh`:
    - `vertices` > `vertex` (x,y,z, floats)
    - `triangles` > `triangle` (v1,v2,v3; opcionais `pid`/`p1`/`p2`/`p3` para materiais/cores)
  - `components` (para assemblies): lista de `component` referenciando `objectid` com `transform` (matriz 3x4 flatten 12 floats).
  - Materiais/Cores: recursos como `basematerials`, `color`, etc. (usar quando necessário).
- `build` (1..1): instâncias dos objetos para a cena a ser impressa.
  - `item` (1..N): referencia `objectid` + `transform` (posicionamento/rotação/escala) e metadados por item, se necessário.

## Unidades, coordenadas e transformações
- `unit`: recomendar `millimeter` para compatibilidade com slicers populares.
- Coordenadas: sistema cartesiano; z crescente para cima.
- Transform: 12 valores float em ordem de linha (matriz 3x4). A ausência de `transform` implica identidade.

## Metadados comuns
- Exemplos úteis (chave -> valor):
  - `Title`: nome do projeto/peça
  - `Designer` / `Author`: autor
  - `Application`: "3mf-pr-js"
  - `CreationDate`: ISO8601
  - `Description`: breve descrição

## Tópicos adicionais
- Materiais e cores (Core): `basematerials` + `base` com `name` e `displaycolor`; mapeados por `pid/pindex`.
- Thumbnails: adicionados como parts extras com relationships e content types adequados (ver `docs/050-opc-pacote.md`).
- Validação: use `lib3mf` para validar referências, índices e integridade.

## Checklist (Core)
- [ ] `/3D/3dmodel.model` com root `model` e `unit` definida
- [ ] Namespace Core declarado: `xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"`
- [ ] `resources` contendo `object`(s) com `id` único
- [ ] Cada `mesh` com `vertices` e `triangles` consistentes
- [ ] `build` com `item`(s) referenciando `objectid` existentes
- [ ] Metadados essenciais presentes (opcional mas recomendado)
- [ ] Namespaces de extensões declarados quando usados
