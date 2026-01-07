import query from '../db.js';
import { verifyToken } from '../utils.js';

export default async function handler(req, res) {
  // Configuração de CORS (padrão)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // 1. Verificar Segurança (Usuário está logado?)
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autorizado. Faça login novamente.' });
  }

  const { service_type, location_text, latitude, longitude, scheduled_date, scheduled_time, details } = req.body;

  if (!service_type || !scheduled_date) {
    return res.status(400).json({ message: 'Tipo de serviço e data são obrigatórios.' });
  }

  try {
    // 2. Salvar no Banco
    const result = await query(
      `INSERT INTO appointments 
      (user_id, service_type, location_text, latitude, longitude, scheduled_date, scheduled_time, details) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id`,
      [user.id, service_type, location_text, latitude, longitude, scheduled_date, scheduled_time, details]
    );

    return res.status(201).json({ 
      message: 'Solicitação enviada com sucesso!', 
      id: result.rows[0].id 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao salvar agendamento.' });
  }
}