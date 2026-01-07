import query from '../db.js';
import { verifyToken } from '../utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  // 1. Segurança: Apenas Admin pode
  const user = verifyToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }

  const { id, status, price, is_paid } = req.body;

  try {
    // 2. Atualizar no Banco
    await query(
      `UPDATE appointments 
       SET status = COALESCE($1, status), 
           price = COALESCE($2, price),
           is_paid = COALESCE($3, is_paid)
       WHERE id = $4`,
      [status, price, is_paid, id]
    );

    return res.status(200).json({ message: 'Atualizado com sucesso!' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar.' });
  }
}