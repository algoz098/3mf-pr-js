# Proposta de Melhoria e Expansão da 3mf-pr-js

Este documento detalha propostas para expandir a biblioteca `3mf-pr-js`, tornando-a uma solução completa para manipulação de arquivos 3MF no ecossistema JavaScript/TypeScript.

## 1. Suporte Bidirecional (Parsing e Leitura)

**Status Atual:** A biblioteca é focada exclusivamente na **geração** (escrita) de arquivos 3MF.
**Proposta:** Implementar um parser robusto para **ler** arquivos `.3mf` e carregar seu conteúdo na estrutura de dados `Model`.

### Benefícios:
- Permitir edição de arquivos existentes (ex: adicionar metadados, modificar materiais).
- Conversão de formatos (3MF -> JSON/OBJ/STL).
- Uso em ferramentas de análise e validação customizada.

### Implementação Sugerida:
- Classe `Reader` que consome um `Buffer` ou `Stream`.
- Extração de ZIP e parsing XML (usando `fast-xml-parser` ou similar).
- Reconstrução da hierarquia de objetos e materiais na memória.

## 2. Expansão do Core e Novas Extensões

### 2.1 Beam Lattice Extension
**Objetivo:** Suportar estruturas de treliça (lattice), essenciais para manufatura aditiva avançada (redução de peso, estruturas biomédicas).
- Implementar `beam` e `ref` elements dentro de `mesh`.
- Gerenciar propriedades de feixe (raio, tipo de extremidade).

### 2.2 Slice Extension
**Objetivo:** Suportar a representação direta de fatias (slices), útil para processos SLA/DLP e interoperabilidade com slicers.
- Permitir definir geometria via contornos 2D (polígonos) empilhados em Z.
- Útil para pré-visualização rápida de fatiamento sem processamento pesado.

### 2.3 Melhorias na Materials Extension
- **Multi-Properties:** Refinar suporte para propriedades físicas além da cor (ex: densidade, flexibilidade - preparando para futuras specs).
- **Texture Mapping Avançado:** Suporte completo a canais de textura (normal maps, roughness) se suportado por extensões futuras ou custom.

## 3. Interface de Linha de Comando (CLI) Robusta

**Status Atual:** Arquivo `src/cli.ts` vazio.
**Proposta:** Desenvolver uma CLI completa distribuída via npm.

### Comandos Propostos:
- `3mf validate <arquivo.3mf>`: Executa validação usando a integração lib3mf.
- `3mf inspect <arquivo.3mf>`: Exibe relatório de conteúdo (nº vértices, materiais, metadados, extensões usadas).
- `3mf convert <input> <output>`: Converte entre JSON <-> 3MF.
- `3mf optimize <arquivo.3mf>`: Executa deduplicação de vértices e re-compressão.

## 4. Performance e Arquitetura

### 4.1 Streaming
**Problema:** Arquivos muito grandes (gigabytes) podem exaurir a memória se carregados inteiramente antes da escrita.
**Solução:** Implementar `StreamWriter` para gerar o XML e o ZIP "on-the-fly", enviando chunks para o disco/rede.

### 4.2 WebAssembly (WASM)
- Avaliar mover validações geométricas pesadas (manifold check, interseções) para módulos WASM dedicados (Rust/C++), complementando a lib3mf.

### 4.3 Separação de Responsabilidades
- Refatorar `Model` para ser puramente dados.
- Criar `Writer` e `Reader` como serviços separados.
- Isso facilita testes e manutenção.

## 5. Ecossistema e Integração Web

### 5.1 Web-First
- Garantir que a biblioteca funcione no browser sem polyfills pesados de Node.js.
- Abstrair sistema de arquivos (`fs`) e buffers.
- Exemplos com React/Vue/Vanilla.

### 5.2 Three.js Adapter
- Criar pacote `@3mf-pr-js/three` com `ThreeMFLoader` e `ThreeMFExporter`.
- Mapeamento automático de materiais Three.js (StandardMaterial) para 3MF PBR (quando disponível) ou BaseMaterials.

## 6. Roadmap Sugerido

| Fase | Foco | Tarefas Principais |
|------|------|--------------------|
| **1** | **CLI & UX** | Implementar CLI básica (validate, inspect). Melhorar logs de erro. |
| **2** | **Parsing** | Implementar leitura básica de geometria e metadados. |
| **3** | **Extensões** | Beam Lattice e Slice Extension. |
| **4** | **Ecosystem** | Three.js Loader e exemplos Web. |
| **5** | **Performance** | Streaming e refatoração arquitetural. |
