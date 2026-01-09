import query from '../db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Configurar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }

  try {
    // 1. Verificar se o usuário existe
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    // Sempre retornar sucesso por segurança (não revelar se email existe ou não)
    if (userResult.rowCount === 0) {
      // Não informamos se o email existe ou não por segurança
      return res.status(200).json({ 
        message: 'Se o email existir em nossa base, você receberá um link de recuperação.'
      });
    }

    const user = userResult.rows[0];

    // 2. Gerar token de recuperação (expira em 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET not configured' });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        type: 'password_reset',
        token: resetToken
      },
      secret,
      { expiresIn: '1h' }
    );

    // 3. Salvar token no banco de dados
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, new Date(Date.now() + 60 * 60 * 1000)] // 1 hora
    );

    // 4. Limpar tokens antigos do mesmo usuário
    await query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1 AND expires_at < NOW()',
      [user.id]
    );

    // 5. Em ambiente de produção, aqui você enviaria o email
    // Para este exemplo, vamos retornar o token (APENAS PARA DESENVOLVIMENTO)
    // EM PRODUÇÃO, REMOVA O TOKEN DA RESPOSTA E ENVIE POR EMAIL
    
    const resetUrl = `${req.headers.origin}/redefinir-senha?token=${token}`;
    
    console.log(`\n=== LINK DE RECUPERAÇÃO PARA ${user.email} ===`);
    console.log(`URL: ${resetUrl}`);
    console.log(`Token: ${token}`);
    console.log(`==============================\n`);

    // 6. Retornar sucesso
    return res.status(200).json({ 
      message: 'Se o email existir em nossa base, você receberá um link de recuperação em breve.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}