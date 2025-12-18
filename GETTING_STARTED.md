# Guia de Início Rápido - 3mf-pr-js

Este guia irá ajudá-lo a começar a usar a biblioteca `3mf-pr-js` para gerar arquivos 3MF.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js** versão 18 ou superior
- **npm** ou **yarn** instalado
- Conhecimento básico de JavaScript/TypeScript
- (Opcional) Bambu Studio ou PrusaSlicer para testar os arquivos gerados

## 🔧 Instalação

### Criar um novo projeto

```bash
mkdir meu-projeto-3mf
cd meu-projeto-3mf
npm init -y
```

### Instalar a biblioteca

```bash
npm install 3mf-pr-js
```

### Configurar TypeScript (Opcional, mas recomendado)

```bash
npm install -D typescript @types/node
npx tsc --init
```

Atualize o `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

Atualize o `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 🎯 Seu Primeiro Arquivo 3MF

### Exemplo 1: Cubo Simples

Crie um arquivo `src/index.ts` (ou `index.js` para JavaScript):

```typescript
import { generate3MF } from '3mf-pr-js';
import { writeFile } from 'fs/promises';

async function createCube() {
  const scene = {
    unit: 'millimeter',
    metadata: {
      Title: 'Meu Primeiro Cubo',
      Designer: 'Seu Nome'
    },
    basematerials: [
      { name: 'PLA Vermelho', displaycolor: '#FF0000FF' }
    ],
    objects: [
      {
        type: 'mesh',
        name: 'Cubo 10mm',
        vertices: [
          // Base (z=0)
          [0, 0, 0],    // 0
          [10, 0, 0],   // 1
          [10, 10, 0],  // 2
          [0, 10, 0],   // 3
          // Topo (z=10)
          [0, 0, 10],   // 4
          [10, 0, 10],  // 5
          [10, 10, 10], // 6
          [0, 10, 10]   // 7
        ],
        triangles: [
          // Base (z=0)
          [0, 1, 2], [0, 2, 3],
          // Topo (z=10)
          [4, 6, 5], [4, 7, 6],
          // Lado frontal (y=0)
          [0, 5, 1], [0, 4, 5],
          // Lado direito (x=10)
          [1, 6, 2], [1, 5, 6],
          // Lado traseiro (y=10)
          [2, 7, 3], [2, 6, 7],
          // Lado esquerdo (x=0)
          [3, 4, 0], [3, 7, 4]
        ],
        materialIndex: 0
      }
    ]
  };

  const buffer = await generate3MF(scene, {
    production: true,
    validate: true
  });

  await writeFile('cube.3mf', buffer);
  console.log('✓ Arquivo cube.3mf criado com sucesso!');
}

createCube().catch(console.error);
```

### Executar o código

```bash
# Se usando TypeScript
npm run build
npm start

# Se usando JavaScript direto
node index.js
```

Você terá um arquivo `cube.3mf` que pode ser aberto no Bambu Studio!

## 📐 Entendendo os Conceitos Básicos

### 1. Unidades

A unidade define a escala das coordenadas:

```typescript
unit: 'millimeter'  // 1 unidade = 1mm (padrão)
unit: 'inch'        // 1 unidade = 1 polegada
unit: 'centimeter'  // 1 unidade = 1cm
```

### 2. Vértices

Vértices são pontos 3D no espaço `[x, y, z]`:

```typescript
vertices: [
  [0, 0, 0],    // Origem
  [10, 0, 0],   // 10mm no eixo X
  [0, 10, 0],   // 10mm no eixo Y
  [0, 0, 10]    // 10mm no eixo Z
]
```

### 3. Triângulos

Triângulos conectam três vértices usando seus índices:

```typescript
triangles: [
  [0, 1, 2]  // Conecta vértices 0, 1 e 2
]
```

⚠️ **Importante**: A ordem dos vértices define a normal do triângulo (regra da mão direita). Para faces externas visíveis, use ordem anti-horária quando visto de fora.

### 4. Materiais

Materiais definem cor e propriedades:

```typescript
basematerials: [
  { 
    name: 'PLA Vermelho', 
    displaycolor: '#FF0000FF'  // RGBA: Red, Green, Blue, Alpha
  }
]
```

O formato é `#RRGGBBAA`:
- `#FF0000FF` = Vermelho opaco
- `#00FF00FF` = Verde opaco
- `#0000FFFF` = Azul opaco
- `#FFFFFF80` = Branco semi-transparente

## 🔨 Exemplos Práticos

### Exemplo 2: Múltiplos Objetos

```typescript
const scene = {
  unit: 'millimeter',
  basematerials: [
    { name: 'PLA Vermelho', displaycolor: '#FF0000FF' },
    { name: 'PLA Azul', displaycolor: '#0000FFFF' }
  ],
  objects: [
    {
      type: 'mesh',
      name: 'Cubo Grande',
      vertices: [ /* ... */ ],
      triangles: [ /* ... */ ],
      materialIndex: 0  // Vermelho
    },
    {
      type: 'mesh',
      name: 'Cubo Pequeno',
      vertices: [ /* ... */ ],
      triangles: [ /* ... */ ],
      materialIndex: 1  // Azul
    }
  ],
  build: [
    {
      objectIndex: 0,
      transform: [1,0,0, 0,1,0, 0,0,1, 0,0,0]  // Posição original
    },
    {
      objectIndex: 1,
      transform: [1,0,0, 0,1,0, 0,0,1, 20,0,0]  // 20mm à direita
    }
  ]
};
```

