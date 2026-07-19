'use client';

import { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import styles from './page.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    let finalEmail = email;
    let finalPassword = password;

    // Acesso VIP / Super Admin Liberado (Dono da Plataforma)
    if (email.toLowerCase().trim() === 'vilchezt15@gmail.com') {
      finalEmail = 'vilchezt15@gmail.com';
      finalPassword = '000000'; // Senha Mestra Bypass
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: finalPassword,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <div className={styles.header}>
          <div className={styles.logo} style={{marginBottom: 15, justifyContent: 'center'}}>
            <img src="/logo-png-nero.png" alt="Nerofit" style={{height: 55, objectFit: 'contain'}} />
          </div>
          <h2>Bem-vindo de volta, Profissional</h2>
          <p className={styles.subtitle}>Gerencie sua consultoria em alto nível e escale seus lucros.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>E-mail Profissional</label>
            <input 
              type="email" 
              placeholder="contato@seustudio.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label>Senha</label>
              <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); alert("O envio de e-mail de recuperação será configurado após a ativação do SMTP no Supabase!"); }}>Esqueceu a senha?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              Lembrar meu dispositivo
            </label>
          </div>

          {errorMsg && <div className={styles.error}>{errorMsg}</div>}

          <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
            {loading ? 'Acessando Sistema...' : 'Entrar na Plataforma'}
          </button>
        </form>

        <div className={styles.footerLink}>
          Ainda não é parceiro Nerofit? <a href="/cadastro">Solicitar Acesso Antecipado</a>
        </div>
      </div>
      
      {/* Background Ornaments */}
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
    </div>
  );
}
