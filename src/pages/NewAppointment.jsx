import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, MapPin, FileText, Send, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import L from 'leaflet';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState(null);
  const [formData, setFormData] = useState({
    service_type: 'Pulverização com Drones',
    scheduled_date: '',
    scheduled_time: '',
    details: '',
    location_text: ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!position && !formData.location_text) return toast.error("Selecione um local no mapa ou descreva o endereço");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('@droneApp:token');
      const payload = {
        ...formData,
        latitude: position ? position.lat : null,
        longitude: position ? position.lng : null,
        user_id: user.id
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error();

      toast.success("Pedido enviado com sucesso!");
      navigate('/confirmation');
    } catch (err) {
      toast.error("Erro ao enviar pedido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
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
                    <option>Mapeamento de Área</option>
                    <option>Contagem de Plantas</option>
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Data</label>
                    <input type="date" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, scheduled_date: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hora</label>
                    <input type="time" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, scheduled_time: e.target.value})} />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Detalhes / Obs</label>
                 <textarea rows={3} className="w-full p-3 border rounded-lg" placeholder="Ex: Área de difícil acesso..." onChange={e => setFormData({...formData, details: e.target.value})} />
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Endereço por escrito (Opcional)</label>
                 <input type="text" className="w-full p-3 border rounded-lg" placeholder="Fazenda Santa Maria, km 12..." onChange={e => setFormData({...formData, location_text: e.target.value})} />
              </div>
           </div>

           <div className="space-y-4 h-full flex flex-col">
              <label className="block text-sm font-bold text-slate-700">Selecione o local no mapa</label>
              <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border shadow-inner relative">
                 <MapContainer center={[-23.5505, -46.6333]} zoom={13} style={{height:'100%', width:'100%'}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker position={position} setPosition={setPosition} />
                 </MapContainer>
                 {!position && <div className="absolute top-2 left-2 bg-white/90 p-2 text-xs rounded shadow z-[400] text-red-600 font-bold">Clique no mapa para marcar</div>}
              </div>
              <p className="text-xs text-slate-500 text-center">Latitude: {position?.lat.toFixed(4)} | Longitude: {position?.lng.toFixed(4)}</p>
           </div>
        </form>

        <div className="p-6 bg-slate-50 border-t flex justify-end">
           <button 
             onClick={handleSubmit} 
             disabled={isSubmitting}
             className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition shadow-lg flex items-center gap-2 disabled:opacity-70"
           >
             {isSubmitting ? <Loader2 className="animate-spin"/> : <>Confirmar Pedido <Send size={18}/></>}
           </button>
        </div>
      </div>
    </div>
  );
}