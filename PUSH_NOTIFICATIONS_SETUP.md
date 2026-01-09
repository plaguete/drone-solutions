# 🚀 Configuração de Notificações Push (Fora do Navegador)

## ⚡ Como Funcionam as Notificações Push

As **Push Notifications** são notificações que aparecem no seu sistema operacional (Windows, macOS, Android, iOS) mesmo quando você **NÃO está logado** e nem com o navegador aberto.

Elas funcionam como:
- ✅ Notificações do WhatsApp
- ✅ Notificações do Instagram  
- ✅ Notificações de aplicativos nativos

## 📋 Pré-requisitos

### 1. Gerar Chaves VAPID

Execute no terminal:
```bash
node generate-vapid.js
```

Isso gerará duas chaves:
- **Chave Pública** → Usada no frontend
- **Chave Privada** → Usada no backend (NUNCA exponha!)

### 2. Configurar Variáveis de Ambiente

Abra o arquivo `.env` e adicione:

```env
# Chaves VAPID para Notificações Push
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
```

### 3. Configurar na Vercel (se estiver usando)

1. Acesse [vercel.com](https://vercel.com)
2. Vá no seu projeto → Settings → Environment Variables
3. Adicione as duas variáveis:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`

## 🔐 Permissões do Navegador

### Primeira Vez que Acessar o Site:

1. **O navegador mostrará um popup:**
   ```
   "droneservice.com quer enviar notificações"
   [Permitir] [Bloquear]
   ```

2. **Clique em "PERMITIR"** ✅

3. **Pronto!** Agora você receberá notificações mesmo fora do site.

## 📱 Como Testar as Notificações

### Teste 1: Notificação Manual (AdminDashboard)

1. Acesse o painel administrativo
2. Clique em qualquer pedido
3. Clique em "Notificar Cliente"
4. **Verifique:**
   - Apareceu uma notificação no seu sistema?
   - A notificação veio mesmo com o navegador fechado?

### Teste 2: Notificação Automática (Novo Pedido)

1. Crie um novo pedido como cliente
2. **Verifique:**
   - O administrador recebeu notificação?
   - A notificação apareceu fora do navegador?

### Teste 3: Notificação Agendada (Lembrete)

1. Configure o cron job (veja `api/notifications/reminder.md`)
2. **Verifique:**
   - Recebeu notificação 1 dia antes do serviço?
   - Funcionou mesmo sem estar logado?

## 🎯 O Que Esperar

### Quando Funciona Corretamente:

✅ **Notificação aparece no sistema operacional:**
- Windows: Canto inferior direito (Action Center)
- macOS: Canto superior direito
- Android: Barra de notificações
- iOS: Centro de notificações

✅ **Funciona com:**
- Navegador fechado
- Usuário deslogado
- Computador ligado (não precisa estar no site)

✅ **Ações disponíveis:**
- Clicar na notificação → Abre o site
- Ignorar → Some sozinha depois de alguns segundos

## 🐛 Solução de Problemas

### Problema: "Não recebo notificações"

**Solução:**
1. Verifique se permitiu as notificações no navegador
2. Confirme que as chaves VAPID estão no `.env`
3. Reinicie o servidor: `npm run dev`
4. Tente em modo anônimo (Ctrl+Shift+N)

### Problema: "Só funciona com o navegador aberto"

**Solução:**
1. Verifique o service worker: `chrome://serviceworker-internals/`
2. Confirme que o SW está registrado
3. Verifique as permissões: `chrome://settings/content/notifications`

### Problema: "Notificações não aparecem no celular"

**Solução:**
1. Acesse o site no celular
2. Permita as notificações
3. Adicione à tela inicial (Add to Home Screen)
4. Teste novamente

## 📊 Tipos de Notificações Implementadas

### 1. **Notificações Manuais** (Admin → Cliente)
- Quando: Admin clica em "Notificar Cliente"
- Onde: Painel administrativo
- Para quem: Cliente específico

### 2. **Notificações Automáticas** (Sistema → Admin)
- Quando: Cliente cria novo pedido
- Onde: Automaticamente
- Para quem: Todos os administradores

### 3. **Notificações Agendadas** (Sistema → Admin)
- Quando: 1 dia antes do serviço
- Onde: Via cron job
- Para quem: Todos os administradores

## 🔄 Como Reconfigurar

### Se precisar gerar novas chaves:

1. Execute: `node generate-vapid.js`
2. Copie as novas chaves
3. Atualize no `.env`
4. Atualize na Vercel
5. Reinicie tudo

### Se precisar resetar as permissões:

1. Chrome: `chrome://settings/content/notifications`
2. Encontre seu site
3. Clique no ícone de lixeira
4. Recarregue a página e permita novamente

## 📞 Suporte

Se ainda não funcionar:

1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor
3. Confirme que todas as variáveis estão configuradas
4. Teste em outro navegador

## ✅ Checklist Final

- [ ] Gerei as chaves VAPID
- [ ] Adicionei ao arquivo `.env`
- [ ] Configurei na Vercel
- [ ] Permiti notificações no navegador
- [ ] Testei notificações manuais
- [ ] Testei notificações automáticas
- [ ] Configurei o cron job
- [ ] Testei notificações agendadas

---

**🎉 Pronto!** Agora você receberá notificações mesmo quando não estiver logado e nem no navegador!