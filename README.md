# 3mf-pr-js

<div align="center">

**Biblioteca TypeScript/JavaScript para geração de arquivos 3MF (3D Manufacturing Format)**

[![npm version](https://img.shields.io/npm/v/3mf-pr-js.svg)](https://www.npmjs.com/package/3mf-pr-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

Biblioteca moderna e completa para criar arquivos 3MF production-ready compatíveis com Bambu Studio, PrusaSlicer e outros slicers profissionais.

[Início Rápido](#-instalação) • [Documentação](#-documentação) • [Exemplos](#-exemplos) • [API](#-api-reference) • [Contribuir](#-contribuindo)

</div>

---

## 📑 Índice

- [Características](#-características)
- [Instalação](#-instalação)
- [Uso Rápido](#-uso-rápido)
- [Recursos Avançados](#-recursos-avançados)
- [Documentação](#-documentação)
- [Exemplos](#-exemplos)
- [Testes](#-testes)
- [API Reference](#-api-reference)
- [Compatibilidade](#-compatibilidade)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🚀 Características

### Core 3MF
- ✅ **Especificação completa v1.3** - Suporte total à especificação 3MF Core
- ✅ **Geometria 3D** - Malhas triangulares com vértices e triângulos
- ✅ **Transformações** - Matrizes 4x3 para posicionamento e rotação
- ✅ **Unidades flexíveis** - millimeter, inch, micron, centimeter, foot, meter
- ✅ **Metadados** - Title, Designer, Author, Description e mais

### Extensões
- ✅ **Production Extension** - UUIDs, multifile, assemblies, partnumbers
- ✅ **Materials Extension** - Color groups, texturas, composite e multi-materials
- ✅ **Triangle Sets** - Agrupamento lógico de triângulos

### Materiais
- ✅ **Base Materials** - Múltiplos conjuntos com cores RGBA
- ✅ **Color Groups** - Paletas de cores reutilizáveis
- ✅ **Texturas** - PNG/JPEG com coordenadas UV
- ✅ **Composite Materials** - Misturas ponderadas de materiais
- ✅ **Multi-Materials** - Combinação de múltiplos recursos
- ✅ **Por triângulo** - Override de materiais por face

### Validação
- ✅ **JSON Schema** - Validação de entrada com AJV
- ✅ **Geometria** - Winding order e manifold checks
- ✅ **lib3mf** - Validação estrutural e OPC via SDK oficial
- ✅ **Relatórios detalhados** - Erros e warnings explicativos

### Otimização de Memória
- ✅ **TypedArrays** - Float32Array/Uint32Array para redução de 90%+ memória
- ✅ **Deduplicação de vértices** - Remove vértices duplicados automaticamente
- ✅ **Geometry pooling** - Reutiliza meshes idênticas
- ✅ **Estimativa de memória** - Análise de uso em tempo real
- ✅ **Suporte a modelos grandes** - Processa modelos 10-100x maiores

### Developer Experience
- ✅ **API simples** - Função de alto nível `generate3MF()` ou API fluente `Model`
- ✅ **TypeScript nativo** - Tipos completos e autocomplete
- ✅ **Thumbnails flexíveis** - PNG/JPEG em `/Thumbnails` ou `/Metadata`
- ✅ **Testado** - 76 testes cobrindo todos os recursos
- ✅ **Documentação extensa** - Guias, exemplos e referência completa

## 📦 Instalação

```bash
npm install 3mf-pr-js
```

## 🎯 Uso Rápido

### API de Alto Nível (Recomendado)

```typescript
import { generate3MF } from '3mf-pr-js';
import { writeFile } from 'fs/promises';

const scene = {
  unit: 'millimeter',
  metadata: {
    Title: 'My 3D Model',
    Designer: 'Your Name'
  },
  basematerials: [
    { name: 'PLA Red', displaycolor: '#FF0000FF' }
  ],
  objects: [
    {
      type: 'mesh',
      name: 'Cube',
      vertices: [
        [0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0],
        [0, 0, 10], [10, 0, 10], [10, 10, 10], [0, 10, 10]
      ],
      triangles: [
        [0, 1, 2], [0, 2, 3],
        [4, 6, 5], [4, 7, 6],
        [0, 5, 1], [0, 4, 5],
        [1, 6, 2], [1, 5, 6],
        [2, 7, 3], [2, 6, 7],
        [3, 4, 0], [3, 7, 4]
      ],
      materialIndex: 0
    }
  ]
};

// Gerar 3MF com validação e Production extension
const buffer = await generate3MF(scene, {
  production: true,
  validate: true
});

await writeFile('output.3mf', buffer);
```

### API Fluente (Controle Detalhado)

```typescript
import { Model } from '3mf-pr-js';

const model = new Model();

// Configuração
model.setUnit('millimeter');
model.enableProduction(true);
model.addMetadata('Title', 'Complex Model');

// Materiais
const red = model.addBaseMaterial('PLA Red', '#FF0000FF');
const blue = model.addBaseMaterial('PLA Blue', '#0000FFFF');

// Objetos
const cube = model.addMesh(
  [[0,0,0], [10,0,0], [10,10,0], [0,10,0], [0,0,10], [10,0,10], [10,10,10], [0,10,10]],
  [[0,1,2], [0,2,3], [4,6,5], [4,7,6], [0,5,1], [0,4,5], [1,6,2], [1,5,6], [2,7,3], [2,6,7], [3,4,0], [3,7,4]],
  { name: 'Cube', material: red }
);

// Assembly
const assembly = model.addComponentObject('Assembly', [
  { objectid: cube, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
  { objectid: cube, transform: [1,0,0, 0,1,0, 0,0,1, 15,0,0] }
]);

// Build item
model.addBuildItem(assembly, [1,0,0, 0,1,0, 0,0,1, 50,50,0]);

// Gerar
const buffer = await model.to3MF();
await model.writeToFile('output.3mf');
```

## 🛠️ Geração via API

Use a API para gerar 3MFs programaticamente. Exemplos:

```bash
npm run build
node examples/materials-api.mjs
```

## 📋 Recursos Avançados

### Múltiplos Conjuntos de Materiais

```typescript
const model = new Model();

// Criar conjuntos separados
model.createBaseMaterialsSet(1); // PLA
model.createBaseMaterialsSet(2); // ABS

const pla_red = model.addBaseMaterial('PLA Red', '#FF0000FF', 1);
const abs_black = model.addBaseMaterial('ABS Black', '#000000FF', 2);

model.addMesh(vertices, triangles, { material: pla_red });
model.addMesh(vertices2, triangles2, { material: abs_black });
```

### Multifile (Production)

```typescript
model.enableProduction(true);

// Criar part externo
const ext = model.addExternalMesh(
  '3D/parts/widget.model',
  'Widget',
  vertices,
  triangles,
  { material: myMaterial }
);

// Referenciar no build
model.addExternalBuildItem(ext.objectid, ext.path, transform);
```

### Validação de Geometria

```typescript
import { validateWindingOrder, validateManifold } from '3mf-pr-js';

// Verificar winding order
const windingResult = validateWindingOrder(vertices, triangles);
if (!windingResult.ok) {
  console.warn('Winding warnings:', windingResult.warnings);
}

// Verificar manifold
const manifoldResult = validateManifold(vertices, triangles);
if (!manifoldResult.ok) {
  console.error('Manifold errors:', manifoldResult.errors);
}
```

### Thumbnails

```typescript
import { readFile } from 'fs/promises';

// PNG em /Thumbnails (padrão)
const thumb = await readFile('thumbnail.png');
model.setThumbnail(thumb, 'png');

// JPEG em /Metadata
const jpg = await readFile('thumbnail.jpg');
model.setThumbnail(jpg, 'jpg', 'Metadata');

// Thumbnail por objeto
model.setObjectThumbnail(cube, thumb, 'png', 'Metadata');
```

### Otimização de Memória

```typescript
import { Model, deduplicateVertices, estimateMemoryUsage } from '3mf-pr-js';

const model = new Model();

// TypedArrays para eficiência máxima
const vertices = new Float32Array([/* ... */]);
const triangles = new Uint32Array([/* ... */]);

// Adicionar com deduplicação automática
model.addMeshOptimized(vertices, triangles, {
  name: 'Large Mesh',
  deduplicate: true,      // Remove vértices duplicados
  reuseGeometry: true,    // Reutiliza geometrias idênticas
});

// Estimar uso de memória
const usage = estimateMemoryUsage(vertices, triangles);
console.log(`Memória: ${(usage.total / 1024 / 1024).toFixed(2)} MB`);
console.log(`Economia potencial: ${usage.savings}`);

// Ver estatísticas do pool
const stats = model.getGeometryPoolStats();
console.log(`Geometrias únicas: ${stats.poolSize}`);
console.log(`Economia: ~${((stats.totalRefs - stats.poolSize) / stats.totalRefs * 100).toFixed(0)}%`);
```

> 💡 **Veja o guia completo:** [MEMORY_OPTIMIZATION.md](./MEMORY_OPTIMIZATION.md)

### Triangle Sets (Extensão)

```typescript
// Criar um conjunto de triângulos e adicionar referências
const idx = model.addTriangleSet(cube, 'Faces Superiores', 't:topFaces');
model.addTriangleSetRefs(cube, idx, [0, 1, { startindex: 2, endindex: 5 }]);
```

### Partnumbers e MustPreserve

```typescript
// Partnumber em objeto e build item
model.setObjectPartNumber(cube, 'PN-001');
model.addBuildItem(cube, undefined, { partnumber: 'BI-001' });

// Adicionar part customizado com MustPreserve
model.addPreservePart('/Metadata/notes.txt', 'Informações importantes');
```

### Materials Extension (Color Groups)

```typescript
// Criar grupo de cores e adicionar cores
const groupId = model.createColorGroup();
const red = model.addColorToGroup('#FF0000FF', 'Red', groupId);
const green = model.addColorToGroup('#00FF00FF', 'Green', groupId);

// Usar o grupo como default do objeto
const colored = model.addMesh(vertices, triangles, { name: 'Colored', material: red });

// Override por triângulo usando pid/p1..p3
model.setTriangleMaterials(colored, [
  { index: 0, pid: red.pid, p1: red.pindex, p2: red.pindex, p3: red.pindex },
  { index: 1, pid: green.pid, p1: green.pindex, p2: green.pindex, p3: green.pindex },
]);
```

### Texturas (Texture2D)

```typescript
import { readFile } from 'fs/promises';

// Adicionar um recurso de textura PNG/JPEG
const png = await readFile('texture.png');
const texId = model.addTexture(png, 'png');
// O recurso é emitido como `m:texture2d` e embalado em `3D/Textures/`
```

### Property Resources (Composite/Multi)

```typescript
// CompositeMaterials: mistura de entradas de um basematerials
const setId = model.createBaseMaterialsSet();
model.addBaseMaterial('Red', '#FF0000FF', setId);
model.addBaseMaterial('Blue', '#0000FFFF', setId);
const compId = model.createCompositeMaterials(setId);
const mix = model.addComposite(compId, [0.5, 0.5]); // soma=1.0
model.addMesh(vertices, triangles, { material: { pid: compId, pindex: mix } });

// MultiMaterials: combina recursos por índice (ex.: dois pids)
const setA = model.createBaseMaterialsSet();
const aMat = model.addBaseMaterial('A', '#FF0000FF', setA);
const setB = model.createBaseMaterialsSet();
model.addBaseMaterial('B', '#0000FFFF', setB);
const mmId = model.createMultiMaterials([setA, setB]);
const combo = model.addMultiMaterial(mmId, [aMat.pindex, 0]);
model.addMesh(vertices, triangles, { material: { pid: mmId, pindex: combo } });
```

## 📚 Documentação Completa

### Guias Principais

| Documento | Descrição | Público |
|-----------|-----------|---------|
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Tutorial passo-a-passo para iniciantes | 🟢 Iniciante |
| **[API.md](./API.md)** | Referência completa da API | 🔵 Intermediário/Referência |
| **[CONCEPTS.md](./CONCEPTS.md)** | Conceitos fundamentais do 3MF | 🔵 Intermediário |
| **[EXAMPLES.md](./EXAMPLES.md)** | Exemplos práticos de uso | 🟢 Todos |
| **[MEMORY_OPTIMIZATION.md](./MEMORY_OPTIMIZATION.md)** | 🚀 Otimização de memória e performance | 🔵 Intermediário |
| **[VALIDATION.md](./VALIDATION.md)** | Guia de validação | 🔵 Intermediário |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Solução de problemas comuns | 🟢 Todos |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Guia para contribuidores | 🟣 Avançado |
| **[CHANGELOG.md](./CHANGELOG.md)** | Histórico de mudanças | 📋 Referência |

### Documentação Técnica

Para documentação técnica detalhada, consulte a pasta [`docs/`](./docs/):

| Documento | Descrição |
|-----------|-----------|
| [**INDEX.md**](./docs/INDEX.md) | 📑 Índice navegável de toda documentação |
| [020-especificacao-core.md](./docs/020-especificacao-core.md) | Core 3MF Specification |
| [030-extensao-production.md](./docs/030-extensao-production.md) | Production Extension |
| [080-esquema-entrada.md](./docs/080-esquema-entrada.md) | JSON Schema |
| [110-exemplos-xml.md](./docs/110-exemplos-xml.md) | Exemplos XML |
| [120-referencia-rapida.md](./docs/120-referencia-rapida.md) | Referência rápida |
| [140-status-compatibilidade.md](./docs/140-status-compatibilidade.md) | Status de compatibilidade |

> 💡 **Dica:** Comece com [GETTING_STARTED.md](./GETTING_STARTED.md) se você é novo na biblioteca!

## 🧪 Testes

```bash
npm test           # Rodar todos os testes
npm run dev:test   # Watch mode
```

**Cobertura**: 58 testes passando
- Core 3MF (6 testes)
- Recursos avançados (12 testes)
- API generate3MF (9 testes)
- Validação (11 testes)

## 🎨 Exemplos

Veja a pasta `examples/`:

- `minimal.json` - Exemplo mínimo
- `complex.json` - Assembly com múltiplos objetos e materiais
- `api-usage.js` - Uso programático da API

## 📖 API Reference

### `generate3MF(scene, options)`

```typescript
interface Generate3MFOptions {
  production?: boolean;      // Habilitar Production extension
  validate?: boolean;        // Validar entrada (default: true)
  strictValidation?: boolean; // Throw em erro de validação (default: true)
}

function generate3MF(scene: SceneJSON, options?: Generate3MFOptions): Promise<Buffer>
```

### Classe `Model`

```typescript
class Model {
  // Configuração
  setUnit(unit: 'millimeter' | 'inch' | 'micron' | 'centimeter' | 'foot' | 'meter'): void
  setLanguage(lang: string): void
  enableProduction(enable?: boolean): void
  
  // Metadados
  addMetadata(name: string, value: string): void
  
  // Materiais
  createBaseMaterialsSet(id?: number): number
  addBaseMaterial(name: string, displaycolor: string, setId?: number): { pid: number; pindex: number }
  
  // Objetos
  addMesh(vertices: Vec3[], triangles: Triangle[], opts?: MeshOptions): number
  addComponentObject(name: string, components: ComponentRef[]): number
  setTriangleMaterials(objectid: number, assignments: TriangleMaterial[]): void
  
  // Build
  addBuildItem(objectid: number, transform?: Transform): void
  
  // Multifile
  addExternalMesh(path: string, name: string, vertices: Vec3[], triangles: Triangle[], opts?: MeshOptions): { path: string; objectid: number }
  addExternalBuildItem(objectid: number, path: string, transform?: Transform): void
  
  // Thumbnails
  setThumbnail(data: Uint8Array, ext?: 'png' | 'jpg', dir?: 'Thumbnails' | 'Metadata'): void
  
  // Geração
  to3MF(): Promise<Buffer>
  writeToFile(path: string): Promise<void>
}
```

### Tipos

```typescript
type Vec3 = [number, number, number];
type Triangle = [number, number, number];
type Transform = [
  number, number, number,  // m00 m01 m02
  number, number, number,  // m10 m11 m12
  number, number, number,  // m20 m21 m22
  number, number, number   // m30 m31 m32 (translation)
];
```

## 🎯 Compatibilidade

✅ **Testado com:**
- Bambu Studio
- PrusaSlicer
- lib3mf validator

✅ **Especificações:**
- 3MF Core Specification v1.3
- Production Extension v1.0
- OPC Package compliant
 
### Matriz de Compatibilidade (Bambu Studio)
- Basematerials/displaycolor: visual; slicing recalcula configurações.
- `m:colorgroup`: visual por objeto/triângulo; não afeta slicing.
- Texturas/UVs (`m:texture2d`/`m:texture2dgroup`): visual; lib3mf aceita `texture2d`; UVs são validados estruturalmente.
- Property Resources (`m:compositematerials`, `m:multimaterials`): estrutural/visual; suporte varia por consumidor.
- Thumbnails (pacote/objeto): apenas visual.
- Triangle Sets (`t:`): organizacional; não afeta slicing.
- Production multifile (`p:path`): assemblies preservados; slicer usa geometria consolidada.
- PrintTicket: opcional; Bambu Studio não requer.

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o roadmap em `docs/130-plano-implementacao.md`.

## 📄 Licença

MIT

## 🔗 Links Úteis

- [3MF Consortium](https://3mf.io/)
- [Core Specification](https://github.com/3MFConsortium/spec_core)
- [Production Extension](https://github.com/3MFConsortium/spec_production)
- [lib3mf SDK](https://github.com/3MFConsortium/lib3mf)

---

**Made with ❤️ for the 3D printing community**
