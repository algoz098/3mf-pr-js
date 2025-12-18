# Índice da Documentação - 3mf-pr-js

Índice completo de toda a documentação do projeto.

## 📚 Documentação Principal

### [README.md](../README.md)
Visão geral do projeto, features, instalação rápida e introdução.

**Conteúdo:**
- Características principais
- Instalação
- Uso rápido (API de alto nível e fluente)
- Recursos avançados
- Compatibilidade

### [GETTING_STARTED.md](../GETTING_STARTED.md)
Guia completo para iniciantes começarem a usar a biblioteca.

**Conteúdo:**
- Pré-requisitos e instalação
- Primeiro arquivo 3MF (cubo simples)
- Conceitos básicos (unidades, vértices, triângulos, materiais)
- Exemplos práticos progressivos
- Debugging e validação
- Problemas comuns
- Dicas

**Ideal para:** Desenvolvedores novos na biblioteca ou no formato 3MF.

### [API.md](../API.md)
Referência completa de todas as classes, métodos e interfaces públicas.

**Conteúdo:**
- `generate3MF()` - Função de alto nível
- Classe `Model` - API fluente completa
  - Configuração
  - Metadados
  - Materiais (base, color groups, texturas, composite, multi)
  - Objetos (mesh, components)
  - Build
  - Extensões (triangle sets, production, thumbnails)
  - Geração
- Validação (JSON, geometria, lib3mf)
- Tipos (Vec3, Triangle, Transform)
- Interfaces (SceneJSON)
- Exemplos de uso completos

**Ideal para:** Referência rápida durante desenvolvimento, entender todas as opções disponíveis.

### [CONCEPTS.md](../CONCEPTS.md)
Explicação detalhada dos conceitos fundamentais do formato 3MF.

**Conteúdo:**
- O que é 3MF e por que usar
- Estrutura de arquivo 3MF (ZIP/OPC)
- Core 3MF (modelo, recursos, objetos, build)
- Extensões (Production, Materials, Triangle Sets)
- Materiais (hierarquia, base materials, color groups, texturas, composite, multi)
- Geometria (vértices, triângulos, winding order, manifold)
- Transformações (matriz 4x3, exemplos comuns)
- Build platform (coordenadas, posicionamento)
- Metadados (padrão e customizados)
- Links para especificações oficiais

**Ideal para:** Entender profundamente o formato 3MF, aprender teoria antes da prática.

### [EXAMPLES.md](../EXAMPLES.md)
Coleção de exemplos práticos para casos de uso comuns.

**Conteúdo:**
- Geometrias básicas (cubo, pirâmide, cilindro, esfera)
- Materiais e cores (múltiplos materiais, color groups, gradientes, composite)
- Assemblies (simples, hierárquico, arrays)
- Texturas e UV mapping
- Production Extension (multifile, partnumbers, MustPreserve)
- Modelo complexo completo
- Dicas e truques

**Ideal para:** Copiar e adaptar código para suas necessidades específicas.

### [VALIDATION.md](../VALIDATION.md)
Guia completo sobre validação de arquivos e geometrias.

**Conteúdo:**
- Tipos de validação (JSON Schema, geometria, lib3mf)
- JSON Schema validation (erros comuns)
- Winding order validation
- Manifold validation
- lib3mf validation (códigos de erro)
- Fluxo de validação completo
- Debugging (visualizar normais, detectar problemas)

**Ideal para:** Garantir qualidade dos arquivos gerados, resolver problemas de geometria.

### [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
Problemas comuns e suas soluções.

**Conteúdo:**
- Erros de validação
- Problemas de geometria (faces invertidas, modelos quebrados)
- Erros de material
- Erros de assembly
- Problemas de performance
- Problemas de compatibilidade (Bambu Studio, cores, texturas)
- Erros do Node.js (ESM, memória)
- Debugging avançado (inspecionar arquivo, logging, comparar XMLs)
- Como obter ajuda

**Ideal para:** Resolver problemas rapidamente, diagnosticar erros.

### [CONTRIBUTING.md](../CONTRIBUTING.md)
Guia para contribuir com o projeto.

