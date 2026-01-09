-- Script para criar usuário administrador
-- Execute este script no console do Neon (SQL Editor)
-- https://console.neon.tech/

-- Inserir usuário administrador
-- Senha: admin123 (já criptografada com bcrypt)
INSERT INTO users (name, email, phone, password_hash, role) 
VALUES (
  'Administrador', 
  'admin@droneservice.com', 
  '11999999999', 
  '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT '✅ Usuário admin criado com sucesso!' as status;

-- Listar usuários admin
SELECT id, name, email, role, created_at FROM users WHERE role = 'admin';