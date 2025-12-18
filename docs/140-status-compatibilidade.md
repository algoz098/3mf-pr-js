# Status de Compatibilidade — Bambu Studio

Este arquivo resume o que já implementamos na biblioteca (3mf-pr-js) e o que falta para atingir compatibilidade completa prática com o Bambu Studio.

**Observação**
- Bambu Studio é baseado em PrusaSlicer; ele recalcula o slicing e não depende da Extensão Slice.
- Focamos na estrutura 3MF Core + Production e recursos comuns que o Bambu Studio reconhece.

## Implementado
- Core 3MF
  - `model/resources/object(mesh|components)/build(item)`
  - `transform` em `item` e `component`
- Metadados
  - `metadata name="Title"`, `Author/Designer`, `Application`, etc.
- Materiais
  - `basematerials` com mapeamento de `pid/pindex` por objeto
  - Materiais por triângulo: `pid/p1/p2/p3` em `triangle`
- Extensão Production (opcional)
  - `xmlns:p`, `requiredextensions="p"`
  - `p:UUID` em `build`, `item`, `object`, `component`
  - Multifile: `p:path` em `item` + parts externos em `/3D/parts/*.model`
  - Assemblies: suporte a `p:path` em `<component>` (model raiz)
- Embalagem OPC/ZIP
  - `[Content_Types].xml` com defaults para `rels/model/png/jpg`
  - `[Content_Types].xml` com `<Override>` para root e external models
  - `/_rels/.rels` com Target absoluto para `/3D/3dmodel.model`
  - `/3D/_rels/3dmodel.model.rels` (quando há parts externos)
- Thumbnails
  - Suporte PNG e JPEG em `/Thumbnails/` ou `/Metadata/`
  - Relacionamento correto no `.rels` raiz
 - Texturas
  - `m:texture2d` com embalagem de imagem em `3D/Textures/` (PNG/JPEG)
  - `m:texture2dgroup` com UVs (`m:tex2coord`) e referência por `pid/p1/p2/p3`
  - Namespace `xmlns:m` e `recommendedextensions="m"`
- Validação
  - JSON Schema (Ajv) para entrada da API
  - Geometria: vertices finitos, índices válidos, winding order, manifold
- Materiais
  - `basematerials` com mapeamento de `pid/pindex` por objeto
  - Materiais por triângulo: `pid/p1/p2/p3` em `triangle`
  - Múltiplos conjuntos de `basematerials` com IDs diferentes
 - Ferramentas
  - API pública: `generate3MF()`, `validateSceneJSON`, `validateWindingOrder`, `validateManifold`
  - Tipos exportados: `Vec3`, `Triangle`, `Transform`, `SceneJSON`, `Generate3MFOptions`
  - Testes (Vitest): 58 testes cobrindo core, Production, validação, API de alto nível

## Em falta / A avaliar para 100%
- Texturas e UV mapping (se o Bambu Studio exibir)
  - Recursos de texturas/`texture2d` e mapeamento UV em triângulos
- Materiais avançados
  - Múltiplos conjuntos de `basematerials` e paletas mais ricas
  - Property Resources (cores/atributos além de `displaycolor`)
- Thumbnails por objeto
  - Relationships em `/3D/_rels/3dmodel.model.rels` para miniaturas específicas de objetos
- Triangle Sets (opcional)
  - Namespace `trianglesets` para agrupar triângulos
- Validação
  - Integração com `lib3mf` para validação de referências/índices/estrutura
- Configurações proprietárias de projeto (Perfis)
  - Perfis de impressora/filamento/slicing embutidos (Bambu/Prusa) — apenas se houver formato documentado; caso contrário, o Bambu Studio recalcula

### A partir da documentação interna (itens adicionais)
- ✅ `p:path` em `component` (multifile em assemblies)
  - Suporte no model raiz para componentes que referenciam objetos em outros `.model`
