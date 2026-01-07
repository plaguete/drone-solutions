import query from '../db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Configurar cabeçalhos para evitar erros de CORS (importante para desenvolvimento)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // 1. Verificar se usuário já existe (email ou telefone)
    const checkUser = await query(
        'SELECT id FROM users WHERE email = $1 OR phone = $2',
        [email, phone]
    );

    if (checkUser.rowCount > 0) {
      return res.status(409).json({ message: 'Email ou Telefone já cadastrados.' });
    }

    // 2. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Inserir no banco
    const newUser = await query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, phone, passwordHash]
    );

    // 4. Sucesso
    return res.status(201).json({ 
        message: 'Usuário criado com sucesso!',
        user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}