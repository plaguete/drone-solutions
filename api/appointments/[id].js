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

  // 2. Extrair o ID da URL
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID do agendamento é obrigatório.' });
  }

  try {
    let text, params;

    if (user.role === 'admin') {
      // SE FOR ADMIN: Pode ver qualquer agendamento
      text = `
        SELECT a.*, u.name as client_name, u.phone as client_phone, u.email as client_email
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = $1
      `;
      params = [id];
    } else {
      // SE FOR CLIENTE: Só pode ver os próprios agendamentos
      text = `
        SELECT * FROM appointments 
        WHERE id = $1 AND user_id = $2
      `;
      params = [id, user.id];
    }

    const result = await query(text, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({ message: 'Erro ao buscar agendamento.' });
  }
}