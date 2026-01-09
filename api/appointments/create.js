import query from '../db.js';
import { verifyToken } from '../utils.js';
import { sendPushNotification } from '../notifications/push.js';

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

    const appointmentId = result.rows[0].id;

    // 3. Enviar notificação para o ADMIN sobre novo pedido
    try {
      // Buscar todos os administradores
      const adminResult = await query('SELECT id FROM users WHERE role = $1', ['admin']);
      
      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        
        // Notificação in-app para admin
        await query(
          'INSERT INTO notifications (user_id, appointment_id, message, type) VALUES ($1, $2, $3, $4)',
          [admin.id, appointmentId, `Novo pedido de ${service_type} solicitado por ${user.name}`, 'new_appointment']
        );

        // Notificação push para admin
        await sendPushNotification(
          admin.id,
          'DroneService - Novo Pedido',
          `Novo pedido de ${service_type} solicitado. Clique para ver detalhes.`,
          '/admin'
        );
      }
    } catch (notifError) {
      console.error('Erro ao enviar notificação para admin:', notifError);
      // Não falha o agendamento por causa do erro de notificação
    }

    return res.status(201).json({ 
      message: 'Solicitação enviada com sucesso!', 
      id: appointmentId 
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: 'Erro ao salvar agendamento.',
      error: error.message,
      details: 'Verifique se as tabelas foram criadas no banco de dados.'
    });
  }
}