# Troubleshooting - 3mf-pr-js

Problemas comuns e suas soluções ao usar `3mf-pr-js`.

## Erros de Validação

### "displaycolor must be in #RRGGBBAA format"

**Causa:** Formato de cor incorreto

**Solução:**
```typescript
// ❌ Errado
displaycolor: '#FF0000'      // Falta alpha
displaycolor: 'red'          // Nome de cor não aceito
displaycolor: '#FF0000AA'    // Ordem incorreta

// ✅ Correto
displaycolor: '#FF0000FF'    // RRGGBBAA
```

### "triangle indices must be integers"

**Causa:** Índices de triângulos não são inteiros

**Solução:**
```typescript
// ❌ Errado
triangles: [[0.5, 1, 2]]

// ✅ Correto
triangles: [[0, 1, 2]]
```

### "triangle index out of range"

**Causa:** Índice referencia vértice inexistente

**Solução:**
```typescript
// Com 3 vértices, índices válidos são 0, 1, 2
const vertices = [[0,0,0], [1,0,0], [0,1,0]];

// ❌ Errado - índice 3 não existe
triangles: [[0, 1, 3]]

// ✅ Correto
triangles: [[0, 1, 2]]
```

## Problemas de Geometria

### Faces Aparecem Invertidas ou Invisíveis

**Causa:** Winding order incorreto

**Solução:**
```typescript
// Inverter ordem dos vértices
// De: [v0, v1, v2]
// Para: [v0, v2, v1]

// Ou validar e corrigir automaticamente
import { validateWindingOrder } from '3mf-pr-js';
const result = validateWindingOrder(vertices, triangles);
```

### Modelo Aparece Quebrado no Slicer

**Causa:** Geometria não-manifold

**Diagnóstico:**
```typescript
import { validateManifold } from '3mf-pr-js';
const result = validateManifold(vertices, triangles);
if (!result.ok) {
  console.error('Erros:', result.errors);
}
```

**Soluções:**
- Verificar se todas as arestas são compartilhadas por exatamente 2 triângulos
- Eliminar vértices duplicados
- Fechar buracos na malha

### Modelo Muito Pequeno ou Grande

**Causa:** Unidade incorreta

**Solução:**
```typescript
// Se coordenadas são em mm
model.setUnit('millimeter');

// Se coordenadas são em cm
model.setUnit('centimeter');
```

## Erros de Material

### "BaseMaterials set with id X already exists"

**Causa:** Tentativa de criar set com ID duplicado

**Solução:**
```typescript
// Deixar a biblioteca gerenciar IDs
const setId = model.createBaseMaterialsSet();  // ID automático

// Ou verificar antes de criar manualmente
if (!existsSet(1)) {
  model.createBaseMaterialsSet(1);
}
```

### Materiais Não Aparecem no Slicer

**Causa:** Referência incorreta de pid/pindex

**Solução:**
```typescript
// Sempre usar o retorno de addBaseMaterial
const red = model.addBaseMaterial('Red', '#FF0000FF');
model.addMesh(vertices, triangles, { material: red });  // ✓

// Não usar valores hardcoded
// material: { pid: 1, pindex: 0 }  // ✗ Perigoso
```

## Erros de Assembly

### "Object X not found"

**Causa:** Referência a objeto inexistente

**Solução:**
```typescript
// Criar objeto primeiro
const cube = model.addMesh(vertices, triangles);

// Depois referenciar
const assembly = model.addComponentObject('Assembly', [
  { objectid: cube, transform: [...] }
]);
```

### Componentes Mal Posicionados

**Causa:** Matriz de transformação incorreta

**Solução:**
```typescript
// Usar transformações conhecidas
const identity = [1,0,0, 0,1,0, 0,0,1, 0,0,0];
const translate = [1,0,0, 0,1,0, 0,0,1, x,y,z];

// Testar com identidade primeiro
{ objectid: cube, transform: identity }
```

## Problemas de Performance

### Geração Muito Lenta

**Causas e Soluções:**

1. **Muitos objetos duplicados**
   ```typescript
   // ❌ Ruim - duplica geometria
   for (let i = 0; i < 1000; i++) {
     model.addMesh(vertices, triangles);
   }
   
   // ✅ Bom - reutiliza geometria
   const base = model.addMesh(vertices, triangles);
   const array = model.addComponentObject('Array', 
     Array(1000).fill(null).map((_, i) => ({
       objectid: base,
       transform: [1,0,0, 0,1,0, 0,0,1, i*10, 0, 0]
     }))
   );
   ```

