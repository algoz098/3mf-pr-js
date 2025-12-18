# Extensão 3MF Production

A extensão Production permite organizar assemblies, reutilizar geometrias e compor projetos de fabricação com múltiplas referências, facilitando cenários com muitos objetos/instâncias.

**Namespace oficial**: `http://schemas.microsoft.com/3dmanufacturing/production/2015/06` (prefixo `p:`)

**IMPORTANTE**: A extensão Production **REQUER** UUIDs em todos os elementos principais para rastreabilidade.

## Quando usar
- Múltiplos assemblies e reuso de geometrias comuns
- Cenários com catálogos/linhas de produção onde objetos são reutilizados
- Organização lógica de partes e subassemblies

## Conceitos
- Recursos Production ficam no escopo de `resources` e/ou sob elementos específicos da extensão.
- Objetos podem ser referenciados via caminhos relativos dentro do pacote 3MF ou dentro do mesmo `model`.
- **UUIDs obrigatórios**: cada `<build>`, `<item>`, `<object>` e `<component>` precisa de atributo `UUID`
- **Atributo path**: permite referenciar objetos em outros arquivos `.model` dentro do pacote 3MF
- **Multifile support**: facilita builds complexos com muitos objetos separados em arquivos distintos

## Elementos comuns (visão geral)
- `p:production` (container raiz da extensão, quando presente)
- Mapeamentos entre IDs lógicos e parts/objetos
- Referências a outros models/parts quando houver segmentação (avançado)

## UUIDs (Obrigatórios)

A extensão Production **REQUER** UUIDs (RFC 4122) em:
- `<build p:UUID="...">` — identificador único do build
- `<item p:UUID="...">` — identificador único de cada item no build
- `<object p:UUID="...">` — identificador único de cada objeto
- `<component p:UUID="...">` — identificador único de cada componente

Formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (lowercase hexadecimal)

Exemplo:
```xml
<build p:UUID="96681a5d-5b0f-e592-8c51-da7ed587cb5f">
  <item objectid="1" p:UUID="b3de5826-ccb6-3dbc-d6c4-29a2d730766c" />
</build>
```

## Atributo Path (Multifile)

O atributo `p:path` permite referenciar objetos em outros arquivos model:
- Usado em `<item>` e `<component>` (apenas no model raiz)
- Caminho absoluto do root do ZIP: `/3D/object1.model`
- Arquivos referenciados devem ter relationship no `.rels`

Exemplo:
```xml
<item objectid="5" p:path="/3D/parts/widget.model" p:UUID="..." />
```

## Interop e validação
- Mesmo com Production, o `build` do Core segue sendo a referência do que será impresso.
- Validar com `lib3mf` e abrir em slicers compatíveis para confirmar reuso e posicionamento.

## Checklist (Production)
- [ ] Namespace `p` declarado: `xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"`
- [ ] Extensão listada em `requiredextensions="p"` no `<model>`
- [ ] UUID presente em `<build p:UUID="...">`
- [ ] UUID presente em todos `<item p:UUID="...">`
- [ ] UUID presente em todos `<object p:UUID="...">`
- [ ] UUID presente em todos `<component p:UUID="...">`
- [ ] Se usar multifile: atributo `p:path` correto e relationships configuradas
- [ ] `build` reflete a composição final
- [ ] Referências entre objetos/parts válidas
