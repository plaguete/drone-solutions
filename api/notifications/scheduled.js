import query from '../db.js';
import { sendPushNotification } from './push.js';

// Esta função deve ser executada diariamente (ex: via cron job ou agendador)
export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Verificar se é uma chamada autorizada (pode ser protegida com API key)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Formatar data para YYYY-MM-DD
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Buscar agendamentos para amanhã com status 'accepted'
    const result = await query(
      `SELECT a.id, a.service_type, a.scheduled_date, u.name as client_name 
       FROM appointments a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.scheduled_date = $1 AND a.status = 'accepted'`,
      [tomorrowStr]
    );

    const appointments = result.rows;
    let notificationsSent = 0;

    // Enviar notificação para cada admin sobre agendamentos de amanhã
    if (appointments.length > 0) {
      // Buscar todos os administradores
      const adminResult = await query('SELECT id FROM users WHERE role = $1', ['admin']);
      
      for (const admin of adminResult.rows) {
        for (const appointment of appointments) {
          const message = `Serviço de ${appointment.service_type} agendado para amanhã (${new Date(appointment.scheduled_date).toLocaleDateString('pt-BR')}) - Cliente: ${appointment.client_name}`;
          
          // Notificação in-app
          await query(
            'INSERT INTO notifications (user_id, appointment_id, message, type) VALUES ($1, $2, $3, $4)',
            [admin.id, appointment.id, message, 'reminder']
          );

          // Notificação push
          await sendPushNotification(
            admin.id,
            'DroneService - Lembrete',
            message,
            '/admin'
          );
          
          notificationsSent++;
        }
      }
    }

    return res.status(200).json({ 
      message: `Notificações de lembrete enviadas: ${notificationsSent}`,
      appointments: appointments.length,
      date: tomorrowStr
    });

  } catch (error) {
    console.error('Erro ao enviar notificações agendadas:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar notificações agendadas',
      error: error.message 
    });
  }
}

// Função auxiliar para ser chamada manualmente ou por agendador
export async function checkAndSendReminders() {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const result = await query(
      `SELECT a.id, a.service_type, a.scheduled_date, u.name as client_name 
       FROM appointments a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.scheduled_date = $1 AND a.status = 'accepted'`,
      [tomorrowStr]
    );

    const appointments = result.rows;

    if (appointments.length > 0) {
      const adminResult = await query('SELECT id FROM users WHERE role = $1', ['admin']);
      
      for (const admin of adminResult.rows) {
        for (const appointment of appointments) {
          const message = `Serviço de ${appointment.service_type} agendado para amanhã - Cliente: ${appointment.client_name}`;
          
          await query(
            'INSERT INTO notifications (user_id, appointment_id, message, type) VALUES ($1, $2, $3, $4)',
            [admin.id, appointment.id, message, 'reminder']
          );

          await sendPushNotification(
            admin.id,
            'DroneService - Lembrete',
            message,
            '/admin'
          );
        }
      }
      
      console.log(`✅ Notificações de lembrete enviadas para ${appointments.length} agendamentos`);
    } else {
      console.log('ℹ️ Nenhum agendamento para amanhã');
    }
  } catch (error) {
    console.error('❌ Erro ao enviar lembretes:', error);
  }
}