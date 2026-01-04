# 🔐 Configuração de Ambientes

## Arquivos de Ambiente

Este projeto usa variáveis de ambiente para proteger credenciais sensíveis.

### Estrutura

```
src/environments/
├── environment.ts           # ❌ NÃO COMMITADO (dev)
├── environment.prod.ts      # ❌ NÃO COMMITADO (prod)
└── environment.example.ts   # ✅ Template (commitado)
```

### 🚀 Setup Inicial

1. **Copie o arquivo de exemplo:**

   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

2. **Preencha com suas credenciais do Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Selecione seu projeto
   - Vá em "Project Settings" > "General"
   - Role até "Your apps" e copie as credenciais

3. **Edite `environment.ts`:**

   ```typescript
   export const environment = {
     production: false,
     firebase: {
       projectId: 'seu-projeto-id',
       appId: 'seu-app-id'
       // ... outras configs
     }
   }
   ```

4. **Repita para produção:**

   ```bash
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```

   E marque `production: true`

### 🔒 Segurança

- ✅ `environment.ts` e `environment.prod.ts` estão no `.gitignore`
- ✅ Credenciais nunca são commitadas
- ✅ Cada desenvolvedor tem suas próprias credenciais locais

### 🏗️ Build

O Angular automaticamente usa:

- **Dev** (`ng serve`): `environment.ts`
- **Prod** (`ng build`): `environment.prod.ts`

### 📝 Nota para Novos Desenvolvedores

Se você clonou este projeto e está tendo erros:

1. Verifique se criou os arquivos de ambiente
2. Solicite credenciais ao time
3. Nunca commite credenciais reais!
