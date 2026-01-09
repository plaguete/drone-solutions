#!/bin/bash

# Script de configuração para o DroneService
# Este script ajuda a configurar o ambiente de desenvolvimento

echo "🚁 Configuração do DroneService"
echo "================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ em https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  Arquivo .env não encontrado"
    echo "📝 Criando arquivo .env a partir de .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Configure as variáveis de ambiente no arquivo .env:"
    echo "   - DATABASE_URL: Sua string de conexão do PostgreSQL (Neon)"
    echo "   - JWT_SECRET: Uma chave secreta para JWT"
    echo "   - REACT_APP_VAPID_PUBLIC_KEY: Chave pública VAPID"
    echo "   - REACT_APP_VAPID_PRIVATE_KEY: Chave privada VAPID"
else
    echo "✅ Arquivo .env encontrado"
fi

# Verificar dependências essenciais
echo ""
echo "🔍 Verificando dependências essenciais..."

# Verificar se bcryptjs está instalado
if npm list bcryptjs &> /dev/null; then
    echo "✅ bcryptjs"
else
    echo "❌ bcryptjs não instalado"
fi

# Verificar se jsonwebtoken está instalado
if npm list jsonwebtoken &> /dev/null; then
    echo "✅ jsonwebtoken"
else
    echo "❌ jsonwebtoken não instalado"
fi

# Verificar se pg está instalado
if npm list pg &> /dev/null; then
    echo "✅ pg (PostgreSQL)"
else
    echo "❌ pg não instalado"
fi

# Verificar se react-leaflet está instalado
if npm list react-leaflet &> /dev/null; then
    echo "✅ react-leaflet"
else
    echo "❌ react-leaflet não instalado"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no arquivo .env"
echo "2. Execute o script SQL em api/complete-schema.sql no seu banco de dados Neon"
echo "3. Inicie o servidor de desenvolvimento: npm run dev"
echo ""
echo "🔗 Links úteis:"
echo "- Neon (Banco de Dados): https://neon.tech"
echo "- Vercel (Deploy): https://vercel.com"
echo "- Gerar chaves VAPID: https://web-push-codelab.glitch.me/"
echo ""
echo "📚 Documentação completa em README.md"