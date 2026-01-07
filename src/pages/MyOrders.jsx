import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Loader2, Package } from 'lucide-react';

export default function MyOrders() {
  const { signed } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signed) navigate('/login');
    else fetchOrders();
  }, [signed]);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem('@droneApp:token');
      const response = await fetch('/api/appointments/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'accepted': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-slate-100 text-slate-600';
      }
  };

  const getStatusText = (s) => ({ pending: 'Em Análise', accepted: 'Aprovado', rejected: 'Recusado' }[s] || s);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link to="/confirmation" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100"><ArrowLeft size={20}/></Link>
            <h1 className="text-2xl font-bold text-slate-900">Meus Pedidos</h1>
        </div>

        {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32}/></div>
        ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                <Package className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Você ainda não tem pedidos.</p>
                <Link to="/new-appointment" className="text-blue-600 font-bold hover:underline mt-2 block">Fazer agendamento</Link>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{order.service_type}</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {new Date(order.scheduled_date).toLocaleDateString()} às {order.scheduled_time}</div>
                            <div className="flex items-center gap-2"><MapPin size={16} className="text-red-500"/> {order.location_text || 'Localização no mapa'}</div>
                        </div>
                        {order.status === 'accepted' && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                                <strong>Atenção:</strong> A equipe técnica entrará em contato em breve.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}