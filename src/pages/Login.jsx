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
    
    // Validação básica
    if (!identifier.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Verifica se a resposta tem os dados esperados
      if (!data.user || !data.token) {
        throw new Error('Resposta inválida do servidor');
      }

      login(data.user, data.token);
      toast.success(`Bem-vindo, ${data.user.name}!`);
      
      // Pequeno delay antes do redirecionamento
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/agendar');
        }
      }, 500);
      
    } catch (err) {
      toast.error(err.message || 'Erro ao conectar com o servidor');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Lado Esquerdo - Formulário */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 flex items-center gap-2 transition">
          <ArrowLeft size={20} /> Voltar
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                <Hexagon className="text-white fill-current" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-2 text-slate-600">Acesse sua conta para continuar</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email ou Telefone</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="seu@email.com ou (11) 99999-9999"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 font-bold transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Entrar <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Cadastre-se agora
              </Link>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Problemas para acessar?{' '}
              <Link to="/" className="text-blue-500 hover:underline">
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop" 
          alt="Drone" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute bottom-0 left-0 p-16 z-10 text-white">
          <h3 className="text-4xl font-bold mb-4">Agricultura de Precisão</h3>
          <p className="text-lg text-slate-200 max-w-lg">
            Monitore suas safras e otimize a produção com nossa tecnologia de drones de última geração.
          </p>
        </div>
      </div>
    </div>
  );
}