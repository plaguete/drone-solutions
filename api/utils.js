import jwt from 'jsonwebtoken';

// Função para validar token nas rotas de API
export function verifyToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1]; // Pega "Bearer XYZ..." -> "XYZ..."
  
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return null;
    }
    const decoded = jwt.verify(token, secret);
    return decoded; // Retorna { id, role, ... }
  } catch (error) {
    return null;
  }
}