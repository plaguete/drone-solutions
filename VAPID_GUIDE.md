# Guia para Gerar Chaves VAPID

Este guia explica como gerar chaves VAPID para notificações push, já que o serviço da Glitch foi descontinuado.

## 🔑 O que são Chaves VAPID?

VAPID (Voluntary Application Server Identification) é um protocolo que permite que seu servidor se identifique de forma segura ao enviar notificações push.

Você precisa de duas chaves:
- **Chave Pública** (`VAPID_PUBLIC_KEY`) - Usada no frontend
- **Chave Privada** (`VAPID_PRIVATE_KEY`) - Usada no backend (NUNCA exponha esta!)

## 🛠 Métodos para Gerar Chaves VAPID

### Método 1: Usando o Script do Projeto (Recomendado)

```bash
node generate-vapid.js
```

Isso gerará as chaves e mostrará instruções claras de como configurar.

### Método 2: Usando Node.js

#### Passo 1: Instale o pacote web-push
```bash
npm install -g web-push
```

#### Passo 2: Gere as chaves
```bash
web-push generate-vapid-keys
```

#### Passo 3: Copie as chaves
A saída será algo como:
```
=======================================
Public Key:
BElWQk3Q4fJ4d8b5g7h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e9f8g7h6i5j4k3l2m1n0o9p8q7r6s5t4

Private Key:
ALp0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7
=======================================
```

### Método 3: Via Linha de Comando (Linux/Mac)

```bash
# Instale o web-push globalmente
npm install -g web-push

# Gere as chaves
npx web-push generate-vapid-keys
```

## 📝 Como Configurar no Projeto

### Passo 1: Adicione ao arquivo `.env`

```env
# Chaves VAPID para Notificações Push
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
```

### Passo 2: Configure na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Vá no seu projeto → Settings → Environment Variables
3. Adicione as duas variáveis:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`

**Importante:** A Vercel só aceita nomes de variáveis com letras, números e underscores (_). Não use hífens (-) ou outros caracteres especiais.

### Passo 3: Configure no Backend

No arquivo `api/notifications/push.js`, as chaves já estão configuradas:

```javascript
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};
```

### Passo 4: Configure no Frontend

No arquivo `src/hooks/usePushNotifications.js`, a chave pública já está sendo usada:

```javascript
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
});
```

## 🔍 Verificação

### Verifique se as chaves estão configuradas

```javascript
// No console do navegador
console.log(process.env.VAPID_PUBLIC_KEY);
```

### Teste as notificações push

1. Abra o aplicativo
2. Tente se inscrever para notificações
3. Verifique o console do navegador e do servidor

## ⚠️ Boas Práticas

### Segurança
- ✅ **NUNCA** exponha a chave privada no frontend
- ✅ **NUNCA** commit a chave privada no Git
- ✅ Mantenha a chave privada segura no `.env`
- ✅ Use variáveis de ambiente na Vercel

### Gerenciamento
- ✅ Gere novas chaves para cada ambiente (dev, prod)
- ✅ Mantenha backup das chaves em local seguro
- ✅ Atualize as chaves periodicamente

## 🐛 Solução de Problemas

### Problema: "VAPID keys not set"
**Solução**: Configure as chaves no backend com `webpush.setVapidDetails()`

### Problema: "Invalid VAPID key"
**Solução**: 
- Verifique se a chave pública está correta
- Certifique-se de que não há espaços ou quebras de linha
- Gere novas chaves se necessário

### Problema: "The name contains invalid characters" (Vercel)
**Solução**: 
- Use apenas letras, números e underscores
- Não use hífens (-) ou outros caracteres especiais
- Não comece com número

### Problema: Notificações não funcionam
**Solução**:
- Verifique se as chaves estão configuradas corretamente
- Confirme que o service worker está registrado
- Verifique as permissões do navegador

## 📚 Recursos Adicionais

### Documentação Oficial
- Web Push Protocol: https://webpush-wg.github.io/webpush-protocol/
- VAPID Specification: https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid

### Ferramentas
- Web Push Libraries: https://github.com/web-push-libs/
- Push Companion: https://web-push-codelab.glitch.me/

### Tutoriais
- Google Web Fundamentals: https://web.dev/push-notifications/
- MDN Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

## 🎯 Checklist de Configuração

- [ ] Gerar chaves VAPID (pública e privada)
- [ ] Adicionar chaves ao arquivo `.env`
- [ ] Configurar chaves na Vercel
- [ ] Configurar chaves no backend
- [ ] Configurar chaves no frontend
- [ ] Testar notificações push
- [ ] Verificar permissões do navegador

---

**Dica**: Se estiver com dificuldades, use o Método 1 (Script do Projeto) - é o mais confiável e funciona offline!- Google Web Fundamentals: https://web.dev/push-notifications/
