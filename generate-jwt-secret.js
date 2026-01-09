#!/usr/bin/env node

/**
 * Script para gerar uma chave JWT_SECRET segura
 * 
 * Como usar:
 * 1. Execute: node generate-jwt-secret.js
 * 2. Copie a chave gerada para o arquivo .env
 * 
 * A chave JWT_SECRET deve ser:
 * - Longa (mínimo 32 caracteres, recomendado 64+)
 * - Aleatória
 * - Segura (não use palavras comuns)
 * - Única para cada ambiente
 */

import crypto from 'crypto';

console.log('🔐 Gerando chave JWT_SECRET segura...');
console.log('');

// Gera uma chave segura de 64 bytes (512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('═══════════════════════════════════════════════════════════');
console.log('🔑 SUA CHAVE JWT_SECRET:');
console.log('═══════════════════════════════════════════════════════════');
console.log(jwtSecret);
console.log('');
console.log(`Tamanho: ${jwtSecret.length} caracteres`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('📝 PRÓXIMOS PASSOS:');
console.log('═══════════════════════════════════════════════════════════');
console.log('1. Abra o arquivo .env');
console.log('2. Adicione a chave:');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');
console.log('3. Configure também na Vercel (variáveis de ambiente)');
console.log('4. Reinicie o servidor de desenvolvimento');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('- Mantenha esta chave SECRETA!');
console.log('- Nunca a compartilhe ou commit no Git');
console.log('- Use chaves diferentes para dev e produção');
console.log('- Guarde uma cópia segura desta chave');
console.log('');
console.log('✅ Chave gerada com sucesso!');
console.log('═══════════════════════════════════════════════════════════');