import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Check, X, MapPin, Calendar, User, Filter, LogOut, LayoutDashboard, DollarSign, Bell, Phone, Mail, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, signed, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [servicePrice, setServicePrice] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (signed && user.role !== 'admin') {
      navigate('/');
    }
    if (signed) {
      fetchAppointments();
      fetchBookedDates();
    }
  }, [signed, user, navigate]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('@droneApp:token');
    try {
      const res = await fetch('/api/appointments/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAppointments(data);
    } catch(e) { toast.error("Erro ao carregar pedidos"); }
  };

  const fetchBookedDates = async () => {
    try {
      const response = await fetch('/api/appointments/available-dates');
      if (response.ok) {
        const data = await response.json();
        const dates = data.bookedDates.map(date => new Date(date));
        setBookedDates(dates);
      }
    } catch (error) {
      console.error('Erro ao buscar datas ocupadas:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('@droneApp:token');
    const loadToast = toast.loading("Atualizando...");
    
    try {
      await fetch('/api/appointments/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: newStatus, price: servicePrice, is_paid: isPaid })
      });

      toast.dismiss(loadToast);
      toast.success(`Pedido ${newStatus === 'accepted' ? 'Aceito' : 'Recusado'}!`);
      
      fetchAppointments();
      fetchBookedDates();
      setSelectedOrder(null);
      setShowConfirmModal(false);
      setServicePrice('');
      setIsPaid(false);
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Erro ao atualizar pedido");
    }
  };

  const handleActionClick = (order, action) => {
    setSelectedOrder(order);
    setConfirmAction(action);
    setServicePrice(order.price || '');
    setIsPaid(order.is_paid || false);
    setShowConfirmModal(true);
  };

  const confirmActionHandler = () => {
    if (confirmAction === 'accept') {
      handleUpdateStatus(selectedOrder.id, 'accepted');
    } else if (confirmAction === 'reject') {
      handleUpdateStatus(selectedOrder.id, 'rejected');
    }
  };

  const filteredAppointments = appointments.filter(a => filter === 'all' ? true : a.status === filter);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': return <XCircle className="text-red-500" size={16} />;
      default: return <AlertCircle className="text-yellow-500" size={16} />;
    }
  };

  const getStatusText = (status) => {
    const map = {
      'pending': 'Pendente',
      'accepted': 'Aceito',
      'rejected': 'Recusado',
      'completed': 'Concluído'
    };
    return map[status] || status;
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.scheduled_date).toDateString();
      return aptDate === date.toDateString();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="text-blue-600" size={24} />
              <h1 className="text-xl font-bold text-slate-900">Painel Administrativo</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Olá, {user?.name}</span>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Client Cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Pedidos de Serviço</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 text-sm rounded-full ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  Pendentes ({appointments.filter(a => a.status === 'pending').length})
                </button>
                <button 
                  onClick={() => setFilter('accepted')}
                  className={`px-3 py-1 text-sm rounded-full ${filter === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  Aceitos ({appointments.filter(a => a.status === 'accepted').length})
                </button>
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  Todos ({appointments.length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium text-slate-900">{getStatusText(order.status)}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{order.service_type}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <strong>Cliente:</strong> {order.client_name}
                        </div>
                        <div>
                          <strong>Data:</strong> {new Date(order.scheduled_date).toLocaleDateString('pt-BR')}
                          {order.scheduled_time && ` às ${order.scheduled_time}`}
                        </div>
                        <div>
                          <strong>Telefone:</strong> {order.client_phone}
                        </div>
                        <div>
                          <strong>Local:</strong> {order.location_text || 'Não especificado'}
                        </div>
                      </div>
                      
                      {order.details && (
                        <div className="mt-3 text-sm text-slate-600">
                          <strong>Observações:</strong> {order.details}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleActionClick(order, 'accept')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                          >
                            <Check size={14} />
                            Aceitar
                          </button>
                          <button
                            onClick={() => handleActionClick(order, 'reject')}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                          >
                            <X size={14} />
                            Recusar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <MapPin size={14} />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  Nenhum pedido encontrado
                </div>
              )}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Calendário de Serviços</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days - simplified version */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isBooked = bookedDates.some(booked => 
                    booked.toDateString() === date.toDateString()
                  );
                  const dayAppointments = getAppointmentsForDate(date);
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`text-center py-2 text-sm rounded-lg transition ${
                        isToday ? 'bg-blue-100 text-blue-800 font-bold' :
                        isBooked ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        'hover:bg-slate-100'
                      }`}
                    >
                      {date.getDate()}
                      {dayAppointments.length > 0 && (
                        <div className="text-xs mt-1">
                          {dayAppointments.length} serviço{dayAppointments.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {selectedDate && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-medium text-slate-900 mb-2">
                    {selectedDate.toLocaleDateString('pt-BR')}
                  </h3>
                  <div className="space-y-2">
                    {getAppointmentsForDate(selectedDate).map(apt => (
                      <div key={apt.id} className="text-sm p-2 bg-slate-50 rounded">
                        <div className="font-medium">{apt.service_type}</div>
                        <div className="text-slate-600">{apt.client_name}</div>
                        <div className="text-xs text-slate-500">
                          {apt.scheduled_time || 'Horário não definido'}
                        </div>
                      </div>
                    ))}
                    {getAppointmentsForDate(selectedDate).length === 0 && (
                      <div className="text-sm text-slate-500">Nenhum serviço agendado</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-slate-900">Detalhes do Pedido</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map */}
                {selectedOrder.latitude && selectedOrder.longitude && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Localização</h3>
                    <div className="h-64 rounded-lg overflow-hidden border border-slate-200">
                      <MapContainer 
                        center={[selectedOrder.latitude, selectedOrder.longitude]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedOrder.latitude, selectedOrder.longitude]}>
                          <Popup>
                            {selectedOrder.location_text}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}
                
                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Informações do Serviço</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="font-medium">{getStatusText(selectedOrder.status)}</span>
                      </div>
                      <p><strong>Tipo:</strong> {selectedOrder.service_type}</p>
                      <p><strong>Data:</strong> {new Date(selectedOrder.scheduled_date).toLocaleDateString('pt-BR')}</p>
                      {selectedOrder.scheduled_time && (
                        <p><strong>Hora:</strong> {selectedOrder.scheduled_time}</p>
                      )}
                      <p><strong>Local:</strong> {selectedOrder.location_text || 'Não especificado'}</p>
                      {selectedOrder.details && (
                        <p><strong>Observações:</strong> {selectedOrder.details}</p>
                      )}
                      {selectedOrder.price && (
                        <p><strong>Preço:</strong> R$ {selectedOrder.price}</p>
                      )}
                      <p><strong>Pago:</strong> {selectedOrder.is_paid ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Informações do Cliente</h3>
                    <div className="space-y-3">
                      <p><strong>Nome:</strong> {selectedOrder.client_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                      <p><strong>Telefone:</strong> {selectedOrder.client_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Send notification to client
                        toast.success(`Notificação enviada para ${selectedOrder.client_name}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <Bell size={16} />
                      Notificar Cliente
                    </button>
                    
                    {selectedOrder.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleActionClick(selectedOrder, 'accept')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <Check size={16} />
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleActionClick(selectedOrder, 'reject')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <X size={16} />
                          Recusar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {confirmAction === 'accept' ? 'Aceitar Pedido' : 'Recusar Pedido'}
              </h2>
              
              <p className="text-slate-600 mb-6">
                Tem certeza que deseja {confirmAction === 'accept' ? 'aceitar' : 'recusar'} o pedido de {selectedOrder?.client_name}?
              </p>
              
              {confirmAction === 'accept' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Preço do Serviço (R$)
                    </label>
                    <input
                      type="number"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPaid"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="isPaid" className="text-sm text-slate-700">
                      Já foi pago
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmActionHandler}
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    confirmAction === 'accept' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {confirmAction === 'accept' ? 'Aceitar' : 'Recusar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}