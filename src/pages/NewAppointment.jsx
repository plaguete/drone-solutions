import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, MapPin, FileText, Send, Loader2, Map } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import L from 'leaflet';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Fix default marker icons for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para capturar clique no mapa
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function NewAppointment() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [dateError, setDateError] = useState('');
  const [noLocation, setNoLocation] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notificationOptIn, setNotificationOptIn] = useState(false);
  const { subscribe, isSupported } = usePushNotifications();
  const [formData, setFormData] = useState({
    service_type: 'Pulverização com Drones',
    scheduled_date: '',
    scheduled_time: '',
    details: '',
    location_text: ''
  });

  // Fetch booked dates on component mount
  useEffect(() => {
    fetchBookedDates();
  }, []);

  async function fetchBookedDates() {
    try {
      const response = await fetch('/api/appointments/available-dates');
      if (response.ok) {
        const data = await response.json();
        setBookedDates(data.bookedDates || []);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  }

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    if (!address || noLocation) {
      setPosition(null);
      return;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Drone Service App'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        setPosition({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon)
        });
      } else {
        setPosition(null);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setPosition(null);
    }
  };

  // Handle location text change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      geocodeAddress(formData.location_text);
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.location_text, noLocation]);

  // Validate date when changed
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData({...formData, scheduled_date: selectedDate});
    
    if (bookedDates.includes(selectedDate)) {
      setDateError('Esta data já está ocupada. Por favor, escolha outra data.');
    } else {
      setDateError('');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate location
    if (!noLocation && !position && !formData.location_text) {
      return toast.error("Selecione um local no mapa, descreva o endereço ou marque 'Sem localização'");
    }
    
    // Validate date
    if (bookedDates.includes(formData.scheduled_date)) {
      return toast.error("Esta data já está ocupada. Por favor, escolha outra data.");
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('@droneApp:token');
      const payload = {
        ...formData,
        latitude: noLocation ? null : (position ? position.lat : null),
        longitude: noLocation ? null : (position ? position.lng : null),
        user_id: user.id,
        location_text: noLocation ? null : formData.location_text
      };

      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Navigate to confirmation page with appointment ID
      navigate(`/appointment-confirmation/${result.id}`);
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || "Erro ao enviar pedido.");
      
      // Fallback: Navigate to generic confirmation page
      navigate('/confirmacao');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNotificationSubscription = async () => {
    if (notificationOptIn && isSupported) {
      const success = await subscribe();
      if (success) {
        toast.success('Notificações ativadas! Você receberá atualizações mesmo fora do site.');
      } else {
        toast.error('Não foi possível ativar as notificações. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-40 h-16 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block">DroneService</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-full transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Início
            </button>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
             <h1 className="text-2xl font-bold">Novo Agendamento</h1>
             <p className="opacity-90">Preencha os dados abaixo para solicitar um drone.</p>
          </div>
        
          <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Serviço</label>
                 <select 
                    className="w-full p-3 border rounded-lg bg-white"
                    value={formData.service_type}
                    onChange={e => setFormData({...formData, service_type: e.target.value})}
                 >
                    <option>Pulverização com Drones</option>
                    <option>Mapeamento Aero Topográfico</option>
                    <option>Manutenção em Drones Agrícolas</option>
                    <option>Captura de Imagens</option>
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Data</label>
                 <input 
                   type="date" 
                   required 
                   className={`w-full p-3 border rounded-lg ${dateError ? 'border-red-500' : ''}`} 
                   onChange={handleDateChange}
                   value={formData.scheduled_date}
                 />
                 {dateError && (
                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                     <span>⚠</span> {dateError}
                   </p>
                 )}
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">
                   Hora (Opcional)
                 </label>
                 <input 
                   type="time" 
                   className="w-full p-3 border rounded-lg" 
                   onChange={e => setFormData({...formData, scheduled_time: e.target.value})}
                   value={formData.scheduled_time}
                 />
                 <p className="text-xs text-slate-500 mt-1">Deixe em branco se não houver horário específico</p>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Detalhes / Obs (Opcional)</label>
                 <textarea 
                   rows={3} 
                   className="w-full p-3 border rounded-lg" 
                   placeholder="Ex: Área de difícil acesso, detalhes sobre o serviço..." 
                   onChange={e => setFormData({...formData, details: e.target.value})}
                   value={formData.details}
                 />
              </div>

              <div className="space-y-3">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Endereço por escrito (Opcional)</label>
                   <input 
                     type="text" 
                     className="w-full p-3 border rounded-lg" 
                     placeholder="Fazenda Santa Maria, km 12..."
                     onChange={e => setFormData({...formData, location_text: e.target.value})}
                     value={formData.location_text}
                     disabled={noLocation}
                   />
                 </div>
                 
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4"
                     checked={noLocation}
                     onChange={(e) => {
                       setNoLocation(e.target.checked);
                       if (e.target.checked) {
                         setPosition(null);
                       }
                     }}
                   />
                   <span className="text-sm text-slate-600">Não tenho localização específica</span>
                 </label>
              </div>
           </div>

              <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                 <label className="block text-sm font-bold text-slate-700">Selecione o local no mapa</label>
                 {noLocation && <span className="text-sm text-slate-500">(Desabilitado - Sem localização)</span>}
              </div>
              
              <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border shadow-inner relative">
                 <MapContainer 
                   center={position || [-23.5505, -46.6333]} 
                   zoom={position ? 15 : 13} 
                   style={{height:'100%', width:'100%'}}
                   className={noLocation ? 'opacity-50 pointer-events-none' : ''}
                   key={position ? `${position.lat}-${position.lng}` : 'default'}
                 >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker position={position} setPosition={setPosition} />
                 </MapContainer>
                 {!noLocation && !position && formData.location_text && (
                   <div className="absolute top-2 left-2 bg-blue-50 p-2 text-xs rounded shadow z-[400] text-blue-600 font-bold">
                     Buscando localização...
                   </div>
                 )}
                 {!noLocation && !position && !formData.location_text && (
                   <div className="absolute top-2 left-2 bg-white/90 p-2 text-xs rounded shadow z-[400] text-red-600 font-bold">
                     Clique no mapa para marcar
                   </div>
                 )}
                 {noLocation && (
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-[400]">
                     <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                       <Map className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                       <p className="text-sm text-gray-600">Localização desabilitada</p>
                     </div>
                   </div>
                 )}
              </div>
              {!noLocation && (
                <div className="text-xs text-slate-500 text-center space-y-1">
                  <p>Latitude: {position?.lat?.toFixed(4) || '--'} | Longitude: {position?.lng?.toFixed(4) || '--'}</p>
                  {formData.location_text && position && (
                    <p className="text-green-600">✓ Localização encontrada no mapa</p>
                  )}
                  {formData.location_text && !position && (
                    <p className="text-yellow-600">⚠ Digite um endereço válido ou clique no mapa</p>
                  )}
                </div>
              )}
           </div>
          </form>

          <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para início
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (formData.scheduled_date && dateError)}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin"/> : <>Confirmar Pedido <Send size={18}/></>}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Pedido Enviado!</h2>
            <p className="text-slate-600 mb-6">Obrigada pela confiança! Seu pedido foi encaminhado para nossa equipe.</p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-blue-600 rounded"
                  checked={notificationOptIn}
                  onChange={(e) => setNotificationOptIn(e.target.checked)}
                />
                <span className="text-sm text-slate-700 font-medium">
                  Receber notificações sobre atualizações do serviço
                </span>
              </label>
            </div>
            
            <div className="grid gap-3">
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Ir para tela inicial
              </button>
              <button
                onClick={() => {
                  handleNotificationSubscription();
                  setShowConfirmation(false);
                  setFormData({
                    service_type: 'Pulverização com Drones',
                    scheduled_date: '',
                    scheduled_time: '',
                    details: '',
                    location_text: ''
                  });
                  setPosition(null);
                  setNotificationOptIn(false);
                }}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
              >
                Agendar outro serviço
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }
