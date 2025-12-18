# Compatibilidade e Observações — Bambu Studio

Este documento compila observações práticas para gerar 3MF que abrem bem no Bambu Studio.

Nota: Bambu Studio é baseado em PrusaSlicer. Muitos metadados e convenções são herdados. Onde necessário, iremos confirmar por inspeção de arquivos `.3mf` gerados pelo Bambu Studio.

## Expectativas gerais
- O Bambu Studio consegue importar 3MF Core com meshes + build.
- Thumbnails são bem-vindos, mas opcionais.
- Metadados (autor, título, aplicação) ajudam na organização.

## Metadados úteis (não proprietários)
- `Title`, `Designer`/`Author`, `Description`, `Application`, `CreationDate`
- Evitar inserir chaves proprietárias específicas sem documentação oficial.

## Materiais e múltiplos objetos
- Multi‑objetos e assemblies funcionam quando `build` referencia corretamente os `objectid`.
- Para cenários de reuso/assemblies complexos, considerar Extensão Production.

## O que normalmente NÃO é necessário
- Extensão Slice: Bambu Studio tende a recalcular slicing.
- G‑code embutido: Bambu Studio gera o G‑code a partir do 3MF (projeto).

## Namespaces e Extensões Suportadas

### Obrigatórios/Recomendados:
- **Core**: `http://schemas.microsoft.com/3dmanufacturing/core/2015/02` (obrigatório)
- **Production**: `http://schemas.microsoft.com/3dmanufacturing/production/2015/06` (recomendado para multifile)

### Opcionais:
- **Materials/Property**: para definição de cores e materiais de impressão
- **Triangle Sets**: `http://schemas.microsoft.com/3dmanufacturing/trianglesets/2021/07`

### NÃO necessários:
- **Slice Extension**: Bambu Studio sempre recalcula slice
- **Beam Lattice**: não suportado
- **Volumetric**: não necessário para casos comuns

## Metadados Reconhecidos
O Bambu Studio reconhece e pode exibir:
- `Title`: nome do projeto
- `Designer`/`Author`: criador
- `Description`: descrição
- `Application`: aplicativo que gerou
- `CreationDate`: data de criação (ISO8601)
- `ModificationDate`: última modificação

## Checklist (Bambu)
- [ ] Abre sem warnings críticos
- [ ] Escala/posição corretas
- [ ] Multi‑objetos aparecem conforme `build`
- [ ] Thumbnail (se presente) exibida
