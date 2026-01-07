import query from '../db.js';

export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    // Buscar todas as datas agendadas
    const result = await query(`
      SELECT DISTINCT scheduled_date
      FROM appointments
      WHERE status IN ('pending', 'accepted')
      ORDER BY scheduled_date
    `);

    const bookedDates = result.rows.map(row => row.scheduled_date);

    return res.status(200).json({ bookedDates });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar datas disponíveis.' });
  }
}