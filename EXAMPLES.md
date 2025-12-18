# Exemplos de Uso - 3mf-pr-js

Coleção de exemplos práticos para casos de uso comuns da biblioteca `3mf-pr-js`.

## 📑 Índice

- [Geometrias Básicas](#geometrias-básicas)
- [Materiais e Cores](#materiais-e-cores)
- [Assemblies e Componentes](#assemblies-e-componentes)
- [Texturas e UV Mapping](#texturas-e-uv-mapping)
- [Production Extension](#production-extension)
- [Modelos Complexos](#modelos-complexos)

---

## Geometrias Básicas

### Cubo

```typescript
import { Model, Vec3, Triangle } from '3mf-pr-js';

function createCube(size: number): { vertices: Vec3[]; triangles: Triangle[] } {
  const s = size;
  
  const vertices: Vec3[] = [
    [0, 0, 0], [s, 0, 0], [s, s, 0], [0, s, 0],  // Base
    [0, 0, s], [s, 0, s], [s, s, s], [0, s, s]   // Topo
  ];
  
  const triangles: Triangle[] = [
    [0, 1, 2], [0, 2, 3],  // Base
    [4, 6, 5], [4, 7, 6],  // Topo
    [0, 5, 1], [0, 4, 5],  // Frente
    [1, 6, 2], [1, 5, 6],  // Direita
    [2, 7, 3], [2, 6, 7],  // Trás
    [3, 4, 0], [3, 7, 4]   // Esquerda
  ];
  
  return { vertices, triangles };
}

const model = new Model();
const red = model.addBaseMaterial('PLA Red', '#FF0000FF');
const { vertices, triangles } = createCube(10);

model.addMesh(vertices, triangles, { name: 'Cube', material: red });
await model.writeToFile('cube.3mf');
```

### Pirâmide

```typescript
function createPyramid(base: number, height: number) {
  const h = base / 2;
  
  const vertices: Vec3[] = [
    [-h, -h, 0], [h, -h, 0], [h, h, 0], [-h, h, 0],  // Base
    [0, 0, height]  // Ápice
  ];
  
  const triangles: Triangle[] = [
    [0, 2, 1], [0, 3, 2],  // Base
    [0, 1, 4],  // Frente
    [1, 2, 4],  // Direita
    [2, 3, 4],  // Trás
    [3, 0, 4]   // Esquerda
  ];
  
  return { vertices, triangles };
}
```

### Cilindro

```typescript
function createCylinder(radius: number, height: number, segments: number = 32) {
  const vertices: Vec3[] = [];
  const triangles: Triangle[] = [];
  
  // Vértices da base
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    vertices.push([x, y, 0]);
  }
  
  // Vértices do topo
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    vertices.push([x, y, height]);
  }
  
  // Centro da base e topo
  vertices.push([0, 0, 0]);  // Índice: segments * 2
  vertices.push([0, 0, height]);  // Índice: segments * 2 + 1
  
  const centerBase = segments * 2;
  const centerTop = segments * 2 + 1;
  
  // Triângulos da base
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    triangles.push([centerBase, next, i]);
  }
  
  // Triângulos do topo
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    triangles.push([centerTop, segments + i, segments + next]);
  }
  
  // Triângulos das laterais
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    triangles.push([i, segments + i, next]);
    triangles.push([next, segments + i, segments + next]);
  }
  
  return { vertices, triangles };
}
```

### Esfera (Icosfera)

```typescript
function createSphere(radius: number, subdivisions: number = 2) {
  // Icosaedro base
  const t = (1 + Math.sqrt(5)) / 2;
  
  let vertices: Vec3[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ].map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [radius * x / len, radius * y / len, radius * z / len] as Vec3;
  });
  
  let triangles: Triangle[] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];
  
  // Subdividir (simplificado - implementação completa requer lógica de subdivisão)
  // Para produção, use biblioteca de geração de malhas
  
  return { vertices, triangles };
}
```

---

## Materiais e Cores

### Múltiplos Materiais

```typescript
const model = new Model();

// Criar materiais
const red = model.addBaseMaterial('PLA Red', '#FF0000FF');
const blue = model.addBaseMaterial('PLA Blue', '#0000FFFF');
const green = model.addBaseMaterial('PLA Green', '#00FF00FF');

// Criar objetos com materiais diferentes
const cube1 = model.addMesh(vertices1, triangles1, { 
  name: 'Red Cube', 
  material: red 
});

const cube2 = model.addMesh(vertices2, triangles2, { 
  name: 'Blue Cube', 
  material: blue 
});

const cube3 = model.addMesh(vertices3, triangles3, { 
  name: 'Green Cube', 
  material: green 
});

// Posicionar na build platform
model.addBuildItem(cube1, [1,0,0, 0,1,0, 0,0,1, 0,0,0]);
model.addBuildItem(cube2, [1,0,0, 0,1,0, 0,0,1, 20,0,0]);
model.addBuildItem(cube3, [1,0,0, 0,1,0, 0,0,1, 40,0,0]);
```

### Color Groups

```typescript
const model = new Model();

// Criar grupo de cores
const colorGroupId = model.createColorGroup();

const red = model.addColorToGroup('#FF0000', 'Red', colorGroupId);
const yellow = model.addColorToGroup('#FFFF00', 'Yellow', colorGroupId);
const blue = model.addColorToGroup('#0000FF', 'Blue', colorGroupId);

// Usar no objeto
const objId = model.addMesh(vertices, triangles, { 
  name: 'Colorful Object',
  material: red  // Cor padrão
});

// Override por triângulo
model.setTriangleMaterials(objId, [
  { index: 0, pid: colorGroupId, pindex: red.pindex },
  { index: 1, pid: colorGroupId, pindex: yellow.pindex },
  { index: 2, pid: colorGroupId, pindex: blue.pindex }
]);
```

### Gradiente por Vértice

```typescript
const model = new Model();
const groupId = model.createColorGroup();

const red = model.addColorToGroup('#FF0000', 'Red', groupId);
const green = model.addColorToGroup('#00FF00', 'Green', groupId);
const blue = model.addColorToGroup('#0000FF', 'Blue', groupId);

const objId = model.addMesh(
  [[0, 0, 0], [10, 0, 0], [5, 10, 0]],
  [[0, 1, 2]],
  { name: 'Gradient Triangle' }
);

// Cada vértice tem uma cor diferente -> gradiente
model.setTriangleMaterials(objId, [
  {
    index: 0,
    pid: groupId,
    p1: red.pindex,
    p2: green.pindex,
    p3: blue.pindex
  }
]);
```

### Composite Materials

```typescript
const model = new Model();

// Base materials
const setId = model.createBaseMaterialsSet();
const red = model.addBaseMaterial('Red Base', '#FF0000FF', setId);
const blue = model.addBaseMaterial('Blue Base', '#0000FFFF', setId);

// Composite materials (misturas)
const compId = model.createCompositeMaterials(setId);

const purple = model.addComposite(compId, [0.5, 0.5]);  // 50% red + 50% blue
const lightPurple = model.addComposite(compId, [0.7, 0.3]);  // 70% red + 30% blue
const darkPurple = model.addComposite(compId, [0.3, 0.7]);  // 30% red + 70% blue

// Usar nos objetos
model.addMesh(vertices1, triangles1, {
  name: 'Purple',
  material: { pid: compId, pindex: purple }
});

model.addMesh(vertices2, triangles2, {
  name: 'Light Purple',
  material: { pid: compId, pindex: lightPurple }
});
```

---

## Assemblies e Componentes

### Assembly Simples

```typescript
const model = new Model();
const red = model.addBaseMaterial('PLA Red', '#FF0000FF');

// Criar peças individuais
const part1 = model.addMesh(vertices1, triangles1, {
  name: 'Part 1',
  material: red
});

const part2 = model.addMesh(vertices2, triangles2, {
  name: 'Part 2',
  material: red
});

// Criar assembly
const assembly = model.addComponentObject('Main Assembly', [
  {
    objectid: part1,
    transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0]  // Posição original
  },
  {
    objectid: part2,
    transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0]  // 20mm à direita
  }
]);

// Build item referencia o assembly (não as partes individuais)
model.addBuildItem(assembly);
```

### Assembly Hierárquico

```typescript
const model = new Model();

// Nível 1: Peças básicas
const screw = model.addMesh(screwVertices, screwTriangles, { name: 'Screw' });
const nut = model.addMesh(nutVertices, nutTriangles, { name: 'Nut' });

// Nível 2: Sub-assembly (parafuso + porca)
const fastener = model.addComponentObject('Fastener', [
  { objectid: screw, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
  { objectid: nut, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,10] }
]);

// Nível 3: Assembly principal (múltiplos fasteners)
const mainAssembly = model.addComponentObject('Main Assembly', [
  { objectid: fastener, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
  { objectid: fastener, transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0] },
  { objectid: fastener, transform: [1,0,0, 0,1,0, 0,0,1, 40,0,0] }
]);

model.addBuildItem(mainAssembly);
```

### Array de Objetos

```typescript
function createObjectArray(
  model: Model,
  objId: number,
  rows: number,
  cols: number,
  spacing: number
): number {
  const components = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      components.push({
        objectid: objId,
        transform: [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          col * spacing,
          row * spacing,
          0
        ]
      });
    }
  }
  
  return model.addComponentObject(`${rows}x${cols} Array`, components);
}

// Uso
const cube = model.addMesh(cubeVertices, cubeTriangles);
const array = createObjectArray(model, cube, 5, 5, 15);  // 5x5 com espaçamento de 15mm
model.addBuildItem(array);
```

---

## Texturas e UV Mapping

### Textura Simples

```typescript
import { readFile } from 'fs/promises';

const model = new Model();

// Carregar textura
const textureData = await readFile('wood.png');
const texId = model.addTexture(textureData, 'png');

// Criar grupo de textura com coordenadas UV
const groupId = model.createTextureGroup(texId, {
  tilestyleu: 'wrap',
  tilestylev: 'wrap',
  filter: 'linear'
});

// Adicionar coordenadas UV (uma por vértice usado)
const uv0 = model.addTexCoord(groupId, 0.0, 0.0);  // Canto inferior-esquerdo
const uv1 = model.addTexCoord(groupId, 1.0, 0.0);  // Canto inferior-direito
const uv2 = model.addTexCoord(groupId, 1.0, 1.0);  // Canto superior-direito
const uv3 = model.addTexCoord(groupId, 0.0, 1.0);  // Canto superior-esquerdo

// Criar objeto
const objId = model.addMesh(
  [[0,0,0], [10,0,0], [10,10,0], [0,10,0]],
  [[0,1,2], [0,2,3]],
  { 
    name: 'Textured Quad',
    material: { pid: groupId, pindex: 0 }  // Placeholder, use UV nos triângulos
  }
);

// Mapear UVs para triângulos
model.setTriangleMaterials(objId, [
  { index: 0, pid: groupId, p1: uv0, p2: uv1, p3: uv2 },
  { index: 1, pid: groupId, p1: uv0, p2: uv2, p3: uv3 }
]);
```

### Cubo Texturizado

```typescript
async function createTexturedCube(model: Model, size: number, texturePath: string) {
  // Carregar textura
  const textureData = await readFile(texturePath);
  const texId = model.addTexture(textureData, 'png');
  const groupId = model.createTextureGroup(texId);
  
  // UVs para cada face (4 cantos)
  const uv00 = model.addTexCoord(groupId, 0.0, 0.0);
  const uv10 = model.addTexCoord(groupId, 1.0, 0.0);
  const uv11 = model.addTexCoord(groupId, 1.0, 1.0);
  const uv01 = model.addTexCoord(groupId, 0.0, 1.0);
  
  const { vertices, triangles } = createCube(size);
  const objId = model.addMesh(vertices, triangles, { name: 'Textured Cube' });
  
  // Mapear UVs para todas as faces
  const uvMappings = [
    // Base
    { index: 0, pid: groupId, p1: uv00, p2: uv10, p3: uv11 },
    { index: 1, pid: groupId, p1: uv00, p2: uv11, p3: uv01 },
    // Topo
    { index: 2, pid: groupId, p1: uv00, p2: uv11, p3: uv10 },
    { index: 3, pid: groupId, p1: uv00, p2: uv01, p3: uv11 },
    // Frente
    { index: 4, pid: groupId, p1: uv00, p2: uv10, p3: uv11 },
    { index: 5, pid: groupId, p1: uv00, p2: uv11, p3: uv01 },
    // ... continuar para todas as faces
  ];
  
  model.setTriangleMaterials(objId, uvMappings);
  
  return objId;
}
```

---

## Production Extension

### Multifile (Modelos Externos)

```typescript
const model = new Model();
model.enableProduction(true);

const red = model.addBaseMaterial('PLA Red', '#FF0000FF');

// Modelo principal
const mainPart = model.addMesh(mainVertices, mainTriangles, {
  name: 'Main Part',
  material: red
});

// Modelos externos (em arquivos separados)
const widget = model.addExternalMesh(
  '3D/parts/widget.model',
  'Widget',
  widgetVertices,
  widgetTriangles,
  { material: red }
);

const gear = model.addExternalMesh(
  '3D/parts/gear.model',
  'Gear',
  gearVertices,
  gearTriangles,
  { material: red }
);

// Build items
model.addBuildItem(mainPart, [1,0,0, 0,1,0, 0,0,1, 0,0,0]);
model.addExternalBuildItem(widget.objectid, widget.path, [1,0,0, 0,1,0, 0,0,1, 20,0,0]);
model.addExternalBuildItem(gear.objectid, gear.path, [1,0,0, 0,1,0, 0,0,1, 40,0,0]);

await model.writeToFile('multifile-model.3mf');
```

### Partnumbers

```typescript
const model = new Model();
model.enableProduction(true);

// Criar objetos com partnumbers
const bolt = model.addMesh(boltVertices, boltTriangles, { name: 'M8 Bolt' });
model.setObjectPartNumber(bolt, 'PN-BOLT-M8-20');

const washer = model.addMesh(washerVertices, washerTriangles, { name: 'M8 Washer' });
model.setObjectPartNumber(washer, 'PN-WASHER-M8');

const nut = model.addMesh(nutVertices, nutTriangles, { name: 'M8 Nut' });
model.setObjectPartNumber(nut, 'PN-NUT-M8');

// Assembly com partnumber
const fastener = model.addComponentObject('M8 Fastener Assembly', [
  { objectid: bolt, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
  { objectid: washer, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,20] },
  { objectid: nut, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,25] }
]);
model.setObjectPartNumber(fastener, 'PN-FASTENER-M8-COMPLETE');

// Build item com partnumber específico
model.addBuildItem(fastener, undefined, { partnumber: 'BUILD-001' });
```

### MustPreserve (Partes Customizadas)

```typescript
const model = new Model();
model.enableProduction(true);

// Adicionar informações de build
const buildInfo = JSON.stringify({
  date: new Date().toISOString(),
  operator: 'João Silva',
  machine: 'Bambu X1C',
  material: 'PLA Generic',
  settings: {
    layerHeight: 0.2,
    infill: 20,
    temperature: 210
  }
});

model.addPreservePart('/Metadata/build-info.json', buildInfo, 'application/json');

// Adicionar instruções de montagem
const instructions = `
Instruções de Montagem:
1. Insira o parafuso através do orifício
2. Adicione a arruela
3. Aperte a porca com torque de 5 Nm
`;

model.addPreservePart('/Metadata/instructions.txt', instructions, 'text/plain');

// Adicionar certificado (binário)
const certificateData = await readFile('certificate.pdf');
model.addPreservePart('/Metadata/certificate.pdf', certificateData, 'application/pdf');
```

---

## Modelos Complexos

### Modelo Completo com Todos os Recursos

```typescript
import { Model } from '3mf-pr-js';
import { readFile } from 'fs/promises';

async function createCompleteModel() {
  const model = new Model();
  
  // ===== CONFIGURAÇÃO =====
  model.setUnit('millimeter');
  model.enableProduction(true);
  
  // Metadados
  model.setTitle('Modelo Completo Exemplo');
  model.setDesigner('João Silva');
  model.setAuthor('João Silva');
  model.setApplication('3mf-pr-js v0.1.0');
  model.setCreationDate(new Date().toISOString());
  model.setDescription('Exemplo demonstrando todos os recursos da biblioteca');
  model.addMetadata('License', 'CC BY-SA 4.0');
  model.addMetadata('Project', 'Demo 3MF');
  
  // ===== MATERIAIS =====
  
  // Base materials - Set 1 (PLA)
  const plaSet = model.createBaseMaterialsSet(1);
  const plaRed = model.addBaseMaterial('PLA Red', '#FF0000FF', plaSet);
  const plaBlue = model.addBaseMaterial('PLA Blue', '#0000FFFF', plaSet);
  const plaGreen = model.addBaseMaterial('PLA Green', '#00FF00FF', plaSet);
  
  // Base materials - Set 2 (ABS)
  const absSet = model.createBaseMaterialsSet(2);
  const absBlack = model.addBaseMaterial('ABS Black', '#000000FF', absSet);
  const absWhite = model.addBaseMaterial('ABS White', '#FFFFFFFF', absSet);
  
  // Color group
  const colorGroup = model.createColorGroup();
  const yellow = model.addColorToGroup('#FFFF00', 'Yellow', colorGroup);
  const cyan = model.addColorToGroup('#00FFFF', 'Cyan', colorGroup);
  const magenta = model.addColorToGroup('#FF00FF', 'Magenta', colorGroup);
  
  // Composite materials
  const compId = model.createCompositeMaterials(plaSet);
  const purple = model.addComposite(compId, [0.5, 0.5, 0.0]);  // 50% red + 50% blue
  
  // Textura
  const woodTexture = await readFile('wood.png');
  const texId = model.addTexture(woodTexture, 'png');
  const texGroupId = model.createTextureGroup(texId, {
    tilestyleu: 'wrap',
    tilestylev: 'wrap'
  });
  const uv0 = model.addTexCoord(texGroupId, 0, 0);
  const uv1 = model.addTexCoord(texGroupId, 1, 0);
  const uv2 = model.addTexCoord(texGroupId, 1, 1);
  const uv3 = model.addTexCoord(texGroupId, 0, 1);
  
  // ===== OBJETOS =====
  
  // Objeto 1: Cubo simples com material base
  const cube1 = model.addMesh(...createCube(10), {
    name: 'Red Cube',
    material: plaRed
  });
  model.setObjectPartNumber(cube1, 'PN-CUBE-001');
  
  // Objeto 2: Cubo com múltiplas cores por triângulo
  const cube2 = model.addMesh(...createCube(10), {
    name: 'Multicolor Cube',
    material: yellow
  });
  model.setTriangleMaterials(cube2, [
    { index: 0, pid: colorGroup, pindex: yellow.pindex },
    { index: 1, pid: colorGroup, pindex: cyan.pindex },
    { index: 2, pid: colorGroup, pindex: magenta.pindex }
  ]);
  model.setObjectPartNumber(cube2, 'PN-CUBE-002');
  
  // Objeto 3: Pirâmide com composite material
  const pyramid = model.addMesh(...createPyramid(10, 15), {
    name: 'Purple Pyramid',
    material: { pid: compId, pindex: purple }
  });
  model.setObjectPartNumber(pyramid, 'PN-PYRAMID-001');
  
  // Objeto 4: Quad texturizado
  const quad = model.addMesh(
    [[0,0,0], [20,0,0], [20,20,0], [0,20,0]],
    [[0,1,2], [0,2,3]],
    { name: 'Textured Quad' }
  );
  model.setTriangleMaterials(quad, [
    { index: 0, pid: texGroupId, p1: uv0, p2: uv1, p3: uv2 },
    { index: 1, pid: texGroupId, p1: uv0, p2: uv2, p3: uv3 }
  ]);
  
  // ===== ASSEMBLIES =====
  
  // Sub-assembly
  const subAssembly = model.addComponentObject('Sub Assembly', [
    { objectid: cube1, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
    { objectid: pyramid, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,15] }
  ]);
  model.setObjectPartNumber(subAssembly, 'PN-SUBASSY-001');
  
  // Main assembly
  const mainAssembly = model.addComponentObject('Main Assembly', [
    { objectid: subAssembly, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
    { objectid: cube2, transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0] },
    { objectid: quad, transform: [1,0,0, 0,1,0, 0,0,1, -10,-10,0] }
  ]);
  model.setObjectPartNumber(mainAssembly, 'PN-MAINASSY-001');
  
  // ===== EXTERNAL MODELS =====
  
  const externalWidget = model.addExternalMesh(
    '3D/parts/widget.model',
    'Widget',
    ...createCylinder(5, 20),
    { material: absBlack }
  );
  
  // ===== BUILD =====
  
  model.addBuildItem(mainAssembly, [1,0,0, 0,1,0, 0,0,1, 100,100,0], {
    partnumber: 'BUILD-MAIN-001'
  });
  
  model.addExternalBuildItem(
    externalWidget.objectid,
    externalWidget.path,
    [1,0,0, 0,1,0, 0,0,1, 50,50,0]
  );
  
  // ===== THUMBNAILS =====
  
  const mainThumb = await readFile('thumbnail-main.png');
  model.setThumbnail(mainThumb, 'png', 'Thumbnails');
  
  const cubeThumb = await readFile('thumbnail-cube.png');
  model.setObjectThumbnail(cube1, cubeThumb, 'png', 'Metadata');
  
  // ===== CUSTOM PARTS =====
  
  const buildInfo = JSON.stringify({
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    configuration: 'production'
  });
  model.addPreservePart('/Metadata/build-info.json', buildInfo);
  
  // ===== GERAR =====
  
  await model.writeToFile('complete-model.3mf');
  console.log('✓ Modelo completo gerado com sucesso!');
}

createCompleteModel().catch(console.error);
```

---

## Dicas e Truques

### Reutilizar Geometria

```typescript
// Criar uma vez, usar múltiplas vezes via components
const bolt = model.addMesh(boltVertices, boltTriangles);

const boltArray = model.addComponentObject('Bolt Array', [
  { objectid: bolt, transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0] },
  { objectid: bolt, transform: [1,0,0, 0,1,0, 0,0,1, 10,0,0] },
  { objectid: bolt, transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0] }
]);
// Economiza memória e tamanho de arquivo
```

### Validar Durante Desenvolvimento

```typescript
import { validateWindingOrder, validateManifold } from '3mf-pr-js';

// Sempre validar geometria durante desenvolvimento
const windingResult = validateWindingOrder(vertices, triangles);
if (!windingResult.ok) console.warn('Winding issues:', windingResult.warnings);

const manifoldResult = validateManifold(vertices, triangles);
if (!manifoldResult.ok) throw new Error('Geometry is not manifold!');
```

### Performance com Muitos Objetos

```typescript
// Para muitos objetos similares, use components ao invés de duplicar geometria
// ❌ Ruim: duplica geometria
for (let i = 0; i < 100; i++) {
  model.addMesh(vertices, triangles);
}

// ✅ Bom: reutiliza geometria
const baseObj = model.addMesh(vertices, triangles);
const components = [];
for (let i = 0; i < 100; i++) {
  components.push({
    objectid: baseObj,
    transform: [1,0,0, 0,1,0, 0,0,1, i*10, 0, 0]
  });
}
model.addComponentObject('Array', components);
```

---

Para mais informações, consulte:
- [API.md](./API.md) - Referência completa da API
- [CONCEPTS.md](./CONCEPTS.md) - Conceitos do formato 3MF
- [VALIDATION.md](./VALIDATION.md) - Guia de validação
