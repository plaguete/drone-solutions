-- Script para LIMPAR COMPLETAMENTE o banco de dados
-- ATENÇÃO: Este script irá APAGAR TODOS os dados permanentemente!
-- Execute apenas se tiver certeza que quer recomeçar do zero

-- Remover todas as tabelas (na ordem correta devido às dependências de chave estrangeira)
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Verificação: Listar tabelas restantes (deveria estar vazio)
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';