### Exemplo 3: Usando a API Fluente

Para mais controle, use a classe `Model`:

```typescript
import { Model } from '3mf-pr-js';

const model = new Model();

// Configuração
model.setUnit('millimeter');
model.enableProduction(true);
model.setTitle('Modelo Complexo');
model.setDesigner('Seu Nome');

// Materiais
const red = model.addBaseMaterial('PLA Vermelho', '#FF0000FF');
const blue = model.addBaseMaterial('PLA Azul', '#0000FFFF');

// Adicionar objetos
const cube1 = model.addMesh(vertices1, triangles1, { 
  name: 'Cubo 1', 
  material: red 
});

const cube2 = model.addMesh(vertices2, triangles2, { 
  name: 'Cubo 2', 
  material: blue 
});

// Build items com transformações
model.addBuildItem(cube1, [1,0,0, 0,1,0, 0,0,1, 0,0,0]);
model.addBuildItem(cube2, [1,0,0, 0,1,0, 0,0,1, 20,0,0]);

// Gerar arquivo
const buffer = await model.to3MF();
await writeFile('complex.3mf', buffer);
```

## 🎨 Adicionando Thumbnails

Thumbnails ajudam a identificar o modelo:

```typescript
import { readFile } from 'fs/promises';

const thumbnail = await readFile('preview.png');

// Com generate3MF - adicione à cena
const scene = {
  // ... resto da cena
};

// Com Model API
const model = new Model();
// ... construir modelo
model.setThumbnail(thumbnail, 'png', 'Thumbnails');
```

## ✅ Validação

A biblioteca valida automaticamente:

```typescript
const buffer = await generate3MF(scene, {
  validate: true,           // Valida entrada JSON
  strictValidation: true    // Lança erro se inválido
});
```

Se houver erros:

```typescript
try {
  const buffer = await generate3MF(scene, { validate: true });
} catch (error) {
  console.error('Validação falhou:', error.message);
  if (error.validationErrors) {
    error.validationErrors.forEach(err => console.error('  -', err));
  }
}
```

## 🔍 Debugging

### Verificar geometria manualmente

```typescript
import { validateWindingOrder, validateManifold } from '3mf-pr-js';

const windingResult = validateWindingOrder(vertices, triangles);
if (!windingResult.ok) {
  console.warn('Avisos de winding:', windingResult.warnings);
}

const manifoldResult = validateManifold(vertices, triangles);
if (!manifoldResult.ok) {
  console.error('Erros de manifold:', manifoldResult.errors);
}
```

### Validar arquivo 3MF gerado

```typescript
import { validate3MF, formatValidationResult } from '3mf-pr-js';

const buffer = await generate3MF(scene);
const result = await validate3MF(buffer);

console.log(formatValidationResult(result));
```

## 📚 Próximos Passos

Agora que você criou seu primeiro arquivo 3MF, explore:

1. **[API.md](./API.md)** - Referência completa da API
2. **[CONCEPTS.md](./CONCEPTS.md)** - Conceitos do formato 3MF
3. **[EXAMPLES.md](./EXAMPLES.md)** - Exemplos práticos avançados
4. **[VALIDATION.md](./VALIDATION.md)** - Guia de validação
5. **[docs/](./docs/)** - Documentação técnica detalhada

## 🆘 Problemas Comuns

### Erro: "triangle indices must be integers"

```typescript
// ❌ Errado
triangles: [[0.5, 1, 2]]

// ✅ Correto
triangles: [[0, 1, 2]]
```

### Erro: "displaycolor must be in #RRGGBBAA format"

```typescript
// ❌ Errado
displaycolor: '#FF0000'     // Falta alpha
displaycolor: 'red'         // Nome de cor não aceito

// ✅ Correto
displaycolor: '#FF0000FF'   // RGBA completo
```

### Modelo aparece muito pequeno/grande no slicer

Verifique a unidade:

```typescript
// Se suas coordenadas são em milímetros
unit: 'millimeter'

// Se suas coordenadas são em centímetros
unit: 'centimeter'
```

### Faces aparecem invertidas ou invisíveis

Verifique a ordem dos vértices nos triângulos (winding order):

```typescript
// Para faces externas visíveis, use ordem anti-horária
// quando visto de fora do objeto
triangles: [
  [0, 1, 2]  // Anti-horário de fora = normal apontando para fora
]
```

## 💡 Dicas

1. **Comece simples**: Teste com geometrias básicas (cubos, pirâmides)
2. **Valide sempre**: Use `validate: true` durante desenvolvimento
3. **Use TypeScript**: Aproveite o autocomplete e verificação de tipos
4. **Teste no slicer**: Sempre abra os arquivos gerados no Bambu Studio/PrusaSlicer
5. **Consulte exemplos**: A pasta `examples/` tem casos de uso reais

## 🔗 Links Úteis

- [Repositório GitHub](https://github.com/yourusername/3mf-pr-js)
- [3MF Consortium](https://3mf.io/)
- [Especificação 3MF Core](https://github.com/3MFConsortium/spec_core)
- [Bambu Studio](https://bambulab.com/en/download/studio)

---

**Pronto para mais?** Continue com o [guia de conceitos](./CONCEPTS.md) ou explore os [exemplos avançados](./EXAMPLES.md)!
