import query from '../db.js';
import { verifyToken } from '../utils.js';

export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  const { subscription } = req.body;

  if (!subscription) {
    return res.status(400).json({ message: 'Subscription é obrigatória' });
  }

  try {
    // Salvar ou atualizar a subscription do usuário
    await query(`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        endpoint = EXCLUDED.endpoint,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        updated_at = CURRENT_TIMESTAMP
    `, [
      user.id,
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth
    ]);

    return res.status(200).json({ message: 'Inscrição salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar subscription:', error);
    return res.status(500).json({ message: 'Erro ao salvar inscrição' });
  }
}