import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Importar handlers
import loginHandler from './api/auth/login.js';
import registerHandler from './api/auth/register.js';
import listAppointments from './api/appointments/list.js';
import createAppointment from './api/appointments/create.js';
import updateAppointment from './api/appointments/update.js';
import availableDates from './api/appointments/available-dates.js';

// Rotas
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/register', registerHandler);
app.get('/api/appointments/list', listAppointments);
app.post('/api/appointments/create', createAppointment);
app.put('/api/appointments/update', updateAppointment);
app.get('/api/appointments/available-dates', availableDates);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});