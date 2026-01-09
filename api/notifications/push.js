import query from '../db.js';
import webpush from 'web-push';

// Configuração do web-push
// Você precisa gerar essas chaves com: webpush.generateVAPIDKeys()
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:contato@droneservice.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { user_id, title, message, url } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ message: 'user_id e message são obrigatórios' });
  }

  try {
    // Buscar a subscription do usuário
    const result = await query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não inscrito em notificações push' });
    }

    const subscription = {
      endpoint: result.rows[0].endpoint,
      keys: {
        p256dh: result.rows[0].p256dh,
        auth: result.rows[0].auth
      }
    };

    // Enviar notificação push
    const payload = JSON.stringify({
      title: title || 'DroneService',
      body: message,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        url: url || '/meus-pedidos',
        dateOfArrival: Date.now()
      }
    });

    await webpush.sendNotification(subscription, payload);

    return res.status(200).json({ message: 'Notificação enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    
    // Se a subscription for inválida, removê-la do banco
    if (error.statusCode === 410) {
      await query('DELETE FROM push_subscriptions WHERE user_id = $1', [user_id]);
      return res.status(410).json({ message: 'Subscription expirada e removida' });
    }

    return res.status(500).json({ message: 'Erro ao enviar notificação' });
  }
}

// Função auxiliar para enviar notificação de outro lugar do código
export async function sendPushNotification(user_id, title, message, url) {
  try {
    const result = await query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) return false;

    const subscription = {
      endpoint: result.rows[0].endpoint,
      keys: {
        p256dh: result.rows[0].p256dh,
        auth: result.rows[0].auth
      }
    };

    const payload = JSON.stringify({
      title: title || 'DroneService',
      body: message,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        url: url || '/meus-pedidos',
        dateOfArrival: Date.now()
      }
    });

    await webpush.sendNotification(subscription, payload);
    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return false;
  }
}