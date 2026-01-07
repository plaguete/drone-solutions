import query from '../db.js';
import { verifyToken } from '../utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  // 1. Verificar usuário logado
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    // 2. Buscar notificações do usuário
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar notificações.' });
  }
}