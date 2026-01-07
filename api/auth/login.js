import query from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Headers CORS padrão
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { identifier, password } = req.body; // identifier pode ser email ou telefone

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  try {
    // 1. Buscar usuário por Email OU Telefone
    const result = await query(
      'SELECT * FROM users WHERE email = $1 OR phone = $1',
      [identifier]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 2. Comparar senhas
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Gerar Token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET not configured' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      secret,
      { expiresIn: '7d' } // Token vale por 7 dias
    );

    // 4. Retornar dados (sem a senha, claro)
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao fazer login.' });
  }
}