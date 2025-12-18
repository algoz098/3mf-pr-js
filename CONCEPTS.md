# Conceitos do Formato 3MF

Este guia explica os conceitos fundamentais do formato 3MF (3D Manufacturing Format) e como eles são implementados na biblioteca `3mf-pr-js`.

## 📑 Índice

- [O que é 3MF?](#o-que-é-3mf)
- [Estrutura de um Arquivo 3MF](#estrutura-de-um-arquivo-3mf)
- [Core 3MF](#core-3mf)
- [Extensões](#extensões)
- [Materiais](#materiais)
- [Geometria](#geometria)
- [Transformações](#transformações)
- [Build Platform](#build-platform)
- [Metadados](#metadados)

---

## O que é 3MF?

**3MF** (3D Manufacturing Format) é um formato de arquivo moderno para manufatura aditiva (impressão 3D) desenvolvido pelo [3MF Consortium](https://3mf.io/).

### Por que 3MF?

**Vantagens sobre formatos antigos (STL, OBJ):**

1. **Formato completo** - Inclui geometria, materiais, cores, texturas e metadados
2. **Baseado em XML** - Estrutura clara e extensível
3. **Compactado** - Usa ZIP, arquivos menores
4. **Padronizado** - Especificação aberta e mantida por consórcio
5. **Moderno** - Suporta recursos avançados (multi-material, assemblies, etc.)

### Especificações

- **Core Specification** v1.3 - Funcionalidade básica
- **Production Extension** v1.0 - Recursos profissionais (UUIDs, multifile, assemblies)
- **Materials Extension** - Color groups, texturas, composite/multi-materials
- **Triangle Sets Extension** - Agrupamento lógico de faces

---

## Estrutura de um Arquivo 3MF

Um arquivo `.3mf` é um arquivo ZIP contendo:

```
arquivo.3mf (ZIP)
├── [Content_Types].xml          # Define tipos MIME
├── _rels/
│   └── .rels                     # Relacionamentos do pacote
├── 3D/
│   ├── 3dmodel.model            # Modelo principal (XML)
│   ├── _rels/
│   │   └── 3dmodel.model.rels   # Relacionamentos do modelo
│   ├── Textures/                 # Texturas (PNG/JPEG)
│   └── parts/                    # Modelos externos (multifile)
├── Metadata/
│   └── thumbnail.png             # Preview do modelo
└── Thumbnails/
    └── thumbnail.png             # Alternativa para thumbnail
```

### Arquivos Principais

#### `[Content_Types].xml`
Define os tipos MIME de cada arquivo no pacote (OPC requirement).

#### `_rels/.rels`
Relacionamentos raiz do pacote, aponta para o modelo principal e thumbnail.

#### `3D/3dmodel.model`
Arquivo XML principal contendo:
- Metadados
- Recursos (materiais, texturas)
- Objetos (geometria)
- Build items (o que imprimir)

---

## Core 3MF

### Modelo (Model)

Elemento raiz do arquivo 3D model:

```xml
<model xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       unit="millimeter"
       xml:lang="en-US">
  <metadata name="Title">Meu Modelo</metadata>
  <resources>
    <!-- materiais e objetos -->
  </resources>
  <build>
    <!-- itens a imprimir -->
  </build>
</model>
```

**Atributos:**
- `unit` - Unidade de medida (millimeter, inch, micron, centimeter, foot, meter)
- `xml:lang` - Idioma dos metadados (en-US, pt-BR, etc.)

### Recursos (Resources)

Contêiner para todos os recursos reutilizáveis:

```xml
<resources>
  <basematerials id="1">
    <base name="PLA Red" displaycolor="#FF0000FF"/>
  </basematerials>
  
  <object id="2" type="model">
    <mesh>
      <!-- geometria -->
    </mesh>
  </object>
</resources>
```

**Tipos de recursos:**
- **basematerials** - Materiais básicos
- **object** - Objetos 3D (mesh ou components)
- **m:colorgroup** - Grupos de cores (Materials Extension)
- **m:texture2d** - Texturas (Materials Extension)
- **m:compositematerials** - Materiais compostos
- **m:multimaterials** - Multi-materiais

### Objetos (Objects)

Dois tipos principais:

#### 1. Mesh Object

Objeto com geometria triangular:

```xml
<object id="2" type="model" pid="1" pindex="0">
  <mesh>
    <vertices>
      <vertex x="0" y="0" z="0"/>
      <vertex x="10" y="0" z="0"/>
      <vertex x="5" y="10" z="0"/>
    </vertices>
    <triangles>
      <triangle v1="0" v2="1" v3="2"/>
    </triangles>
  </mesh>
</object>
```

**Atributos:**
- `id` - Identificador único do recurso
- `type` - Tipo do objeto (`model`, `solidsupport`, `support`, `other`)
- `pid` - ID do recurso de propriedade (material)
- `pindex` - Índice dentro do recurso de propriedade
- `name` - Nome descritivo (opcional)

#### 2. Component Object

Objeto que referencia outros objetos (assembly):

```xml
<object id="3" type="model" name="Assembly">
  <components>
    <component objectid="2" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>
    <component objectid="2" transform="1 0 0 0 1 0 0 0 1 20 0 0"/>
  </components>
</object>
```

### Build

Define quais objetos devem ser impressos e suas posições na plataforma:

```xml
<build>
  <item objectid="3" transform="1 0 0 0 1 0 0 0 1 50 50 0"/>
</build>
```

**Conceito importante:** Nem todos os objetos em `resources` precisam estar no `build`. Alguns podem existir apenas para serem referenciados por components.

---

## Extensões

### Production Extension

Adiciona recursos para uso profissional/industrial.

**Namespace:** `xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"`

**Recursos:**

#### UUIDs

Identificadores únicos universais para rastreabilidade:

```xml
<model xmlns:p="..." requiredextensions="p">
  <build p:UUID="550e8400-e29b-41d4-a716-446655440000">
    <item objectid="2" p:UUID="6ba7b810-9dad-11d1-80b4-00c04fd430c8"/>
  </build>
</model>
```

**Uso na biblioteca:**
```typescript
model.enableProduction(true);
// UUIDs são gerados automaticamente
```

#### Multifile

Permite dividir modelo em múltiplos arquivos:

```xml
<object id="5" type="model" p:UUID="...">
  <components>
    <component objectid="1" p:path="/3D/parts/widget.model"/>
  </components>
</object>
```

**Uso na biblioteca:**
```typescript
const ext = model.addExternalMesh(
  '3D/parts/widget.model',
  'Widget',
  vertices,
  triangles
);
model.addExternalBuildItem(ext.objectid, ext.path);
```

#### Partnumbers

Números de peça para identificação:

```xml
<object id="2" partnumber="PN-12345">...</object>
<item objectid="2" partnumber="BI-001"/>
```

**Uso na biblioteca:**
```typescript
model.setObjectPartNumber(objId, 'PN-12345');
model.addBuildItem(objId, undefined, { partnumber: 'BI-001' });
```

#### MustPreserve

Preserva partes customizadas do pacote:

```xml
<!-- Em _rels/.rels -->
<Relationship Type="...mustpreserve" Target="/Metadata/info.txt"/>
```

**Uso na biblioteca:**
```typescript
model.addPreservePart('/Metadata/info.txt', 'Informações importantes');
```

### Materials Extension

Adiciona suporte avançado a materiais.

**Namespace:** `xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"`

#### Color Groups

Paletas de cores reutilizáveis:

```xml
<m:colorgroup id="1">
  <m:color value="#FF0000" name="Red"/>
  <m:color value="#00FF00" name="Green"/>
</m:colorgroup>

<object id="2" pid="1" pindex="0">...</object>
```

#### Texturas

Imagens PNG/JPEG aplicadas com coordenadas UV:

```xml
<m:texture2d id="3" path="/3D/Textures/wood.png" contenttype="image/png"/>

<m:texture2dgroup id="4" texid="3">
  <m:tex2coord u="0.0" v="0.0"/>
  <m:tex2coord u="1.0" v="0.0"/>
  <m:tex2coord u="0.5" v="1.0"/>
</m:texture2dgroup>
```

#### Composite Materials

Misturas ponderadas de materiais:

```xml
<basematerials id="1">
  <base name="Red" displaycolor="#FF0000FF"/>
  <base name="Blue" displaycolor="#0000FFFF"/>
</basematerials>

<m:compositematerials id="2" pid="1">
  <m:composite values="0.5 0.5"/>  <!-- 50% Red + 50% Blue = Purple -->
  <m:composite values="0.8 0.2"/>  <!-- 80% Red + 20% Blue -->
</m:compositematerials>
```

#### Multi-Materials

Combina múltiplos recursos de propriedades:

```xml
<m:multimaterials id="5" pids="1 4">
  <m:multimaterial pindices="0 2"/>  <!-- material 0 from resource 1, material 2 from resource 4 -->
</m:multimaterials>
```

### Triangle Sets Extension

Agrupa triângulos logicamente sem afetar geometria.

**Namespace:** `xmlns:t="http://schemas.microsoft.com/3dmanufacturing/trianglesets/2021/07"`

```xml
<mesh>
  <vertices>...</vertices>
  <triangles>...</triangles>
  
  <t:trianglesets>
    <t:triangleset name="Top Faces" identifier="t:top">
      <t:ref index="0"/>
      <t:ref index="1"/>
      <t:refrange startindex="4" endindex="7"/>
    </t:triangleset>
  </t:trianglesets>
</mesh>
```

**Uso na biblioteca:**
```typescript
const setIdx = model.addTriangleSet(objId, 'Top Faces', 't:top');
model.addTriangleSetRefs(objId, setIdx, [0, 1, { startindex: 4, endindex: 7 }]);
```

---

## Materiais

### Hierarquia de Materiais

Materiais podem ser aplicados em três níveis (do mais geral ao mais específico):

1. **Objeto** - Material padrão para todo o objeto
2. **Triângulo** - Material específico para um triângulo
3. **Vértice** - Material específico para cada vértice de um triângulo

**Precedência:** Vértice > Triângulo > Objeto

### Base Materials

Materiais mais simples, apenas cor RGBA:

```xml
<basematerials id="1">
  <base name="PLA Red" displaycolor="#FF0000FF"/>
</basematerials>
```

**Formato de cor:** `#RRGGBBAA`
- RR = Red (00-FF)
- GG = Green (00-FF)
- BB = Blue (00-FF)
- AA = Alpha/transparência (00=transparente, FF=opaco)

**Uso na biblioteca:**
```typescript
const red = model.addBaseMaterial('PLA Red', '#FF0000FF');
model.addMesh(vertices, triangles, { material: red });
```

### Múltiplos Conjuntos

É possível ter múltiplos conjuntos de materiais:

```typescript
const pla = model.createBaseMaterialsSet(1);
const abs = model.createBaseMaterialsSet(2);

const plaRed = model.addBaseMaterial('PLA Red', '#FF0000FF', pla);
const absBlue = model.addBaseMaterial('ABS Blue', '#0000FFFF', abs);
```

**Por que usar múltiplos conjuntos?**
- Organização (PLA vs ABS vs TPU)
- Diferentes fornecedores
- Diferentes propriedades físicas

### Override por Triângulo

Permite colorir faces individuais:

```xml
<object id="2" pid="1" pindex="0">  <!-- Material padrão vermelho -->
  <mesh>
    <vertices>...</vertices>
    <triangles>
      <triangle v1="0" v2="1" v3="2"/>                    <!-- Usa padrão (vermelho) -->
      <triangle v1="3" v2="4" v3="5" pid="1" pindex="1"/> <!-- Override para azul -->
    </triangles>
  </mesh>
</object>
```

**Uso na biblioteca:**
```typescript
const groupId = model.createColorGroup();
const red = model.addColorToGroup('#FF0000', 'Red', groupId);
const blue = model.addColorToGroup('#0000FF', 'Blue', groupId);

const objId = model.addMesh(vertices, triangles, { material: red });

model.setTriangleMaterials(objId, [
  { index: 1, pid: groupId, pindex: blue.pindex }
]);
```

### Override por Vértice

Permite gradientes suaves (interpolação):

```xml
<triangle v1="0" v2="1" v3="2" pid="1" p1="0" p2="1" p3="2"/>
<!-- Vértice 0 usa material 0, vértice 1 usa material 1, vértice 2 usa material 2 -->
<!-- Cores são interpoladas entre vértices -->
```

**Uso na biblioteca:**
```typescript
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

---

## Geometria

### Vértices (Vertices)

Pontos 3D no espaço:

```xml
<vertices>
  <vertex x="0.0" y="0.0" z="0.0"/>
  <vertex x="10.0" y="0.0" z="0.0"/>
  <vertex x="5.0" y="10.0" z="0.0"/>
</vertices>
```

**Coordenadas:**
- Valores decimais (float)
- Unidade definida no atributo `unit` do modelo
- Sistema de coordenadas destro (right-handed)

### Triângulos (Triangles)

Faces definidas por três vértices:

```xml
<triangles>
  <triangle v1="0" v2="1" v3="2"/>
</triangles>
```

**Índices:**
- Zero-based (primeiro vértice é 0)
- Devem referenciar vértices existentes

### Winding Order (Ordem de Enrolamento)

**Regra crítica:** A ordem dos vértices define a direção da normal do triângulo.

**Regra da mão direita:**
- Vértices em ordem anti-horária quando vistos de fora
- Normal aponta para fora da superfície

```
   v2
   /\
  /  \
 /    \
v0----v1

Triangle: [v0, v1, v2]  ✓ Correto (anti-horário de fora)
Triangle: [v0, v2, v1]  ✗ Errado (horário de fora, normal invertida)
```

**Consequências de winding incorreto:**
- Faces aparecem invertidas ou invisíveis
- Problemas no slicing
- Visualização incorreta

**Validação:**
```typescript
import { validateWindingOrder } from '3mf-pr-js';

const result = validateWindingOrder(vertices, triangles);
if (!result.ok) {
  console.warn('Avisos de winding:', result.warnings);
}
```

### Manifold (Variedade)

**Definição:** Uma malha é manifold se:
1. Cada aresta é compartilhada por exatamente 2 triângulos
2. Não há vértices ou arestas soltos
3. Forma uma superfície fechada e contínua

**Por que é importante?**
- Slicers requerem geometria manifold
- Define volume interno/externo claramente
- Evita erros de impressão

**Problemas comuns de não-manifold:**
- **Buracos** - Arestas com apenas 1 triângulo
- **Sobreposições** - Arestas com mais de 2 triângulos
- **Vértices T** - Vértice no meio de aresta

**Validação:**
```typescript
import { validateManifold } from '3mf-pr-js';

const result = validateManifold(vertices, triangles);
if (!result.ok) {
  console.error('Erros de manifold:', result.errors);
}
```

### Degenerados

**Triângulos degenerados** têm área zero:
- Todos os vértices colineares
- Dois ou mais vértices idênticos

```typescript
// Degenerados (evitar)
[0, 0, 0]  // Todos iguais
[0, 1, 0]  // v1 e v3 iguais (área zero)
```

**A biblioteca valida automaticamente:**
```typescript
// Lança erro
model.addMesh(
  [[0,0,0], [1,0,0]],
  [[0, 0, 1]]  // v1 e v3 iguais
);
```

---

## Transformações

### Matriz 4x3

3MF usa matriz de transformação afim 4x3:

```
[m00 m01 m02]   [eixo X transformado]
[m10 m11 m12]   [eixo Y transformado]
[m20 m21 m22]   [eixo Z transformado]
[m30 m31 m32]   [translação x, y, z]
```

**Representação no XML:**
```xml
<item objectid="2" transform="m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32"/>
```

**Representação na biblioteca:**
```typescript
type Transform = [
  m00, m01, m02,
  m10, m11, m12,
  m20, m21, m22,
  m30, m31, m32
];
```

### Transformações Comuns

#### Identidade (sem transformação)

```typescript
const identity: Transform = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  0, 0, 0
];
```

#### Translação

Mover objeto no espaço:

```typescript
// Mover 10mm em X, 20mm em Y, 5mm em Z
const translation: Transform = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  10, 20, 5
];
```

#### Escala Uniforme

```typescript
// Escalar 2x em todos os eixos
const scale2x: Transform = [
  2, 0, 0,
  0, 2, 0,
  0, 0, 2,
  0, 0, 0
];
```

#### Escala Não-Uniforme

```typescript
// 2x em X, 1x em Y, 3x em Z
const scaleXYZ: Transform = [
  2, 0, 0,
  0, 1, 0,
  0, 0, 3,
  0, 0, 0
];
```

#### Rotação em Z (90° anti-horário)

```typescript
const rotateZ90: Transform = [
  0, -1, 0,
  1, 0, 0,
  0, 0, 1,
  0, 0, 0
];
```

#### Rotação em X (90° anti-horário)

```typescript
const rotateX90: Transform = [
  1, 0, 0,
  0, 0, -1,
  0, 1, 0,
  0, 0, 0
];
```

#### Rotação em Y (90° anti-horário)

```typescript
const rotateY90: Transform = [
  0, 0, 1,
  0, 1, 0,
  -1, 0, 0,
  0, 0, 0
];
```

#### Combinação (Rotação + Translação)

```typescript
// Rotar 90° em Z e mover 10mm em X
const combined: Transform = [
  0, -1, 0,
  1, 0, 0,
  0, 0, 1,
  10, 0, 0
];
```

### Composição de Transformações

Transformações são aplicadas na ordem: **Rotação/Escala → Translação**

Para combinar múltiplas transformações, multiplique as matrizes (álgebra linear).

**Exemplo:** Rotacionar em Z e depois mover
```typescript
// 1. Definir rotação
// 2. Definir translação
// 3. Multiplicar matrizes para obter transformação combinada
```

---

## Build Platform

### Conceito

O elemento `<build>` define quais objetos serão impressos e onde na plataforma:

```xml
<build>
  <item objectid="2" transform="..."/>
  <item objectid="3" transform="..."/>
</build>
```

### Sistema de Coordenadas

- **Origem (0, 0, 0)** - Canto frontal-esquerdo da plataforma
- **Eixo X** - Da esquerda para direita
- **Eixo Y** - De frente para trás
- **Eixo Z** - De baixo para cima

```
      Y (para trás)
      |
      |_____ X (para direita)
     /
    Z (para cima)
```

### Posicionamento

**Centro da plataforma (200x200mm):**
```typescript
model.addBuildItem(objId, [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  100, 100, 0  // Centro
]);
```

**Múltiplos objetos lado a lado:**
```typescript
model.addBuildItem(obj1, [1,0,0, 0,1,0, 0,0,1, 50,100,0]);
model.addBuildItem(obj2, [1,0,0, 0,1,0, 0,0,1, 150,100,0]);
```

---

## Metadados

### Metadados Padrão

3MF define metadados bem conhecidos:

```xml
<metadata name="Title">Meu Modelo</metadata>
<metadata name="Designer">João Silva</metadata>
<metadata name="Author">João Silva</metadata>
<metadata name="Application">3mf-pr-js</metadata>
<metadata name="CreationDate">2024-01-15T10:30:00Z</metadata>
<metadata name="ModificationDate">2024-01-15T14:20:00Z</metadata>
<metadata name="Description">Um modelo de exemplo</metadata>
```

**Uso na biblioteca:**
```typescript
model.setTitle('Meu Modelo');
model.setDesigner('João Silva');
model.setCreationDate(new Date().toISOString());
model.setDescription('Um modelo de exemplo');
```

### Metadados Customizados

Você pode adicionar metadados personalizados:

```typescript
model.addMetadata('License', 'CC BY-SA 4.0');
model.addMetadata('PrintSettings', 'Layer: 0.2mm, Infill: 20%');
model.addMetadata('PartNumber', 'PN-12345');
```

**Nota:** Metadados são informativos e não afetam o processo de impressão.

---

## Referências

### Especificações Oficiais

- [3MF Core Specification v1.3](https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md)
- [Production Extension v1.0](https://github.com/3MFConsortium/spec_production/blob/master/3MF%20Production%20Extension.md)
- [Materials Extension](https://github.com/3MFConsortium/spec_materials/blob/master/3MF%20Materials%20Extension.md)
- [Triangle Sets Extension](https://github.com/3MFConsortium/spec_trianglesets)

### Recursos Adicionais

- [3MF Consortium](https://3mf.io/)
- [lib3mf SDK](https://github.com/3MFConsortium/lib3mf)
- [OPC Specification](https://en.wikipedia.org/wiki/Open_Packaging_Conventions)

---

**Próximos passos:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Comece a usar a biblioteca
- [API.md](./API.md) - Referência completa da API
- [EXAMPLES.md](./EXAMPLES.md) - Exemplos práticos
- [VALIDATION.md](./VALIDATION.md) - Guia de validação