- ✅ Unidade `micron` (conformidade com Spec)
  - Enum atualizado: aceita `micron` e normaliza `micrometer` → `micron` para saída XML
- ✅ Thumbnails flexíveis (PNG/JPEG; `/Thumbnails` ou `/Metadata` + relationships)
  - `setThumbnail(data, ext, dir)` aceita `png|jpg` e diretório `Thumbnails|Metadata`
- ✅ Content Types `Override` para parts específicos
  - `[Content_Types].xml` inclui `<Override>` para root e external models
- ✅ JSON Schema da entrada + validação na API
  - Schema Ajv completo; validação antes de gerar via API
- ✅ Validadores de geometria (winding/índices/manifold básico)
  - `validateWindingOrder()` e `validateManifold()` exportados; checks em `addMesh()`
- ✅ Múltiplos conjuntos de `basematerials` com IDs customizados
  - `createBaseMaterialsSet(id)` e `addBaseMaterial(name, color, setId)`

## Como testar rapidamente
Gerar 3MF de exemplo via API:

```zsh
npm run build
node examples/generate-minimal.mjs
```

- Abrir `out-minimal.3mf` no Bambu Studio e verificar:
  - Escala/posição corretas
  - Objetos e components renderizados
  - Thumbnail do pacote (se fornecida)
  - Sem warnings críticos

## Roadmap do 3mf-pr-js (foco compatibilidade)

Veja o plano detalhado em `docs/130-plano-implementacao.md`. Abaixo, os marcos e o backlog priorizado para atingir compatibilidade prática com o Bambu Studio.

### Fases & Marcos (resumo)
- Fase 2 — Core 3MF: serialização de `<model>`, metadados, `basematerials`, objetos/mesh, `build` e `transform`.
- Fase 3 — Production: `p:UUID` consistente, suporte a multifile com `p:path`, relationships entre models.
- Fase 4 — OPC: `[Content_Types].xml`, `_rels/.rels`, `3dmodel.model.rels`, thumbnails no pacote.
- Fase 5 — API: `generate3MF()`, opções (pretty/validate/production), tratamento de erros.
- Fase 6 — Testes: unitários + integração com Bambu Studio/PrusaSlicer; fixtures e exemplos.
- Fase 7 — Documentação: TypeDoc, README, tutoriais e exemplos práticos.
- Fase 8 — Otimização: performance, bundle, distribuição (CJS/ESM/UMD).

Meta de compatibilidade prática: concluir até o fim da Fase 6 (ver Cronograma em `docs/130-plano-implementacao.md`).

### Concluído (implementado)
- [x] Core 3MF: `model/resources/object(mesh|components)/build(item)` e `transform` em `item`/`component`
- [x] Metadados: `Title`, `Author/Designer`, `Application`, etc.
- [x] Materiais: `basematerials` e materiais por triângulo (`pid/p1/p2/p3`)
- [x] Materiais: múltiplos conjuntos de `basematerials` com IDs customizados
- [x] Materiais: sincronização automática entre root e external models
- [x] Extensão Production: `xmlns:p`, `requiredextensions="p"`, `p:UUID` em `build/item/object/component`
- [x] Multifile: `p:path` em `item` e `component` + parts externos em `/3D/parts/*.model`
- [x] Embalagem OPC: `[Content_Types].xml` (defaults + overrides), relationships corretos
- [x] Thumbnails: PNG/JPEG em `/Thumbnails` ou `/Metadata` com relationships
- [x] Validação: JSON Schema (Ajv), geometria (winding/manifold)
- [x] API: `generate3MF()` de alto nível, tipos exportados, opções de validação
- [x] Ferramentas: API pública completa, 58 testes (Vitest)
- [x] Validação lib3mf: wrapper WASM da biblioteca oficial
- [x] Triangle Sets: `t:trianglesets` com namespace `xmlns:t` e `recommendedextensions="t"`
- [x] Materials Extension: `m:colorgroup`/`m:color` com `xmlns:m` e `recommendedextensions="m"`; uso de `pid/pindex` em objetos e triângulos
- [x] Thumbnails por objeto: atributo `thumbnail` em `<object>` + relationship em `3D/_rels/3dmodel.model.rels`
- [x] Partnumbers: suporte a `partnumber` em `<object>` e `<item>`
- [x] MustPreserve: API para parts customizados com relationship `mustpreserve` e content types dinâmicos

