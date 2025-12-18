# Esquema de Dados de Entrada (Draft)

Definição preliminar de um JSON que a biblioteca consumirá para gerar o 3MF.

Aviso: rascunho — será evoluído com a implementação e validação.

## JSON (conceitual)
```json
{
  "project": {
    "title": "Nome do Projeto",
    "author": "Seu Nome",
    "description": "Opcional",
    "createdAt": "2025-11-24T12:00:00Z",
    "application": "3mf-pr-js"
  },
  "unit": "millimeter",
  "materials": [
    { "id": "mat1", "name": "PLA Branco", "color": "#FFFFFF" }
  ],
  "objects": [
    {
      "id": "obj1",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "type": "model",
      "mesh": {
        "vertices": [[0,0,0],[1,0,0],[0,1,0]],
        "triangles": [[0,1,2]]
      },
      "material": { "materialId": "mat1" }
    }
  ],
  "build": {
    "uuid": "96681a5d-5b0f-e592-8c51-da7ed587cb5f",
    "items": [
      {
        "objectId": "obj1",
        "uuid": "b3de5826-ccb6-3dbc-d6c4-29a2d730766c",
        "transform": [1,0,0,0, 0,1,0,0, 0,0,1,0]
      }
    ]
  },
  "thumbnails": [
    { "path": "Thumbnails/thumbnail.png", "contentType": "image/png" }
  ],
  "extensions": {
    "production": {
      "enabled": true,
      "autoGenerateUUIDs": true
    },
    "slice": {
      "enabled": false
    }
  }
}
```

## Notas
- `materials` mapeados a `pid/pindex` na geração.
- A `transform` é matriz 3x4 flatten (12 floats). Omita para identidade.
- `type` do objeto padrão `model`; outros usos (ex.: `support`) só quando necessário.
- `thumbnails` opcionais; se fornecidos, criaremos parts e relationships.
- **UUIDs**: se `extensions.production.enabled = true`, UUIDs são OBRIGATÓRIOS:
  - `build.uuid`: UUID do build
  - `items[].uuid`: UUID de cada item
  - `objects[].uuid`: UUID de cada objeto
  - Se `autoGenerateUUIDs = true`, a lib gerará UUIDs v4 automaticamente quando omitidos
  - Formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (RFC 4122)

## Próximos passos
- Publicar JSON Schema (Draft 2020‑12) para validação estática dos inputs.
