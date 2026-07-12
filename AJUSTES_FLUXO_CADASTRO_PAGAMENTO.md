# Ajustes do fluxo de cadastro e pagamento

- O checkout agora envia somente `plano_id` para a API.
- Planos gratuitos não criam cliente/cobrança no Asaas.
- Se o cadastro retornar 409 porque a conta já existe, o frontend tenta login com o telefone e a senha informados e continua o pagamento.
- O progresso do checkout é salvo no navegador sem armazenar senha.
- Se ocorrer erro depois da criação da conta, um aviso aparece dentro do painel com o botão **Concluir pagamento**.
- Ao clicar em **Concluir pagamento**, o checkout recupera os dados, gera a assinatura/fatura e abre automaticamente o link do Asaas.
- Se já existir uma assinatura pendente com `invoice_url`, o frontend abre a fatura existente em vez de criar outra.
- Se a assinatura já estiver ativa, o usuário é direcionado para a visão geral.
- Erros de plano inativo, plano removido, sessão expirada e falha do Asaas mantêm o cadastro pendente para nova tentativa.

## Observação

O navegador salva apenas: plano, nome, telefone, e-mail e CPF/CNPJ. A senha não é salva.
