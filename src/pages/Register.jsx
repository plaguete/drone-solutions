import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Hexagon, ArrowRight, Loader2, UserPlus, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen w-full flex bg-slate-50">
      
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <Link to="/" className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 flex items-center gap-2 transition">
            <ArrowLeft size={20} /> Voltar
        </Link>

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Crie sua conta</h2>
            <p className="text-slate-500 text-sm mt-1">Comece a agendar seus serviços hoje</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Nome Completo</label>
                <input name="name" onChange={handleChange} required className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="João Silva" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
                <input name="email" type="email" onChange={handleChange} required className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="joao@exemplo.com" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Telefone</label>
                <input name="phone" onChange={handleChange} required className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="(00) 00000-0000" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Senha</label>
                <input name="password" type="password" onChange={handleChange} required className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="******" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 font-bold transition disabled:opacity-50 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Cadastrar <UserPlus size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
      
      {/* Imagem Lateral */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1530268578403-ade5914654e3?q=80&w=2069&auto=format&fit=crop" 
          alt="Campo" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-green-900/40 mix-blend-multiply"></div>
      </div>
    </div>
  );
}