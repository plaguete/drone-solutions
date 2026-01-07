// api/notifications.js
import { Pool } from 'pg';

// Conexão com o Neon (pegue a string no painel do Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necessário para Neon
});

export default async function handler(req, res) {
  // 1. LISTAR NOTIFICAÇÕES (GET) - Usado pelo Cliente
  if (req.method === 'GET') {
    const { user_id } = req.query; // Cliente envia seu ID

    try {
      const result = await pool.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC LIMIT 20`, 
        [user_id]
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. CRIAR NOTIFICAÇÃO (POST) - Usado pelo Admin
  if (req.method === 'POST') {
    const { user_id, message, type, appointment_id } = req.body;

    try {
      await pool.query(
        `INSERT INTO notifications (user_id, message, type, appointment_id) 
         VALUES ($1, $2, $3, $4)`,
        [user_id, message, type || 'info', appointment_id]
      );
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 3. MARCAR COMO LIDA (PUT) - Usado pelo Cliente
  if (req.method === 'PUT') {
    const { id } = req.body;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    return res.status(200).json({ success: true });
  }
}