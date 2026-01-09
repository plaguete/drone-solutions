# Guia de Segurança - DroneService

Este guia explica como configurar e gerenciar chaves de segurança para o projeto.

## 🔐 Chaves de Segurança Necessárias

O projeto requer duas chaves de segurança principais:

### 1. Chaves VAPID (Notificações Push)
- **Finalidade**: Autenticar notificações push
- **Chave Pública**: Usada no frontend (pode ser pública)
- **Chave Privada**: Usada no backend (DEVE ser secreta)

### 2. JWT Secret (Autenticação)
- **Finalidade**: Assinar tokens de autenticação JWT
- **Requisitos**: Longa (64+ caracteres), aleatória, segura
- **Importância**: CRÍTICA para segurança do sistema

## 🚀 Como Gerar Todas as Chaves

### Método Rápido (Recomendado)

```bash
# Gere todas as chaves de uma vez
node generate-vapid.js
node generate-jwt-secret.js
```

### Método Detalhado

#### Passo 1: Gerar Chaves VAPID
```bash
node generate-vapid.js
```

Copie as chaves geradas para o `.env`:
```env
REACT_APP_VAPID_PUBLIC_KEY=sua_chave_publica
REACT_APP_VAPID_PRIVATE_KEY=sua_chave_privada
```

#### Passo 2: Gerar JWT Secret
```bash
node generate-jwt-secret.js
```

Copie a chave gerada para o `.env`:
```env
JWT_SECRET=sua_chave_jwt_segura
```

## 📝 Configuração Completa do .env

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Chaves VAPID
REACT_APP_VAPID_PUBLIC_KEY=BPuiaaRzUiQXELm67nHElmPCAMeRMFc5iXpO55K1TRJbFyDQl_-PnuIIGwcurievjdN_g3GUO16TOSsUVcgUnmA
REACT_APP_VAPID_PRIVATE_KEY=nmAtPHSmhefHYA3utMkqGJ4W4-yrLpUZKK2vwv5DgGE

# JWT Secret
JWT_SECRET=b5da302be7b59c2ac903c8dae2e8badc606abc517daa3197030b109fe341996106f1b3c204ebe488b723cbb46544443b93687aff496a5f21fc2f85e0c363d54e

# Configurações do App
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 🔒 Boas Práticas de Segurança

### Para JWT Secret

✅ **FAÇA:**
- Use chaves longas (mínimo 64 caracteres)
- Gere chaves aleatórias usando crypto
- Use chaves diferentes para dev/staging/prod
- Mantenha a chave segura e privada
- Armazene em variáveis de ambiente
- Faça backup seguro da chave

❌ **NÃO FAÇA:**
- Nunca use palavras comuns ou frases
- Nunca commit a chave no Git
- Nunca compartilhe a chave publicamente
- Nunca use a mesma chave em múltiplos ambientes
- Nunca use chaves curtas ou previsíveis

### Para Chaves VAPID

✅ **FAÇA:**
- Mantenha a chave privada segura
- Use variáveis de ambiente
- Gere chaves diferentes por ambiente
- Atualize periodicamente

❌ **NÃO FAÇA:**
- Nunca exponha a chave privada no frontend
- Nunca commit a chave privada no Git
- Nunca use a mesma chave privada em múltiplos projetos

## 🛠 Scripts de Geração

### generate-vapid.js
Gera par de chaves VAPID para notificações push.

```bash
node generate-vapid.js
```

### generate-jwt-secret.js
Gera chave JWT_SECRET segura usando crypto.

```bash
node generate-jwt-secret.js
```

## 📋 Checklist de Configuração

### Ambiente de Desenvolvimento
- [ ] Gerar chaves VAPID
- [ ] Gerar JWT_SECRET
- [ ] Configurar arquivo `.env`
- [ ] Testar autenticação
- [ ] Testar notificações push

### Ambiente de Produção (Vercel)
- [ ] Gerar chaves separadas para produção
- [ ] Configurar na Vercel (Environment Variables)
- [ ] Verificar se as chaves estão corretas
- [ ] Testar autenticação em produção
- [ ] Testar notificações push em produção

## 🐛 Solução de Problemas

### Problema: "Invalid JWT token"
**Causa**: JWT_SECRET incorreta ou não configurada
**Solução**: 
1. Verifique se JWT_SECRET está no `.env`
2. Confirme que a chave é longa o suficiente
3. Reinicie o servidor

### Problema: "VAPID keys not set"
**Causa**: Chaves VAPID não configuradas
**Solução**:
1. Gere as chaves com `node generate-vapid.js`
2. Adicione ao `.env`
3. Configure no backend

### Problema: Notificações push não funcionam
**Causa**: Chaves VAPID incorretas
**Solução**:
1. Verifique se as chaves estão corretas
2. Confirme que estão configuradas na Vercel
3. Teste o service worker

## 🔄 Gerenciamento de Chaves

### Quando Gerar Novas Chaves

1. **Primeira configuração** do projeto
2. **Vazamento de chave** (suspeita ou confirmado)
3. **Rotação periódica** (a cada 6-12 meses)
4. **Mudança de ambiente** (dev → prod)

### Como Rotacionar Chaves

1. Gere novas chaves
2. Atualize o arquivo `.env`
3. Atualize na Vercel
4. Reinicie os serviços
5. Teste todas as funcionalidades

## 📚 Recursos Adicionais

### Documentação
- JWT Specification: https://tools.ietf.org/html/rfc7519
- VAPID Specification: https://tools.ietf.org/html/draft-thomson-webpush-vapid
- Web Push Protocol: https://tools.ietf.org/html/rfc8030

### Ferramentas
- JWT Debugger: https://jwt.io/
- Web Push Libraries: https://github.com/web-push-libs/

### Tutoriais
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Web Push Security: https://web.dev/push-notifications-security/

---

**⚠️ AVISO IMPORTANTE**: A segurança do seu aplicativo depende diretamente da segurança das suas chaves. Siga rigorosamente as boas práticas descritas neste guia.