# Referência Completa da API - 3mf-pr-js

Esta é a documentação completa de todas as classes, métodos e interfaces públicas da biblioteca `3mf-pr-js`.

## 📑 Índice

- [Funções de Alto Nível](#funções-de-alto-nível)
  - [generate3MF()](#generate3mf)
- [Classe Model](#classe-model)
  - [Configuração](#configuração)
  - [Metadados](#metadados)
  - [Materiais](#materiais)
  - [Objetos](#objetos)
  - [Build](#build)
  - [Extensões](#extensões)
  - [Geração](#geração)
- [Validação](#validação)
- [Tipos](#tipos)
- [Interfaces](#interfaces)

---

## Funções de Alto Nível

### generate3MF()

Gera um arquivo 3MF a partir de uma descrição JSON de cena.

**Assinatura:**
```typescript
function generate3MF(
  scene: SceneJSON,
  options?: Generate3MFOptions
): Promise<Buffer>
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `scene` | `SceneJSON` | Descrição da cena seguindo o schema JSON |
| `options` | `Generate3MFOptions` | Opções de geração (opcional) |

**Opções (`Generate3MFOptions`):**

```typescript
interface Generate3MFOptions {
  /** Habilitar Production extension (UUIDs, multifile) */
  production?: boolean;
  
  /** Validar entrada JSON antes de processar (padrão: true) */
  validate?: boolean;
  
  /** Lançar erro se validação falhar (padrão: true) */
  strictValidation?: boolean;
  
  /** Pretty-print XML (adiciona espaços, arquivos maiores) */
  prettyPrint?: boolean;
}
```

**Retorno:**
- `Promise<Buffer>` - Buffer contendo o arquivo 3MF

**Exceções:**
- `ValidationError` - Se validação falhar e `strictValidation` for `true`

**Exemplo:**
```typescript
import { generate3MF } from '3mf-pr-js';

const scene = {
  unit: 'millimeter',
  metadata: { Title: 'Meu Modelo' },
  objects: [{ type: 'mesh', vertices: [...], triangles: [...] }]
};

const buffer = await generate3MF(scene, {
  production: true,
  validate: true
});
```

---

## Classe Model

A classe `Model` oferece controle detalhado sobre a criação de arquivos 3MF.

### Construtor

```typescript
const model = new Model();
```

Cria uma nova instância do modelo 3MF.

---

## Configuração

### setUnit()

Define a unidade de medida do modelo.

**Assinatura:**
```typescript
setUnit(unit: Unit): void
```

**Parâmetros:**

| Tipo | Valores Aceitos |
|------|----------------|
| `Unit` | `'millimeter'` \| `'inch'` \| `'micron'` \| `'micrometer'` \| `'centimeter'` \| `'foot'` \| `'meter'` |

**Exemplo:**
```typescript
model.setUnit('millimeter');  // Padrão
model.setUnit('inch');
```

**Notas:**
- `'micrometer'` é normalizado para `'micron'` conforme especificação

### setLanguage()

Define o idioma dos metadados.

**Assinatura:**
```typescript
setLanguage(lang: string): void
```

**Parâmetros:**
- `lang` - Código de idioma (ex: `'en-US'`, `'pt-BR'`)

**Exemplo:**
```typescript
model.setLanguage('pt-BR');
```

### enableProduction()

Habilita a Production Extension (UUIDs, multifile, assemblies).

**Assinatura:**
```typescript
enableProduction(enable?: boolean): void
```

**Parâmetros:**
- `enable` - `true` para habilitar, `false` para desabilitar (padrão: `true`)

**Exemplo:**
```typescript
model.enableProduction(true);
```

---

## Metadados

### addMetadata()

Adiciona metadado customizado ao modelo.

**Assinatura:**
```typescript
addMetadata(name: string, value: string): void
```

**Parâmetros:**
- `name` - Nome do metadado
- `value` - Valor do metadado

**Exemplo:**
```typescript
model.addMetadata('Author', 'João Silva');
model.addMetadata('License', 'CC BY-SA 4.0');
```

### Helpers de Metadados

Métodos de conveniência para metadados bem conhecidos:

```typescript
setTitle(title: string): void
setDesigner(designer: string): void
setAuthor(author: string): void
setApplication(app: string): void
setCreationDate(isoDate: string): void
setModificationDate(isoDate: string): void
setDescription(desc: string): void
```

**Exemplo:**
```typescript
model.setTitle('Engrenagem Principal');
model.setDesigner('João Silva');
model.setCreationDate(new Date().toISOString());
model.setDescription('Engrenagem para impressora 3D');
```

---

## Materiais

### Base Materials

#### createBaseMaterialsSet()

Cria um novo conjunto de materiais base.

**Assinatura:**
```typescript
createBaseMaterialsSet(id?: number): number
```

**Parâmetros:**
- `id` - ID do conjunto (opcional, auto-gerado se omitido)

**Retorno:**
- ID do conjunto criado

**Exemplo:**
```typescript
const setId = model.createBaseMaterialsSet();
```

#### addBaseMaterial()

Adiciona um material base a um conjunto.

**Assinatura:**
```typescript
addBaseMaterial(
  name: string,
  displaycolor: string,
  setId?: number
): { pid: number; pindex: number }
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | `string` | Nome do material |
| `displaycolor` | `string` | Cor no formato `#RRGGBBAA` |
| `setId` | `number` | ID do conjunto (opcional, usa/cria primeiro se omitido) |

**Retorno:**
- Objeto com `pid` (ID do recurso) e `pindex` (índice no conjunto)

**Exemplo:**
```typescript
const red = model.addBaseMaterial('PLA Vermelho', '#FF0000FF');
const blue = model.addBaseMaterial('PLA Azul', '#0000FFFF');

// Múltiplos conjuntos
const setA = model.createBaseMaterialsSet(1);
const setB = model.createBaseMaterialsSet(2);
const redA = model.addBaseMaterial('PLA Red', '#FF0000FF', setA);
const blueB = model.addBaseMaterial('ABS Blue', '#0000FFFF', setB);
```

**Validação:**
- `displaycolor` deve estar no formato `#RRGGBBAA`
- Exemplos válidos: `#FF0000FF`, `#00FF00FF`, `#FFFFFF80`

### Color Groups (Materials Extension)

#### createColorGroup()

Cria um grupo de cores.

**Assinatura:**
```typescript
createColorGroup(id?: number): number
```

**Parâmetros:**
- `id` - ID do grupo (opcional)

**Retorno:**
- ID do grupo criado

#### addColorToGroup()

Adiciona uma cor a um grupo.

**Assinatura:**
```typescript
addColorToGroup(
  value: string,
  name?: string,
  groupId?: number
): { pid: number; pindex: number }
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `value` | `string` | Cor no formato `#RRGGBB` ou `#RRGGBBAA` |
| `name` | `string` | Nome da cor (opcional) |
| `groupId` | `number` | ID do grupo (opcional) |

**Retorno:**
- Objeto com `pid` e `pindex`

**Exemplo:**
```typescript
const groupId = model.createColorGroup();
const red = model.addColorToGroup('#FF0000', 'Vermelho', groupId);
const green = model.addColorToGroup('#00FF00', 'Verde', groupId);
```

### Texturas (Materials Extension)

#### addTexture()

Adiciona um recurso de textura 2D (PNG ou JPEG).

**Assinatura:**
```typescript
addTexture(
  data: Uint8Array,
  ext?: 'png' | 'jpg' | 'jpeg',
  id?: number
): number
```

**Parâmetros:**
- `data` - Dados binários da imagem
- `ext` - Extensão/formato (padrão: `'png'`)
- `id` - ID do recurso (opcional)

**Retorno:**
- ID da textura

**Exemplo:**
```typescript
import { readFile } from 'fs/promises';

const textureData = await readFile('texture.png');
const texId = model.addTexture(textureData, 'png');
```

#### createTextureGroup()

Cria um grupo de textura 2D com coordenadas UV.

**Assinatura:**
```typescript
createTextureGroup(
  texid: number,
  opts?: TextureGroupOptions,
  id?: number
): number
```

**Opções (`TextureGroupOptions`):**
```typescript
interface TextureGroupOptions {
  tilestyleu?: 'wrap' | 'mirror' | 'clamp';
  tilestylev?: 'wrap' | 'mirror' | 'clamp';
  filter?: 'auto' | 'nearest' | 'linear';
}
```

**Retorno:**
- ID do grupo de textura

**Exemplo:**
```typescript
const texId = model.addTexture(textureData);
const groupId = model.createTextureGroup(texId, {
  tilestyleu: 'wrap',
  tilestylev: 'wrap',
  filter: 'linear'
});
```

#### addTexCoord()

Adiciona coordenada UV a um grupo de textura.

**Assinatura:**
```typescript
addTexCoord(groupId: number, u: number, v: number): number
```

**Parâmetros:**
- `groupId` - ID do grupo de textura
- `u` - Coordenada U (0.0 a 1.0)
- `v` - Coordenada V (0.0 a 1.0)

**Retorno:**
- Índice da coordenada no grupo

**Exemplo:**
```typescript
const uv0 = model.addTexCoord(groupId, 0.0, 0.0);
const uv1 = model.addTexCoord(groupId, 1.0, 0.0);
const uv2 = model.addTexCoord(groupId, 0.5, 1.0);
```

### Composite Materials (Materials Extension)

#### createCompositeMaterials()

Cria um recurso de materiais compostos vinculado a um conjunto de base materials.

**Assinatura:**
```typescript
createCompositeMaterials(pid: number, id?: number): number
```

**Parâmetros:**
- `pid` - ID do conjunto de base materials
- `id` - ID do recurso (opcional)

**Retorno:**
- ID do recurso de composite materials

#### addComposite()

Adiciona uma mistura de materiais ao recurso de composite materials.

**Assinatura:**
```typescript
addComposite(compId: number, values: number[]): number
```

**Parâmetros:**
- `compId` - ID do composite materials
- `values` - Array de pesos (devem somar 1.0)

**Retorno:**
- Índice da mistura

**Exemplo:**
```typescript
const setId = model.createBaseMaterialsSet();
model.addBaseMaterial('Red', '#FF0000FF', setId);
model.addBaseMaterial('Blue', '#0000FFFF', setId);

const compId = model.createCompositeMaterials(setId);
const purple = model.addComposite(compId, [0.5, 0.5]); // 50% red + 50% blue

model.addMesh(vertices, triangles, {
  material: { pid: compId, pindex: purple }
});
```

**Validação:**
- `values` deve ser array não-vazio
- Todos os valores devem ser ≥ 0
- Soma dos valores deve ser 1.0 (tolerância de 1e-6)

### Multi-Materials (Materials Extension)

#### createMultiMaterials()

Cria um recurso multi-materials que combina múltiplos recursos de propriedades.

**Assinatura:**
```typescript
createMultiMaterials(pids: number[], id?: number): number
```

**Parâmetros:**
- `pids` - Array de IDs de recursos de propriedades (mínimo 2)
- `id` - ID do recurso (opcional)

**Retorno:**
- ID do multi-materials

#### addMultiMaterial()

Adiciona uma entrada multi-material combinando índices de múltiplos recursos.

**Assinatura:**
```typescript
addMultiMaterial(mmId: number, pindices: number[]): number
```

**Parâmetros:**
- `mmId` - ID do multi-materials
- `pindices` - Array de índices (um por recurso em `pids`)

**Retorno:**
- Índice da entrada

**Exemplo:**
```typescript
const setA = model.createBaseMaterialsSet(1);
const red = model.addBaseMaterial('Red', '#FF0000FF', setA);

const setB = model.createBaseMaterialsSet(2);
const smooth = model.addBaseMaterial('Smooth', '#FFFFFFFF', setB);

const mmId = model.createMultiMaterials([setA, setB]);
const combo = model.addMultiMaterial(mmId, [red.pindex, smooth.pindex]);

model.addMesh(vertices, triangles, {
  material: { pid: mmId, pindex: combo }
});
```

---

## Objetos

### addMesh()

Adiciona um objeto de malha triangular ao modelo.

**Assinatura:**
```typescript
addMesh(
  vertices: Vec3[],
  triangles: Triangle[],
  opts?: MeshOptions
): number
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `vertices` | `Vec3[]` | Array de vértices `[x, y, z]` |
| `triangles` | `Triangle[]` | Array de triângulos `[v1, v2, v3]` |
| `opts` | `MeshOptions` | Opções (opcional) |

**Opções (`MeshOptions`):**
```typescript
interface MeshOptions {
  name?: string;
  material?: { pid: number; pindex: number };
}
```

**Retorno:**
- ID do objeto criado

**Exemplo:**
```typescript
const vertices: Vec3[] = [
  [0, 0, 0],
  [10, 0, 0],
  [5, 10, 0]
];

const triangles: Triangle[] = [
  [0, 1, 2]
];

const red = model.addBaseMaterial('Red', '#FF0000FF');
const objId = model.addMesh(vertices, triangles, {
  name: 'Triângulo',
  material: red
});
```

**Validação:**
- `vertices` não pode estar vazio
- `triangles` não pode estar vazio
- Coordenadas devem ser números finitos
- Índices de triângulos devem ser inteiros válidos

**Notas:**
- Automaticamente adiciona um build item com transformação identidade
- Ordem dos vértices em triângulos determina a normal (regra da mão direita)

### addComponentObject()

Adiciona um objeto de componentes (assembly).

**Assinatura:**
```typescript
addComponentObject(
  name: string,
  components: ComponentRef[]
): number
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | `string` | Nome do assembly |
| `components` | `ComponentRef[]` | Array de referências a componentes |

**ComponentRef:**
```typescript
interface ComponentRef {
  objectid: number;
  transform?: Transform;
  path?: string;  // Para multifile (Production)
}
```

**Retorno:**
- ID do objeto de componentes

**Exemplo:**
```typescript
const cube1 = model.addMesh(vertices1, triangles1);
const cube2 = model.addMesh(vertices2, triangles2);

const assembly = model.addComponentObject('Assembly', [
  {
    objectid: cube1,
    transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0]
  },
  {
    objectid: cube2,
    transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0]  // 20mm à direita
  }
]);
```

### setTriangleMaterials()

Define materiais por triângulo (override do material padrão do objeto).

**Assinatura:**
```typescript
setTriangleMaterials(
  objectid: number,
  assignments: TriangleMaterialAssignment[]
): void
```

**TriangleMaterialAssignment:**
```typescript
interface TriangleMaterialAssignment {
  index: number;   // Índice do triângulo
  pid?: number;    // ID do recurso de propriedade
  p1?: number;     // Índice para vértice 1
  p2?: number;     // Índice para vértice 2
  p3?: number;     // Índice para vértice 3
}
```

**Exemplo:**
```typescript
const groupId = model.createColorGroup();
const red = model.addColorToGroup('#FF0000', 'Red', groupId);
const green = model.addColorToGroup('#00FF00', 'Green', groupId);

const objId = model.addMesh(vertices, triangles);

model.setTriangleMaterials(objId, [
  { index: 0, pid: groupId, p1: red.pindex, p2: red.pindex, p3: red.pindex },
  { index: 1, pid: groupId, p1: green.pindex, p2: green.pindex, p3: green.pindex }
]);
```

### setObjectPartNumber()

Define o partnumber de um objeto.

**Assinatura:**
```typescript
setObjectPartNumber(objectid: number, partnumber: string): void
```

**Exemplo:**
```typescript
model.setObjectPartNumber(objId, 'PN-12345');
```

---

## Build

### addBuildItem()

Adiciona um item ao build (plataforma de impressão).

**Assinatura:**
```typescript
addBuildItem(
  objectid: number,
  transform?: Transform,
  opts?: BuildItemOptions
): void
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `objectid` | `number` | ID do objeto a adicionar |
| `transform` | `Transform` | Transformação 4x3 (opcional, identidade se omitido) |
| `opts` | `BuildItemOptions` | Opções adicionais |

**BuildItemOptions:**
```typescript
interface BuildItemOptions {
  partnumber?: string;
}
```

**Exemplo:**
```typescript
// Identidade (sem transformação)
model.addBuildItem(objId);

// Com translação
model.addBuildItem(objId, [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  50, 50, 0  // x=50, y=50, z=0
]);

// Com partnumber
model.addBuildItem(objId, undefined, { partnumber: 'BI-001' });
```

**Notas sobre Transform:**

Matriz 4x3 no formato:
```
[m00, m01, m02,   // linha 1: eixo X transformado
 m10, m11, m12,   // linha 2: eixo Y transformado
 m20, m21, m22,   // linha 3: eixo Z transformado
 m30, m31, m32]   // linha 4: translação (x, y, z)
```

Transformações comuns:
```typescript
// Identidade
[1,0,0, 0,1,0, 0,0,1, 0,0,0]

// Translação (mover 10mm em X, 20mm em Y)
[1,0,0, 0,1,0, 0,0,1, 10,20,0]

// Escala 2x em todos os eixos
[2,0,0, 0,2,0, 0,0,2, 0,0,0]

// Rotação 90° em Z (sentido anti-horário)
[0,-1,0, 1,0,0, 0,0,1, 0,0,0]
```

---

## Extensões

### Triangle Sets

#### addTriangleSet()

Cria um conjunto de triângulos para organização lógica.

**Assinatura:**
```typescript
addTriangleSet(
  objectid: number,
  name: string,
  identifier: string
): number
```

**Parâmetros:**
- `objectid` - ID do objeto mesh
- `name` - Nome do conjunto
- `identifier` - Identificador único

**Retorno:**
- Índice do conjunto

#### addTriangleSetRefs()

Adiciona referências de triângulos a um conjunto.

**Assinatura:**
```typescript
addTriangleSetRefs(
  objectid: number,
  setIndex: number,
  refs: Array<number | TriangleSetRefRange>
): void
```

**TriangleSetRefRange:**
```typescript
interface TriangleSetRefRange {
  startindex: number;
  endindex: number;
}
```

**Exemplo:**
```typescript
const objId = model.addMesh(vertices, triangles);
const setIdx = model.addTriangleSet(objId, 'Top Faces', 't:top');

model.addTriangleSetRefs(objId, setIdx, [
  0,  // Triângulo 0
  1,  // Triângulo 1
  { startindex: 4, endindex: 7 }  // Triângulos 4-7
]);
```

### Production Extension

#### addExternalMesh()

Adiciona um mesh a um modelo externo (multifile).

**Assinatura:**
```typescript
addExternalMesh(
  path: string,
  name: string,
  vertices: Vec3[],
  triangles: Triangle[],
  opts?: MeshOptions
): { path: string; objectid: number }
```

**Parâmetros:**
- `path` - Caminho do modelo externo (deve começar com `3D/`)
- Demais parâmetros iguais a `addMesh()`

**Retorno:**
- Objeto com `path` e `objectid` para referência

**Exemplo:**
```typescript
model.enableProduction(true);

const ext = model.addExternalMesh(
  '3D/parts/widget.model',
  'Widget',
  vertices,
  triangles,
  { material: red }
);

model.addExternalBuildItem(ext.objectid, ext.path);
```

#### addExternalBuildItem()

Adiciona um build item referenciando objeto externo.

**Assinatura:**
```typescript
addExternalBuildItem(
  objectid: number,
  path: string,
  transform?: Transform
): void
```

**Nota:** Requer Production extension habilitada.

#### addPreservePart()

Adiciona um part customizado com relacionamento MustPreserve.

**Assinatura:**
```typescript
addPreservePart(
  path: string,
  data: Uint8Array | string,
  contentType?: string
): void
```

**Parâmetros:**
- `path` - Caminho do part (deve começar com `/`)
- `data` - Dados binários ou string
- `contentType` - MIME type (opcional, inferido de extensão conhecida)

**Exemplo:**
```typescript
model.addPreservePart(
  '/Metadata/notes.txt',
  'Informações importantes',
  'text/plain'
);

const jsonData = JSON.stringify({ custom: 'data' });
model.addPreservePart('/Metadata/config.json', jsonData, 'application/json');
```

### Thumbnails

#### setThumbnail()

Define thumbnail do modelo.

**Assinatura:**
```typescript
setThumbnail(
  data: Uint8Array,
  ext?: 'png' | 'jpg',
  dir?: 'Thumbnails' | 'Metadata'
): void
```

**Parâmetros:**
- `data` - Dados binários da imagem
- `ext` - Formato (padrão: `'png'`)
- `dir` - Diretório (padrão: `'Thumbnails'`)

**Exemplo:**
```typescript
import { readFile } from 'fs/promises';

const thumb = await readFile('preview.png');
model.setThumbnail(thumb, 'png', 'Thumbnails');
```

#### setObjectThumbnail()

Define thumbnail específico de um objeto.

**Assinatura:**
```typescript
setObjectThumbnail(
  objectid: number,
  data: Uint8Array,
  ext?: 'png' | 'jpg',
  dir?: 'Thumbnails' | 'Metadata'
): void
```

**Exemplo:**
```typescript
const objThumb = await readFile('object-preview.png');
model.setObjectThumbnail(objId, objThumb, 'png', 'Metadata');
```

---

## Geração

### to3MF()

Gera o arquivo 3MF como buffer.

**Assinatura:**
```typescript
async to3MF(): Promise<Buffer>
```

**Retorno:**
- `Promise<Buffer>` - Buffer contendo o arquivo 3MF (ZIP)

**Exemplo:**
```typescript
const buffer = await model.to3MF();
// Use o buffer conforme necessário
```

### writeToFile()

Gera e escreve o arquivo 3MF em disco.

**Assinatura:**
```typescript
async writeToFile(path: string): Promise<void>
```

**Parâmetros:**
- `path` - Caminho do arquivo a criar

**Exemplo:**
```typescript
await model.writeToFile('output.3mf');
console.log('Arquivo criado com sucesso!');
```

---

## Validação

### validateSceneJSON()

Valida uma cena JSON contra o schema.

**Assinatura:**
```typescript
function validateSceneJSON(
  scene: unknown
): ValidationResult
```

**Retorno:**
```typescript
interface ValidationResult {
  ok: boolean;
  errors?: string[];
  warnings?: string[];
}
```

**Exemplo:**
```typescript
import { validateSceneJSON } from '3mf-pr-js';

const result = validateSceneJSON(scene);
if (!result.ok) {
  console.error('Erros de validação:', result.errors);
}
```

### validateWindingOrder()

Valida a ordem de winding dos triângulos.

**Assinatura:**
```typescript
function validateWindingOrder(
  vertices: Vec3[],
  triangles: Triangle[]
): ValidationResult
```

**Exemplo:**
```typescript
import { validateWindingOrder } from '3mf-pr-js';

const result = validateWindingOrder(vertices, triangles);
if (!result.ok) {
  console.warn('Avisos de winding:', result.warnings);
}
```

### validateManifold()

Valida se a geometria é manifold (fechada).

**Assinatura:**
```typescript
function validateManifold(
  vertices: Vec3[],
  triangles: Triangle[]
): ValidationResult
```

**Exemplo:**
```typescript
import { validateManifold } from '3mf-pr-js';

const result = validateManifold(vertices, triangles);
if (!result.ok) {
  console.error('Erros de manifold:', result.errors);
}
```

### validate3MF()

Valida um arquivo 3MF usando lib3mf SDK.

**Assinatura:**
```typescript
async function validate3MF(
  buffer: Buffer
): Promise<ValidationResult>
```

**Retorno:**
```typescript
interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  code: number;
  message: string;
}
```

**Exemplo:**
```typescript
import { validate3MF, formatValidationResult } from '3mf-pr-js';

const buffer = await model.to3MF();
const result = await validate3MF(buffer);

console.log(formatValidationResult(result));
```

### formatValidationResult()

Formata resultado de validação para exibição.

**Assinatura:**
```typescript
function formatValidationResult(result: ValidationResult): string
```

---

## Tipos

### Vec3

Vetor 3D representando um ponto no espaço.

```typescript
type Vec3 = [number, number, number];
```

**Exemplo:**
```typescript
const vertex: Vec3 = [10.5, 20.0, 5.25];
```

### Triangle

Triângulo definido por três índices de vértices.

```typescript
type Triangle = [number, number, number];
```

**Exemplo:**
```typescript
const triangle: Triangle = [0, 1, 2];  // Conecta vértices 0, 1 e 2
```

### Transform

Matriz de transformação 4x3 (rotação + translação).

```typescript
type Transform = [
  number, number, number,  // m00 m01 m02
  number, number, number,  // m10 m11 m12
  number, number, number,  // m20 m21 m22
  number, number, number   // m30 m31 m32
];
```

**Exemplo:**
```typescript
// Identidade
const identity: Transform = [1,0,0, 0,1,0, 0,0,1, 0,0,0];

// Translação
const translation: Transform = [1,0,0, 0,1,0, 0,0,1, 10,20,30];

// Rotação 90° em Z
const rotation: Transform = [0,-1,0, 1,0,0, 0,0,1, 0,0,0];
```

---

## Interfaces

### SceneJSON

Schema de entrada para `generate3MF()`.

```typescript
interface SceneJSON {
  unit?: 'millimeter' | 'inch' | 'micron' | 'centimeter' | 'foot' | 'meter';
  lang?: string;
  production?: boolean;
  metadata?: Record<string, string>;
  basematerials?: Array<{
    name: string;
    displaycolor: string;
  }>;
  objects: Array<SceneObject>;
  build?: Array<{
    objectIndex: number;
    transform?: Transform;
  }>;
  external?: Array<ExternalObject>;
}

interface SceneObject {
  type: 'mesh' | 'components';
  name?: string;
  vertices?: Vec3[];      // Para mesh
  triangles?: Triangle[]; // Para mesh
  materialIndex?: number; // Para mesh
  components?: Array<{    // Para components
    objectIndex: number;
    transform?: Transform;
    path?: string;
  }>;
}
```

**Exemplo completo:**
```typescript
const scene: SceneJSON = {
  unit: 'millimeter',
  lang: 'pt-BR',
  production: true,
  metadata: {
    Title: 'Meu Modelo',
    Designer: 'João'
  },
  basematerials: [
    { name: 'PLA Red', displaycolor: '#FF0000FF' }
  ],
  objects: [
    {
      type: 'mesh',
      name: 'Cube',
      vertices: [[0,0,0], [10,0,0], ...],
      triangles: [[0,1,2], ...],
      materialIndex: 0
    }
  ],
  build: [
    { objectIndex: 0, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] }
  ]
};
```

---

## Exemplos de Uso Completo

### Exemplo Básico Completo

```typescript
import { Model } from '3mf-pr-js';

async function createModel() {
  const model = new Model();
  
  // Configuração
  model.setUnit('millimeter');
  model.setTitle('Exemplo Completo');
  model.setDesigner('João Silva');
  
  // Material
  const red = model.addBaseMaterial('PLA Red', '#FF0000FF');
  
  // Geometria
  const vertices: Vec3[] = [
    [0,0,0], [10,0,0], [10,10,0], [0,10,0],
    [0,0,10], [10,0,10], [10,10,10], [0,10,10]
  ];
  
  const triangles: Triangle[] = [
    [0,1,2], [0,2,3],
    [4,6,5], [4,7,6],
    [0,5,1], [0,4,5],
    [1,6,2], [1,5,6],
    [2,7,3], [2,6,7],
    [3,4,0], [3,7,4]
  ];
  
  // Criar objeto
  const cubeId = model.addMesh(vertices, triangles, {
    name: 'Cube',
    material: red
  });
  
  // Build item
  model.addBuildItem(cubeId, [1,0,0, 0,1,0, 0,0,1, 50,50,0]);
  
  // Gerar
  await model.writeToFile('complete-example.3mf');
}

createModel();
```

### Exemplo Avançado com Production Extension

```typescript
import { Model } from '3mf-pr-js';
import { readFile } from 'fs/promises';

async function createAdvancedModel() {
  const model = new Model();
  
  // Habilitar Production
  model.enableProduction(true);
  
  // Configuração
  model.setUnit('millimeter');
  model.setTitle('Modelo Avançado');
  
  // Múltiplos conjuntos de materiais
  const pla = model.createBaseMaterialsSet(1);
  const abs = model.createBaseMaterialsSet(2);
  
  const plaRed = model.addBaseMaterial('PLA Red', '#FF0000FF', pla);
  const absBlue = model.addBaseMaterial('ABS Blue', '#0000FFFF', abs);
  
  // Objetos principais
  const obj1 = model.addMesh(vertices1, triangles1, {
    name: 'Part 1',
    material: plaRed
  });
  
  const obj2 = model.addMesh(vertices2, triangles2, {
    name: 'Part 2',
    material: absBlue
  });
  
  // Modelo externo
  const ext = model.addExternalMesh(
    '3D/parts/widget.model',
    'Widget',
    verticesExt,
    trianglesExt,
    { material: plaRed }
  );
  
  // Assembly
  const assembly = model.addComponentObject('Main Assembly', [
    { objectid: obj1, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
    { objectid: obj2, transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0] }
  ]);
  
  // Build
  model.addBuildItem(assembly, [1,0,0, 0,1,0, 0,0,1, 50,50,0]);
  model.addExternalBuildItem(ext.objectid, ext.path, [1,0,0, 0,1,0, 0,0,1, 0,0,20]);
  
  // Thumbnail
  const thumb = await readFile('preview.png');
  model.setThumbnail(thumb);
  
  // Partnumbers
  model.setObjectPartNumber(obj1, 'PN-001');
  model.setObjectPartNumber(obj2, 'PN-002');
  
  // Custom part
  model.addPreservePart('/Metadata/info.txt', 'Build info');
  
  // Gerar
  await model.writeToFile('advanced-model.3mf');
}

createAdvancedModel();
```

---

## Notas de Implementação

### Performance

- Use `generate3MF()` para casos simples
- Use `Model` API para controle fino e melhor performance em modelos complexos
- Evite validação em produção se os dados já foram validados

### Limites

- Número máximo de vértices: ~16 milhões (limitação de índices de triângulos)
- Tamanho de arquivo: Limitado pela memória disponível (arquivos são gerados em memória)

### Compatibilidade

- **Node.js**: ≥18.0.0
- **Slicers testados**: Bambu Studio, PrusaSlicer
- **3MF Spec**: v1.3 (Core), v1.0 (Production)

---

**Para mais informações, consulte:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Guia de início
- [EXAMPLES.md](./EXAMPLES.md) - Mais exemplos
- [CONCEPTS.md](./CONCEPTS.md) - Conceitos 3MF
- [Documentação técnica](./docs/) - Especificações detalhadas
