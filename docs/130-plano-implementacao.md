# Plano de Implementação - Biblioteca 3MF JavaScript

## Visão Geral

Plano completo para implementação da biblioteca `3mf-pr-js`, que gera arquivos 3MF "production-ready" compatíveis com Bambu Studio a partir de dados JavaScript/TypeScript.

## Objetivos

1. Criar biblioteca JavaScript/TypeScript para geração de arquivos 3MF
2. Implementar suporte completo ao Core 3MF v1.3
3. Implementar extensão Production (obrigatória para production-ready)
4. Garantir compatibilidade com Bambu Studio e outros slicers
5. Fornecer API simples e intuitiva
6. Garantir validação e geração de arquivos corretos

## Fases da Implementação

### Fase 1: Fundação e Estrutura do Projeto (Semana 1)

#### 1.1 Setup do Projeto
- [ ] Inicializar projeto Node.js com `npm init`
- [ ] Configurar TypeScript (`tsconfig.json`)
- [ ] Configurar estrutura de diretórios:
  ```
  src/
    ├── index.ts              # Export principal
    ├── types/                # Tipos TypeScript
    ├── core/                 # 3MF Core
    ├── extensions/           # Production, Slice
    ├── opc/                  # Empacotamento OPC/ZIP
    ├── utils/                # Utilitários
    └── validators/           # Validação
  test/
    ├── unit/                 # Testes unitários
    ├── integration/          # Testes de integração
    └── fixtures/             # Arquivos de teste
  examples/                   # Exemplos de uso
  ```
- [ ] Configurar ferramentas:
  - ESLint para linting
  - Prettier para formatação
  - Jest para testes
  - Rollup/esbuild para bundling

#### 1.2 Dependências Principais
```json
{
  "dependencies": {
    "jszip": "^3.10.1",           // Geração de ZIP
    "uuid": "^9.0.0",             // Geração de UUIDs RFC 4122
    "fast-xml-parser": "^4.3.0"   // Geração/parsing XML
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### 1.3 Tipos e Interfaces Base
Criar interfaces TypeScript baseadas em `docs/080-esquema-entrada.md`:

```typescript
// src/types/input.ts
export interface ProjectInput {
  metadata?: Metadata;
  unit?: Unit;
  resources: Resources;
  build: Build;
  extensions?: Extensions;
}

export interface Mesh {
  vertices: Vertex[];
  triangles: Triangle[];
}

export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export interface Triangle {
  v1: number;
  v2: number;
  v3: number;
  pid?: number;
  p1?: number;
  p2?: number;
  p3?: number;
}
// ... outros tipos
```

### Fase 2: Implementação do Core 3MF (Semana 2-3)

#### 2.1 Geração de XML do Model
- [ ] Implementar `ModelBuilder` class
- [ ] Gerar estrutura básica `<model>` com namespaces corretos
- [ ] Implementar serialização de metadados
- [ ] Implementar serialização de resources:
  - basematerials
  - objects com mesh
  - vertices e triangles
- [ ] Implementar serialização de build items
- [ ] Implementar transform matrix (3x4)

```typescript
// src/core/model-builder.ts
export class ModelBuilder {
  constructor(private input: ProjectInput) {}
  
  build(): string {
    // Gera XML do model
  }
  
  private buildResources(): XMLElement { }
  private buildBuild(): XMLElement { }
  private buildMetadata(): XMLElement[] { }
}
```

#### 2.2 Validação de Geometria
- [ ] Validar winding order dos triângulos
- [ ] Validar índices de vértices
- [ ] Validar manifold (opcional, mas recomendado)
- [ ] Validar valores numéricos (NaN, Infinity)

```typescript
// src/validators/geometry-validator.ts
export class GeometryValidator {
  validateMesh(mesh: Mesh): ValidationResult { }
  validateWindingOrder(triangle: Triangle, vertices: Vertex[]): boolean { }
  isManifold(mesh: Mesh): boolean { }
}
```

### Fase 3: Implementação da Extensão Production (Semana 3-4)

#### 3.1 UUID Management
- [ ] Implementar gerador de UUIDs v4
- [ ] Garantir unicidade de UUIDs no documento
- [ ] Adicionar UUIDs a:
  - build
  - items
  - objects
  - components

```typescript
// src/extensions/production/uuid-manager.ts
export class UUIDManager {
  private used = new Set<string>();
  
  generate(): string {
    // Gera UUID único
  }
  
