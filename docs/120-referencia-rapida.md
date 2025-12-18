# Referência Rápida - 3MF Production Ready

Valores oficiais e requisitos para gerar 3MF compatível com Bambu Studio.

## Namespaces Oficiais

| Extensão | Namespace | Prefixo | Status |
|----------|-----------|---------|--------|
| **Core** | `http://schemas.microsoft.com/3dmanufacturing/core/2015/02` | (default) | **Obrigatório** |
| **Production** | `http://schemas.microsoft.com/3dmanufacturing/production/2015/06` | `p:` | **Recomendado** |
| **Production Alternatives** | `http://schemas.microsoft.com/3dmanufacturing/production/alternatives/2021/04` | `pa:` | Opcional |
| Triangle Sets | `http://schemas.microsoft.com/3dmanufacturing/trianglesets/2021/07` | `t:` | Opcional |
| Slice | `http://schemas.microsoft.com/3dmanufacturing/slice/2015/07` | `s:` | ❌ Não usar |

### Exemplo de declaração:
```xml
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"
       requiredextensions="p">
```

## Content Types Oficiais

| Tipo | Content Type |
|------|--------------|
| **3MF Package** | `model/3mf` |
| **3D Model Part** | `application/vnd.ms-package.3dmanufacturing-3dmodel+xml` |
| Relationships | `application/vnd.openxmlformats-package.relationships+xml` |
| PNG Image | `image/png` |
| JPEG Image | `image/jpeg` |

### Exemplo de [Content_Types].xml:
```xml
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" 
           ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" 
           ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="png" ContentType="image/png" />
</Types>
```

## Relationship Types Oficiais

| Tipo | URI |
|------|-----|
| **StartPart** (Model principal) | `http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel` |
| **Thumbnail** | `http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail` |
| PrintTicket | `http://schemas.microsoft.com/3dmanufacturing/2013/01/printticket` |
| MustPreserve | `http://schemas.openxmlformats.org/package/2006/relationships/mustpreserve` |

### Exemplo de /_rels/.rels:
```xml
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" 
                Target="/3D/3dmodel.model" Id="rel-1" />
  <Relationship Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail" 
                Target="/Metadata/thumbnail.png" Id="rel-0" />
</Relationships>
```

## UUIDs (Obrigatórios com Production Extension)

### Formato RFC 4122
- Pattern: `[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}`
- Lowercase hexadecimal
- Exemplo: `550e8400-e29b-41d4-a716-446655440000`

### Onde são obrigatórios:
```xml
<build p:UUID="96681a5d-5b0f-e592-8c51-da7ed587cb5f">
  <item objectid="2" 
        p:UUID="b3de5826-ccb6-3dbc-d6c4-29a2d730766c" />
</build>

<object id="2" p:UUID="550e8400-e29b-41d4-a716-446655440000">
  <components>
    <component objectid="3" 
               p:UUID="12345678-1234-1234-1234-123456789abc" />
  </components>
</object>
```

## Estrutura Mínima do Pacote

```
arquivo.3mf (ZIP)
├── [Content_Types].xml          ← Content types
├── _rels/
│   └── .rels                     ← Root relationships
├── 3D/
│   ├── 3dmodel.model             ← Model principal (OBRIGATÓRIO)
│   └── _rels/
│       └── 3dmodel.model.rels    ← Model relationships (opcional)
└── Metadata/
    └── thumbnail.png             ← Thumbnail (opcional)
```

## Estrutura Multifile (Production)

```
arquivo.3mf (ZIP)
├── [Content_Types].xml
├── _rels/
│   └── .rels
├── 3D/
│   ├── build.model               ← Model raiz
│   ├── _rels/
│   │   └── build.model.rels      ← Refs para outros models
│   └── parts/
│       ├── widget.model          ← Model referenciado
│       └── gear.model            ← Model referenciado
└── Metadata/
    └── thumbnail.png
```

## Metadados Recomendados

| Chave | Descrição | Exemplo |
|-------|-----------|---------|
| `Title` | Nome do projeto | "Peça Exemplo" |
| `Designer` ou `Author` | Criador | "João Silva" |
| `Application` | App que gerou | "3mf-pr-js" |
| `CreationDate` | Data de criação | "2025-11-24T12:00:00Z" |
| `ModificationDate` | Última modificação | "2025-11-24T14:30:00Z" |
| `Description` | Descrição | "Protótipo v1" |

```xml
<metadata name="Title">Peça Exemplo</metadata>
<metadata name="Designer">João Silva</metadata>
<metadata name="Application">3mf-pr-js</metadata>
<metadata name="CreationDate">2025-11-24T12:00:00Z</metadata>
```

## Unidades Suportadas

| Valor | Descrição |
|-------|-----------|
| `micron` | Micrômetro |
| **`millimeter`** | **Milímetro (RECOMENDADO)** |
| `centimeter` | Centímetro |
| `inch` | Polegada |
| `foot` | Pé |
| `meter` | Metro |

```xml
<model unit="millimeter">
```

## Tipos de Objeto

| Tipo | Descrição | Uso |
|------|-----------|-----|
| **`model`** | **Objeto principal** | **Padrão** |
| `support` | Suporte (thin) | Estruturas de suporte |
| `solidsupport` | Suporte sólido | Suporte preenchido |
| `surface` | Superfície | Superfícies 2D |
| `other` | Outro | Não imprimível |

```xml
<object id="1" type="model">
```

## Transform Matrix (3x4)

### Formato
12 valores float: `m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32`