**Conteúdo:**
- Como contribuir (reportar bugs, sugerir features)
- Setup de desenvolvimento
- Padrões de código (TypeScript, naming, documentação)
- Escrevendo testes
- Pull requests (processo, mensagens de commit, checklist)
- Áreas para contribuir
- Debugging

**Ideal para:** Desenvolvedores que querem contribuir com o projeto.

### [CHANGELOG.md](../CHANGELOG.md)
Histórico de versões e mudanças do projeto.

**Conteúdo:**
- Versões lançadas
- Features adicionadas
- Bugs corrigidos
- Mudanças na API
- Roadmap futuro

**Ideal para:** Acompanhar evolução do projeto, saber o que mudou entre versões.

## 📁 Documentação Técnica (pasta docs/)

### [000-correcoes-aplicadas.md](./000-correcoes-aplicadas.md)
Correções aplicadas durante o desenvolvimento.

### [010-requisitos-3mf.md](./010-requisitos-3mf.md)
Requisitos e especificações 3MF.

### [020-especificacao-core.md](./020-especificacao-core.md)
Especificação detalhada do 3MF Core.

### [030-extensao-production.md](./030-extensao-production.md)
Detalhes da Production Extension.

### [040-extensao-slice.md](./040-extensao-slice.md)
Informações sobre Slice Extension.

### [050-opc-pacote.md](./050-opc-pacote.md)
Estrutura de pacote OPC (Open Packaging Conventions).

### [060-bambu-studio.md](./060-bambu-studio.md)
Compatibilidade e considerações para Bambu Studio.

### [070-validacao.md](./070-validacao.md)
Detalhes técnicos de validação.

### [080-esquema-entrada.md](./080-esquema-entrada.md)
Schema de entrada JSON (SceneJSON).

### [090-exemplos.md](./090-exemplos.md)
Exemplos técnicos e casos de teste.

### [100-arquitetura-lib.md](./100-arquitetura-lib.md)
Arquitetura interna da biblioteca.

### [110-exemplos-xml.md](./110-exemplos-xml.md)
Exemplos de estruturas XML 3MF.

### [120-referencia-rapida.md](./120-referencia-rapida.md)
Referência rápida de comandos e conceitos.

### [130-plano-implementacao.md](./130-plano-implementacao.md)
Plano de implementação e roadmap.

### [140-status-compatibilidade.md](./140-status-compatibilidade.md)
Status de compatibilidade com slicers e features.

### [150-printticket-avaliacao.md](./150-printticket-avaliacao.md)
Avaliação da extensão PrintTicket.

## 🎯 Guia de Navegação por Objetivo

### Quero começar a usar a biblioteca
1. [README.md](../README.md) - Visão geral
2. [GETTING_STARTED.md](../GETTING_STARTED.md) - Tutorial passo-a-passo
3. [EXAMPLES.md](../EXAMPLES.md) - Exemplos para copiar

### Quero entender o formato 3MF
1. [CONCEPTS.md](../CONCEPTS.md) - Conceitos fundamentais
2. [docs/020-especificacao-core.md](./020-especificacao-core.md) - Especificação técnica
3. [docs/110-exemplos-xml.md](./110-exemplos-xml.md) - Estruturas XML

### Quero usar features avançadas
1. [API.md](../API.md) - Referência completa
2. [EXAMPLES.md](../EXAMPLES.md) - Exemplos avançados
3. [docs/030-extensao-production.md](./030-extensao-production.md) - Production Extension

