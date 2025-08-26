# Catalog Hub 🗂️

O Catalog Hub é uma aplicação de página única (SPA) moderna para gerenciamento de produtos. Este projeto serve como uma demonstração prática de como construir uma aplicação CRUD (Create, Read, Update, Delete) completa, utilizando os recursos mais recentes do Angular.

## Principais Funcionalidades

  - ✅ **Listagem de Produtos:** Visualização de todos os produtos consumidos de uma API pública.
  - 🔍 **Busca Reativa:** Filtragem de produtos em tempo real com otimização de chamadas à API.
  - ➕ **Criação e Edição:** Um formulário único e reutilizável para adicionar e atualizar produtos.
  - ❌ **Deleção:** Remoção de produtos da lista.
  - ⏳ **Feedback Visual:** Um indicador de carregamento global durante as requisições HTTP.
  - 🌐 **Internacionalização:** Interface totalmente traduzida com `@ngx-translate/core` (`pt-BR` / `en-US` / `es-ES`).

## Stack Tecnológico

Este projeto foi construído com foco em uma arquitetura moderna e limpa:

  - **Framework:** Angular 18+
  - **Arquitetura:** Standalone Components
  - **Estilização:** Tailwind CSS
  - **Formulários:** Reactive Forms
  - **Reatividade:** RxJS (para busca) e Signals (para gerenciamento de estado simples)
  - **Cliente HTTP:** `HttpClient` com um `HttpInterceptor`
  - **Internacionalização:** `@ngx-translate/core`

## Rodando o Projeto Localmente

Para executar o projeto em sua máquina, siga os passos abaixo:

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/NFC-Streamline-Technology/Catalog-Hub.git
    ```

2.  **Acesse a pasta do projeto:**

    ```bash
    cd catalog-hub
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    ng serve -o
    ```

O app estará disponível em `http://localhost:4200/`.