```
[m00 m01 m02]   ← Rotação/Escala
[m10 m11 m12]   ← Rotação/Escala
[m20 m21 m22]   ← Rotação/Escala
[m30 m31 m32]   ← Translação (x, y, z)
```

### Exemplos Comuns

**Identidade (sem transformação):**
```xml
transform="1 0 0 0 1 0 0 0 1 0 0 0"
```

**Translação para (50, 50, 0):**
```xml
transform="1 0 0 0 1 0 0 0 1 50 50 0"
```

**Escala 2x em todas dimensões:**
```xml
transform="2 0 0 0 2 0 0 0 2 0 0 0"
```

**Rotação 90° em Z + translação:**
```xml
transform="0 -1 0 1 0 0 0 0 1 100 100 0"
```

## Cores (sRGB)

### Formato
- 6 dígitos: `#RRGGBB` (opaco)
- 8 dígitos: `#RRGGBBAA` (com alpha)

### Exemplos
```xml
<base name="Branco" displaycolor="#FFFFFF" />
<base name="Preto" displaycolor="#000000" />
<base name="Vermelho" displaycolor="#FF0000" />
<base name="Verde" displaycolor="#00FF00" />
<base name="Azul" displaycolor="#0000FF" />
<base name="Cinza 50%" displaycolor="#808080" />
<base name="Transparente 50%" displaycolor="#FFFFFF80" />
```

**⚠️ IMPORTANTE**: `displaycolor` é apenas para renderização. Para cores reais de impressão, use Materials Extension.

## Triangles: Winding Order

Vértices devem estar em ordem **anti-horária** (counter-clockwise) quando vistos de fora:

```xml
<vertices>
  <vertex x="0" y="0" z="0" />  <!-- v0 -->
  <vertex x="1" y="0" z="0" />  <!-- v1 -->
  <vertex x="0" y="1" z="0" />  <!-- v2 -->
</vertices>
<triangles>
  <!-- Normal aponta para +Z -->
  <triangle v1="0" v2="1" v3="2" />
</triangles>
```

## Path Attribute (Multifile)

Para referenciar objetos em outros arquivos model:

```xml
<!-- No model raiz -->
<item objectid="5" 
      p:path="/3D/parts/widget.model"
      p:UUID="..." />

<component objectid="10"
           p:path="/3D/parts/gear.model"
           p:UUID="..." />
```

**Regras**:
- Path é **absoluto** do root do ZIP
- Começa com `/`
- Só pode ser usado no model raiz
- Model referenciado deve ter relationship em `.rels`

## Checklist Rápido

### Core (Mínimo)
- [ ] `/3D/3dmodel.model` existe
- [ ] `[Content_Types].xml` correto
- [ ] `/_rels/.rels` aponta para model
- [ ] Namespace Core declarado
- [ ] `unit="millimeter"` definida
- [ ] `<resources>` com pelo menos 1 `<object>`
- [ ] `<build>` com pelo menos 1 `<item>`
- [ ] Todos triangles com winding correto
- [ ] Mesh é manifold (edges consistentes)

### Production Extension
- [ ] Namespace Production declarado
- [ ] `requiredextensions="p"` no `<model>`
- [ ] UUID no `<build>`
- [ ] UUID em todos `<item>`
- [ ] UUID em todos `<object>`
- [ ] UUID em todos `<component>` (se houver)
- [ ] Se multifile: `p:path` correto e relationships

### Bambu Studio Específico
- [ ] **NÃO** incluir Slice Extension
- [ ] Metadados básicos presentes (Title, Author, etc.)
- [ ] Thumbnail PNG ou JPEG (recomendado)
- [ ] Unidade `millimeter` (padrão do Bambu)
- [ ] Testa com lib3mf antes de enviar

## Ferramentas de Validação

### lib3mf (Oficial)
```bash
# Validar arquivo
lib3mf validate arquivo.3mf

# Ver informações
lib3mf info arquivo.3mf
```

### 3MF Viewer
- [3D Viewer Online](https://www.3mf.io/3d-model-viewer/)
- Bambu Studio (importar e verificar)
- PrusaSlicer (importar e verificar)

## Links Úteis

- **3MF Core Spec**: https://github.com/3MFConsortium/spec_core
- **Production Extension**: https://github.com/3MFConsortium/spec_production
- **lib3mf SDK**: https://github.com/3MFConsortium/lib3mf
- **3MF Samples**: https://github.com/3MFConsortium/3mf-samples
- **RFC 4122 (UUIDs)**: https://www.rfc-editor.org/rfc/rfc4122

## Materiais & Texturas — Referência Rápida
- Exemplos completos de XML: veja `docs/110-exemplos-xml.md` (Texturas/UVs, Color Groups, Composite/Multi).
- Exemplo gerador via API: `examples/materials-api.mjs` (gera `out-materials.3mf`).
- Compatibilidade prática (Bambu Studio): veja `docs/140-status-compatibilidade.md` (matriz visual x slice).

## Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Invalid namespace | Namespace errado | Use URLs oficiais exatas |
| Missing UUID | Production sem UUIDs | Adicione UUIDs em build, items, objects |
| Invalid transform | Matriz incorreta | Use 12 valores float separados por espaço |
| Non-manifold mesh | Edges inconsistentes | Verifique winding e conectividade |
| Wrong winding | Normais invertidas | Inverta ordem dos vértices |
| Invalid path | Path relativo ou errado | Use path absoluto começando com `/` |
| Missing relationship | Model ref sem .rels | Adicione relationship no .rels |
| Wrong content type | Extension mapeada errado | Use content types oficiais |
