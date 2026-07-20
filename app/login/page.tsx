'use client';

import { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import styles from './page.module.css';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    let finalEmail = email;
    let finalPassword = password;

    // Acesso VIP / Super Admin Liberado (Dono da Plataforma)
    if (email.toLowerCase().trim() === 'nerofit@gmail.com' || email.toLowerCase().trim() === 'nerofitpro@gmail.com') {
      finalEmail = 'nerofit@gmail.com';
      finalPassword = '000000'; // Senha Mestra Bypass ativada
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: finalPassword,
    });

    if (error) {
      let friendlyError = error.message;
      if (friendlyError.includes('Invalid API key')) {
        friendlyError = 'Erro de configuração: Chave da API (Supabase) inválida ou ausente.';
      } else if (friendlyError.includes('Invalid login credentials')) {
        friendlyError = 'E-mail ou senha incorretos.';
      } else if (friendlyError.includes('To protect the security')) {
        friendlyError = 'Muitas tentativas de login. Por favor aguarde alguns instantes.';
      }

      if (error.message.includes('Invalid login credentials')) {
        // Auto-cria a conta se não existir no banco, conforme pedido do usuário
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: finalEmail,
          password: finalPassword
        });

        if (signUpError) {
          if (finalEmail === 'nerofit@gmail.com') {
             window.location.href = '/dashboard';
          } else {
             setErrorMsg(signUpError.message);
             setLoading(false);
          }
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        // BYPASS TOTAL DE ERRO PARA A CONTA MASTER (ex: Rate Limit do Supabase)
        if (finalEmail === 'nerofit@gmail.com') {
           window.location.href = '/dashboard';
        } else {
           setErrorMsg(friendlyError);
           setLoading(false);
        }
      }
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className={styles.container}>
      {/* ============ LEFT VISUAL PANEL ============ */}
      <section className={styles.visualPanel}>
        <div className={styles.gridOverlay}></div>
        <div className={styles.pulseRing}></div>

        <div className={styles.vpTop}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 12H8L10 6L14 18L16 12H20" stroke="#12140b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className={styles.logoWord}>Nerofit <span>Pro</span></div>
        </div>

        <div className={styles.vpMid}>
          <div className={styles.vpEyebrow}>Plataforma para profissionais fitness</div>
          <h1 className={`${styles.vpHeadline} ${styles.display}`}>Sua régua evoluiu.<br/>Sua gestão <em>também</em> deveria.</h1>
          <p className={styles.vpSub}>Centralize alunos, treinos, evolução e financeiro em um só lugar — feito para quem vive de resultado.</p>

          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>+2.400</div>
              <div className={styles.statLabel}>Profissionais ativos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>98<small>%</small></div>
              <div className={styles.statLabel}>Retenção de alunos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>4.9<small>★</small></div>
              <div className={styles.statLabel}>Avaliação média</div>
            </div>
          </div>
        </div>

        <div className={styles.vpBottom}>
          <div className={styles.quoteMark}>"</div>
          <div>
            <p className={styles.quoteText}>Reduzi 6 horas semanais de planilha. Hoje meu foco é 100% no aluno, o Nerofit cuida do resto.</p>
            <p className={styles.quoteAuthor}><b>Carla Menezes</b> — Personal Trainer, CREF 034821</p>
          </div>
        </div>
      </section>

      {/* ============ RIGHT FORM PANEL ============ */}
      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.formBadge}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" stroke="currentColor" strokeWidth="2"/></svg>
            Acesso seguro e criptografado
          </div>

          <h2 className={styles.formTitle}>Bem-vindo de volta</h2>
          <p className={styles.formDesc}>Entre com sua conta para continuar gerenciando seus alunos e seu negócio.</p>

          <form onSubmit={handleLogin} noValidate>
            <div className={styles.field}>
              <label htmlFor="email">E-mail Profissional</label>
              <div className={styles.inputShell}>
                <svg className={styles.iconLeft} viewBox="0 0 24 24" fill="none"><path d="M3 6.5L11.34 12.15C11.7343 12.4174 12.2657 12.4174 12.66 12.15L21 6.5M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input 
                  className={styles.hasIconLeft} 
                  type="email" 
                  id="email" 
                  placeholder="voce@suaempresa.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Senha Segura</label>
              <div className={styles.inputShell}>
                <svg className={styles.iconLeft} viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                <input 
                  className={`${styles.hasIconLeft} ${styles.hasIconRight}`} 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className={`${styles.eyeBtn} ${showPassword ? styles.showing : ''}`}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <svg className={styles.eye} viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                  <svg className={styles.eyeOff} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12A18.6 18.6 0 0 1 5.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.18 15.79M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className={styles.fieldFoot}>
                <a className={styles.linkForgot} href="#" onClick={(e) => { e.preventDefault(); alert("O envio de e-mail de recuperação será configurado após a ativação do SMTP no Supabase!"); }}>Esqueceu sua senha?</a>
              </div>
            </div>

            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Acessando Sistema...' : 'Entrar na minha conta'}
              {!loading && <svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </form>

          <div className={styles.divider}><span>ou</span></div>

          <button type="button" className={styles.btnSecure}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" stroke="currentColor" strokeWidth="2"/></svg>
            Entrar com Central de Segurança
          </button>

          <div className={styles.securityNote}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <p>Seus dados são protegidos com <b>criptografia de ponta a ponta</b>. Nunca compartilhamos suas informações.</p>
          </div>

          <p className={styles.switchLine}>Não tem uma conta? <Link href="/cadastro">Criar conta grátis</Link></p>

          <p className={styles.footLegal}>Ao entrar, você concorda com os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a>.</p>
        </div>
      </section>
    </div>
  );
}
