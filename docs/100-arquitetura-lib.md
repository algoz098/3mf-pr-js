# Arquitetura da Biblioteca (Draft)

Design inicial da API e pipeline de geração do 3MF.

## Módulos
- `pack/opc` — montagem do pacote ZIP/OPC, content types e relationships
- `model/core` — geração do `/3D/3dmodel.model` (Core)
- `ext/production` — aplicação da extensão Production (quando ativada)
- `ext/slice` — aplicação da extensão Slice (quando ativada)
- `assets` — gestão de thumbnails e anexos
- `validate` — hooks para validações básicas antes de empacotar

## API proposta (JS/TS)
```ts
export type GenerateOptions = {
  pretty?: boolean;
  validate?: boolean;
};

export async function generate3MF(input: ProjectInput, options?: GenerateOptions): Promise<Uint8Array>;

export async function validate3MF(data: Uint8Array): Promise<{ ok: boolean; issues: string[] }>;
```

- `generate3MF` recebe o JSON de entrada (ver `docs/080-esquema-entrada.md`) e retorna o binário do `.3mf`.
- `validate3MF` (opcional) roda validações estáticas; integração com `lib3mf` pode ser documentada à parte.

## Pipeline
1) Validar `input` com JSON Schema
2) Construir DOM do Core (`model/resources/build`)
3) Aplicar extensões (Production/Slice), se habilitadas
4) Gerar parts adicionais (thumbnails) e relationships
5) Gerar `[Content_Types].xml` e `.rels`
6) Compactar em ZIP e retornar buffer

## Considerações
- Precisão de floats e determinismo de IDs/ordem para reprodutibilidade
- Tamanho do arquivo (otimizar quando possível)
- Extensibilidade futura para materiais avançados e texturas
