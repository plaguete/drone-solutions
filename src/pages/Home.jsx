import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, MapIcon, Wrench, Camera, ArrowRight } from 'lucide-react';

export default function Home() {
  const { signed, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">D</div>
              <span className="font-bold text-xl text-slate-800">DroneService</span>
            </div>
            <div className="flex items-center gap-4">
              {signed ? (
                <>
                  <Link to="/meus-pedidos" className="text-slate-600 hover:text-blue-600 font-medium transition">Meus Pedidos</Link>
                  <Link to="/agendar" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    Agendar Serviço
                  </Link>
                  <button onClick={logout} className="text-slate-600 hover:text-red-600 font-medium transition">
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition">Entrar</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    Cadastrar-se
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Plane size={16} />
              Tecnologia de ponta para agricultura
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Serviços especializados com <span className="text-blue-600">drones</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Conheça nossos serviços de pulverização, mapeamento aero topográfico, manutenção e captura de imagens com tecnologia de ponta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={signed ? "/agendar" : "/register"} 
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              Agendar Serviço <ArrowRight size={20} />
            </Link>
            {!signed && (
              <Link to="/login" className="bg-white text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-50 transition font-bold text-lg border border-slate-300">
                Já tenho conta
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Oferecemos soluções completas para monitoramento agrícola com tecnologia avançada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pulverização com Drones</h3>
              <p className="text-slate-600 text-sm">
                Pulverização precisa e eficiente de defensivos agrícolas com drones especializados.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mapeamento Aero Topográfico</h3>
              <p className="text-slate-600 text-sm">
                Levantamentos topográficos precisos com tecnologia de ponta para mapeamento aéreo.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition hover:shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Manutenção em Drones Agrícolas</h3>
              <p className="text-slate-600 text-sm">
                Serviços especializados de manutenção e reparo para sua frota de drones agrícolas.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition hover:shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Captura de Imagens</h3>
              <p className="text-slate-600 text-sm">
                Registros fotográficos e videográficos aéreos profissionais para análise e documentação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Pronto para otimizar seus serviços com drones?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Agende agora mesmo e experimente a tecnologia que vai transformar seus resultados.
          </p>
          <Link 
            to={signed ? "/agendar" : "/register"} 
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-lg"
          >
            {signed ? "Agendar Novo Serviço" : "Criar conta gratuita"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">D</div>
              <span className="font-bold text-lg">DroneService</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 DroneService. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}