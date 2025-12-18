# Pacote 3MF — Estrutura OPC/ZIP

Um arquivo 3MF é um pacote ZIP que segue as Open Packaging Conventions (OPC). Este documento descreve a estrutura mínima necessária.

## Estrutura mínima de diretórios/arquivos
- `[Content_Types].xml` — mapeia tipos de conteúdo por extensão e por part
- `/_rels/.rels` — relacionamento raiz indicando o part principal do model
- `/3D/3dmodel.model` — part principal (XML do 3MF Core)
- (Opcional) `/Thumbnails/thumbnail.png` — miniatura
- (Opcional) Parts adicionais (texturas, anexos, etc.)

## Content Types (oficiais)
- `.model` → `application/vnd.ms-package.3dmanufacturing-3dmodel+xml`
- `.rels` → `application/vnd.openxmlformats-package.relationships+xml`
- `.png` → `image/png`
- `.jpg`/`.jpeg` → `image/jpeg`
- Pacote 3MF → `model/3mf` (MIME type)

## Relationships
- Em `/_rels/.rels`: relacionamento `Type` apontando para o part principal `/3D/3dmodel.model`
- Em `/3D/_rels/3dmodel.model.rels` (opcional): relacionar thumbnail(s), texturas e outros recursos

## Relationship Types (oficiais)
- **StartPart** (model principal): `http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel`
- **Thumbnail**: `http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail`
- **PrintTicket**: `http://schemas.microsoft.com/3dmanufacturing/2013/01/printticket`
- **MustPreserve**: `http://schemas.openxmlformats.org/package/2006/relationships/mustpreserve`

Exemplo de `/_rels/.rels`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" 
                Target="/3D/3dmodel.model" Id="rel-1" />
  <Relationship Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail" 
                Target="/Metadata/thumbnail.png" Id="rel-0" />
</Relationships>
```

## Thumbnails
- Armazenar em `/Thumbnails/` e declarar relationship a partir do model
- Úteis para UX em slicers/visualizadores

## Boas práticas
- Nomes estáveis e previsíveis de parts
- Evitar caracteres especiais nos caminhos
- Validar pacote (ZIP bem formado) e relacionamento principal

## Checklist (OPC)
- [ ] ZIP válido com `[Content_Types].xml` e `/_rels/.rels`
- [ ] Relationship raiz usa tipo: `http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel`
- [ ] Relationship raiz aponta para `/3D/3dmodel.model`
- [ ] Content type do model: `application/vnd.ms-package.3dmanufacturing-3dmodel+xml`
- [ ] Content types definidos para todos os parts (thumbnails, etc.)
- [ ] (Opcional) Thumbnail com relationship tipo: `...metadata/thumbnail`
