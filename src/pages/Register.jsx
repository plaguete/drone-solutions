import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Hexagon, ArrowRight, Loader2, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Erro ao cadastrar');

      toast.success('Conta criada com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex font-sans bg-slate-50">
      <Toaster position="top-right" />
      
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white shadow-xl lg:shadow-none z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl mb-2">
              <Hexagon className="fill-blue-600 text-white" /> Drone Service
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-4">Crie sua conta</h2>
            <p className="text-slate-500 mt-2">Junte-se a nós e revolucione sua gestão agrícola.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">Nome Completo</label>
              <input 
                name="name" type="text"
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Seu nome"
                onChange={handleChange} required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
                    <input 
                        name="email" type="email"
                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="email@exemplo.com"
                        onChange={handleChange} required 
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700 ml-1">Telefone</label>
                    <input 
                        name="phone" type="text"
                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="(00) 00000-0000"
                        onChange={handleChange} required 
                    />
                </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
              <input 
                name="password" type="password" 
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Crie uma senha forte"
                onChange={handleChange} required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-bold shadow-lg shadow-green-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <>Cadastrar <UserPlus size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden lg:block lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-green-900/20 z-10 mix-blend-multiply"></div>
        <img 
          src="https://images.unsplash.com/photo-1530268578403-ade5914654e3?q=80&w=2069&auto=format&fit=crop" 
          alt="Agricultura Tecnológica" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-0 left-0 p-16 text-white z-20">
            <h3 className="text-4xl font-bold mb-4 leading-tight">Comece agora a <br/>transformar sua colheita.</h3>
            <p className="text-lg text-green-100 max-w-md">Junte-se a centenas de produtores que usam nossa tecnologia.</p>
        </div>
      </div>
    </div>
  );
}