### Backlog Prioritário (compatibilidade Bambu)
 - P0 — Essenciais
  - [x] Validação com `lib3mf` (estrutura, referências, índices)
  - [x] JSON Schema da entrada + validação na API
  - [x] Validadores de geometria (winding/índices/manifold básico)
  - [x] `p:path` em `component` para assemblies multifile
  - [x] Mapeamento consistente de `basematerials` entre root e parts externos
  - [x] Thumbnails flexíveis (PNG/JPEG; `/Thumbnails` ou `/Metadata` + relationships)
  - [x] Content Types `Override` quando necessário
  - [x] `unit` aceitar `micron` (conforme Spec)
  - [x] Relationships mínimos corretos (3dmodel/thumbnail)
  - [x] Avaliar `printticket` — **OPCIONAL**: Spec classifica como OPTIONAL; Bambu Studio não requer

- P1 — Relevantes
  - [x] Materiais avançados: Property Resources (CompositeMaterials e MultiMaterials)
  - [x] Thumbnails por objeto (relationships em `/3D/_rels/3dmodel.model.rels`)
  - [x] Triangle Sets (se útil no Bambu)
  - [x] Texturas (imagens) + UV mapping
    - Implementado: `m:texture2d` + `m:texture2dgroup` com UVs (XML e embalagem); lib3mf aceita `texture2d`; UVs validados estruturalmente

- P2 — Opcionais / Futuro
  - [ ] `production alternatives (pa:)` — avaliar benefício
  - [x] Relationship Types adicionais: `mustpreserve` (suportado via API); `printticket` (avaliado — OPCIONAL)
  - [ ] Extensões pós v1.0: Slice, Beam Lattice, integrações 3D

### Links úteis
- `docs/020-especificacao-core.md` — Core 3MF
- `docs/030-extensao-production.md` — Extensão Production
- `docs/050-opc-pacote.md` — Pacote OPC/ZIP
- `docs/110-exemplos-xml.md` — Exemplos de XML
- `docs/130-plano-implementacao.md` — Roadmap detalhado e cronograma

### Notas de compatibilidade (Bambu Studio)
- Visualização: `displaycolor` e Materials Extension afetam apenas visualização; o slicer recalcula materiais reais.
- Texturas: `m:texture2d` é aceito pela lib3mf; UVs via `m:texture2dgroup` validados estruturalmente.
- Property Resources: `m:compositematerials` e `m:multimaterials` são estruturais; aceitação prática depende do ambiente.
- PrintTicket: OPCIONAL pelo Spec; Bambu Studio não requer.
- Production Alternatives (`pa:`): em avaliação; implementar apenas se houver benefício claro.

### Matriz de Compatibilidade (Visual x Slice)
- **`displaycolor`/`basematerials`**: visual; slicing não usa cores para parâmetros.
- **`m:colorgroup`**: visual; exibição de cor por triângulo/objeto.
- **Texturas/UV (`m:texture2d`, `m:texture2dgroup`)**: visual; slicing não depende dos UVs.
- **Property Resources (`m:compositematerials`, `m:multimaterials`)**: estrutural/visual; suporte varia por consumidor.
- **Thumbnails (pacote/objeto)**: visual; não afeta slicing.
- **Triangle Sets (`t:`)**: organizacional; consumidor pode ignorar; não afeta slicing.
- **Production multifile (`p:path`)**: compatível; assemblies preservados; slicing usa geometria consolidada.
- **PrintTicket**: opcional/ignorado; não implementado; sem impacto.
