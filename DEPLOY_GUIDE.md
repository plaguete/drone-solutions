# 🚀 Guia de Deploy na Vercel com GitHub

Este guia explica como fazer o deploy do seu site na Vercel conectando com o GitHub.

## 📋 Pré-requisitos

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Conta no [GitHub](https://github.com)
- ✅ Código do projeto commitado no GitHub

## 🎯 Passo a Passo

### Passo 1: Criar Repositório no GitHub

1. **Acesse** [github.com](https://github.com)
2. **Clique** em "New" (canto superior direito)
3. **Preencha**:
   - Repository name: `drone-service` (ou o nome que preferir)
   - Description: "Sistema de agendamento para serviços de drone"
   - Público ou Privado (escolha o que preferir)
4. **Clique** em "Create repository"

### Passo 2: Fazer Upload do Código

#### Opção A: Usando Git (Recomendado)

```bash
# 1. Inicialize o repositório (se ainda não tiver feito)
git init

# 2. Adicione todos os arquivos
git add .

# 3. Faça o primeiro commit
git commit -m "Initial commit: Drone Service App"

# 4. Conecte ao repositório do GitHub
git remote add origin https://github.com/seu-usuario/drone-service.git

# 5. Envie para o GitHub
git push -u origin main
```

#### Opção B: Upload Manual (Se não souber usar Git)

1. **Acesse** seu repositório no GitHub
2. **Clique** em "Add file" → "Upload files"
3. **Arraste** todos os arquivos do projeto
4. **Clique** em "Commit changes"

### Passo 3: Conectar GitHub à Vercel

1. **Acesse** [vercel.com](https://vercel.com)
2. **Clique** em "Add New" → "Project"
3. **Clique** em "Import" ao lado do GitHub
4. **Autorize** a Vercel a acessar seu GitHub (se for a primeira vez)
5. **Procure** seu repositório `drone-service`
6. **Clique** em "Import"

### Passo 4: Configurar o Projeto na Vercel

1. **Framework Preset**: Selecione "Vite"
2. **Root Directory**: Deixe como está (./)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Passo 5: Configurar Variáveis de Ambiente

1. **Na página de configuração**, role até "Environment Variables"
2. **Adicione** as variáveis:

```env
# Banco de Dados
DATABASE_URL=sqlite:./api/database.sqlite

# JWT Secret
JWT_SECRET=sua_chave_jwt_aqui

# Chaves VAPID (para notificações push)
VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid

# Cron Secret (para notificações agendadas)
CRON_SECRET=sua_chave_cron_aqui
```

3. **Clique** em "Add" para cada variável

### Passo 6: Fazer o Deploy

1. **Clique** em "Deploy"
2. **Aguarde** o processo de build (2-5 minutos)
3. **Pronto!** Seu site estará no ar

## 🔗 URLs Geradas

- **Production**: `https://drone-service.vercel.app` (exemplo)
- **Preview**: Cada commit gera uma URL única para testar

## 🔄 Deploy Automático

### Como Funciona:
- ✅ Cada commit no `main` → Deploy automático na produção
- ✅ Cada commit em branch → Deploy em preview
- ✅ Pull Request → Gera URL de preview para testar

### Como Usar:
```bash
# 1. Faça uma alteração no código
# 2. Commit e push
git add .
git commit -m "Adiciona nova funcionalidade"
git push origin main

# 3. A Vercel faz o deploy automaticamente!
```

## 🛠 Configurações Avançadas

### 1. Domínio Personalizado

1. Vá em **Settings → Domains**
2. Adicione seu domínio (ex: `meusite.com`)
3. Siga as instruções de DNS

### 2. Variáveis de Ambiente por Ambiente

- **Production**: Variáveis para produção
- **Preview**: Variáveis para testar
- **Development**: Variáveis para desenvolvimento local

### 3. Cron Jobs (Notificações Agendadas)

Adicione no `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/notifications/scheduled",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 🐛 Solução de Problemas

### Problema: "Build failed"
**Solução:**
1. Verifique os logs na Vercel
2. Confirme que todas as variáveis estão configuradas
3. Teste localmente: `npm run build`

### Problema: "Database not found"
**Solução:**
1. Confirme que o banco de dados está commitado
2. Verifique o caminho no `DATABASE_URL`
3. Use SQLite para desenvolvimento

### Problema: "Notificações não funcionam"
**Solução:**
1. Confirme que as chaves VAPID estão configuradas
2. Verifique as permissões no navegador
3. Teste em produção (HTTPS é obrigatório)

## 📊 Monitoramento

### Logs:
- **Acesse**: Vercel Dashboard → Seu projeto → Logs
- **Veja**: Erros, requisições, builds

### Analytics:
- **Acesse**: Vercel Dashboard → Analytics
- **Veja**: Tráfego, performance, erros

## ✅ Checklist de Deploy

- [ ] Criei repositório no GitHub
- [ ] Fiz upload do código
- [ ] Conectei GitHub à Vercel
- [ ] Configurei as variáveis de ambiente
- [ ] Fiz o primeiro deploy
- [ ] Testei o site no ar
- [ ] Configurei domínio personalizado (opcional)
- [ ] Configurei cron jobs (opcional)

## 🎉 Pronto!

Seu site estará no ar e atualizando automaticamente a cada commit!

### Links Úteis:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub](https://github.com)
- [Documentação Vercel](https://vercel.com/docs)

---

**Dica**: Use branches para testar novas funcionalidades antes de mandar para produção!