2. **Validação excessiva**
   ```typescript
   // Desabilitar em produção se dados já validados
   const buffer = await generate3MF(scene, { validate: false });
   ```

### Arquivo 3MF Muito Grande

**Causas e Soluções:**

1. **Thumbnails grandes**
   ```typescript
   // Redimensionar imagens antes
   // Usar JPEG ao invés de PNG para fotos
   model.setThumbnail(thumbData, 'jpg');
   ```

2. **Geometria duplicada**
   - Usar components ao invés de duplicar meshes
   - Usar multifile para modelos grandes

3. **Pretty print XML**
   ```typescript
   // Desabilitar em produção
   const buffer = await generate3MF(scene, { prettyPrint: false });
   ```

## Problemas de Compatibilidade

### Arquivo Não Abre no Bambu Studio

**Diagnóstico:**
```typescript
import { validate3MF } from '3mf-pr-js';
const result = await validate3MF(buffer);
console.log(formatValidationResult(result));
```

**Soluções comuns:**
- Verificar winding order
- Garantir geometria manifold
- Verificar que todas as referências de material existem

### Cores Não Aparecem Corretamente

**Causa:** Bambu Studio recalcula configurações

**Nota:** `displaycolor` é apenas visual. Para impressão real, o slicer determina as cores.

### Texturas Não Carregam

**Verificações:**
- Path correto no XML
- Arquivo de textura incluído no ZIP
- Content-Type correto em [Content_Types].xml
- Coordenadas UV válidas (0.0 - 1.0)

## Erros do Node.js

### "Cannot find module '3mf-pr-js'"

**Solução:**
```bash
# Instalar dependência
npm install 3mf-pr-js

# Verificar package.json
cat package.json | grep 3mf-pr-js
```

### "ERR_REQUIRE_ESM"

**Causa:** Biblioteca é ESM-only

**Solução:**
```json
// package.json
{
  "type": "module"
}
```

```typescript
// Usar import, não require
import { Model } from '3mf-pr-js';  // ✓
// const { Model } = require('3mf-pr-js');  // ✗
```

### Memory Heap Out of Memory

**Causa:** Modelo muito grande

**Solução:**
```bash
# Aumentar limite de memória
node --max-old-space-size=4096 script.js
```

```typescript
// Ou processar em chunks, usar multifile
model.enableProduction(true);
model.addExternalMesh('3D/parts/big-part.model', ...);
```

## Debugging Avançado

### Inspecionar Arquivo 3MF

```bash
# Descompactar arquivo
unzip model.3mf -d extracted/

# Visualizar XML
cat extracted/3D/3dmodel.model

# Verificar estrutura
ls -R extracted/
```

### Logging Detalhado

```typescript
import { validate3MF, formatValidationResult } from '3mf-pr-js';

// Habilitar logging verbose
const buffer = await model.to3MF();

console.log('Buffer size:', buffer.length);

const result = await validate3MF(buffer);
console.log(formatValidationResult(result));

if (!result.ok) {
  result.errors.forEach((err, i) => {
    console.error(`Error ${i+1}:`, {
      code: err.code,
      message: err.message
    });
  });
}
```

### Comparar XMLs

```bash
# Gerar dois arquivos
node generate1.js  # Cria model1.3mf
node generate2.js  # Cria model2.3mf

# Extrair
unzip model1.3mf -d model1/
unzip model2.3mf -d model2/

# Comparar
diff model1/3D/3dmodel.model model2/3D/3dmodel.model
```

## Obter Ajuda

### Antes de Reportar Bug

1. ✅ Verificar se é problema conhecido (este documento)
2. ✅ Testar com exemplo mínimo
3. ✅ Validar com lib3mf
4. ✅ Verificar logs de erro completos

### Reportar Issue

Incluir:
```typescript
// Código mínimo que reproduz o problema
import { Model } from '3mf-pr-js';

const model = new Model();
// ... código que causa o erro

try {
  await model.writeToFile('test.3mf');
} catch (error) {
  console.error('Error:', error);
  // Incluir stack trace completo
}
```

Informações do sistema:
```bash
node --version
npm --version
npm list 3mf-pr-js
uname -a  # ou systeminfo no Windows
```

---

**Ainda com problemas?**
- [Issues no GitHub](https://github.com/yourusername/3mf-pr-js/issues)
- [Documentação completa](./README.md)
- [Exemplos](./EXAMPLES.md)
