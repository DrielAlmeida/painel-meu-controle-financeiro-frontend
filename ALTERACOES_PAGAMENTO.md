# Alterações aplicadas

- Integração do checkout com o FastAPI e Asaas.
- Fluxo: cadastro do usuário -> criação/localização do cliente no Asaas -> criação da assinatura -> redirecionamento para `invoice_url`.
- Novo serviço `services/pagamentos.ts`.
- Checkout atualizado com CPF/CNPJ, aceite de termos e privacidade e mensagens de progresso.
- Painel de incidentes da visão geral reduzido para um card compacto.
- A página de desempenho continua exibindo a versão completa do painel de incidentes.

## Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Execução

```bash
npm install
npm run dev
```
