import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import NewAppointment from './pages/NewAppointment';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';
import { Plane, Map as MapIcon, Wrench, ArrowRight } from 'lucide-react';

function Home() {
  const { user, logout } = useAuth();

  return (
    // ADICIONADO w-full AQUI
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      <Toaster />
      
      {/* Navbar com w-full */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xl shrink-0">
                <Plane className="transform -rotate-45" fill="currentColor" /> Drone Service
            </div>

            <nav className="hidden md:flex items-center gap-8">
                <a href="#services" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition">Serviços</a>
                <a href="#about" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition">Sobre</a>
            </nav>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition whitespace-nowrap">
                                Painel Admin
                            </Link>
                        )}
                        <Link to="/meus-pedidos" className="text-slate-600 hover:text-blue-600 font-medium text-sm whitespace-nowrap">Meus Pedidos</Link>
                        <button onClick={logout} className="text-slate-400 hover:text-red-500 text-sm font-medium">Sair</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Entrar</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 whitespace-nowrap">
                            Começar
                        </Link>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* Hero Section w-full */}
      <section className="relative w-full bg-slate-900 py-32 overflow-hidden flex justify-center items-center">
        <img 
            src="https://images.unsplash.com/photo-1508614589041-895b8c9d7ef5?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            alt="Drone agrícola" 
        />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wider mb-6 uppercase backdrop-blur-sm">
                Líder em tecnologia aérea
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Eleve a produtividade <br/> da sua lavoura.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Pulverização de precisão, mapeamento topográfico e inteligência de dados com a frota de drones mais moderna do mercado.
            </p>
            <div className="flex justify-center gap-4">
                <Link 
                    to={user ? "/agendar" : "/register"} 
                    className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition shadow-xl shadow-blue-900/50 flex items-center gap-2 group"
                >
                    {user ? 'Agendar Serviço' : 'Criar Conta Grátis'} <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
                </Link>
            </div>
        </div>
      </section>

      {/* Services Section w-full */}
      <section id="services" className="w-full py-24 bg-white flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Nossos Serviços</h2>
                <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Oferecemos soluções completas para agricultura de precisão e engenharia civil.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Pulverização Agrícola", icon: Plane, desc: "Aplicação uniforme e eficiente, reduzindo desperdício de defensivos." },
                    { title: "Mapeamento Topográfico", icon: MapIcon, desc: "Modelos digitais de terreno com precisão centimétrica via fotogrametria." },
                    { title: "Manutenção Especializada", icon: Wrench, desc: "Laboratório técnico para reparo e revisão de DJI Agras e Mavic." }
                ].map((service, index) => (
                    <div key={index} className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition">
                            <service.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{service.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white font-bold text-2xl mb-6">
                <Plane className="transform -rotate-45 text-blue-500" /> Drone Service
            </div>
            <p className="text-sm">© 2024 Drone Service Manager. Tecnologia que voa alto.</p>
        </div>
      </footer>
    </div>
  );
}

// App Principal
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/agendar" element={<NewAppointment />} />
          <Route path="/confirmacao" element={<AppointmentConfirmation />} />
          <Route path="/meus-pedidos" element={<MyOrders />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


