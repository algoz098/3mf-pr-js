# Exemplos XML Completos

Este documento apresenta exemplos práticos de arquivos 3MF Production Ready para referência.

## Exemplo 1: 3MF Mínimo com Production Extension

### `/3D/3dmodel.model` (Root Model)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"
       requiredextensions="p">
  
  <!-- Metadados -->
  <metadata name="Title">Cubo Simples</metadata>
  <metadata name="Designer">3mf-pr-js</metadata>
  <metadata name="Application">3mf-pr-js</metadata>
  <metadata name="CreationDate">2025-11-24T12:00:00Z</metadata>
  
  <!-- Recursos -->
  <resources>
    <!-- Material base -->
    <basematerials id="1">
      <base name="PLA Branco" displaycolor="#FFFFFFFF" />
    </basematerials>
    
    <!-- Objeto: Cubo -->
    <object id="2" type="model" name="Cubo" pid="1" pindex="0"
            p:UUID="550e8400-e29b-41d4-a716-446655440000">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="10" y="0" z="0" />
          <vertex x="10" y="10" z="0" />
          <vertex x="0" y="10" z="0" />
          <vertex x="0" y="0" z="10" />
          <vertex x="10" y="0" z="10" />
          <vertex x="10" y="10" z="10" />
          <vertex x="0" y="10" z="10" />
        </vertices>
        <triangles>
          <!-- Face inferior -->
          <triangle v1="0" v2="2" v3="1" />
          <triangle v1="0" v2="3" v3="2" />
          <!-- Face superior -->
          <triangle v1="4" v2="5" v3="6" />
          <triangle v1="4" v2="6" v3="7" />
          <!-- Face frontal -->
          <triangle v1="0" v2="1" v3="5" />
          <triangle v1="0" v2="5" v3="4" />
          <!-- Face traseira -->
          <triangle v1="2" v2="3" v3="7" />
          <triangle v1="2" v2="7" v3="6" />
          <!-- Face esquerda -->
          <triangle v1="0" v2="4" v3="7" />
          <triangle v1="0" v2="7" v3="3" />
          <!-- Face direita -->
          <triangle v1="1" v2="2" v3="6" />
          <triangle v1="1" v2="6" v3="5" />
        </triangles>
      </mesh>
    </object>
  </resources>
  
  <!-- Build -->
  <build p:UUID="96681a5d-5b0f-e592-8c51-da7ed587cb5f">
    <item objectid="2" 
          p:UUID="b3de5826-ccb6-3dbc-d6c4-29a2d730766c"
          transform="1 0 0 0 1 0 0 0 1 50 50 0" />
  </build>
</model>
```

## Exemplo 2: 3MF Multifile com Production Extension

### `/3D/build.model` (Root Model)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"
       requiredextensions="p">
  
  <metadata name="Title">Build com Múltiplos Objetos</metadata>
  <metadata name="Application">3mf-pr-js</metadata>
  
  <!-- Resources pode estar vazio se tudo está em outros arquivos -->
  <resources>
    <!-- Objeto local opcional -->
    <object id="1" type="model" name="Base"
            p:UUID="11111111-1111-1111-1111-111111111111">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="100" y="0" z="0" />
          <vertex x="100" y="100" z="0" />
          <vertex x="0" y="100" z="0" />
          <vertex x="0" y="0" z="1" />
          <vertex x="100" y="0" z="1" />
          <vertex x="100" y="100" z="1" />
          <vertex x="0" y="100" z="1" />
        </vertices>
        <triangles>
          <triangle v1="0" v2="2" v3="1" />
          <triangle v1="0" v2="3" v3="2" />
          <triangle v1="4" v2="5" v3="6" />
          <triangle v1="4" v2="6" v3="7" />
          <triangle v1="0" v2="1" v3="5" />
          <triangle v1="0" v2="5" v3="4" />
          <triangle v1="2" v2="3" v3="7" />
          <triangle v1="2" v2="7" v3="6" />
          <triangle v1="0" v2="4" v3="7" />
          <triangle v1="0" v2="7" v3="3" />
          <triangle v1="1" v2="2" v3="6" />
          <triangle v1="1" v2="6" v3="5" />
        </triangles>
      </mesh>
    </object>
  </resources>
  
  <build p:UUID="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee">
    <!-- Item local -->
    <item objectid="1" 
          p:UUID="22222222-2222-2222-2222-222222222222"
          transform="1 0 0 0 1 0 0 0 1 0 0 0" />
    
    <!-- Item referenciando objeto externo -->
    <item objectid="5" 
          p:path="/3D/parts/widget.model"
          p:UUID="33333333-3333-3333-3333-333333333333"
          transform="1 0 0 0 1 0 0 0 1 20 20 0" />
    
    <!-- Outro item referenciando objeto externo -->
    <item objectid="10" 
          p:path="/3D/parts/gear.model"
          p:UUID="44444444-4444-4444-4444-444444444444"
          transform="1 0 0 0 1 0 0 0 1 60 60 0" />
  </build>
</model>
```

