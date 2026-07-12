import Image from "@/components/app-image";
import Link from "@/components/router-link";
import { useEffect, useMemo, useState } from "react";
import "./landing.css";
import { publicPlansService, codigoDoPlano, type PlanoPublico } from "@/services/public-plans-service";

type ChatMessage = {
  who: "in" | "out";
  time: string;
  html?: string;
  audio?: boolean;
};

const chatScript: ChatMessage[] = [
  { who: "in", audio: true, time: "10:37" },
  {
    who: "out",
    time: "10:37",
    html: `
      <b>✅ Gasto registrado com sucesso!</b>
      <div class="cat-line">💰 Valor: R$ 17,46</div>
      <div class="cat-line">📝 Descrição: farmácia</div>
      <div class="cat-line">📂 Categoria: saude</div>
      <div class="cat-line">📅 Data: 08/07/2026</div>
    `,
  },
  { who: "in", time: "11:14", html: "Excluir" },
  {
    who: "out",
    time: "11:14",
    html: `<span class="badge-warn">⚠ Confirma a exclusão deste gasto?</span>`,
  },
  {
    who: "out",
    time: "11:15",
    html: `
      <b>🗑️ Gasto excluído com sucesso!</b>
      <div class="cat-line">🆔 ID: 39</div>
      <div class="cat-line">📝 cadernos</div>
      <div class="cat-line">📂 compras</div>
      <div class="cat-line">💰 R$ 30,00</div>
      <div class="cat-line">📅 08/07/2026</div>
    `,
  },
  { who: "in", time: "12:18", html: "Meus gastos essa semana" },
  {
    who: "out",
    time: "12:18",
    html: `
      <b>📋 Relatório detalhado — esta semana</b>
      <div style="color:#8ea3ab;font-size:11.5px;margin:3px 0 8px;">📄 Parte 1 de 1</div>
      <div style="margin-bottom:4px;"><b>Resumo por categoria:</b></div>
      <div class="cat-line">• Saude: R$ 17,46</div>
      <div class="cat-line">• Outros: R$ 16,50</div>
      <div class="cat-line">• Alimentação: R$ 5,45</div>
      <div style="margin:8px 0 4px;"><b>Lançamentos:</b></div>
      <div class="cat-line">1. 📅 10/07/2026 · 📝 pão · 📂 Alimentação · 💰 R$ 5,45</div>
      <div class="cat-line">2. 📅 10/07/2026 · 📝 material de construcao · 📂 Outros · 💰 R$ 16,50</div>
      <div class="cat-line">3. 📅 08/07/2026 · 📝 farmácia · 📂 Saude · 💰 R$ 17,46</div>
      <div style="margin-top:8px;">💰 <b>Total geral: R$ 39,41</b></div>
    `,
  },
  { who: "in", time: "12:40", html: "Gastei 30 com cadernos" },
  {
    who: "out",
    time: "12:40",
    html: `
      <b>✅ Gasto registrado com sucesso!</b>
      <div class="cat-line">🆔 ID: 39</div>
      <div class="cat-line">💰 Valor: R$ 30,00</div>
      <div class="cat-line">📝 Descrição: cadernos</div>
      <div class="cat-line">📂 Categoria: compras</div>
      <div class="cat-line">📅 Data: 08/07/2026</div>
    `,
  },
];

const faqItems = [
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não. Tudo acontece pelo WhatsApp que você já usa, sem instalar nada novo.",
  },
  {
    question: "Como a IA entende meus áudios?",
    answer:
      'Você fala naturalmente, por exemplo “gastei 20 reais com carne”, e a IA transcreve, identifica valor, descrição e categoria.',
  },
  {
    question: "Posso corrigir ou excluir um gasto lançado errado?",
    answer:
      'Sim. Envie “excluir”, confirme e o lançamento é removido do histórico e do painel.',
  },
  {
    question: "O que é um incidente leve?",
    answer:
      "É um aviso educado quando uma compra foge do planejamento. O sistema chama sua atenção antes que o gasto se torne um problema.",
  },
  {
    question: "Meus dados financeiros ficam seguros?",
    answer:
      "Sim. Suas conversas e lançamentos ficam vinculados somente à sua conta.",
  },
];


