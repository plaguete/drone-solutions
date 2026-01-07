import query from '../db.js';
import { verifyToken } from '../utils.js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // 1. Segurança: Apenas Admin pode (assumindo que é admin enviando)
  const user = verifyToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }

  const { appointment_id, client_id, message, type } = req.body;

  if (!appointment_id || !client_id || !message || !type) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // 2. Buscar dados do cliente para enviar notificação
    const clientResult = await query('SELECT name, email FROM users WHERE id = $1', [client_id]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    const client = clientResult.rows[0];

    // 3. Criar tabela notifications se não existir
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        appointment_id INT REFERENCES appointments(id),
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Inserir notificação no banco
    await query(
      'INSERT INTO notifications (user_id, appointment_id, message, type) VALUES ($1, $2, $3, $4)',
      [client_id, appointment_id, message, type]
    );

    console.log(`Notificação in-app enviada para ${client.name}: ${message}`);

    return res.status(200).json({ message: 'Notificação enviada com sucesso!' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao enviar notificação.' });
  }
}