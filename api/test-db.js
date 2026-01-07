export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    // Teste simples sem banco
    return res.status(200).json({
      message: 'API funcionando',
      timestamp: new Date().toISOString(),
      env_vars: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Presente' : 'Ausente',
        NODE_ENV: process.env.NODE_ENV || 'undefined'
      }
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({
      message: 'Erro interno',
      error: error.message
    });
  }
}