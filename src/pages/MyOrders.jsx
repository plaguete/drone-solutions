import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const { user, signed } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (signed) {
      fetchOrders();
    }
  }, [signed]);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem('@droneApp:token');
      const response = await fetch('/api/appointments/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao buscar pedidos", error);
    } finally {
      setLoading(false);
    }
  }

  // Função para definir a cor do status
  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // pending
    }
  };

  const getStatusText = (status) => {
    const map = {
      'pending': '⏳ Pendente',
      'accepted': '✅ Aceito',
      'rejected': '❌ Recusado',
      'completed': '🏁 Concluído'
    };
    return map[status] || status;
  };

  if (loading) return <div className="p-8 text-center">Carregando pedidos...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Pedidos</h1>
        <div className="flex gap-2">
          <Link to="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Voltar ao Início
          </Link>
          <Link to="/agendar" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            + Novo Serviço
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded shadow">
          <p className="text-gray-500 mb-4">Você ainda não tem solicitações de serviço.</p>
          <Link to="/agendar" className="text-blue-600 font-bold hover:underline">Fazer o primeiro pedido</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800">{order.service_type}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  📅 Agendado para: <strong>{new Date(order.scheduled_date).toLocaleDateString('pt-BR')}</strong>
                  {order.scheduled_time && <span> às {order.scheduled_time}</span>}
                </p>
                <p className="text-gray-500 text-sm mt-1 truncate max-w-md">
                  📍 {order.location_text || 'Localização não especificada'}
                </p>
              </div>

              {/* Se o pedido foi aceito, mostra aviso */}
              {order.status === 'accepted' && (
                <div className="bg-blue-50 p-3 rounded border border-blue-100 flex items-center text-sm text-blue-800 md:max-w-xs">
                  ℹ️ Sua solicitação foi aceita! Nossa equipe entrará em contato em breve pelo telefone.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}