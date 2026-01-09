# Guia de Testes - DroneService

Este guia ajuda a testar todas as funcionalidades do sistema.

## 🧪 Testes de Funcionalidades

### 1. Testes de Autenticação

#### 1.1 Cadastro de Usuário
- [ ] Acessar `/cadastro`
- [ ] Preencher formulário com dados válidos
- [ ] Verificar se redireciona para login
- [ ] Verificar se não permite email/telefone duplicados

#### 1.2 Login
- [ ] Acessar `/login`
- [ ] Fazer login com credenciais válidas
- [ ] Verificar se redireciona para home
- [ ] Verificar se token é salvo no localStorage

#### 1.3 Recuperação de Senha
- [ ] Acessar `/esqueci-senha`
- [ ] Inserir email cadastrado
- [ ] Verificar se exibe link no console (dev)
- [ ] Testar link de recuperação

### 2. Testes de Agendamento

#### 2.1 Novo Agendamento
- [ ] Acessar `/agendar` (após login)
- [ ] Selecionar tipo de serviço
- [ ] Escolher data disponível
- [ ] Selecionar localização no mapa
- [ ] Preencher detalhes
- [ ] Enviar pedido
- [ ] Verificar confirmação

#### 2.2 Validações de Agendamento
- [ ] Testar data já ocupada
- [ ] Testar data no passado
- [ ] Testar sem localização
- [ ] Testar com localização por texto

### 3. Testes de Acompanhamento

#### 3.1 Meus Pedidos
- [ ] Acessar `/meus-pedidos`
- [ ] Verificar lista de pedidos
- [ ] Verificar status dos pedidos
- [ ] Testar filtros (pendente, aprovado, recusado)

#### 3.2 Detalhes do Pedido
- [ ] Clicar em um pedido
- [ ] Verificar informações exibidas
- [ ] Verificar botões de ação

### 4. Testes de Painel Administrativo

#### 4.1 Dashboard Admin
- [ ] Acessar `/admin` (com usuário admin)
- [ ] Verificar estatísticas
- [ ] Verificar lista de agendamentos
- [ ] Testar filtros e busca

#### 4.2 Gerenciamento de Pedidos
- [ ] Aceitar um pedido pendente
- [ ] Recusar um pedido pendente
- [ ] Editar informações financeiras
- [ ] Enviar notificação ao cliente

#### 4.3 Calendário
- [ ] Navegar entre meses
- [ ] Verificar dias com agendamentos
- [ ] Verificar dia atual destacado

### 5. Testes de Notificações

#### 5.1 Notificações Push
- [ ] Ativar notificações no navegador
- [ ] Subscrever para push notifications
- [ ] Enviar notificação do admin
- [ ] Receber notificação push

#### 5.2 Notificações em Tempo Real
- [ ] Verificar lista de notificações
- [ ] Marcar notificação como lida
- [ ] Verificar contador de não lidas

### 6. Testes de Responsividade

#### 6.1 Mobile
- [ ] Testar em smartphone (Chrome DevTools)
- [ ] Verificar menu mobile
- [ ] Verificar formulários
- [ ] Verificar mapa

#### 6.2 Tablet
- [ ] Testar em tablet
- [ ] Verificar layout
- [ ] Verificar funcionalidades

#### 6.3 Desktop
- [ ] Testar em desktop
- [ ] Verificar todas as funcionalidades

### 7. Testes de Performance

#### 7.1 Carregamento
- [ ] Verificar tempo de carregamento inicial
- [ ] Verificar carregamento de páginas
- [ ] Verificar carregamento de imagens

#### 7.2 Navegação
- [ ] Testar navegação entre páginas
- [ ] Verificar transições
- [ ] Testar voltar/avançar

### 8. Testes de Segurança

#### 8.1 Autenticação
- [ ] Testar acesso sem login
- [ ] Testar token expirado
- [ ] Testar token inválido

#### 8.2 Autorização
- [ ] Testar acesso admin com usuário comum
- [ ] Verificar permissões

## 🐛 Checklist de Problemas Comuns

### Banco de Dados
- [ ] Conexão com Neon configurada
- [ ] Tabelas criadas (api/complete-schema.sql)
- [ ] Permissões de usuário corretas

### Variáveis de Ambiente
- [ ] DATABASE_URL configurada
- [ ] JWT_SECRET definida
- [ ] Chaves VAPID configuradas (para notificações)

### Dependências
- [ ] Todas as dependências instaladas
- [ ] Nenhum erro de importação
- [ ] Serviços externos acessíveis

### Console Errors
- [ ] Verificar console do navegador
- [ ] Verificar logs da Vercel
- [ ] Verificar logs do banco de dados

## 📊 Checklist de Deploy

### Pré-Deploy
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Banco de dados Neon configurado
- [ ] Script SQL executado
- [ ] Testes locais passando

### Pós-Deploy
- [ ] Verificar URL de produção
- [ ] Testar todas as funcionalidades
- [ ] Verificar logs de erro
- [ ] Testar em diferentes dispositivos

## 🔧 Scripts de Teste

### Testar Conexão com Banco
```bash
curl https://seusite.vercel.app/api/test-db
```

### Testar Autenticação
```bash
# Registrar usuário
curl -X POST https://seusite.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","phone":"11999999999","password":"123456"}'

# Login
curl -X POST https://seusite.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## 📝 Relatório de Testes

Use este template para documentar seus testes:

```markdown
# Relatório de Testes - DroneService

**Data:** [DATA]
**Responsável:** [NOME]
**Ambiente:** [DEV/PROD]

## Testes Realizados

### ✅ Funcionalidades Testadas
- [Funcionalidade 1]
- [Funcionalidade 2]

### ❌ Problemas Encontrados
- [Problema 1]
- [Problema 2]

### 🔧 Correções Aplicadas
- [Correção 1]
- [Correção 2]

## Status Geral
[✅ APROVADO / ❌ REPROVADO / ⚠️ APROVADO COM RESSALVAS]

## Observações
[Observações adicionais]
```

## 🎯 Critérios de Aceitação

O sistema está pronto para produção quando:
- [ ] Todos os testes de autenticação passam
- [ ] Agendamentos funcionam corretamente
- [ ] Painel admin funciona completamente
- [ ] Notificações push estão operacionais
- [ ] Responsividade testada em todos os dispositivos
- [ ] Performance aceitável
- [ ] Sem erros críticos no console
- [ ] Deploy concluído com sucesso

---

**Dica:** Execute este guia sistematicamente para garantir que todas as funcionalidades estejam funcionando corretamente antes de ir para produção.