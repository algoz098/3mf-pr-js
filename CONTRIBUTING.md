# Contribuindo para 3mf-pr-js

Obrigado pelo interesse em contribuir! Este documento fornece diretrizes para contribuições.

## 🚀 Como Contribuir

### Reportar Bugs

Use [GitHub Issues](https://github.com/yourusername/3mf-pr-js/issues) e inclua:

- Descrição clara do problema
- Código mínimo que reproduz o bug
- Versão do Node.js e 3mf-pr-js
- Comportamento esperado vs. observado
- Stack trace completo (se aplicável)

### Sugerir Features

Abra um Issue com:

- Caso de uso claro
- Exemplo de como a API seria usada
- Benefícios da feature

## 🔧 Setup de Desenvolvimento

### Pré-requisitos

- Node.js ≥ 18
- npm ou yarn
- Git

### Clone e Instale

```bash
git clone https://github.com/yourusername/3mf-pr-js.git
cd 3mf-pr-js
npm install
```

### Build

```bash
npm run build
```

### Testes

```bash
# Rodar todos os testes
npm test

# Watch mode (desenvolvimento)
npm run dev:test

# Testes específicos
npx vitest run tests/basic.spec.ts
```

## 📝 Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Tipos explícitos em assinaturas públicas
- Evite `any` - use `unknown` se necessário

```typescript
// ✅ Bom
function processVertex(vertex: Vec3): void {
  // ...
}

// ❌ Evitar
function processVertex(vertex: any) {
  // ...
}
```

### Naming Conventions

- **Classes**: PascalCase (`Model`, `ValidationResult`)
- **Métodos/Funções**: camelCase (`addMesh`, `validateWindingOrder`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_UNIT`)
- **Tipos**: PascalCase (`Vec3`, `Transform`)

### Documentação de Código

Use JSDoc para funções públicas:

```typescript
/**
 * Adds a base material to a material set.
 * 
 * @param name - Material name
 * @param displaycolor - Color in #RRGGBBAA format
 * @param setId - Material set ID (optional, auto-assigned if omitted)
 * @returns Object with pid and pindex
 * 
 * @example
 * ```typescript
 * const red = model.addBaseMaterial('PLA Red', '#FF0000FF');
 * ```
 */
addBaseMaterial(name: string, displaycolor: string, setId?: number): { pid: number; pindex: number }
```

### Formatação

O projeto usa prettier/ESLint (a configurar):

```bash
npm run format
npm run lint
```

## 🧪 Escrevendo Testes

### Estrutura

```typescript
import { describe, it, expect } from 'vitest';
import { Model } from '../src/model.js';

describe('Feature Name', () => {
  it('should do something specific', async () => {
    const model = new Model();
    // ... setup
    
    const result = model.someMethod();
    
    expect(result).toBe(expectedValue);
  });
  
  it('should throw on invalid input', () => {
    const model = new Model();
    
    expect(() => {
      model.someMethod(invalidInput);
    }).toThrow('Expected error message');
  });
});
```

### Boas Práticas

- Um conceito por teste
- Nome descritivo do teste
- Arrange-Act-Assert pattern
- Testar casos de erro
- Testar edge cases

## 📦 Pull Requests

### Processo

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie branch** a partir de `main`:
   ```bash
   git checkout -b feature/amazing-feature
   # ou
   git checkout -b fix/bug-description
   ```

4. **Faça commits** pequenos e focados:
   ```bash
   git commit -m "feat: add support for X"
   git commit -m "fix: resolve issue with Y"
   ```

5. **Push** para seu fork:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Abra PR** no GitHub

### Mensagens de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Apenas documentação
- `style:` Formatação, sem mudança de código
- `refactor:` Refatoração de código
- `test:` Adicionar/corrigir testes
- `chore:` Tarefas de manutenção

```bash
# Exemplos
git commit -m "feat: add texture support"
git commit -m "fix: resolve winding order validation"
git commit -m "docs: update API reference"
```

### Checklist do PR

Antes de submeter:

- [ ] Código compila sem erros (`npm run build`)
- [ ] Todos os testes passam (`npm test`)
- [ ] Novos testes para nova funcionalidade
- [ ] Documentação atualizada (se aplicável)
- [ ] Changelog atualizado (para features/fixes significativos)
- [ ] Sem console.log ou código de debug

### Revisão

- Mantenha PRs focados e pequenos
- Responda a comentários de revisão
- Faça updates solicitados
- Seja receptivo a feedback

## 📚 Áreas para Contribuir

### High Priority

- [ ] Suporte a mais extensões 3MF (Beam Lattice, Slice, etc.)
- [ ] Melhorias de performance
- [ ] Mais exemplos de uso
- [ ] Testes adicionais

### Medium Priority

- [ ] CLI tool para conversão
- [ ] Suporte a importação (ler 3MF existentes)
- [ ] Validação mais robusta
- [ ] Documentação em outros idiomas

### Low Priority

- [ ] Playground web
- [ ] Visualizador 3D integrado
- [ ] Plugins para ferramentas populares

## 🐛 Debugging

### Executar Testes Específicos

```bash
npx vitest run --reporter=verbose tests/materials.spec.ts
```

### Debug com VS Code

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeArgs": [
        "--loader=tsx",
        "node_modules/vitest/vitest.mjs",
        "run"
      ],
      "console": "integratedTerminal"
    }
  ]
}
```

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

## ❓ Perguntas

- 💬 [Discussions no GitHub](https://github.com/yourusername/3mf-pr-js/discussions)
- 📧 Email: maintainer@example.com

---

**Obrigado por contribuir para tornar 3mf-pr-js melhor!** 🎉
