#!/usr/bin/env node

/**
 * Script para gerar chaves VAPID para notificações push
 * 
 * Como usar:
 * 1. Execute: node generate-vapid.cjs
 * 2. Copie as chaves geradas para o arquivo .env
 * 
 * Requisitos:
 * - Node.js instalado
 * - Pacote web-push instalado (npm install web-push)
 */

import webpush from 'web-push';

console.log('🚀 Gerando chaves VAPID para notificações push...');
console.log('');

// Gera as chaves
const vapidKeys = webpush.generateVAPIDKeys();

console.log('═══════════════════════════════════════════════════════════');
console.log('🔑 CHAVE PÚBLICA (REACT_APP_VAPID_PUBLIC_KEY):');
console.log('═══════════════════════════════════════════════════════════');
console.log(vapidKeys.publicKey);
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('🔒 CHAVE PRIVADA (REACT_APP_VAPID_PRIVATE_KEY):');
console.log('═══════════════════════════════════════════════════════════');
console.log(vapidKeys.privateKey);
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('📝 PRÓXIMOS PASSOS:');
console.log('═══════════════════════════════════════════════════════════');
console.log('1. Abra o arquivo .env');
console.log('2. Adicione as chaves:');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('3. Configure também na Vercel (variáveis de ambiente)');
console.log('4. Reinicie o servidor de desenvolvimento');
console.log('');
console.log('✅ Chaves geradas com sucesso!');
console.log('═══════════════════════════════════════════════════════════');