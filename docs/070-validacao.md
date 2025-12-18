# Validação e Checklist

Este documento define critérios e procedimentos de validação do 3MF gerado.

## Ferramentas
- `lib3mf`: validar a integridade do 3MF (estrutura, referências, índices)
- Slicers/Visualizadores: abrir o arquivo no Bambu Studio e outros (quando pertinente)

## Procedimentos
1) Validar pacote OPC: ZIP, `[Content_Types].xml`, `/_rels/.rels`
2) Validar part principal: `/3D/3dmodel.model` é alvo do relacionamento raiz
3) Validar Core:
   - `model` com `unit`
   - `resources` com `object`(s) válidos
   - `mesh` consistente (contagens, índices)
   - `build` com `item`(s) referenciando `objectid` existentes
4) (Se aplicável) Validar Extensões (Production, Slice): namespaces e estrutura
5) (Opcional) Thumbnails: relationship e content types
6) Abrir no Bambu Studio e verificar escala/posição e ausência de warnings críticos

## Checklist rápida
- [ ] OPC ok (ZIP + content types + relationships)
- [ ] Core ok (resources, build, metadados essenciais)
- [ ] Extensões ok (se usadas)
- [ ] Visualização ok (Bambu Studio)
- [ ] lib3mf sem erros
