# Guia de Validação - 3mf-pr-js

Este guia explica como validar arquivos 3MF e geometrias usando `3mf-pr-js`.

## 📑 Tipos de Validação

1. **JSON Schema** - Valida estrutura de entrada
2. **Geometria** - Valida winding order e manifold
3. **lib3mf** - Valida estrutura 3MF e OPC

## JSON Schema Validation

### Validar SceneJSON

```typescript
import { validateSceneJSON } from '3mf-pr-js';

const scene = {
  unit: 'millimeter',
  objects: [{ type: 'mesh', vertices: [...], triangles: [...] }]
};

const result = validateSceneJSON(scene);
if (!result.ok) {
  console.error('Erros:', result.errors);
}
```

### Erros Comuns

**Formato de cor inválido:**
```typescript
// ❌ Errado
{ displaycolor: '#FF0000' }  // Falta alpha

// ✅ Correto
{ displaycolor: '#FF0000FF' }
```

**Índices de triângulos inválidos:**
```typescript
// ❌ Errado
triangles: [[0, 1, 10]]  // Índice 10 não existe

// ✅ Correto - verificar que índices < vertices.length
```

## Validação de Geometria

### Winding Order

Valida se normais apontam para fora:

```typescript
import { validateWindingOrder } from '3mf-pr-js';

const result = validateWindingOrder(vertices, triangles);
if (!result.ok) {
  console.warn('Avisos:', result.warnings);
  // Pode continuar, mas faces podem estar invertidas
}
```

**Correção manual:**
```typescript
// Inverter ordem de um triângulo
const triangle: Triangle = [0, 2, 1];  // Invertido de [0, 1, 2]
```

### Manifold Validation

Verifica se geometria é fechada e válida:

```typescript
import { validateManifold } from '3mf-pr-js';

const result = validateManifold(vertices, triangles);
if (!result.ok) {
  console.error('Erros:', result.errors);
  // Não deve continuar - geometria inválida
}
```

**Erros de manifold:**
- **Buracos** - Arestas com apenas 1 triângulo
- **Sobreposições** - Arestas com mais de 2 triângulos
- **Vértices isolados** - Vértices não referenciados

## Validação lib3mf

Valida arquivo 3MF completo usando SDK oficial:

```typescript
import { validate3MF, formatValidationResult } from '3mf-pr-js';

const buffer = await model.to3MF();
const result = await validate3MF(buffer);

console.log(formatValidationResult(result));

if (!result.ok) {
  for (const err of result.errors) {
    console.error(`[${err.code}] ${err.message}`);
  }
}
```

### Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 1001 | Invalid XML | Verificar estrutura do modelo |
| 1002 | Missing required attribute | Adicionar atributo faltante |
| 2001 | Invalid OPC package | Verificar estrutura ZIP |
| 3001 | Invalid triangle indices | Corrigir índices de triângulos |
| 4001 | Invalid material reference | Verificar pid/pindex |

## Fluxo de Validação Completo

```typescript
import {
  generate3MF,
  validateSceneJSON,
  validateWindingOrder,
  validateManifold,
  validate3MF,
  formatValidationResult
} from '3mf-pr-js';

async function generateWithFullValidation(scene: SceneJSON) {
  // 1. Validar JSON
  const jsonResult = validateSceneJSON(scene);
  if (!jsonResult.ok) {
    throw new Error(`JSON inválido: ${jsonResult.errors?.join(', ')}`);
  }
  
  // 2. Validar geometrias
  for (const obj of scene.objects) {
    if (obj.type === 'mesh') {
      const windingResult = validateWindingOrder(obj.vertices!, obj.triangles!);
      if (!windingResult.ok) {
        console.warn(`Winding warnings: ${windingResult.warnings?.join(', ')}`);
      }
      
      const manifoldResult = validateManifold(obj.vertices!, obj.triangles!);
      if (!manifoldResult.ok) {
        throw new Error(`Geometria não-manifold: ${manifoldResult.errors?.join(', ')}`);
      }
    }
  }
  
  // 3. Gerar 3MF
  const buffer = await generate3MF(scene, { validate: false });  // Já validamos
  
  // 4. Validar 3MF final
  const lib3mfResult = await validate3MF(buffer);
  if (!lib3mfResult.ok) {
    console.error(formatValidationResult(lib3mfResult));
    throw new Error('Validação lib3mf falhou');
  }
  
  console.log('✓ Todas as validações passaram!');
  return buffer;
}
```

## Debugging

### Visualizar Normais

```typescript
import { computeTriangleNormal } from '3mf-pr-js';

for (let i = 0; i < triangles.length; i++) {
  const normal = computeTriangleNormal(vertices, triangles[i]);
  console.log(`Triangle ${i} normal:`, normal);
  
  // Normal deve apontar para fora
  // Se aponta para dentro, inverter ordem dos vértices
}
```

### Detectar Triângulos Problemáticos

```typescript
function findDegenerateTriangles(vertices: Vec3[], triangles: Triangle[]) {
  const degenerate = [];
  
  for (let i = 0; i < triangles.length; i++) {
    const [v1, v2, v3] = triangles[i];
    if (v1 === v2 || v2 === v3 || v3 === v1) {
      degenerate.push(i);
    }
  }
  
  return degenerate;
}
```

---

Para mais informações:
- [API.md](./API.md) - Referência da API
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Problemas comuns
