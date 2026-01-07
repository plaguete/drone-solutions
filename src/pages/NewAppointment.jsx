import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MapSelector from '../components/MapSelector';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, MapPin, FileText, Send, CheckCircle2, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function NewAppointment() {
  const { signed } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [mapPosition, setMapPosition] = useState(null);
  const [noLocation, setNoLocation] = useState(false);

  const [formData, setFormData] = useState({
    service_type: 'Pulverização com Drones',
    scheduled_date: '',
    scheduled_time: '',
    details: '',
    location_text: '',
    latitude: null,
    longitude: null
  });

  if (!signed) {
    setTimeout(() => navigate('/login'), 100);
    return null;
  }

  useEffect(() => {
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
    fetchBookedDates();
  }, []);

  const handleLocationTextChange = async (value) => {
    setFormData(prev => ({ ...prev, location_text: value }));
    
    if (value.trim()) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=1`);
        const data = await response.json();
        console.log('Geocoding result:', data);
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
          setMapPosition([parseFloat(lat), parseFloat(lon)]);
          toast.success("Localização encontrada no mapa!", { id: 'geocode-toast', duration: 2000 });
        } else {
          toast.error("Localização não encontrada. Tente um endereço mais específico.", { id: 'geocode-toast', duration: 3000 });
        }
      } catch (error) {
        console.error('Erro ao geocodificar:', error);
        toast.error("Erro ao buscar localização.", { id: 'geocode-toast', duration: 2000 });
      }
    } else {
      setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
      setMapPosition(null);
    }
  };

  const handleMapSelect = async (latlng) => {
    setFormData(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }));
    setMapPosition([latlng.lat, latlng.lng]);
    
    // Reverse geocoding to get address
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, location_text: data.display_name }));
        toast.success("Localização marcada e endereço preenchido!", { id: 'map-toast', duration: 2000 });
      } else {
        toast.success("Localização marcada!", { id: 'map-toast', duration: 2000 });
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      toast.success("Localização marcada!", { id: 'map-toast', duration: 2000 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('@droneApp:token');

    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Pedido enviado com sucesso!');
        setTimeout(() => navigate('/confirmacao'), 1500);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Erro ao enviar pedido.');
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error('Erro de conexão.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Agendar Novo Serviço</h1>
          <p className="text-slate-600 mt-2">Preencha os dados abaixo para solicitar um drone.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
          
          <div className="p-8 space-y-8">
            {/* Seção 1: O Serviço */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={20} /> O que você precisa?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {['Pulverização com Drones', 'Mapeamento Aero Topográfico', 'Manutenção de Drones', 'Imagens Aéreas'].map((type) => (
                  <label key={type} className={`
                    border-2 rounded-xl p-4 cursor-pointer transition-all
                    ${formData.service_type === type ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-blue-300'}
                  `}>
                    <input 
                      type="radio" 
                      name="service" 
                      value={type}
                      checked={formData.service_type === type}
                      onChange={e => setFormData({...formData, service_type: e.target.value})}
                      className="hidden" 
                    />
                    <span className="font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Seção 2: Localização */}
            <div className="space-y-4">
               <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Onde será o serviço?
              </h2>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="noLocation" 
                  checked={noLocation}
                  onChange={e => {
                    setNoLocation(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, latitude: null, longitude: null, location_text: '' }));
                      setMapPosition(null);
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor="noLocation" className="text-sm text-slate-700">Não especificar localização</label>
              </div>
              
              {!noLocation && (
                <>
                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-inner">
                     <MapSelector onLocationSelect={handleMapSelect} position={mapPosition} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço ou Referência</label>
                    <textarea 
                      placeholder="Ex: Fazenda Santa Rita, km 40, entrada pelo portão azul..."
                      className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      rows={3}
                      value={formData.location_text}
                      onChange={e => handleLocationTextChange(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Seção 3: Data e Hora */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar size={16} /> Data Desejada
                </label>
                <DatePicker
                  selected={formData.scheduled_date ? new Date(formData.scheduled_date) : null}
                  onChange={(date) => {
                    if (date) {
                      const dateStr = date.toISOString().split('T')[0];
                      if (bookedDates.some(booked => booked.toISOString().split('T')[0] === dateStr)) {
                        toast.error('Esta data já está ocupada. Escolha outra data.');
                        return;
                      }
                      setFormData({...formData, scheduled_date: dateStr});
                    } else {
                      setFormData({...formData, scheduled_date: ''});
                    }
                  }}
                  excludeDates={bookedDates}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione uma data"
                  className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Clock size={16} /> Hora (Opcional)
                </label>
                <input 
                  type="time" 
                  className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm px-3 py-2 border"
                  value={formData.scheduled_time}
                  onChange={e => setFormData({...formData, scheduled_time: e.target.value})}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Seção 4: Detalhes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FileText size={16} /> Observações (Opcional)
              </label>
              <textarea 
                className="w-full border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm px-3 py-2 border"
                placeholder="Área de difícil acesso, etc."
                rows={3}
                value={formData.details}
                onChange={e => setFormData({...formData, details: e.target.value})}
              />
            </div>
          </div>

          {/* Footer do Form */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : <>Confirmar Agendamento <Send size={18} /></>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}