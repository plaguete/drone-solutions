import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { AuthProvider, useAuth } from './context/AuthContext';

// Importações CORRETAS da pasta pages/
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NewAppointment from './pages/NewAppointment';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentConfirmation from './pages/AppointmentConfirmation';

// Componente para rotas protegidas
function ProtectedRoute({ children, requireAdmin = false }) {
  const { signed, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!signed) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/agendar" />;
  }
  
  return children;
}

// Componente para rotas de autenticação (login/register quando já logado)
function AuthRoute({ children }) {
  const { signed, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (signed) {
    return <Navigate to="/agendar" />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/login" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />
          
          <Route path="/register" element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } />
          
          <Route path="/esqueci-senha" element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          } />
          
          <Route path="/agendar" element={
            <ProtectedRoute>
              <NewAppointment />
            </ProtectedRoute>
          } />
          
          <Route path="/meus-pedidos" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          
          <Route path="/appointment-confirmation/:id" element={
            <ProtectedRoute>
              <AppointmentConfirmation />
            </ProtectedRoute>
          } />
          
          <Route path="/confirmacao" element={
            <ProtectedRoute>
              <AppointmentConfirmation />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
