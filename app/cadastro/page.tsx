'use client';

import { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import styles from '../login/page.module.css'; // Reutiliza estilo do login
import { useRouter } from 'next/navigation';

export default function Cadastro() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className={styles.authBox} style={{marginTop: '20px', marginBottom: '20px'}}>
        <div className={styles.logo} style={{marginBottom: 15, justifyContent: 'center'}}>
          <img src="/logo-png-nero.png" alt="Nerofit Pro" style={{height: 55, objectFit: 'contain'}} />
        </div>
        
        <h2>Criar nova conta</h2>
        <p className={styles.subtitle}>Inicie a transformação do seu negócio profissional.</p>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Nome Completo</label>
            <input 
              type="text" 
              placeholder="Ex: Carlos Educação Física"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>E-mail Profissional</label>
            <input 
              type="email" 
              placeholder="seu@email.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Senha Segura</label>
            <input 
              type="password" 
              placeholder="Min. 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {errorMsg && <div className={styles.error}>{errorMsg}</div>}

          <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
            {loading ? 'Criando conta...' : 'Criar minha conta Grátis'}
          </button>
        </form>

        <div className={styles.footerLink}>
          Já tem uma conta? <a href="/login">Fazer Login</a>
        </div>
      </div>
      
      {/* Background Ornaments */}
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
    </div>
  );
}
