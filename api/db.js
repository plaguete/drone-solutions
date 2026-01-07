// Este arquivo fica dentro da pasta /api na raiz do projeto.
// Ele é responsável por conectar as Serverless Functions ao Neon.

import pg from 'pg';

const { Pool } = pg;

// A string de conexão virá das variáveis de ambiente da Vercel
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not loaded');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para conexão segura com Neon
  },
});

// Log connection errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Função auxiliar para executar queries
export default async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  // const duration = Date.now() - start;
  
  // Opcional: Log para debug em desenvolvimento
  // console.log('executed query', { text, duration, rows: res.rowCount });
  
  return res;
}