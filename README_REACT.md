# Meu Controle Financeiro — React + Vite

Projeto convertido de Next.js para React com Vite e React Router.

## Executar

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:3000`.

## API

Configure `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Produção

```bash
npm run build
npm run preview
```

O build fica em `dist/`. Em hospedagem estática, configure fallback de todas as rotas para `index.html`.
