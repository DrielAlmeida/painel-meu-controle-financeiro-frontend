# Meu Controle Financeiro — Front-end integrado

Front-end Next.js integrado à API FastAPI por cookie HttpOnly.

## Requisitos

- Node.js 20 ou 22
- API FastAPI rodando em `http://localhost:8000`
- No `.env` da API: `FRONTEND_URL=http://localhost:3000` e `COOKIE_SECURE=false` durante o desenvolvimento local

## Variável do front

O arquivo `.env.local` já foi criado:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Em produção, troque somente pelo endereço HTTPS público da API, por exemplo:

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

O front-end não precisa e não deve receber `DATABASE_URL`, `AUTH_SECRET`, senha do banco ou token da Meta.

## Instalação

```bat
cd C:\RPA_PYTHON\painel-financeiro-front
npm install --no-audit --no-fund
npm run dev
```

Abra `http://localhost:3000/login`.

## Ordem para iniciar localmente

Terminal 1 — API:

```bat
cd C:\RPA_PYTHON\painel-financeiro-api
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 — Front:

```bat
cd C:\RPA_PYTHON\painel-financeiro-front
npm run dev
```

## Telas conectadas

- Login e logout
- Cadastro de senha
- Sessão `/auth/me`
- Visão geral
- Desempenho e incidentes
- Configuração financeira
- Listagem, criação, exclusão lógica e restauração de gastos
- Gastos recorrentes (listar e pausar/reativar)
- Metas (listar)
- Notificações (listar e marcar como lida)
- Perfil em modo leitura

## Endpoints ainda necessários para concluir todas as ações

Alguns botões permanecem apenas visuais porque a API ainda não possui rotas correspondentes:

- atualizar nome, telefone, e-mail e foto do perfil;
- recuperação e redefinição de senha;
- gráficos e relatórios agregados;
- criação/edição completa de metas pelo front;
- criação de gasto recorrente e “gerar agora”;
- exportação CSV, Excel e PDF.

## Cadastro

O telefone precisa existir previamente na tabela `usuarios` e estar autorizado. Após cadastrar a senha, o usuário é direcionado para o login.

## Atualização funcional

Esta versão inclui:

- Cadastro de metas financeiras pelo painel.
- Inclusão de valores acumulados nas metas.
- Cadastro, pausa, reativação e exclusão lógica de gastos recorrentes.
- Filtros de gastos por data, categoria e descrição.
- Total, quantidade de dias e média diária no período selecionado.
- Relatórios com filtros por período e categoria.
- Gráficos em colunas para gastos diários, categorias, seis meses e comparação mensal.
- Exportação funcional para CSV, Excel (.xls) e PDF via impressão do navegador.
- Comparativo entre mês atual e mês anterior.
- Inclusão da economia mensal na reserva de emergência.
- Status de atenção no painel de incidentes a partir de 70% da meta.

### Configuração

O arquivo `.env.local` deve conter somente o endereço público da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Credenciais de banco, `AUTH_SECRET`, tokens da Meta e outras chaves privadas devem permanecer apenas no `.env` da API FastAPI.

## Patrimônio, reservas e investimentos

A rota `/patrimonio` permite cadastrar fundos, reservas e investimentos, registrar aportes, retiradas, rendimentos e ajustes, além de visualizar a distribuição em gráfico de colunas.

Nesta versão, esses dados são persistidos no `localStorage` do navegador. Para sincronização entre dispositivos, implemente futuramente na API FastAPI:

- `GET/POST /api/v1/ativos-financeiros`
- `PATCH/DELETE /api/v1/ativos-financeiros/{id}`
- `GET/POST /api/v1/movimentacoes-financeiras`

## Regra inteligente de incidentes

A classificação do front está em `lib/incident-rules.ts`. Compras planejadas, recorrentes e essenciais de baixo valor não contam como incidente. Os limites podem ser ajustados nesse arquivo.

## Cor dos gráficos

As cores das colunas ficam em `components/charts/column-chart.tsx`, na constante `SERIES_COLORS`.

## Painel administrativo

Usuários com `administrador=true` enxergam as rotas:

- `/admin`
- `/admin/usuarios`
- `/admin/planos`
- `/admin/assinaturas`

O front consome os endpoints administrativos em `/api/v1/admin/*`.

## Landing page e checkout Asaas

A rota pública `/` é a landing page. O botão Entrar leva a `/login` e os botões de assinatura levam a `/checkout?plano=basico` ou `/checkout?plano=premium`.

O checkout envia os dados para:

```text
POST /api/v1/pagamentos/asaas/checkout
```

Resposta esperada:

```json
{
  "checkout_url": "https://asaas.com/checkout/...",
  "checkout_id": "...",
  "usuario_id": 123
}
```

Nunca coloque a chave da API Asaas no front-end. O backend deve criar o cliente/checkout e devolver somente a URL hospedada.
