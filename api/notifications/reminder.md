# Configuração de Notificações Agendadas

## Como configurar as notificações automáticas

### 1. Adicionar variável de ambiente
No arquivo `.env`, adicione:
```env
CRON_SECRET=sua_chave_secreta_aqui
```

### 2. Configurar agendamento (cron job)

#### Opção A: Usando Vercel Cron (Recomendado)
Adicione no seu `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/notifications/scheduled",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Opção B: Usando GitHub Actions
Crie um arquivo `.github/workflows/daily-reminder.yml`:
```yaml
name: Daily Reminder
on:
  schedule:
    - cron: '0 9 * * *'  # Executa diariamente às 9h UTC

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Enviar notificações
        run: |
          curl -X POST https://seusite.com/api/notifications/scheduled \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Opção C: Execução manual
Para testar manualmente, faça uma requisição POST:
```bash
curl -X POST https://seusite.com/api/notifications/scheduled \
  -H "Authorization: Bearer sua_chave_secreta"
```

### 3. Testar localmente
```bash
curl -X POST http://localhost:3000/api/notifications/scheduled \
  -H "Authorization: Bearer sua_chave_secreta"
```

## O que a função faz:
1. Busca todos os agendamentos com status 'accepted' para o dia seguinte
2. Envia notificação in-app para todos os administradores
3. Envia notificação push (se o admin tiver inscrito)
4. Registra no console quantas notificações foram enviadas

## Personalização:
- Altere o horário no cron para o que preferir (ex: `0 18 * * *` para 18h)
- Modifique o texto das notificações no arquivo `scheduled.js`
- Adicione mais tipos de lembretes (ex: 1 hora antes, etc.)