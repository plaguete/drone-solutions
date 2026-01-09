import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Mail, Loader2, Key } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor, informe seu email');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao solicitar recuperação');
      }

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err) {
      toast.error(err.message || 'Erro ao conectar com o servidor');
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <Link to="/login" className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 flex items-center gap-2 transition">
            <ArrowLeft size={20} /> Voltar para login
        </Link>

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                <Key className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Recuperar Senha</h2>
            <p className="text-slate-500 text-sm mt-2">
              Informe seu email para receber um link de recuperação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-bold transition disabled:opacity-50 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Enviar Link <Mail size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Lembrou sua senha?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
      
      {/* Imagem Lateral */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
          alt="Segurança" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
      </div>

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
    </div>
  );
}