  validate(uuid: string): boolean {
    // Valida formato RFC 4122
  }
}
```

#### 3.2 Multifile Support
- [ ] Implementar suporte a p:path attribute
- [ ] Gerenciar múltiplos arquivos .model
- [ ] Criar relationships entre models
- [ ] Validar referências entre arquivos

```typescript
// src/extensions/production/multifile-manager.ts
export class MultifileManager {
  addModel(path: string, model: ModelDefinition): void { }
  resolveReferences(): Map<string, string> { }
  buildRelationships(): Relationship[] { }
}
```

### Fase 4: Implementação do Pacote OPC (Semana 4-5)

#### 4.1 Content Types
- [ ] Implementar geração de `[Content_Types].xml`
- [ ] Registrar tipos padrão (rels, model, png, jpg)
- [ ] Suportar overrides para partes específicas

```typescript
// src/opc/content-types.ts
export class ContentTypesBuilder {
  addDefault(extension: string, contentType: string): void { }
  addOverride(partName: string, contentType: string): void { }
  build(): string { }
}
```

#### 4.2 Relationships
- [ ] Implementar geração de `_rels/.rels` (root)
- [ ] Implementar geração de relationships por arquivo
- [ ] Gerenciar IDs de relationships
- [ ] Suportar tipos de relacionamento:
  - 3dmodel
  - thumbnail
  - printticket (futuro)

```typescript
// src/opc/relationships.ts
export class RelationshipManager {
  addRelationship(type: string, target: string, id?: string): string { }
  buildRootRels(): string { }
  buildModelRels(modelPath: string): string { }
}
```

#### 4.3 Empacotamento ZIP
- [ ] Implementar estrutura de diretórios do pacote
- [ ] Adicionar arquivos na ordem correta
- [ ] Configurar compressão apropriada
- [ ] Gerar arquivo final .3mf

```typescript
// src/opc/package-builder.ts
export class PackageBuilder {
  async addPart(path: string, content: string | Uint8Array): Promise<void> { }
  async build(): Promise<Uint8Array> { }
}
```

### Fase 5: API Pública e Integração (Semana 5-6)

#### 5.1 API Principal
- [ ] Implementar função `generate3MF()`
- [ ] Implementar opções de geração
- [ ] Pipeline completo de geração
- [ ] Tratamento de erros

```typescript
// src/index.ts
export interface GenerateOptions {
  pretty?: boolean;          // XML formatado
  validate?: boolean;        // Validar antes de gerar
  production?: boolean;      // Habilitar extensão Production
  metadata?: Metadata;       // Metadados adicionais
}

export async function generate3MF(
  input: ProjectInput,
  options?: GenerateOptions
): Promise<Uint8Array> {
  // Pipeline de geração
}
```

#### 5.2 Validação
- [ ] Implementar validação de entrada (JSON Schema)
- [ ] Validação estrutural do 3MF
- [ ] Relatório de erros detalhado

```typescript
// src/validators/validator.ts
export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export function validateInput(input: unknown): ValidationResult { }
export function validate3MF(data: Uint8Array): Promise<ValidationResult> { }
```

### Fase 6: Testes e Validação (Semana 6-7)

#### 6.1 Testes Unitários
- [ ] Testes para ModelBuilder
- [ ] Testes para validadores
- [ ] Testes para UUIDManager
- [ ] Testes para ContentTypes/Relationships
- [ ] Testes para PackageBuilder
- [ ] Cobertura mínima: 80%

#### 6.2 Testes de Integração
- [ ] Gerar arquivos 3MF completos
- [ ] Validar com slicers reais:
  - Bambu Studio
  - PrusaSlicer
  - Cura (se possível)
- [ ] Comparar com arquivos de referência
- [ ] Testes de arquivos multifile

#### 6.3 Fixtures e Exemplos
- [ ] Cubo simples
- [ ] Múltiplos objetos
- [ ] Assembly com componentes
- [ ] Multifile com partes externas
- [ ] Objetos com materiais
- [ ] Transforms complexos

### Fase 7: Documentação e Exemplos (Semana 7-8)

#### 7.1 Documentação da API
- [ ] JSDoc completo em todas as funções públicas
- [ ] Gerar documentação com TypeDoc
- [ ] README com quick start
- [ ] Guia de migração/integração

#### 7.2 Exemplos de Uso
```javascript
// examples/01-simple-cube.js
const { generate3MF } = require('3mf-pr-js');

const input = {
  unit: 'millimeter',
  resources: {
    materials: [
      { id: 1, name: 'PLA White', color: '#FFFFFF' }
    ],
    objects: [
      {
        id: 2,
        type: 'model',
        name: 'Cube',
        materialId: 1,
        mesh: {
          vertices: [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            // ... outros vértices
          ],
          triangles: [
            { v1: 0, v2: 1, v3: 2 },
            // ... outros triângulos
          ]
        }
      }
    ]
  },
  build: {
    items: [
      { objectId: 2, transform: [1,0,0, 0,1,0, 0,0,1, 50,50,0] }
    ]
  }
};

const buffer = await generate3MF(input, { 
  production: true,
  validate: true 
});

