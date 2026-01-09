# DroneService - Plataforma de Agendamento de Serviços com Drones

Uma aplicação web moderna para agendamento de serviços especializados com drones, construída com React, Vite e PostgreSQL.

## 🚁 Serviços Oferecidos

- **Pulverização com Drones**: Pulverização precisa e eficiente de defensivos agrícolas
- **Mapeamento Aero Topográfico**: Levantamentos topográficos precisos com tecnologia de ponta
- **Manutenção em Drones Agrícolas**: Serviços especializados de manutenção e reparo
- **Captura de Imagens**: Registros fotográficos e videográficos aéreos profissionais

## ✨ Funcionalidades

### Para Clientes
- ✅ Cadastro e autenticação com email/telefone únicos
- ✅ Página inicial com apresentação dos serviços
- ✅ Agendamento de serviços com seleção de localização no mapa
- ✅ Acompanhamento de pedidos (status: pendente, aprovado, recusado)
- ✅ Recuperação de senha por email

### Para Administradores
- ✅ Dashboard administrativo
- ✅ Gerenciamento de agendamentos
- ✅ Controle de status dos pedidos

## 🛠 Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Serverless Functions (Vercel)
- **Banco de Dados**: PostgreSQL (Neon)
- **Autenticação**: JWT
- **Mapas**: Leaflet
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

## 📦 Estrutura do Projeto

```
drone-service/
├── api/                    # Serverless Functions
│   ├── auth/              # Autenticação
│   │   ├── login.js
│   │   ├── register.js
│   │   └── forgot-password.js
│   ├── appointments/      # Agendamentos
│   ├── notifications/     # Notificações
│   ├── db.js             # Conexão com o banco
│   └── utils.js          # Utilitários
├── src/
│   ├── components/        # Componentes React
│   ├── context/          # Context API (Auth)
│   ├── pages/            # Páginas da aplicação
│   │   ├── Home.jsx      # Página inicial
│   │   ├── Login.jsx     # Login
│   │   ├── Register.jsx  # Cadastro
│   │   ├── ForgotPassword.jsx # Recuperação de senha
│   │   ├── NewAppointment.jsx # Novo agendamento
│   │   ├── MyOrders.jsx  # Meus pedidos
│   │   └── AdminDashboard.jsx # Dashboard admin
│   └── ...
├── vercel.json           # Configuração da Vercel
└── package.json
```

## 🚀 Deploy na Vercel

### Pré-requisitos
- Conta na [Vercel](https://vercel.com)
- Conta no [Neon](https://neon.tech) (banco de dados PostgreSQL)

### Passos para Deploy

1. **Fork este repositório** ou crie um novo com este código

2. **Configure o banco de dados Neon**:
   - Crie uma conta no Neon
   - Crie um novo projeto
   - Copie a string de conexão (DATABASE_URL)

3. **Configure as variáveis de ambiente**:
   Na Vercel, adicione as seguintes variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=sua-chave-secreta-aqui
   EMAIL_USER=seu-email@gmail.com (opcional, para notificações)
   EMAIL_PASS=sua-senha-de-app (opcional)
   ```

4. **Execute o schema SQL**:
   - Acesse o console do banco de dados Neon
   - Execute o conteúdo do arquivo `api/schema.sql` para criar a tabela de tokens de recuperação

5. **Faça o deploy**:
   - Conecte seu repositório à Vercel
   - A Vercel detectará automaticamente a configuração e fará o deploy

## 🔧 Configuração Local

### Instalação
```bash
npm install
```

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=sua-chave-secreta-aqui
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

### Desenvolvimento
```bash
npm run dev
```

## 📋 Configuração do Banco de Dados

### Tabelas Necessárias

#### Tabela de Usuários (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela de Tokens de Recuperação (password_reset_tokens)
Execute o arquivo `api/schema.sql` no seu banco de dados.

## 🔐 Funcionalidade de Recuperação de Senha

A funcionalidade de "Esqueci Senha" está implementada da seguinte forma:

1. **Frontend**: Página `/esqueci-senha` onde usuários informam o email
2. **Backend**: API `/api/auth/forgot-password` que:
   - Gera um token JWT com validade de 1 hora
   - Salva o token no banco de dados
   - **Em desenvolvimento**: Exibe o link no console
   - **Em produção**: Deve ser integrado com serviço de email (SendGrid, Resend, etc.)

### Como configurar envio de emails em produção

1. Escolha um serviço de email (SendGrid, Resend, Amazon SES, etc.)
2. Adicione as credenciais nas variáveis de ambiente
3. Modifique o arquivo `api/auth/forgot-password.js` para enviar o email real

## 🎨 Personalização

### Cores e Estilo
O projeto usa Tailwind CSS. As cores principais estão definidas em `tailwind.config.js`.

### Logo e Marca
- Altere o favicon em `public/`
- Modifique o texto "DroneService" nos componentes
- Atualize as imagens nas páginas de autenticação

## 📱 Responsividade

O site é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Mobile

## 🔄 Fluxo de Navegação

1. **Usuário não logado**:
   - Home → Login/Register → Agendar (redireciona para login)
   
2. **Usuário logado**:
   - Home → Agendar → Meus Pedidos → Acompanhamento

3. **Administrador**:
   - Home → Admin Dashboard → Gerenciar pedidos

## 🐛 Solução de Problemas

### Banco de Dados
- Verifique se a DATABASE_URL está correta
- Confirme que as tabelas foram criadas
- Teste a conexão com a API `/api/test-db`

### Autenticação
- Verifique se JWT_SECRET está definida
- Confirme que o token está sendo salvo no localStorage

### Deploy na Vercel
- Verifique os logs no painel da Vercel
- Confirme que todas as variáveis de ambiente estão configuradas
- Teste as Serverless Functions individualmente

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através das issues do projeto.

---

**Nota**: Este projeto foi desenvolvido para demonstração e pode ser adaptado para diferentes necessidades. Em produção, certifique-se de:
- Usar variáveis de ambiente seguras
- Configurar um serviço de email real
- Implementar validações adicionais
- Adicionar testes automatizados
- Configurar monitoramento e logs