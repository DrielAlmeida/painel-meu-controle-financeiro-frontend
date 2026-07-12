# Endpoints necessários para planos dinâmicos e faturas

O frontend foi preparado para usar planos cadastrados no painel administrativo, períodos grátis, duração em meses e renovação.

## 1. Planos públicos

`GET /api/v1/planos/publicos`

Resposta esperada:

```json
[
  {
    "id": 1,
    "codigo": "basico",
    "nome": "Plano Básico",
    "descricao": "Plano mensal",
    "valor_mensal": "29.90",
    "valor_anual": null,
    "duracao_meses": 1,
    "dias_gratis": 7,
    "destaque": true,
    "ativo": true,
    "permite_whatsapp": true,
    "permite_relatorios": true,
    "permite_investimentos": false,
    "permite_exportacao": false
  }
]
```

## 2. Minha assinatura

`GET /api/v1/pagamentos/minha-assinatura`

Resposta esperada:

```json
{
  "assinatura_id": 10,
  "plano_id": 1,
  "plano_nome": "Plano Básico",
  "status": "ativa",
  "valor": 29.9,
  "data_inicio": "2026-07-12",
  "data_vencimento": "2026-07-19",
  "dias_restantes": 2,
  "invoice_url": null,
  "renovacao_automatica": true
}
```

## 3. Renovação

`POST /api/v1/pagamentos/renovar`

Corpo:

```json
{ "plano_id": 1 }
```

Resposta:

```json
{ "invoice_url": "https://sandbox.asaas.com/i/..." }
```

## 4. Campos adicionais em planos

A tabela e os schemas de planos precisam aceitar:

- `codigo`: identificador técnico único;
- `duracao_meses`: 1, 3, 6, 12 etc.;
- `dias_gratis`: 0 ou quantidade de dias de teste;
- `destaque`: define o card destacado na landing page.

## 5. Criação de assinatura

O endpoint de criação deve aceitar `plano_id` e não ficar limitado somente a `basico` e `premium`. O preço, duração e dias grátis devem vir do banco, nunca do frontend.
