import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { 
  Check, X, MapPin, Calendar, Search, LogOut, 
  LayoutDashboard, Bell, Phone, Mail, 
  Clock, ChevronLeft, ChevronRight, Edit2, Save, 
  MessageCircle, Send
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import L from 'leaflet';

// Fix default marker icons for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componentes Utilitários
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  const labels = { pending: 'Pendente', accepted: 'Agendado', rejected: 'Recusado', completed: 'Concluído' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>{labels[status] || status}</span>;
};

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modais
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotify, setIsSendingNotify] = useState(false);
  
  // Edição
  const [inputPrice, setInputPrice] = useState('');
  const [inputIsPaid, setInputIsPaid] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await fetchAppointments();
    setIsLoading(false);
  };

  const fetchAppointments = async () => {
    const token = localStorage.getItem('@droneApp:token');
    try {
      const res = await fetch('/api/appointments/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAppointments(data);
    } catch(e) { 
        setAppointments([]); 
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setInputPrice(order.price || '');
    setInputIsPaid(order.is_paid || false);
    setIsEditingDetails(false);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setShowConfirmModal(false);
    setShowNotifyModal(false);
    setIsEditingDetails(false);
  };

  const handleOpenNotifyModal = () => {
    const defaultMsg = `Olá ${selectedOrder.client_name}, referente ao serviço de ${selectedOrder.service_type} do dia ${new Date(selectedOrder.scheduled_date).toLocaleDateString('pt-BR')}.`;
    setNotifyMessage(defaultMsg);
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    if (!notifyMessage.trim()) return toast.error("Digite uma mensagem.");
    setIsSendingNotify(true);
    const toastId = toast.loading("Enviando...");

    try {
        const token = localStorage.getItem('@droneApp:token');
        await fetch('/api/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: selectedOrder.user_id, // ID do cliente
                message: notifyMessage,
                type: 'info',
                appointment_id: selectedOrder.id
            })
        });
        toast.success("Enviado!", { id: toastId });
        setShowNotifyModal(false);
    } catch (error) {
        toast.error("Erro ao enviar.", { id: toastId });
    } finally {
        setIsSendingNotify(false);
    }
  };

  const executeStatusUpdate = async () => {
    const id = selectedOrder.id;
    const newStatus = actionType === 'accept' ? 'accepted' : 'rejected';
    const toastId = toast.loading("Atualizando...");

    try {
      const token = localStorage.getItem('@droneApp:token');
      await fetch('/api/appointments/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: newStatus, price: inputPrice, is_paid: inputIsPaid })
      });
      toast.success("Atualizado!", { id: toastId });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus, price: inputPrice, is_paid: inputIsPaid } : apt));
      handleCloseDetails();
    } catch (error) {
      toast.error("Erro.", { id: toastId });
    }
  };

  const handleUpdatePaymentInfo = async () => {
    const toastId = toast.loading("Salvando...");
    try {
       // Lógica real de update aqui (mesma do executeStatusUpdate mas só campos financeiros)
       setAppointments(prev => prev.map(apt => apt.id === selectedOrder.id ? { ...apt, price: inputPrice, is_paid: inputIsPaid } : apt));
       setSelectedOrder(prev => ({ ...prev, price: inputPrice, is_paid: inputIsPaid }));
       setIsEditingDetails(false);
       toast.success("Salvo!", { id: toastId });
    } catch { toast.error("Erro", { id: toastId }); }
  };

  // Filtros
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchFilter = filter === 'all' ? true : apt.status === filter;
      const matchSearch = apt.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [appointments, filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: appointments.filter(a => a.status === 'pending').length,
    revenue: appointments.filter(a => a.status === 'accepted' && a.is_paid).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
  }), [appointments]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard className="text-white" size={20} /></div>
          <span className="font-bold text-xl text-slate-900">AdminPanel</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex gap-4 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium">
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div> Pendentes: {stats.pending}</span>
             <span className="w-px h-4 bg-slate-300"></span>
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Caixa: {formatCurrency(stats.revenue)}</span>
           </div>
           <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
           <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {['pending', 'accepted', 'all'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm font-medium rounded-md ${filter === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                        {f === 'pending' ? 'Pendentes' : f === 'accepted' ? 'Agendados' : 'Todos'}
                    </button>
                ))}
              </div>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input className="pl-10 pr-4 py-2 w-full sm:w-64 bg-slate-50 border rounded-lg" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-4">
             {isLoading ? <p>Carregando...</p> : filteredAppointments.map(apt => (
                <div key={apt.id} onClick={() => handleOpenDetails(apt)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition">
                   <div className="flex justify-between mb-3">
                      <StatusBadge status={apt.status} />
                      <span className="text-xs text-slate-400">{new Date(apt.created_at).toLocaleDateString()}</span>
                   </div>
                   <h3 className="font-bold text-slate-900 mb-1">{apt.service_type}</h3>
                   <p className="text-sm text-slate-600 mb-4">{apt.client_name}</p>
                   <div className="flex justify-between text-xs text-slate-500 border-t pt-3">
                      <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(apt.scheduled_date).toLocaleDateString()}</div>
                      {apt.price && <span className="font-bold text-slate-700">R$ {apt.price}</span>}
                   </div>
                </div>
             ))}
           </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))}><ChevronLeft size={18}/></button>
                 <span className="font-bold capitalize">{currentMonth.toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}</span>
                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))}><ChevronRight size={18}/></button>
              </div>
              <div className="p-4 grid grid-cols-7 gap-1 text-center text-sm">
                 {['D','S','T','Q','Q','S','S'].map(d => <span key={d} className="font-bold text-slate-400 text-[10px]">{d}</span>)}
                 {getDaysInMonth(currentMonth).map((d, i) => {
                     if(!d) return <div key={i}/>;
                     const hasEvent = appointments.some(a => new Date(a.scheduled_date).toDateString() === d.toDateString() && a.status === 'accepted');
                     return (
                         <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg ${d.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                            {d.getDate()}
                            {hasEvent && <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>}
                         </div>
                     )
                 })}
              </div>
           </div>
        </div>
      </main>
      
      {/* Drawer */}
      {selectedOrder && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseDetails}></div>
            <div className="relative w-full sm:w-[480px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
               <div className="p-5 border-b flex justify-between items-center bg-white">
                  <h2 className="font-bold text-lg">Detalhes</h2>
                  <button onClick={handleCloseDetails} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                  {/* Mapa */}
                  {selectedOrder.latitude && (
                    <div className="h-56 rounded-xl overflow-hidden border shadow-sm">
                       <MapContainer center={[selectedOrder.latitude, selectedOrder.longitude]} zoom={15} style={{height:'100%'}} zoomControl={false}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[selectedOrder.latitude, selectedOrder.longitude]} />
                       </MapContainer>
                    </div>
                  )}
                  {/* Dados */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                     <h3 className="font-bold text-slate-900 text-lg mb-4">{selectedOrder.client_name}</h3>
                     <div className="grid grid-cols-3 gap-2">
                        <a href={`tel:${selectedOrder.client_phone}`} className="flex flex-col items-center p-2 bg-slate-50 rounded border hover:bg-slate-100 text-xs"><Phone size={16}/> Ligar</a>
                        <a href={`mailto:${selectedOrder.email}`} className="flex flex-col items-center p-2 bg-slate-50 rounded border hover:bg-slate-100 text-xs"><Mail size={16}/> Email</a>
                        <a href={`https://wa.me/55${selectedOrder.client_phone.replace(/\D/g,'')}`} target="_blank" className="flex flex-col items-center p-2 bg-green-50 rounded border border-green-200 text-green-700 hover:bg-green-100 text-xs"><MessageCircle size={16}/> Whats</a>
                     </div>
                  </div>
                  {/* Financeiro */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                     <div className="flex justify-between mb-4"><h3 className="font-bold text-xs uppercase text-slate-400">Financeiro</h3><button onClick={()=>setIsEditingDetails(true)} className="text-xs text-blue-600 flex gap-1"><Edit2 size={12}/> Editar</button></div>
                     {isEditingDetails || selectedOrder.status === 'pending' ? (
                        <div className="space-y-3">
                           <input type="number" placeholder="Valor (R$)" value={inputPrice} onChange={e=>setInputPrice(e.target.value)} className="w-full p-2 border rounded"/>
                           <div onClick={()=>setInputIsPaid(!inputIsPaid)} className="flex items-center gap-2 cursor-pointer"><div className={`w-5 h-5 border rounded flex items-center justify-center ${inputIsPaid ? 'bg-blue-600 border-blue-600' : 'bg-white'}`}>{inputIsPaid && <Check size={14} className="text-white"/>}</div> Pago</div>
                           {isEditingDetails && <button onClick={handleUpdatePaymentInfo} className="w-full bg-blue-600 text-white py-2 rounded text-xs font-bold">Salvar</button>}
                        </div>
                     ) : (
                        <div className="flex justify-between font-bold text-sm"><span>{formatCurrency(selectedOrder.price)}</span><span>{selectedOrder.is_paid ? 'PAGO' : 'PENDENTE'}</span></div>
                     )}
                  </div>
               </div>
               <div className="p-4 border-t bg-white space-y-3">
                  <button onClick={handleOpenNotifyModal} className="w-full py-3 bg-white border text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex justify-center gap-2"><Bell size={18}/> Notificar Cliente</button>
                  {selectedOrder.status === 'pending' && (
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={()=> {setActionType('reject'); setShowConfirmModal(true)}} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold">Recusar</button>
                        <button onClick={()=> {setActionType('accept'); setShowConfirmModal(true)}} className="py-3 bg-green-600 text-white rounded-xl font-bold">Aceitar</button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* Modal Notificação */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="text-blue-500"/> Enviar Notificação</h3>
                <textarea className="w-full border rounded-xl p-3 h-32 text-sm bg-slate-50 mb-4" value={notifyMessage} onChange={e=>setNotifyMessage(e.target.value)}></textarea>
                <div className="flex justify-end gap-3">
                    <button onClick={()=>setShowNotifyModal(false)} className="text-slate-500 font-medium text-sm">Cancelar</button>
                    <button onClick={handleSendNotification} disabled={isSendingNotify} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">{isSendingNotify ? 'Enviando...' : <><Send size={16}/> Enviar</>}</button>
                </div>
            </div>
        </div>
      )}

      {/* Modal Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
           <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
              <h3 className="font-bold text-xl mb-2">{actionType === 'accept' ? 'Aceitar Pedido?' : 'Recusar?'}</h3>
              <div className="flex gap-3 mt-6">
                 <button onClick={()=>setShowConfirmModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                 <button onClick={executeStatusUpdate} className={`flex-1 py-2 rounded-lg font-bold text-white ${actionType==='accept'?'bg-green-600':'bg-red-600'}`}>Confirmar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}