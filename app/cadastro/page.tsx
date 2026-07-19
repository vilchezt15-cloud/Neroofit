'use client';

import { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import styles from '../login/page.module.css'; // Reutiliza estilo do login
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Cadastro() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Cria o usuário na tabela Auth Users do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    // Mesmo sem trigger de banco, podemos tentar inserir manualmente ou apenas avançar.
    // Como a política de RLS e Triggers geralmente lidam com a cópia de auth.users -> profiles,
    // nós direcionaremos diretamente para o dashboard.
    router.push('/dashboard');
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
          <div className={styles.vpEyebrow}>Sua central de operações</div>
          <h1 className={`${styles.vpHeadline} ${styles.display}`}>Inicie a sua.<br/><em>Transformação</em> hoje.</h1>
          <p className={styles.vpSub}>Ferramentas completas para aumentar a retenção dos seus alunos e gerenciar todo seu fluxo de caixa de forma inteligente.</p>

          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>+2.400</div>
              <div className={styles.statLabel}>Profissionais ativos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>98<small>%</small></div>
              <div className={styles.statLabel}>Retenção de alunos</div>
            </div>
          </div>
        </div>

        <div className={styles.vpBottom}>
          <div className={styles.quoteMark}>"</div>
          <div>
            <p className={styles.quoteText}>Gerenciar alunos nunca foi tão rápido e fácil.</p>
            <p className={styles.quoteAuthor}><b>João Silva</b> — Personal Trainer</p>
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

          <h2 className={styles.formTitle}>Criar nova conta</h2>
          <p className={styles.formDesc}>Comece a usar o Nerofit Pro e modernize sua consultoria instantaneamente.</p>

          <form onSubmit={handleRegister} noValidate>
            
            <div className={styles.field}>
              <label htmlFor="name">Nome Completo</label>
              <div className={styles.inputShell}>
                <svg className={styles.iconLeft} viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 17.8954 19.1046 17 18 17H6C4.89543 17 4 17.8954 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input 
                  className={styles.hasIconLeft} 
                  type="text" 
                  id="name" 
                  placeholder="Ex: Carlos M. Silva" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
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
            </div>

            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Criando sua conta...' : 'Criar minha conta Grátis'}
              {!loading && <svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </form>

          <p className={styles.switchLine}>Já tem uma conta? <Link href="/login">Entrar</Link></p>

          <p className={styles.footLegal}>Ao se cadastrar, você concorda com os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a>.</p>
        </div>
      </section>
    </div>
  );
}
