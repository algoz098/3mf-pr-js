# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ **Otimizações de Memória** (Memory Optimization)
  - TypedArrays support (Float32Array/Uint32Array) - 90%+ redução de memória
  - Deduplicação automática de vértices com remapeamento de índices
  - Geometry pooling para reutilização de meshes idênticas
  - Estimativa de uso de memória em tempo real
  - API `addMeshOptimized()` com flags `deduplicate` e `reuseGeometry`
  - Métodos `getGeometryPoolStats()` e `clearGeometryPool()`
  - Utilitários de conversão TypedArray ↔ Array
  - 18 novos testes de otimização de memória
  - Documentação completa em MEMORY_OPTIMIZATION.md
  - Exemplos práticos em `examples/memory-optimization.mjs`
  - Demo rápido em `examples/quick-demo.mjs`
  - Suporte para processar modelos 10-100x maiores

### Planejado
- [ ] Streaming XML para reduzir pico de memória
- [ ] Lazy loading de texturas
- [ ] Compactação incremental do ZIP
- [ ] Suporte a Beam Lattice Extension
- [ ] Suporte a Slice Extension
- [ ] CLI tool para conversão
- [ ] Importação de arquivos 3MF existentes

## [0.1.0] - 2024-01-15

### Added
- ✨ Implementação inicial da biblioteca
- ✨ Suporte completo a 3MF Core Specification v1.3
- ✨ Production Extension (UUIDs, multifile, assemblies, partnumbers)
- ✨ Materials Extension (color groups, texturas, composite, multi-materials)
- ✨ Triangle Sets Extension
- ✨ API de alto nível `generate3MF()`
- ✨ API fluente `Model` para controle detalhado
- ✨ Validação JSON Schema com AJV
- ✨ Validação de geometria (winding order, manifold)
- ✨ Validação lib3mf (estrutural e OPC)
- ✨ Suporte a múltiplos conjuntos de materiais
- ✨ Suporte a texturas PNG/JPEG com coordenadas UV
- ✨ Thumbnails (pacote e por objeto)
- ✨ Metadados extensíveis
- ✨ Transformações 4x3 completas
- ✨ Component objects (assemblies)
- ✨ External models (multifile)
- ✨ MustPreserve para partes customizadas
- ✨ 58 testes cobrindo todos os recursos
- 📚 Documentação completa
  - README.md expandido
  - GETTING_STARTED.md
  - API.md (referência completa)
  - CONCEPTS.md (conceitos 3MF)
  - EXAMPLES.md (exemplos práticos)
  - VALIDATION.md (guia de validação)
  - TROUBLESHOOTING.md (solução de problemas)
  - CONTRIBUTING.md (guia de contribuição)
- 📝 Exemplos de uso na pasta `examples/`
- 🔧 Configuração TypeScript
- 🧪 Suite de testes com Vitest

### Fixed
- 🐛 Winding order validation corrigida
- 🐛 Manifold validation melhorada
- 🐛 Normalização de unidade 'micrometer' para 'micron'
- 🐛 Validação de índices de triângulos
- 🐛 Sincronização de materiais em external models

### Changed
- ⚡ Otimização de geração de ZIP
- 📦 Dependências atualizadas

### Documentation
- 📚 Documentação completa em português
- 📖 Exemplos práticos para casos de uso comuns
- 🔍 Guia detalhado de troubleshooting
- 🎓 Tutorial de início rápido
- 📋 Referência completa da API

## [0.0.1] - 2024-01-01

### Added
- 🎉 Versão inicial (proof of concept)
- Geração básica de arquivos 3MF
- Suporte a geometria simples
- Materiais básicos

---

## Formato

### Tipos de Mudanças
- **Added** - Novas features
- **Changed** - Mudanças em funcionalidades existentes
- **Deprecated** - Features que serão removidas
- **Removed** - Features removidas
- **Fixed** - Correções de bugs
- **Security** - Correções de vulnerabilidades

### Emojis
- ✨ Nova feature
- 🐛 Bug fix
- 📚 Documentação
- ⚡ Performance
- 🔧 Configuração
- 🧪 Testes
- 🔒 Segurança
- ♻️ Refatoração
- 🎨 UI/Style

[Unreleased]: https://github.com/yourusername/3mf-pr-js/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/3mf-pr-js/releases/tag/v0.1.0
[0.0.1]: https://github.com/yourusername/3mf-pr-js/releases/tag/v0.0.1