### `/3D/parts/widget.model`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06">
  
  <resources>
    <basematerials id="1">
      <base name="PLA Azul" displaycolor="#0000FFFF" />
    </basematerials>
    
    <object id="5" type="model" name="Widget" pid="1" pindex="0"
            p:UUID="55555555-5555-5555-5555-555555555555">
      <mesh>
        <!-- Vertices e triangles do widget -->
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="5" y="0" z="0" />
          <vertex x="2.5" y="4" z="0" />
          <vertex x="2.5" y="2" z="5" />
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2" />
          <triangle v1="0" v2="1" v3="3" />
          <triangle v1="1" v2="2" v3="3" />
          <triangle v1="2" v2="0" v3="3" />
        </triangles>
      </mesh>
    </object>
  </resources>
  
  <!-- Build vazio (ignorado em non-root models) -->
  <build />
</model>
```

## Exemplo 3: Objeto com Components

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"
       requiredextensions="p">
  
  <metadata name="Title">Assembly com Componentes</metadata>
  
  <resources>
    <basematerials id="1">
      <base name="PLA Cinza" displaycolor="#808080FF" />
    </basematerials>
    
    <!-- Objeto primitivo: Roda -->
    <object id="2" type="model" name="Roda" pid="1" pindex="0"
            p:UUID="aaaa0001-0001-0001-0001-000000000001">
      <mesh>
        <!-- Geometria da roda -->
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="10" y="0" z="0" />
          <vertex x="5" y="8.66" z="0" />
          <vertex x="5" y="4" z="5" />
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2" />
          <triangle v1="0" v2="1" v3="3" />
          <triangle v1="1" v2="2" v3="3" />
          <triangle v1="2" v2="0" v3="3" />
        </triangles>
      </mesh>
    </object>
    
    <!-- Assembly: Carro (usa componentes) -->
    <object id="3" type="model" name="Carro"
            p:UUID="aaaa0002-0002-0002-0002-000000000002">
      <components>
        <!-- Roda dianteira esquerda -->
        <component objectid="2"
                   p:UUID="bbbb0001-0001-0001-0001-000000000001"
                   transform="1 0 0 0 1 0 0 0 1 10 10 0" />
        
        <!-- Roda dianteira direita -->
        <component objectid="2"
                   p:UUID="bbbb0002-0002-0002-0002-000000000002"
                   transform="1 0 0 0 1 0 0 0 1 10 30 0" />
        
        <!-- Roda traseira esquerda -->
        <component objectid="2"
                   p:UUID="bbbb0003-0003-0003-0003-000000000003"
                   transform="1 0 0 0 1 0 0 0 1 40 10 0" />
        
        <!-- Roda traseira direita -->
        <component objectid="2"
                   p:UUID="bbbb0004-0004-0004-0004-000000000004"
                   transform="1 0 0 0 1 0 0 0 1 40 30 0" />
      </components>
    </object>
  </resources>
  
  <build p:UUID="cccc0001-0001-0001-0001-000000000001">
    <item objectid="3" 
          p:UUID="dddd0001-0001-0001-0001-000000000001" />
  </build>
</model>
```

## Exemplo 4: [Content_Types].xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <!-- Default types por extensão -->
  <Default Extension="rels" 
           ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" 
           ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="png" 
           ContentType="image/png" />
  <Default Extension="jpg" 
           ContentType="image/jpeg" />
  
  <!-- Override types específicos (se necessário) -->
  <Override PartName="/3D/3dmodel.model" 
            ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>
```

## Exemplo 5: /_rels/.rels (Root Relationships)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <!-- Relationship para o model principal -->
  <Relationship Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" 
                Target="/3D/3dmodel.model" 
                Id="rel-1" />
  
  <!-- Relationship para thumbnail do pacote -->
  <Relationship Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail" 
                Target="/Metadata/thumbnail.png" 
                Id="rel-0" />
</Relationships>
```

## Exemplo 6: /3D/_rels/3dmodel.model.rels (Model Relationships)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <!-- Relationship para outro model file (multifile) -->
  <Relationship Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" 
                Target="/3D/parts/widget.model" 
                Id="rel-1" />
  
  <Relationship Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" 
                Target="/3D/parts/gear.model" 
                Id="rel-2" />
  
  <!-- Relationship para thumbnail do objeto -->
  <Relationship Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail" 
                Target="/Thumbnails/object1.png" 
                Id="rel-10" />
</Relationships>
```

## Notas Importantes

### Transforms
Transform é uma matriz 3x4 flatten (12 valores):
```
m00 m01 m02  m10 m11 m12  m20 m21 m22  m30 m31 m32

