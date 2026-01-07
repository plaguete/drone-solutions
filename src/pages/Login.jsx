import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Hexagon, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Erro ao logar');

      login(data.user, data.token);
      toast.success(`Bem-vindo, ${data.user.name}!`);
      navigate('/');
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 relative">
      <Toaster position="top-right" />
      
      {/* Botão Voltar */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-slate-700 hover:bg-white hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          Voltar ao Início
        </Link>
      </div>
      
      {/* Lado Esquerdo - Formulário */}
      <div className="flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl mb-2">
              <Hexagon className="fill-blue-600 text-white" /> Drone Service
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">Bem-vindo de volta</h2>
            <p className="text-slate-500 mt-2">Gerencie seus serviços aéreos com facilidade.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email ou Telefone</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="ex: contato@empresa.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required 
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Senha</label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</a>
                </div>
                <input 
                  type="password" 
                  className="w-full mt-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <>Entrar <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>

      {/* Lado Direito - Imagem Decorativa */}
      <div className="hidden lg:block bg-slate-900 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop" 
          alt="Drone voando sobre campo" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute bottom-0 left-0 p-12 text-white z-10">
          <h3 className="text-3xl font-bold mb-4">Tecnologia de ponta para o seu negócio.</h3>
          <p className="text-lg text-slate-300">Acompanhe mapeamentos e pulverizações em tempo real com nossa plataforma exclusiva.</p>
        </div>
      </div>
    </div>
  );
}