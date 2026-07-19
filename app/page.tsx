import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/logo-png-nero.png" alt="Nerofit" style={{height: 35, objectFit: 'contain'}} />
        </div>
        <nav className={styles.nav}>
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#como-funciona">Mecanismo</a>
          <a href="#resultados">Resultados</a>
          <a href="#planos">Preços</a>
        </nav>
        <div className={styles.actions}>
          <a href="/login" className={styles.btnGhost}>Entrar</a>
          <a href="/cadastro" className="btn btn-primary">Começar grátis</a>
        </div>
      </header>

      {/* HERO SECTION 2 COLUMNS */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        
        <div className={styles.heroGrid}>
          {/* TEXT SIDE */}
          <div className={styles.heroContent}>
            <h1 className="animate-fade-in">
              A forma mais inovadora de organizar sua <br/>
              <span className={styles.textHighlight}>Consultoria Online</span>
            </h1>
            <p className="animate-fade-in delay-1">
              A plataforma que gerencia tudo da sua esteira profissional: alunos, treino e dieta, e coloca sua <strong>cobrança recorrente no automático</strong>. Muito mais previsibilidade e menos caos. <br/><br/>
              <strong>Bye bye Excel, PDF e WhatsApp.</strong>
            </p>
            <div className={`${styles.ctaGroup} animate-fade-in delay-2`}>
              <a href="/cadastro" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>Começar grátis</a>
              <a href="#planos" className="btn btn-outline" style={{ padding: '16px 36px', fontSize: '1.05rem', background: 'rgba(255,255,255,0.05)', border: 'none' }}>Ver planos</a>
            </div>

            <div className={`${styles.socialProof} animate-fade-in delay-3`}>
              <div className={styles.checkMark}>✓ Grátis, sem cartão · cancele quando quiser</div>
              <div className={styles.proofBadge}>
                 <span className={styles.pulseDot}></span>
                 <strong>+300 profissionais</strong> já dominam seu tempo na Nerofit
              </div>
            </div>
          </div>

          {/* IMAGE MOCKUP (DESKTOP DASHBOARD) */}
          <div className={`${styles.heroVisuals} animate-fade-in delay-2`}>
            
            <div className={styles.desktopMockupContainer}>
               {/* Brilho Lateral do mockup */}
               <div className={styles.desktopSideGlow}></div>
               
               <div className={styles.desktopMockup}>
                 {/* Substituindo Imagem AI por layout HTML perfeito em Português */}
                 <div className={styles.mockupApp}>
                    <div className={styles.mockupSidebar}>
                       <div className={styles.mockupLogo}>
                         <img src="/logo-png-nero.png" alt="Nerofit Pro" style={{height: 25, objectFit: 'contain'}} />
                       </div>
                       <div className={styles.mockupMenu}>
                          <div className={styles.mockupMenuItem}>📊 Visão Geral</div>
                          <div className={styles.mockupMenuItem}>👥 Alunos</div>
                          <div className={styles.mockupMenuItem}>💪 Treinos</div>
                          <div className={styles.mockupMenuItem}>🍽️ Planos Alimentares</div>
                          <div className={styles.mockupMenuItem}>💰 Financeiro (Asaas)</div>
                       </div>
                    </div>
                    <div className={styles.mockupMain}>
                       <div className={styles.mockupHeader}>
                          <div className={styles.mockupSearch}>Buscar aluno, treino ou fatura...</div>
                          <div className={styles.mockupAvatar}></div>
                       </div>
                       <div className={styles.mockupCards}>
                          <div className={styles.mockupCard}>
                             <span>Vendas (Mês atual)</span>
                             <strong>R$ 14.350,00</strong>
                          </div>
                          <div className={styles.mockupCard}>
                             <span>Alunos Ativos</span>
                             <strong>142</strong>
                          </div>
                          <div className={styles.mockupCard}>
                             <span>Inadimplentes</span>
                             <strong style={{color: '#ef4444'}}>3</strong>
                          </div>
                       </div>
                       <div className={styles.mockupTableArea}>
                          <div className={styles.mockupTableTitle}>Últimos Alunos Adicionados</div>
                          <div className={styles.mockupTableRow}>
                            <span style={{fontWeight: 600, color: 'white'}}>Thiago Vilchez</span> 
                            <span style={{color: '#a1a1aa'}}>Plano Semestral VIP</span> 
                            <span className={styles.tagGreen}>Ativo</span>
                          </div>
                          <div className={styles.mockupTableRow}>
                            <span style={{fontWeight: 600, color: 'white'}}>Ana Silva</span> 
                            <span style={{color: '#a1a1aa'}}>Consultoria de Treino Mensal</span> 
                            <span className={styles.tagGreen}>Ativo</span>
                          </div>
                          <div className={styles.mockupTableRow}>
                            <span style={{fontWeight: 600, color: 'white'}}>Carlos Eduardo</span> 
                            <span style={{color: '#a1a1aa'}}>Acompanhamento Nutricional</span> 
                            <span className={styles.tagRed}>Pagamento Pendente</span>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Emojis / Tags Flutuantes Subindo (como o usuário pediu) */}
               <div className={`${styles.floatingEmoji} ${styles.emojiMoney1}`}>💰 <span className={styles.emojiText}>Lucro subindo</span></div>
               <div className={`${styles.floatingEmoji} ${styles.emojiSpreadsheet}`}>📉 <span className={styles.emojiText}>Fim das planilhas de Excel</span></div>
               <div className={`${styles.floatingEmoji} ${styles.emojiMoney2}`}>💲 <span className={styles.emojiText}>Pix Automático</span></div>
               <div className={`${styles.floatingEmoji} ${styles.emojiFire}`}>🔥</div>
               <div className={`${styles.floatingEmoji} ${styles.emojiGraph}`}>📈</div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className={styles.sectionDark}>
        <div className={styles.sectionHeader}>
          <div className={styles.premiumBadge}>Conexão & Sincronia</div>
          <h2>A plataforma <span className={styles.gradientText}>completa</span> para a sua consultoria</h2>
          <p>Treino, Dieta e Financeiro conversando perfeitamente. Tudo o que você precisava em dezenas de apps, centralizado de forma automática.</p>
        </div>
        <div className={styles.gridFeatures}>
          <div className={styles.featureCard}>
             <span className={styles.featureIcon}>🏋️</span>
             <h3>Prescrição de Treinos</h3>
             <p>Monte treinos com controle completo de carga, séries, intervalos e até vídeos demonstrativos de biomecânica. O envio é instantâneo para o aluno.</p>
          </div>
          <div className={styles.featureCard}>
             <span className={styles.featureIcon}>🍎</span>
             <h3>Dieta e Macros</h3>
             <p>Crie planos alimentares com cálculo automático de calorias e distribuição refinada de macronutrientes do sistema de banco alimentar.</p>
          </div>
          <div className={styles.featureCard}>
             <span className={styles.featureIcon}>💳</span>
             <h3>Cobrança Automática</h3>
             <p>Vincule assinaturas recorrentes via cartão de crédito ou PIX, controle a inadimplência e receba no seu bolso sem desgaste cobrando pelo WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* MECANISMO / COMO FUNCIONA */}
      <section id="como-funciona" className={styles.sectionLight}>
         <div className={styles.sectionHeader}>
          <h2>Substitua a dezena de apps pela Nerofit Pro</h2>
          <p>Seus alunos terão uma experiência fluida. Você terá paz mental.</p>
        </div>
        <div className={styles.timeline}>
           <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>1</div>
              <div>
                 <h3>O Aluno Assina o Plano</h3>
                 <p>Você envia um link único de pagamento gerado aqui. A assinatura cai automática, com zero conciliação manual bancária.</p>
              </div>
           </div>
           <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>2</div>
              <div>
                 <h3>Ficha Anamnese Dinâmica</h3>
                 <p>O sistema notifica o aluno para enviar histórico médico, percentual de lesões e objetivo primário diretamente após a compra.</p>
              </div>
           </div>
           <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>3</div>
              <div>
                 <h3>Acompanhamento Escalonável</h3>
                 <p>Com um clique você acompanha métricas da bioimpedância e atualiza os protocolos sem abrir nenhuma pasta do Google Drive.</p>
              </div>
           </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="planos" className={styles.sectionDark}>
        <div className={styles.sectionHeader}>
          <h2>Previsibilidade para o seu negócio</h2>
          <p>Assuma o controle total do seu faturamento. Assine agora mesmo.</p>
        </div>
        <div className={styles.pricingCards}>
           <div className={styles.priceCard}>
              <h3>Plano <span style={{color: 'var(--primary)'}}>Pro</span></h3>
              <p>O ideal para o personal focado em escalar a operação e abandonar as planilhas.</p>
              <div className={styles.priceValue}><span>R$</span> 89<span>/mês</span></div>
              <ul className={styles.priceFeatures}>
                 <li>✓ Prescrição de treinos ilimitada</li>
                 <li>✓ Módulo de Dashboard Financeiro</li>
                 <li>✓ Fichas de Anamnese dinâmicas</li>
                 <li>✓ Limite de 50 alunos ativos simultâneos</li>
              </ul>
              <a href="/cadastro?plano=pro" className="btn btn-outline" style={{width: '100%', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: 'none'}}>Escolher Pro</a>
           </div>

           <div className={`${styles.priceCard} ${styles.priceCardHighlighted}`}>
              <div className={styles.priceBadge}>Mais Profissional</div>
              <h3>Plano <span style={{color: 'var(--secondary)'}}>Elite</span></h3>
              <p>Ferramenta definitiva para a organização ponta a ponta e automação pesada.</p>
              <div className={styles.priceValue}><span>R$</span> 169<span>/mês</span></div>
              <ul className={styles.priceFeatures}>
                 <li>✓ Tudo do Pro, <strong>sem limites</strong> de alunos</li>
                 <li>✓ Dashboard Financeiro Avançado (ROI / CHURN)</li>
                 <li>✓ Cobranças Diretas (Cartão/PIX recorrente)</li>
                 <li>✓ Gestão Nutricional (Distribuidor de Macros)</li>
              </ul>
              <a href="/cadastro?plano=elite" className="btn btn-primary" style={{width: '100%', marginTop: 'auto'}}>Começar Elite</a>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
         <div className={styles.logo} style={{marginBottom: 10, justifyContent: 'center'}}>
           <img src="/logo-png-nero.png" alt="Nerofit Pro" style={{height: 45, objectFit: 'contain'}} />
         </div>
         <p>© {new Date().getFullYear()} Nerofit SaaS para Profissionais da Saúde. Todos os direitos reservados.</p>
      </footer>

    </main>
  );
}