require('fs').writeFileSync('output.3mf', buffer);
```

- [ ] Exemplo de objeto complexo
- [ ] Exemplo de multifile
- [ ] Exemplo de assembly
- [ ] Exemplo com thumbnails
- [ ] Integração com frameworks (Three.js, Babylon.js)

#### 7.3 Tutoriais
- [ ] Como criar um objeto simples
- [ ] Como trabalhar com transforms
- [ ] Como criar assemblies
- [ ] Como usar multifile
- [ ] Como validar arquivos

### Fase 8: Otimização e Polimento (Semana 8)

#### 8.1 Performance
- [ ] Benchmark de geração
- [ ] Otimizar serialização XML
- [ ] Otimizar compressão ZIP
- [ ] Cache de UUIDs e validações
- [ ] Memory profiling

#### 8.2 Qualidade do Código
- [ ] Code review completo
- [ ] Refatoração onde necessário
- [ ] Remover código morto
- [ ] Adicionar comentários onde necessário
- [ ] Seguir convenções do ecossistema

#### 8.3 Bundle e Distribuição
- [ ] Configurar build para CommonJS
- [ ] Configurar build para ES Modules
- [ ] Configurar build para browser (UMD)
- [ ] Minificação e tree-shaking
- [ ] Source maps

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "browser": "dist/index.umd.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## Cronograma Resumido

| Fase | Duração | Descrição |
|------|---------|-----------|
| 1 | 1 semana | Setup e estrutura |
| 2 | 2 semanas | Core 3MF |
| 3 | 2 semanas | Extensão Production |
| 4 | 2 semanas | Pacote OPC |
| 5 | 1 semana | API pública |
| 6 | 2 semanas | Testes |
| 7 | 2 semanas | Documentação |
| 8 | 1 semana | Otimização |
| **Total** | **13 semanas** | **~3 meses** |

## Dependências e Riscos

### Dependências Críticas
1. **JSZip**: Geração de arquivos ZIP - biblioteca madura e estável
2. **fast-xml-parser**: Serialização XML - considerar alternativas se necessário
3. **uuid**: Geração de UUIDs - padrão do ecossistema

### Riscos Identificados

#### Alto Risco
- **Compatibilidade com slicers**: Cada slicer pode ter quirks específicos
  - *Mitigação*: Testar extensivamente com Bambu Studio desde o início
  - *Mitigação*: Manter arquivos de teste de referência

#### Médio Risco
- **Complexidade de multifile**: Gerenciar referências entre arquivos
  - *Mitigação*: Implementar em fase separada com testes dedicados
  
- **Validação de geometria**: Algoritmos complexos (manifold check)
  - *Mitigação*: Implementar validações básicas primeiro, avançadas como opcional

#### Baixo Risco
- **Performance**: Geração pode ser lenta para meshes grandes
  - *Mitigação*: Otimizar na fase 8, não é bloqueante

## Critérios de Sucesso

### Funcional
- ✅ Gera arquivos 3MF válidos conforme especificação
- ✅ Bambu Studio abre e processa os arquivos sem erros
- ✅ Suporte completo à extensão Production
- ✅ API intuitiva e bem documentada

### Qualidade
- ✅ Cobertura de testes ≥ 80%
- ✅ Zero erros de linting
- ✅ Documentação completa
- ✅ Exemplos funcionais

### Performance
- ✅ Gerar arquivo simples em < 100ms
- ✅ Gerar arquivo complexo (10k triângulos) em < 1s
- ✅ Tamanho do bundle < 100KB (minified)

## Próximos Passos Imediatos

1. **Inicializar projeto** com `npm init` e configurar TypeScript
2. **Instalar dependências** principais (jszip, uuid, fast-xml-parser)
3. **Criar estrutura de diretórios** conforme planejado
4. **Implementar tipos base** em `src/types/`
5. **Criar primeiro teste** para validar setup

## Recursos Necessários

### Técnicos
- Node.js 18+ (LTS)
- Editor com suporte TypeScript (VS Code)
- Bambu Studio para testes
- Opcional: lib3mf para validação externa

### Documentação de Referência
- ✅ `docs/020-especificacao-core.md` - Especificação Core
- ✅ `docs/030-extensao-production.md` - Extensão Production
- ✅ `docs/050-opc-pacote.md` - Estrutura OPC
- ✅ `docs/110-exemplos-xml.md` - Exemplos práticos
- ✅ Especificação oficial 3MF: https://github.com/3MFConsortium/spec_core

## Manutenção Futura

### Extensões Planejadas (Pós v1.0)
- [ ] Slice Extension (se necessário)
- [ ] Materials & Properties Extension
- [ ] Beam Lattice Extension
- [ ] Suporte a texturas
- [ ] Validação com lib3mf integrada

### Melhorias Contínuas
- [ ] Otimizações de performance
- [ ] Novos exemplos e tutoriais
- [ ] Integração com frameworks 3D populares
 - [ ] Ferramentas adicionais via API (conversão de formatos programática)

---

**Versão**: 1.0  
**Última Atualização**: 2025-11-24  
**Autor**: 3mf-pr-js team