### Estou tendo problemas
1. [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Problemas comuns
2. [VALIDATION.md](../VALIDATION.md) - Validação e debugging
3. [GitHub Issues](https://github.com/yourusername/3mf-pr-js/issues) - Reportar bug

### Quero contribuir
1. [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição
2. [docs/100-arquitetura-lib.md](./100-arquitetura-lib.md) - Arquitetura
3. [docs/130-plano-implementacao.md](./130-plano-implementacao.md) - Roadmap

## 📖 Referências Externas

### Especificações Oficiais
- [3MF Core Specification v1.3](https://github.com/3MFConsortium/spec_core)
- [Production Extension](https://github.com/3MFConsortium/spec_production)
- [Materials Extension](https://github.com/3MFConsortium/spec_materials)
- [Triangle Sets Extension](https://github.com/3MFConsortium/spec_trianglesets)

### Ferramentas e SDKs
- [lib3mf SDK](https://github.com/3MFConsortium/lib3mf)
- [3MF Consortium](https://3mf.io/)
- [Bambu Studio](https://bambulab.com/en/download/studio)
- [PrusaSlicer](https://www.prusa3d.com/page/prusaslicer_424/)

### Padrões Relacionados
- [Open Packaging Conventions](https://en.wikipedia.org/wiki/Open_Packaging_Conventions)
- [ZIP File Format](https://en.wikipedia.org/wiki/ZIP_(file_format))
- [XML Specification](https://www.w3.org/XML/)

## 🔍 Busca Rápida

### Por Feature

**Materiais:**
- Base materials: [API.md](../API.md#base-materials)
- Color groups: [API.md](../API.md#color-groups-materials-extension)
- Texturas: [API.md](../API.md#texturas-materials-extension), [EXAMPLES.md](../EXAMPLES.md#texturas-e-uv-mapping)
- Composite: [API.md](../API.md#composite-materials-materials-extension)
- Multi-materials: [API.md](../API.md#multi-materials-materials-extension)

**Objetos:**
- Mesh: [API.md](../API.md#addmesh)
- Components: [API.md](../API.md#addcomponentobject)
- Assemblies: [EXAMPLES.md](../EXAMPLES.md#assemblies-e-componentes)

**Extensões:**
- Production: [API.md](../API.md#production-extension), [docs/030-extensao-production.md](./030-extensao-production.md)
- Triangle Sets: [API.md](../API.md#triangle-sets)
- Multifile: [API.md](../API.md#addexternalmesh)

**Validação:**
- JSON Schema: [VALIDATION.md](../VALIDATION.md#json-schema-validation)
- Geometria: [VALIDATION.md](../VALIDATION.md#validação-de-geometria)
- lib3mf: [VALIDATION.md](../VALIDATION.md#validação-lib3mf)

### Por Problema

- Faces invertidas: [TROUBLESHOOTING.md](../TROUBLESHOOTING.md#faces-aparecem-invertidas-ou-invisíveis)
- Modelo quebrado: [TROUBLESHOOTING.md](../TROUBLESHOOTING.md#modelo-aparece-quebrado-no-slicer)
- Cores erradas: [TROUBLESHOOTING.md](../TROUBLESHOOTING.md#cores-não-aparecem-corretamente)
- Performance: [TROUBLESHOOTING.md](../TROUBLESHOOTING.md#problemas-de-performance)

## 📊 Matriz de Conteúdo

| Documento | Iniciante | Intermediário | Avançado | Referência |
|-----------|:---------:|:-------------:|:--------:|:----------:|
| README.md | ✓ | ✓ | - | - |
| GETTING_STARTED.md | ✓✓✓ | ✓ | - | - |
| API.md | - | ✓ | ✓ | ✓✓✓ |
| CONCEPTS.md | ✓ | ✓✓✓ | ✓✓ | - |
| EXAMPLES.md | ✓✓ | ✓✓✓ | ✓✓ | - |
| VALIDATION.md | ✓ | ✓✓✓ | ✓✓ | ✓ |
| TROUBLESHOOTING.md | ✓✓ | ✓✓✓ | ✓✓ | ✓ |
| CONTRIBUTING.md | - | ✓ | ✓✓✓ | - |

**Legenda:** ✓ = útil, ✓✓ = muito útil, ✓✓✓ = essencial

---

## 📝 Notas

- Toda a documentação está em português brasileiro
- Exemplos de código são completos e executáveis
- Links internos facilitam navegação entre documentos
- Documentação técnica em `docs/` é mais detalhada e voltada para desenvolvimento

## 🆘 Precisa de Ajuda?

1. Consulte [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
2. Busque em [GitHub Issues](https://github.com/yourusername/3mf-pr-js/issues)
3. Abra uma nova issue se necessário
4. Entre em contato via [Discussions](https://github.com/yourusername/3mf-pr-js/discussions)

---

**Última atualização:** 2024-01-15
