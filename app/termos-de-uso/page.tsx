import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";

export default function TermosDeUsoPage() {
  return (
    <LegalPageLayout title="Termos de Uso" updatedAt="16 de julho de 2026">
      <p>
        Estes Termos regulam o uso do Meu Controle Financeiro, serviço operado
        pelo responsável inscrito no CNPJ 43.202.419/0001-39. Ao criar uma conta
        ou utilizar o serviço, o usuário declara que leu e concorda com estas
        condições.
      </p>
      <LegalSection title="1. Funcionamento do serviço">
        <p>
          O serviço permite registrar, organizar e consultar informações
          financeiras enviadas pelo WhatsApp ou inseridas no painel, incluindo
          gastos, categorias, parcelas, recorrências, metas, alertas e
          relatórios. Mensagens de texto e áudio podem ser processadas
          automaticamente para identificar as informações do lançamento.
        </p>
      </LegalSection>
      <LegalSection title="2. Cadastro e segurança">
        <p>
          O usuário deve fornecer informações verdadeiras, manter seu telefone e
          senha protegidos e comunicar imediatamente qualquer uso não
          autorizado. Cada lançamento é associado ao telefone remetente
          cadastrado. É proibido utilizar conta de terceiros ou tentar acessar
          dados de outros usuários.
        </p>
      </LegalSection>
      <LegalSection title="3. Responsabilidade pelas informações">
        <p>
          O usuário é responsável por conferir valores, datas, categorias e
          demais dados interpretados pelo sistema. Automações podem cometer
          erros, especialmente em mensagens ou áudios ambíguos. O painel oferece
          apoio à organização pessoal e não substitui contabilidade, consultoria
          financeira, jurídica, fiscal ou de investimentos.
        </p>
      </LegalSection>
      <LegalSection title="4. Planos e pagamentos">
        <p>
          Preços, duração, benefícios e eventual período gratuito são
          apresentados antes da contratação. Cobranças são processadas pelo
          provedor de pagamento indicado no checkout. A falta de pagamento
          poderá limitar ou suspender recursos, observadas as informações
          apresentadas na contratação e a legislação aplicável.
        </p>
      </LegalSection>
      <LegalSection title="5. Cancelamento e direito de arrependimento">
        <p>
          O usuário poderá solicitar o cancelamento pelo e-mail
          adrielislife@yahoo.com.br. Nas contratações realizadas pela internet,
          poderá exercer o direito de arrependimento em até 7 (sete) dias
          corridos contados da contratação, com restituição dos valores pagos,
          quando aplicável. Depois desse prazo, o cancelamento impedirá novas
          renovações, mas não gera automaticamente reembolso do período já
          iniciado, salvo previsão legal ou oferta específica mais favorável.
        </p>
      </LegalSection>
      <LegalSection title="6. Uso permitido">
        <p>
          É proibido utilizar o serviço para fraude, violação de direitos, envio
          de conteúdo ilícito, tentativa de invasão, exploração de falhas,
          sobrecarga da infraestrutura ou qualquer finalidade contrária à
          legislação brasileira.
        </p>
      </LegalSection>
      <LegalSection title="7. Serviços de terceiros">
        <p>
          O funcionamento pode depender de serviços de terceiros, como
          WhatsApp/Meta, automação N8N, Asaas, hospedagem, banco de dados e
          processamento de áudio. Indisponibilidades ou mudanças nesses serviços
          podem afetar temporariamente algumas funcionalidades.
        </p>
      </LegalSection>
      <LegalSection title="8. Disponibilidade e alterações">
        <p>
          Buscamos manter o serviço disponível e seguro, mas não garantimos
          funcionamento ininterrupto. Funcionalidades poderão ser corrigidas,
          atualizadas ou descontinuadas. Alterações relevantes nestes Termos
          serão informadas no serviço ou pelos canais de contato disponíveis.
        </p>
      </LegalSection>
      <LegalSection title="9. Suspensão e encerramento">
        <p>
          A conta poderá ser suspensa em caso de inadimplência, fraude, risco de
          segurança ou descumprimento destes Termos. O usuário pode solicitar o
          encerramento da conta, sem prejuízo da conservação de registros
          necessária ao cumprimento de obrigações legais, regulatórias ou ao
          exercício regular de direitos.
        </p>
      </LegalSection>
      <LegalSection title="10. Propriedade intelectual">
        <p>
          A marca, interface, textos, código, identidade visual e demais
          elementos do serviço são protegidos pela legislação aplicável. A
          contratação concede apenas uma licença limitada, pessoal e não
          transferível para utilização do serviço.
        </p>
      </LegalSection>
      <LegalSection title="11. Limitação de responsabilidade">
        <p>
          O serviço não se responsabiliza por decisões financeiras tomadas
          exclusivamente com base nos relatórios, por dados incorretos enviados
          pelo usuário, nem por falhas externas fora de seu controle razoável.
          Nada nestes Termos exclui direitos assegurados ao consumidor pela
          legislação brasileira.
        </p>
      </LegalSection>
      <LegalSection title="12. Legislação e contato">
        <p>
          Aplicam-se as leis brasileiras, especialmente o Código de Defesa do
          Consumidor quando houver relação de consumo. Dúvidas, cancelamentos e
          solicitações podem ser enviados para adrielislife@yahoo.com.br.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
