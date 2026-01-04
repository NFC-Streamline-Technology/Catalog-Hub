# Catalog Hub 🗂️

O Catalog Hub é uma aplicação de página única (SPA) moderna para gerenciamento de produtos. Este projeto serve como uma demonstração prática de como construir uma aplicação CRUD (Create, Read, Update, Delete) completa, utilizando os recursos mais recentes do Angular 18+ com as melhores práticas de desenvolvimento.

## ✨ Principais Funcionalidades

- ✅ **Dashboard Interativo:** Visão geral com KPIs, gráficos e estatísticas dos produtos
- 📦 **Listagem de Produtos:** Visualização paginada com busca e filtros em tempo real
- 🔍 **Busca Reativa:** Filtragem de produtos com debounce e otimização de chamadas à API
- ➕ **Criação e Edição:** Formulário reutilizável com validação reativa completa
- 🖼️ **Upload de Imagens:** Suporte para múltiplas imagens (drag & drop ou URL)
- ❌ **Deleção:** Remoção de produtos com diálogo de confirmação
- ⏳ **Feedback Visual:** Indicador de carregamento global durante requisições HTTP
- 🌐 **Internacionalização:** Interface totalmente traduzida em 3 idiomas (pt-BR, en-US, es-ES)
- 📄 **Paginação Inteligente:** Componente customizado com navegação otimizada

## 🏗️ Arquitetura e Boas Práticas

Este projeto implementa uma arquitetura moderna e escalável:

### **Signals API** 🚀

- Reatividade nativa do Angular 18+ com `signal()` e `computed()`
- Type-safe translations usando `typeof` dos arquivos JSON
- Inputs/Outputs como signals para melhor performance
- Destruição automática com `takeUntilDestroyed()`

### **Type Safety** 🛡️

- Zero uso de `any`
- Tipos de tradução gerados automaticamente do JSON
- Interfaces bem definidas para todos os modelos
- Validação em tempo de compilação

### **Componentização** 🧩

- Standalone components (Angular 18+)
- Componentes reutilizáveis e modulares
- Separação clara de responsabilidades
- Templates externalizados para componentes grandes

### **Padrões de Código** 📏

- Organização consistente de métodos
- Uso adequado de `readonly` em signals
- Computed signals para valores derivados
- Constructor apenas para subscriptions

## 🛠️ Stack Tecnológico

- **Framework:** Angular 18+
- **Linguagem:** TypeScript 5+
- **Arquitetura:** Standalone Components
- **Estilização:** Tailwind CSS 3+
- **Formulários:** Reactive Forms com validação
- **Reatividade:** RxJS + Signals API
- **Cliente HTTP:** HttpClient com interceptors
- **Internacionalização:** @ngx-translate/core
- **Ícones:** Font Awesome 6
- **Gráficos:** Chart.js com ng2-charts
- **Hospedagem:** Firebase Hosting

## 📁 Estrutura do Projeto

```
src/app/
├── core/                       # Serviços e funcionalidades principais
│   ├── interceptors/           # HTTP interceptors (loading)
│   └── services/               # Serviços globais (loading)
├── pages/                      # Páginas da aplicação
│   ├── dashboard/              # Dashboard com KPIs e gráficos
│   │   └── services/
│   └── products/               # Gerenciamento de produtos
│       ├── components/         # Componentes específicos da página
│       │   ├── product-card/
│       │   └── product-form/
│       └── services/
├── shared/                     # Recursos compartilhados
│   ├── components/             # Componentes reutilizáveis
│   │   ├── confirm-dialog/
│   │   ├── header/
│   │   ├── image-upload/
│   │   ├── loading-spinner/
│   │   └── pagination/
│   └── models/                 # Interfaces e tipos
│       ├── product.model.ts
│       └── translate.model.ts
└── assets/
    └── i18n/
        ├── pt-BR.json
        ├── en-US.json
        └── es-ES.json
```

## 🚀 Rodando o Projeto Localmente

### Pré-requisitos

- Node.js 20+ e npm
- Angular CLI 18+

### Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/NFC-Streamline-Technology/Catalog-Hub.git
   ```

2. **Acesse a pasta do projeto:**

   ```bash
   cd Catalog-Hub
   ```

3. **Instale as dependências:**

   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   ng serve -o
   ```

O app estará disponível em `http://localhost:4200/`

### Scripts Disponíveis

```bash
npm start          # Inicia servidor de desenvolvimento
npm run build      # Build de produção
npm run lint       # Verifica código com ESLint
```

## 🎯 Recursos Técnicos Implementados

### Traduções Type-Safe

Tipos gerados automaticamente do JSON usando `typeof`:

```typescript
import type { ProductsTranslations } from '@shared/models/translate.model'

protected readonly translate = signal<ProductsTranslations | null>(null)

// Autocomplete completo no template:
{{ translate()?.fields?.title?.label }}
```

### Signals API

Gerenciamento de estado reativo e performático:

```typescript
// State management
protected readonly products = signal<Product[]>([])
protected readonly isLoading = signal<boolean>(false)

// Computed values
protected readonly totalValue = computed(() =>
  this.products().reduce((sum, p) => sum + p.price, 0)
)
```

### Paginação Customizada

Componente inteligente com navegação otimizada:

- Ellipsis para muitas páginas
- Sempre mostra primeira e última página
- Contexto dinâmico ao redor da página atual

### Upload de Imagens

Suporte completo para imagens:

- Drag & drop de arquivos
- Adicionar por URL
- Validação de tipo e tamanho
- Preview em tempo real

## 📊 Análise de Qualidade

O projeto segue rigorosamente as melhores práticas do Angular:

| Métrica                  | Status         |
| ------------------------ | -------------- |
| Type Safety              | ✅ 100%        |
| Signals API              | ✅ 100%        |
| Standalone Components    | ✅ 100%        |
| Computed Signals         | ✅ 100%        |
| Templates Externalizados | ✅ 100%        |
| Padrão de Código         | ✅ Consistente |

## 🌐 Internacionalização

Suporte completo para 3 idiomas:

- Português (pt-BR)
- Inglês (en-US)
- Espanhol (es-ES)

Troca de idioma em tempo real através do header.

## 🔧 Configuração Adicional

### Prettier

O projeto usa Prettier para formatação consistente

### TypeScript

Configurado com `resolveJsonModule: true` para suporte a tipos derivados de JSON.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é open source e está disponível sob a [MIT License](LICENSE).

## 👥 Autores

- **NFC Streamline Technology** - [GitHub](https://github.com/NFC-Streamline-Technology)

## 🙏 Agradecimentos

- API pública: [DummyJSON](https://dummyjson.com/)
- Comunidade Angular
- Contribuidores open source

---

**Desenvolvido com ❤️ usando Angular 18+**