const dashboardSlides = [
  {
    id: 1,
    title: "Desempenho financeiro",
    description:
      "Acompanhe compras normais, incidentes, risco atual e todas as movimentações analisadas.",
    image: "/images/painel/desempenho.png",
  },
  {
    id: 2,
    title: "Controle completo de gastos",
    description:
      "Filtre despesas por período, categoria e descrição, além de visualizar todos os lançamentos.",
    image: "/images/painel/gastos.png",
  },
  {
    id: 3,
    title: "Reservas e investimentos",
    description:
      "Acompanhe patrimônio, reservas financeiras, investimentos e resultados acumulados.",
    image: "/images/painel/investimentos.png",
  },
  {
    id: 4,
    title: "Relatórios avançados",
    description:
      "Analise gastos por dia, categorias, evolução mensal e exporte em CSV, Excel ou PDF.",
    image: "/images/painel/relatorios.png",
  },
];

export default function HomePage() {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dashboardIndex, setDashboardIndex] = useState(0);
  const [planos, setPlanos] = useState<PlanoPublico[]>([]);
  const [planosCarregando, setPlanosCarregando] = useState(true);

  const bars = useMemo(() => [30, 72, 45, 88, 20, 35], []);

  useEffect(() => {
    publicPlansService.listar()
      .then((items) => setPlanos(items.filter((item) => item.ativo)))
      .catch(() => setPlanos([]))
      .finally(() => setPlanosCarregando(false));
  }, []);

  useEffect(() => {
    const current = chatScript[messageIndex % chatScript.length];

    if (current.who === "out") {
      setTyping(true);
      const typingTimer = window.setTimeout(() => {
        setTyping(false);
        setVisibleMessages((messages) => [...messages, current].slice(-5));
        setMessageIndex((index) => index + 1);
      }, 2200);

      return () => window.clearTimeout(typingTimer);
    }

    const timer = window.setTimeout(() => {
      setVisibleMessages((messages) => [...messages, current].slice(-5));
      setMessageIndex((index) => index + 1);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [messageIndex]);


  useEffect(() => {
    const interval = window.setInterval(() => {
      setDashboardIndex((current) =>
        current === dashboardSlides.length - 1 ? 0 : current + 1,
      );
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  function nextDashboardSlide() {
    setDashboardIndex((current) =>
      current === dashboardSlides.length - 1 ? 0 : current + 1,
    );
  }

  function previousDashboardSlide() {
    setDashboardIndex((current) =>
      current === 0 ? dashboardSlides.length - 1 : current - 1,
    );
  }

  return (
    <>
      <main className="landing-page">
        <nav>
          <div className="nav-inner">
            <Link href="/" className="brand">
              <div className="brand-mark">MC</div>
              Meu Controle
            </Link>

            <div className="nav-links">
              <a href="#como-funciona">Como funciona</a>
              <a href="#painel">Painel</a>
              <a href="#recursos">Recursos</a>
              <a href="#planos">Planos</a>
              <a href="#faq">Perguntas</a>
            </div>

            <div className="nav-actions">
              <Link href="/login" className="nav-login">
                Entrar
              </Link>
              <Link href="/checkout?plano=basico" className="nav-cta">
                <span className="nav-cta-desktop">Começar agora</span>
                <span className="nav-cta-mobile">Começar</span>
              </Link>
            </div>
          </div>
        </nav>

        <header className="hero wrap">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">
                <span className="dot" />
                Conectado ao seu WhatsApp agora
              </span>

              <h1>
                Seus gastos, registrados{" "}
                <span className="accent">só de mandar um áudio.</span>
              </h1>

              <p className="sub">
                Mande um áudio ou texto pelo WhatsApp e a IA registra,
                categoriza, organiza e avisa quando algum gasto sai do
                planejamento.
              </p>

              <div className="hero-ctas">
                <Link href="/checkout?plano=basico" className="btn-primary">
                  Conectar meu WhatsApp →
                </Link>
                <a href="#painel" className="btn-secondary">
                  Ver o painel completo
                </a>
              </div>

              <div className="hero-note">
                Sem fidelidade · Cancele quando quiser
              </div>

              <div className="hero-stats">
                <div>
                  <div className="stat-num mono">R$ 39,41</div>
                  <div className="stat-label">Registrado nesta semana</div>
                </div>
                <div>
                  <div className="stat-num mono">2</div>
                  <div className="stat-label">Alertas no mês</div>
                </div>
                <div>
                  <div className="stat-num mono">20s</div>
                  <div className="stat-label">Do áudio ao lançamento</div>
                </div>
              </div>
            </div>

            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="wa-header">
                <div className="wa-avatar">C</div>
                <div>
                  <div className="wa-title">Controle de Gastos</div>
                  <div className="wa-sub">Conta comercial</div>
                </div>
              </div>

              <div className="wa-body">
                {visibleMessages.map((message, index) =>
                  message.audio ? (
                    <div
                      key={`${messageIndex}-${index}`}
                      className="bubble out audio-bubble"
                    >
                      <span>▶</span>
                      <span className="audio-wave">
                        {Array.from({ length: 14 }).map((_, item) => (
                          <span
                            key={item}
                            style={{ height: `${6 + ((item * 7) % 10)}px` }}
                          />
                        ))}
                      </span>
                      <span className="time">0:03 {message.time}</span>
                    </div>
                  ) : (
                    <div
                      key={`${messageIndex}-${index}`}
                      className={`bubble ${message.who}`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: message.html ?? "",
                        }}
                      />
                      <span className="time">{message.time}</span>
                    </div>
                  ),
                )}

                {typing && (
                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>

              <div className="wa-inputbar">
                <div className="field">Mensagem</div>
                <div className="wa-mic">🎤</div>
              </div>
            </div>
          </div>
        </header>

        <section id="como-funciona" className="wrap">
          <div className="section-head">
            <span className="eyebrow">
              <span className="dot" />3 passos. Pronto.
            </span>
            <h2>Do áudio ao painel financeiro</h2>
            <p>
              Tudo que separa você de saber exatamente para onde vai seu
              dinheiro é uma mensagem de WhatsApp.
            </p>
          </div>

          <div className="steps">
            {[
              [
                "Passo 1",
                "Mande texto ou áudio",
                '“Gastei 17,46 na farmácia” — fale ou escreva do jeito mais rápido.',
              ],
              [
                "Passo 2",
                "A IA registra e categoriza",
                "Valor, descrição, categoria e data são identificados automaticamente.",
              ],
              [
                "Passo 3",
                "Acompanhe no painel",
                "Veja gastos, metas, relatórios, recorrentes e alertas em um só lugar.",
              ],
            ].map(([number, title, description]) => (
              <div className="step-card" key={number}>
                <div className="step-num">{number}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="painel" className="dashboard-section">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">
                <span className="dot" />
                Sistema completo
              </span>

              <h2>Veja tudo o que você controla no painel</h2>

              <p>
                Cada gasto enviado pelo WhatsApp aparece automaticamente em um
                painel completo, organizado e fácil de entender.
              </p>
            </div>

            <div className="dashboard-carousel">
              <div className="carousel-glow" />

              <div className="carousel-info">
                <span className="carousel-counter">
                  {String(dashboardIndex + 1).padStart(2, "0")} /{" "}
                  {String(dashboardSlides.length).padStart(2, "0")}
                </span>

                <h3>{dashboardSlides[dashboardIndex].title}</h3>

                <p>{dashboardSlides[dashboardIndex].description}</p>

                <div className="carousel-buttons">
                  <button
                    type="button"
                    onClick={previousDashboardSlide}
                    aria-label="Tela anterior"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={nextDashboardSlide}
                    aria-label="Próxima tela"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="carousel-screen">
                <div className="browser-topbar">
                  <div className="browser-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="browser-address">
                    painel.meucontrole.com.br
                  </div>
                </div>

                <div className="carousel-image-wrapper">
                  <Image
                    key={dashboardSlides[dashboardIndex].image}
                    src={dashboardSlides[dashboardIndex].image}
                    alt={dashboardSlides[dashboardIndex].title}
                    width={1680}
                    height={900}
                    className="carousel-image"
                    priority={dashboardIndex === 0}
                    sizes="(max-width: 1100px) 100vw, 960px"
                  />
                </div>
              </div>
            </div>

            <div className="carousel-dots">
              {dashboardSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={dashboardIndex === index ? "active" : ""}
                  onClick={() => setDashboardIndex(index)}
                  aria-label={`Abrir ${slide.title}`}
                />
              ))}
            </div>

            <div className="dashboard-features">
              <div>
                <span>📊</span>
                <strong>Gráficos completos</strong>
                <p>Veja onde seu dinheiro está sendo utilizado.</p>
              </div>

              <div>
                <span>🎯</span>
                <strong>Metas e alertas</strong>
                <p>Receba avisos antes de ultrapassar seu planejamento.</p>
              </div>

              <div>
                <span>💰</span>
                <strong>Patrimônio e reservas</strong>
                <p>Acompanhe investimentos e evolução financeira.</p>
              </div>

              <div>
                <span>📄</span>
                <strong>Relatórios exportáveis</strong>
                <p>Exporte suas informações para CSV, Excel ou PDF.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="wrap">
          <div className="section-head">
            <span className="eyebrow">
              <span className="dot" />
              Tudo incluso
            </span>
            <h2>A IA cuida da planilha. Você cuida do dinheiro.</h2>
            <p>Recursos para quem quer controle sem trabalho manual.</p>
          </div>

          <div className="feat-grid">
            {[
              ["🎙️", "Entende texto e áudio", "A IA extrai valor, descrição e categoria da mensagem."],
              ["🗂️", "Categorização automática", "Cada gasto vai para a categoria certa."],
              ["🛡️", "Detecção de incidentes", "Compras fora do planejamento são sinalizadas cedo."],
              ["📊", "Relatórios no WhatsApp", "Peça seus gastos da semana e receba tudo no chat."],
              ["↩️", "Editar e excluir", "Corrija ou exclua lançamentos por comando."],
              ["🎯", "Metas e recorrentes", "Controle metas, assinaturas e compras parceladas."],
            ].map(([icon, title, description]) => (
              <div className="feat-card" key={title}>
                <div className="feat-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="wrap">
          <div className="section-head">
            <span className="eyebrow"><span className="dot" />Planos flexíveis</span>
            <h2>Escolha o período que combina com você</h2>
            <p>Planos cadastrados no painel administrativo aparecem aqui automaticamente.</p>
          </div>

          {planosCarregando ? (
            <div className="plans-loading">Carregando planos...</div>
          ) : planos.length === 0 ? (
            <div className="plans-loading">Nenhum plano público disponível no momento.</div>
          ) : (
            <div className="price-grid dynamic-plans">
              {planos.map((plano, index) => {
                const codigo = codigoDoPlano(plano);
                const meses = plano.duracao_meses ?? 1;
                const periodo = meses === 12 ? "por ano" : meses > 1 ? `por ${meses} meses` : "por mês";
                const valor = Number(plano.valor_mensal || 0);
                const recursos = [
                  plano.permite_whatsapp && "Controle pelo WhatsApp",
                  plano.permite_relatorios && "Relatórios financeiros",
                  plano.permite_investimentos && "Reservas e investimentos",
                  plano.permite_exportacao && "Exportação de dados",
                ].filter(Boolean) as string[];

                return (
                  <div className={`price-card ${(plano.destaque || index === 1) ? "featured" : ""}`} key={plano.id}>
                    {(plano.destaque || index === 1) && <div className="price-badge">Mais escolhido</div>}
                    <h3>{plano.nome}</h3>
                    <div className="desc">{plano.descricao || "Controle financeiro completo e simples."}</div>
                    {Number(plano.dias_gratis || 0) > 0 && <div className="trial-badge">{plano.dias_gratis} dias grátis</div>}
                    <div className="price-val"><span className="num mono">{valor === 0 ? "Grátis" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span><span className="per">/{periodo}</span></div>
                    <ul className="price-list">
                      {recursos.map((item) => <li key={item}><span className="check">✓</span>{item}</li>)}
                      {meses > 1 && <li><span className="check">✓</span>Acesso por {meses} meses</li>}
                    </ul>
                    <Link href={`/checkout?plano=${encodeURIComponent(codigo)}&plano_id=${plano.id}`} className="price-cta">{Number(plano.dias_gratis || 0) > 0 ? "Começar período grátis" : `Assinar ${plano.nome}`}</Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section id="faq" className="wrap">
          <div className="section-head">
            <span className="eyebrow">
              <span className="dot" />
              Dúvidas
            </span>
            <h2>Perguntas frequentes</h2>
          </div>

          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                key={item.question}
              >
                <button
                  type="button"
                  className="faq-q"
                  onClick={() =>
                    setOpenFaq((current) => (current === index ? null : index))
                  }
                >
                  <span>{item.question}</span>
                  <span className="plus">+</span>
                </button>
                <div className="faq-a">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap">
          <div className="final-cta">
            <h2>Pare de anotar gasto no caderno.</h2>
            <p>
              Em poucos segundos seu primeiro gasto já aparece no painel.
            </p>
            <Link href="/checkout?plano=basico" className="btn-primary">
              Conectar meu WhatsApp →
            </Link>
          </div>
        </section>

        <footer className="wrap">
          <div className="footer-inner">
            <div className="brand footer-brand">Meu Controle</div>
            <div>
              © 2026 Meu Controle · feito para quem cansou de anotar gasto na mão
            </div>
          </div>
        </footer>
      </main>


    </>
  );
}