import query from '../db.js';
import { verifyToken } from '../utils.js';

export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  // 1. Verificar quem é o usuário
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    let text, params;

    if (user.role === 'admin') {
      // SE FOR ADMIN: Busca TUDO e traz junto o nome do cliente (JOIN)
      text = `
        SELECT a.*, u.name as client_name, u.phone as client_phone 
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
      `;
      params = [];
    } else {
      // SE FOR CLIENTE: Busca só os dele
      text = `
        SELECT * FROM appointments 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      params = [user.id];
    }

    const result = await query(text, params);
    
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar agendamentos.' });
  }
}