Onde:
[m00 m01 m02]   [rotação/escala]
[m10 m11 m12] = [rotação/escala]
[m20 m21 m22]   [rotação/escala]
[m30 m31 m32]   [translação x, y, z]
```

Identidade: `1 0 0 0 1 0 0 0 1 0 0 0`

Translação para (50, 50, 0): `1 0 0 0 1 0 0 0 1 50 50 0`

### UUIDs
Devem ser RFC 4122 compliant (versão 4 recomendada):
- Formato: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Lowercase hexadecimal
- y = 8, 9, a, ou b

Exemplo: `550e8400-e29b-41d4-a716-446655440000`

### Winding Order
Triângulos devem ter vértices em ordem anti-horária (counter-clockwise) quando vistos de fora do objeto, para que a normal aponte para fora.

### Materiais
`displaycolor` é apenas para visualização. Para cores reais de impressão, use a Materials Extension (não coberta nestes exemplos básicos).

## Exemplo 7: Materials Extension — Texturas e UVs

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"
       recommendedextensions="m">
  <resources>
    <!-- Textura 2D -->
    <m:texture2d id="10" path="/3D/Textures/texture-10.png" contenttype="image/png" />
    <!-- Grupo de UVs → indices usados por triângulos (p1/p2/p3) -->
    <m:texture2dgroup id="11" texid="10" tilestyleu="wrap" tilestylev="wrap" filter="auto">
      <m:tex2coord u="0.0" v="0.0" />
      <m:tex2coord u="1.0" v="0.0" />
      <m:tex2coord u="0.0" v="1.0" />
      <m:tex2coord u="1.0" v="1.0" />
    </m:texture2dgroup>

    <!-- Objeto usando UVs por triângulo -->
    <object id="20" type="model" name="Quad">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="10" y="0" z="0" />
          <vertex x="0" y="10" z="0" />
          <vertex x="10" y="10" z="0" />
        </vertices>
        <triangles>
          <!-- Triângulo 1 com UVs → pid=11 (texture2dgroup), p1/p2/p3 = indices -->
          <triangle v1="0" v2="1" v3="2" pid="11" p1="0" p2="1" p3="2" />
          <!-- Triângulo 2 com UVs → pid=11, mapeando para canto superior direito -->
          <triangle v1="2" v2="1" v3="3" pid="11" p1="2" p2="1" p3="3" />
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="20" />
  </build>
</model>
```

## Exemplo 8: Property Resources — CompositeMaterials

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"
       recommendedextensions="m">
  <resources>
    <!-- Bases → conjunto pid=1 com duas cores -->
    <basematerials id="1">
      <base name="Red" displaycolor="#FF0000FF" />
      <base name="Blue" displaycolor="#0000FFFF" />
    </basematerials>
    
    <!-- Composite vinculado ao pid=1 -->
    <m:compositematerials id="12" pid="1">
      <!-- Mistura 50/50 → índice 0 -->
      <m:composite values="0.5 0.5" />
    </m:compositematerials>

    <!-- Objeto: usa composite por padrão (pid/pindex em object) -->
    <object id="30" type="model" name="Triângulo" pid="12" pindex="0">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="10" y="0" z="0" />
          <vertex x="0" y="10" z="0" />
        </vertices>
        <triangles>
          <!-- Triângulo usa composite default (do object) -->
          <triangle v1="0" v2="1" v3="2" />
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="30" />
  </build>
</model>
```

## Exemplo 9: Property Resources — MultiMaterials

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"
       recommendedextensions="m">
  <resources>
    <!-- Conjuntos base para combinar -->
    <basematerials id="2">
      <base name="A" displaycolor="#FF0000FF" />
      <base name="A2" displaycolor="#FF8080FF" />
    </basematerials>
    <basematerials id="3">
      <base name="B" displaycolor="#0000FFFF" />
    </basematerials>

    <!-- MultiMaterials combinando pids=2 e 3; entrada usa pindices "1 0" → índice da base em cada pid -->
    <m:multimaterials id="13" pids="2 3">
      <m:multimaterial pindices="1 0" />
    </m:multimaterials>

    <!-- Objeto: usa multi por padrão -->
    <object id="40" type="model" name="Triângulo Combo" pid="13" pindex="0">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="10" y="0" z="0" />
          <vertex x="0" y="10" z="0" />
        </vertices>
        <triangles>
          <!-- Triângulo usa combinação default do objeto -->
          <triangle v1="0" v2="1" v3="2" />
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="40" />
  </build>
</model>
```

## Exemplo 10: Materials Extension — Color Group por Triângulo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
       xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"
       recommendedextensions="m">
  <resources>
    <!-- Grupo de cores -->
    <m:colorgroup id="21">
      <m:color name="Red" value="#FF0000FF" />
      <m:color name="Green" value="#00FF00FF" />
    </m:colorgroup>

    <!-- Objeto com override por triângulo -->
    <object id="22" type="model" name="Colored Triangles" pid="21" pindex="0">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0" />
          <vertex x="10" y="0" z="0" />
          <vertex x="0" y="10" z="0" />
          <vertex x="10" y="10" z="0" />
        </vertices>
        <triangles>
          <!-- Triângulo 1 vermelho -->
          <triangle v1="0" v2="1" v3="2" pid="21" p1="0" p2="0" p3="0" />
          <!-- Triângulo 2 verde -->
          <triangle v1="2" v2="1" v3="3" pid="21" p1="1" p2="1" p3="1" />
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="22" />
  </build>
</model>
```
