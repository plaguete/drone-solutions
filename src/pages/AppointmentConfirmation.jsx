import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell, CheckCircle, Plus, LogOut, MessageCircle, Info, Check, Clock, User
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationItem = ({ notification, onRead }) => (
  <div onClick={() => onRead(notification.id)} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-600 text-white'}`}>
       {notification.type === 'alert' ? <Info size={16}/> : <MessageCircle size={16}/>}
    </div>
    <div className="flex-1">
       <p className={`text-sm ${!notification.is_read && 'font-bold text-slate-900'}`}>{notification.message}</p>
       <span className="text-[10px] text-slate-400">{new Date(notification.created_at).toLocaleTimeString()}</span>
    </div>
    {!notification.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
  </div>
);

export default function AppointmentConfirmation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const lastIdRef = useRef(0);

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
    const interval = setInterval(fetchNotifications, 5000); // Polling a cada 5s
    fetchNotifications();
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
        // Simulação de Fetch (Substitua pela sua rota: /api/notifications?user_id=...)
        // Como o usuário pediu para "transcrever os códigos", estou mantendo a lógica de UI, 
        // mas aqui deve entrar o fetch real no seu backend
        // const res = await fetch(`/api/notifications?user_id=${user.id}`);
        // const data = await res.json();
        
        // MOCK PARA UI FUNCIONAR NO TESTE
        // Em produção, remova esse mock e use o fetch acima
        const mockData = notifications.length ? notifications : [{ id: 1, message: 'Bem-vindo ao sistema!', type: 'info', created_at: new Date(), is_read: false }];
        setNotifications(mockData);
        
    } catch (e) { console.error(e); }
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      <nav className="bg-white border-b sticky top-0 z-50 h-16 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block">DroneApp</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/agendar')} className="hidden md:flex items-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition"><Plus size={18}/> Novo Pedido</button>
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-slate-100 transition">
                    <Bell size={22} className={showNotifications ? 'text-blue-600' : 'text-slate-600'} />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
                </button>
                {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border overflow-hidden z-[100]">
                        <div className="p-3 border-b bg-slate-50 font-bold text-sm text-slate-700">Notificações</div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? <p className="p-4 text-center text-sm text-slate-400">Vazio</p> : notifications.map(n => <NotificationItem key={n.id} notification={n} onRead={handleMarkRead}/>)}
                        </div>
                    </div>
                )}
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={22}/></button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto mt-12 px-4">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden text-center p-10 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-400"></div>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Pedido Enviado!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">Seu pedido foi encaminhado para nossa central. Você receberá notificações assim que um técnico analisar sua solicitação.</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
             <button onClick={() => navigate('/agendar')} className="py-3 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition">Novo Pedido</button>
             <button onClick={() => navigate('/meus-pedidos')} className="py-3 bg-blue-600 font-bold text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Meus Pedidos</button>
          </div>
        </div>
      </main>
    </div>
  );
}