import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      updatedAt="16 de julho de 2026"
    >
      <p>
        Esta Política explica como o Meu Controle Financeiro, operado pelo
        responsável inscrito no CNPJ 43.202.419/0001-39, trata dados pessoais
        conforme a Lei Geral de Proteção de Dados Pessoais — LGPD.
      </p>
      <LegalSection title="1. Dados tratados">
        <p>
          Podemos tratar nome, telefone, e-mail, CPF ou CNPJ informado no
          checkout, dados da conta e assinatura, identificadores técnicos,
          registros de acesso, mensagens, áudios, transcrições e informações
          financeiras fornecidas pelo usuário, como valores, descrições,
          categorias, datas, parcelas, metas e recorrências. Dados completos de
          cartão ou credenciais bancárias são tratados diretamente pelo provedor
          de pagamento, conforme o fluxo contratado.
        </p>
      </LegalSection>
      <LegalSection title="2. Como os dados são obtidos">
        <p>
          Os dados são fornecidos no cadastro, checkout, painel e mensagens
          enviadas ao número oficial do serviço. Também recebemos eventos
          técnicos necessários de provedores integrados, como confirmação de
          pagamento, identificação da mensagem e status de entrega.
        </p>
      </LegalSection>
      <LegalSection title="3. Finalidades">
        <p>
          Utilizamos os dados para criar e autenticar a conta; identificar o
          remetente; interpretar mensagens e áudios; registrar e organizar
          gastos; gerar relatórios, metas e alertas; administrar planos e
          cobranças; prestar suporte; prevenir fraude; manter a segurança;
          cumprir obrigações legais; e melhorar o funcionamento do serviço.
        </p>
      </LegalSection>
      <LegalSection title="4. Bases legais">
        <p>
          O tratamento pode ocorrer para executar o contrato e procedimentos
          solicitados pelo usuário, cumprir obrigações legais ou regulatórias,
          exercer direitos em processos, proteger o crédito, atender interesses
          legítimos compatíveis com os direitos do titular e, quando necessário,
          com base no consentimento.
        </p>
      </LegalSection>
      <LegalSection title="5. Compartilhamento">
        <p>
          Os dados podem ser compartilhados, no limite necessário, com
          fornecedores de WhatsApp/Meta, automação N8N, transcrição ou
          inteligência artificial, Asaas, hospedagem, banco de dados,
          monitoramento, suporte e segurança. Também poderão ser apresentados a
          autoridades quando exigido por lei ou ordem válida. Não
          comercializamos dados pessoais.
        </p>
      </LegalSection>
      <LegalSection title="6. Transferência e infraestrutura">
        <p>
          Alguns fornecedores podem processar ou armazenar dados fora do Brasil.
          Nesses casos, buscamos utilizar fornecedores que adotem medidas de
          proteção compatíveis e mecanismos admitidos pela legislação aplicável.
        </p>
      </LegalSection>
      <LegalSection title="7. Armazenamento e retenção">
        <p>
          Os dados são mantidos pelo tempo necessário para prestar o serviço e
          cumprir as finalidades descritas. Após o encerramento, alguns
          registros poderão ser conservados para cumprimento de obrigações
          legais, prevenção de fraude, auditoria e exercício regular de
          direitos. Encerrados esses prazos, os dados serão eliminados ou
          anonimizados quando tecnicamente possível.
        </p>
      </LegalSection>
      <LegalSection title="8. Segurança">
        <p>
          Adotamos medidas administrativas e técnicas proporcionais aos riscos
          para reduzir acessos não autorizados, perda, alteração ou divulgação
          indevida. Nenhum ambiente digital é totalmente imune a incidentes; por
          isso, o usuário também deve proteger sua senha, telefone e
          dispositivos.
        </p>
      </LegalSection>
      <LegalSection title="9. Cookies e sessão">
        <p>
          O painel utiliza cookies ou tecnologias equivalentes necessários para
          autenticação, segurança e manutenção da sessão. Esses recursos não
          devem ser desativados quando forem indispensáveis ao funcionamento da
          conta.
        </p>
      </LegalSection>
      <LegalSection title="10. Direitos do titular">
        <p>
          O titular pode solicitar confirmação e acesso aos dados, correção,
          informações sobre compartilhamento, portabilidade quando aplicável,
          revisão de decisões automatizadas nos casos previstos em lei,
          anonimização, bloqueio ou eliminação de dados inadequados, revogação
          do consentimento e oposição a tratamentos irregulares. Alguns pedidos
          podem exigir confirmação de identidade.
        </p>
      </LegalSection>
      <LegalSection title="11. Exclusão da conta">
        <p>
          A solicitação de exclusão pode ser enviada para
          adrielislife@yahoo.com.br. A desativação do acesso não implica
          eliminação imediata de registros que precisem ser conservados por
          obrigação legal ou para exercício regular de direitos. Quando não
          houver outra base legal para retenção, os dados serão eliminados ou
          anonimizados.
        </p>
      </LegalSection>
      <LegalSection title="12. Contato e alterações">
        <p>
          Solicitações relacionadas à privacidade podem ser enviadas para
          adrielislife@yahoo.com.br. Esta Política poderá ser atualizada para
          refletir mudanças legais, técnicas ou operacionais; a data da versão
          vigente será sempre indicada no início da página.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
