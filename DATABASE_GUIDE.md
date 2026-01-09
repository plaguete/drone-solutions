# Guia de Banco de Dados - DroneService

Este guia explica como gerenciar o banco de dados PostgreSQL no Neon.

## 📊 Estrutura do Banco de Dados

### Tabelas Existentes

1. **users** - Cadastro de usuários
   - id, name, email, phone, password_hash, role, created_at, updated_at

2. **appointments** - Agendamentos de serviços
   - id, user_id, service_type, location_text, latitude, longitude
   - scheduled_date, scheduled_time, details, status, price, is_paid

3. **password_reset_tokens** - Tokens para recuperação de senha
   - id, user_id, token, expires_at, created_at, used_at

4. **notifications** - Notificações do sistema
   - id, user_id, appointment_id, message, type, read_at, created_at

5. **push_subscriptions** - Inscrições para notificações push
   - id, user_id, endpoint, p256dh, auth, created_at, updated_at

## 🔄 Como Recriar o Banco de Dados do Zero

### Passo 1: Acessar o Console do Neon

1. Acesse https://console.neon.tech
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral

### Passo 2: Limpar o Banco (OPCIONAL - APAGA TUDO!)

**ATENÇÃO**: Este comando irá apagar TODOS os dados permanentemente!

```sql
-- Execute o script api/reset-database.sql
-- Ou copie e cole este código:

DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Passo 3: Criar Novas Tabelas

```sql
-- Execute o script api/recreate-database.sql
-- Ou use o script completo em api/complete-schema.sql
```

## 🛠 Scripts Disponíveis

### 1. `api/reset-database.sql`
**Finalidade**: Apagar todas as tabelas e dados
**Quando usar**: Quando quer recomeçar completamente do zero
**Atenção**: Esta operação não tem volta!

### 2. `api/recreate-database.sql`
**Finalidade**: Criar todas as tabelas do zero
**Quando usar**: Após executar o reset-database.sql

### 3. `api/complete-schema.sql`
**Finalidade**: Criar todas as tabelas (com verificação se já existem)
**Quando usar**: Para configuração inicial ou atualização segura

## 📋 Passos para Configuração Inicial

### Opção A: Banco Novo (Recomendado para primeira vez)

1. Execute `api/complete-schema.sql` no console do Neon
2. Pronto! As tabelas serão criadas com verificações

### Opção B: Banco Existente (Quer recomeçar)

1. Execute `api/reset-database.sql` para apagar tudo
2. Execute `api/recreate-database.sql` para criar novamente
3. Pronto! Banco recriado do zero

## 🔍 Verificações

### Verificar se as tabelas foram criadas

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Verificar estrutura de uma tabela

```sql
-- Exemplo: ver estrutura da tabela users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### Verificar dados em uma tabela

```sql
-- Exemplo: ver usuários cadastrados
SELECT id, name, email, role, created_at FROM users;

-- Exemplo: ver agendamentos
SELECT id, service_type, status, scheduled_date FROM appointments;
```

### Verificar quantos registros existem

```sql
-- Contar usuários
SELECT COUNT(*) FROM users;

-- Contar agendamentos por status
SELECT status, COUNT(*) FROM appointments GROUP BY status;
```

## 🗑 Como Limpar Dados Específicos

### Limpar apenas agendamentos

```sql
DELETE FROM appointments;
-- Reiniciar a sequência do ID
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
```

### Limpar apenas notificações

```sql
DELETE FROM notifications;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
```

### Limpar tokens de recuperação expirados

```sql
DELETE FROM password_reset_tokens WHERE expires_at < NOW();
```

## ⚠️ Boas Práticas

### Backup Antes de Limpar

Sempre faça backup antes de executar operações destrutivas:

```sql
-- Criar backup de uma tabela (exemplo)
CREATE TABLE users_backup AS SELECT * FROM users;
```

### Testar em Desenvolvimento Primeiro

Sempre teste scripts de banco de dados em um ambiente de desenvolvimento antes de aplicar em produção.

### Usar Transações para Operações Críticas

```sql
BEGIN;
-- Suas operações aqui
-- Se algo der errado, execute ROLLBACK;
COMMIT;
```

## 🐛 Solução de Problemas

### Problema: "table already exists"
**Solução**: Use `CREATE TABLE IF NOT EXISTS` ou execute o reset primeiro

### Problema: "foreign key constraint fails"
**Solução**: Exclua as tabelas na ordem correta (use CASCADE)

### Problema: "permission denied"
**Solução**: Verifique as permissões do usuário do banco de dados

### Problema: Não consegue conectar
**Solução**: 
1. Verifique a DATABASE_URL
2. Confirme que o banco está ativo
3. Verifique as configurações de rede/firewall

## 📞 Suporte

Para problemas com o banco de dados Neon:
- Documentação: https://neon.tech/docs
- Console: https://console.neon.tech
- Suporte: https://neon.tech/support

---

**Dica**: Mantenha sempre um backup do seu banco de dados antes de fazer alterações importantes!