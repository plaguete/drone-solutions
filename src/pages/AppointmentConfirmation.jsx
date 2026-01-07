import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Eye, Home } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AppointmentConfirmation() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleEnableNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          toast.success('Notificações ativadas! Você será informado sobre atualizações do serviço.');
        } else {
          toast.error('Permissão para notificações negada.');
        }
      });
    } else {
      toast.error('Este navegador não suporta notificações.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Serviço Solicitado!</h1>
            <p className="text-slate-600 mb-8">
              Obrigado pela confiança em nossos serviços. Sua solicitação foi enviada com sucesso.
            </p>

            {/* Notificação */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <Bell className="text-blue-600 mx-auto mb-3" size={24} />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Receber notificações sobre atualizações do serviço?
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Ative as notificações para ser informado sobre o andamento do seu pedido.
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={notificationsEnabled}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notificationsEnabled ? 'Notificações Ativadas' : 'Ativar Notificações'}
              </button>
            </div>

            {/* Botões de ação */}
            <div className="space-y-4">
              <button
                onClick={() => navigate('/meus-pedidos')}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Eye size={18} /> Acompanhar o Serviço
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                <Home size={18} /> Voltar para Página Inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}