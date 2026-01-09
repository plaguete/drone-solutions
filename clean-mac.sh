#!/bin/bash
echo "🧹 Limpando cache do Mac..."

# Para o servidor se estiver rodando
pkill -f "vite" 2>/dev/null

# Remove caches
rm -rf node_modules
rm -f package-lock.json
rm -rf .vite
rm -rf dist
rm -rf ~/Library/Caches/vite

# Limpa cache do npm e yarn
npm cache clean --force
if command -v yarn &> /dev/null; then
    yarn cache clean
fi

echo "✅ Limpeza completa! Execute 'npm install' e depois 'npm run dev'"