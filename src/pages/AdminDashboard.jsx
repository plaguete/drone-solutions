import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Check, X, MapPin, Calendar, Search, LogOut, 
  LayoutDashboard, Bell, Phone, Mail, 
  Clock, ChevronLeft, ChevronRight, Edit2, Save, 
  MessageCircle, Send, AlertTriangle, DollarSign
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
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    problem: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  const labels = { pending: 'Pendente', accepted: 'Agendado', rejected: 'Recusado', completed: 'Concluído', problem: 'Com Problema' };
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Modal de ocupar/desocupar data
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateAction, setDateAction] = useState(null); // 'occupy' or 'free'
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');

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
        
        // Enviar notificação in-app
        await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: selectedOrder.user_id,
                message: notifyMessage,
                type: 'info',
                appointment_id: selectedOrder.id
            })
        });

        // Enviar notificação push
        await fetch('/api/notifications/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: selectedOrder.user_id,
                title: 'DroneService - Atualização',
                message: notifyMessage,
                url: '/meus-pedidos'
            })
        });

        toast.success("Notificação enviada com sucesso!", { id: toastId });
        setShowNotifyModal(false);
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        toast.error("Erro ao enviar notificação.", { id: toastId });
    } finally {
        setIsSendingNotify(false);
    }
  };

  const executeStatusUpdate = async () => {
    const id = selectedOrder.id;
    const newStatus = actionType === 'accept' ? 'accepted' : actionType === 'problem' ? 'problem' : 'rejected';
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

  const handleDateClick = (date) => {
    if (!date) return;
    
    const hasAppointment = appointments.some(a => 
      new Date(a.scheduled_date).toDateString() === date.toDateString() && 
      a.status === 'accepted'
    );
    
    setSelectedDate(date);
    
    if (hasAppointment) {
      setDateAction('free');
    } else {
      setDateAction('occupy');
    }
    
    setTime('');
    setServiceType('');
    setNotes('');
    setShowDateModal(true);
  };

  const handleDateAction = async () => {
    if (!selectedDate) return;
    
    if (dateAction === 'free') {
      const toastId = toast.loading("Liberando data...");
      try {
        const token = localStorage.getItem('@droneApp:token');
        // Lógica para liberar a data (remover agendamentos)
        toast.success("Data liberada!", { id: toastId });
        await fetchAppointments();
        setShowDateModal(false);
      } catch (error) {
        toast.error("Erro ao liberar data", { id: toastId });
      }
    } else {
      // Validar campos para ocupar
      if (!time || !serviceType) {
        toast.error("Preencha pelo menos a hora e o tipo de serviço");
        return;
      }
      
      const toastId = toast.loading("Ocupando data...");
      try {
        const token = localStorage.getItem('@droneApp:token');
        // Lógica para ocupar a data
        const dateTime = new Date(selectedDate);
        const [hours, minutes] = time.split(':');
        dateTime.setHours(parseInt(hours), parseInt(minutes));
        
        // Aqui você faria a chamada API para criar o agendamento
        toast.success("Data ocupada com sucesso!", { id: toastId });
        await fetchAppointments();
        setShowDateModal(false);
      } catch (error) {
        toast.error("Erro ao ocupar data", { id: toastId });
      }
    }
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
           <button onClick={() => setShowLogoutConfirm(true)} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={20} /></button>
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
                     const isToday = d.toDateString() === new Date().toDateString();
                     return (
                         <button
                           key={i}
                           onClick={() => handleDateClick(d)}
                           className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                             isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                             hasEvent ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer' : 
                             'text-slate-700 hover:bg-slate-100'
                           }`}
                         >
                            {d.getDate()}
                            {hasEvent && <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>}
                         </button>
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
                    <div className="space-y-2">
                      <div className="h-56 rounded-xl overflow-hidden border shadow-sm">
                         <MapContainer center={[selectedOrder.latitude, selectedOrder.longitude]} zoom={15} style={{height:'100%'}} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[selectedOrder.latitude, selectedOrder.longitude]}>
                              <Popup>
                                <div className="text-sm">
                                  <strong>{selectedOrder.client_name}</strong><br/>
                                  {selectedOrder.service_type}<br/>
                                  {selectedOrder.address && <span className="text-slate-600">{selectedOrder.address}</span>}
                                </div>
                              </Popup>
                            </Marker>
                         </MapContainer>
                      </div>
                      {selectedOrder.address && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                          <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                          <div className="text-xs text-blue-900">
                            <div className="font-semibold mb-1">Localização exata:</div>
                            <div>{selectedOrder.address}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Dados do Cliente */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="font-bold text-slate-900 text-lg mb-1">{selectedOrder.client_name}</h3>
                         <p className="text-sm text-slate-600">{selectedOrder.service_type}</p>
                       </div>
                       <StatusBadge status={selectedOrder.status} />
                     </div>
                     
                     <div className="space-y-3">
                       <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                         <Phone className="text-slate-600 flex-shrink-0" size={16} />
                         <div className="flex-1 min-w-0">
                           <div className="text-xs text-slate-500">Telefone</div>
                           <div className="text-sm font-medium text-slate-900">{selectedOrder.client_phone}</div>
                         </div>
                         <div className="flex gap-1">
                           <a href={`tel:${selectedOrder.client_phone}`} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium">Ligar</a>
                           <a href={`https://wa.me/55${selectedOrder.client_phone.replace(/\D/g,'')}`} target="_blank" className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs font-medium">Whats</a>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                         <Mail className="text-slate-600 flex-shrink-0" size={16} />
                         <div className="flex-1 min-w-0">
                           <div className="text-xs text-slate-500">Email</div>
                           <div className="text-sm font-medium text-slate-900 truncate">{selectedOrder.email}</div>
                         </div>
                         <a href={`mailto:${selectedOrder.email}`} className="p-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-xs font-medium">Email</a>
                       </div>
                       
                       <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                         <Calendar className="text-blue-600 flex-shrink-0" size={16} />
                         <div className="flex-1">
                           <div className="text-xs text-blue-600">Data do Serviço</div>
                           <div className="text-sm font-medium text-blue-900">{new Date(selectedOrder.scheduled_date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                         </div>
                       </div>
                       
                       {selectedOrder.notes && (
                         <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                           <div className="flex items-start gap-2">
                             <MessageCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                             <div className="flex-1">
                               <div className="text-xs font-semibold text-amber-800 mb-1">Detalhes do Serviço</div>
                               <div className="text-sm text-amber-900">{selectedOrder.notes}</div>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                  {/* Financeiro */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
                         <DollarSign size={14} className="text-green-600" />
                         Financeiro
                       </h3>
                       <button onClick={()=>setIsEditingDetails(true)} className="text-xs text-blue-600 flex gap-1"><Edit2 size={12}/> Editar</button>
                     </div>
                     {isEditingDetails || selectedOrder.status === 'pending' ? (
                        <div className="space-y-3">
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                             <input 
                               type="number" 
                               placeholder="Valor do serviço" 
                               value={inputPrice} 
                               onChange={e=>setInputPrice(e.target.value)} 
                               className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             />
                           </div>
                           <div onClick={()=>setInputIsPaid(!inputIsPaid)} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                             <div className={`w-5 h-5 border rounded flex items-center justify-center ${inputIsPaid ? 'bg-green-600 border-green-600' : 'bg-white border-slate-300'}`}>
                               {inputIsPaid && <Check size={14} className="text-white"/>}
                             </div>
                             <span className="text-sm font-medium">Serviço já foi pago</span>
                           </div>
                           {isEditingDetails && (
                             <div className="flex gap-2">
                               <button onClick={()=>setIsEditingDetails(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">Cancelar</button>
                               <button onClick={handleUpdatePaymentInfo} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Salvar</button>
                             </div>
                           )}
                        </div>
                     ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Valor do serviço:</span>
                            <span className="font-bold text-lg text-slate-900">{formatCurrency(selectedOrder.price)}</span>
                          </div>
                          <div className={`flex justify-between items-center p-2 rounded-lg ${selectedOrder.is_paid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            <span className="text-sm font-medium">Status:</span>
                            <span className="font-bold">{selectedOrder.is_paid ? 'PAGO ✓' : 'PENDENTE'}</span>
                          </div>
                        </div>
                     )}
                  </div>
               </div>
               <div className="p-4 border-t bg-white space-y-3">
                  <button onClick={handleOpenNotifyModal} className="w-full py-3 bg-white border text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex justify-center gap-2"><Bell size={18}/> Notificar Cliente</button>
                  {selectedOrder.status === 'pending' ? (
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={()=> {setActionType('reject'); setShowConfirmModal(true)}} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold">Recusar</button>
                        <button onClick={()=> {setActionType('accept'); setShowConfirmModal(true)}} className="py-3 bg-green-600 text-white rounded-xl font-bold">Aceitar</button>
                     </div>
                  ) : selectedOrder.status === 'accepted' ? (
                     <button onClick={()=> {setActionType('problem'); setShowConfirmModal(true)}} className="w-full py-3 bg-orange-50 text-orange-600 rounded-xl font-bold flex items-center justify-center gap-2">
                       <AlertTriangle size={18} />
                       Reportar Problema
                     </button>
                  ) : null}
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
              <h3 className="font-bold text-xl mb-2">
                {actionType === 'accept' ? 'Aceitar Pedido?' : 
                 actionType === 'problem' ? 'Reportar Problema?' : 
                 'Recusar Pedido?'}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {actionType === 'accept' ? 'Deseja aceitar este pedido?' : 
                 actionType === 'problem' ? 'Deseja marcar este serviço como com problema?' : 
                 'Deseja recusar este pedido?'}
              </p>
              <div className="flex gap-3 mt-6">
                 <button onClick={()=>setShowConfirmModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                 <button onClick={executeStatusUpdate} className={`flex-1 py-2 rounded-lg font-bold text-white ${
                   actionType==='accept'?'bg-green-600':actionType==='problem'?'bg-orange-600':'bg-red-600'
                 }`}>Confirmar</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Confirmação de Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
           <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
              <h3 className="font-bold text-xl mb-2">Sair do Painel?</h3>
              <p className="text-sm text-slate-600 mb-4">Tem certeza que deseja sair do painel administrativo?</p>
              <div className="flex gap-3 mt-6">
                 <button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                 <button onClick={logout} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Sair</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Ocupar/Liberar Data */}
      {showDateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
           <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Calendar className="text-blue-500" size={24} />
                {dateAction === 'free' ? 'Liberar Data' : 'Ocupar Data'}
              </h3>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-semibold text-blue-900">Data selecionada:</div>
                <div className="text-lg font-bold text-blue-700">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              
              {dateAction === 'free' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <div className="font-semibold text-red-900 mb-1">Atenção!</div>
                        <div className="text-sm text-red-700">Ao liberar esta data, todos os agendamentos para este dia serão cancelados. Esta ação não pode ser desfeita.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button onClick={()=>setShowDateModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                    <button onClick={handleDateAction} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Liberar Data</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Horário *</label>
                    <input 
                      type="time" 
                      value={time} 
                      onChange={e=>setTime(e.target.value)} 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Serviço *</label>
                    <select 
                      value={serviceType} 
                      onChange={e=>setServiceType(e.target.value)} 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Filmagem Aérea">Filmagem Aérea</option>
                      <option value="Fotografia Aérea">Fotografia Aérea</option>
                      <option value="Inspeção com Drone">Inspeção com Drone</option>
                      <option value="Mapeamento Aéreo">Mapeamento Aéreo</option>
                      <option value="Pulverização Agrícola">Pulverização Agrícola</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
                    <textarea 
                      value={notes} 
                      onChange={e=>setNotes(e.target.value)} 
                      rows={3}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Detalhes sobre o serviço..."
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button onClick={()=>setShowDateModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                    <button onClick={handleDateAction} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Ocupar Data</button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
