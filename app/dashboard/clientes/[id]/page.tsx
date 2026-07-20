'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import styles from './Profile.module.css';

export default function ClientProfile({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prontuario'); 

  useEffect(() => {
    async function loadData() {
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (!profErr && profData) {
        setStudent(profData);
        
        const { data: detData } = await supabase
          .from('student_details')
          .select('*')
          .eq('profile_id', params.id)
          .single();
        
        if (detData) {
          setDetails(detData);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return <div className={styles.loadingState}>Carregando Ficha do Aluno...</div>;
  }

  if (!student) {
    return (
      <div className={styles.loadingState}>
        <h2>Aluno não encontrado</h2>
        <button className={styles.btnGeneric} onClick={() => router.push('/dashboard?tab=clientes')}>Voltar</button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Inativo': return '#ef4444';
      case 'Pausado': return '#f59e0b';
      default: return '#10b981';
    }
  };
  const statusColor = getStatusColor(details?.status);

  return (
    <div className={styles.pageContainer}>
      {/* HEADER SECTION */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard?tab=clientes')}>
             <span style={{marginRight: 6}}>❮</span> Voltar
          </button>
          
          <div className={styles.profileIdentify}>
             <div className={styles.avatarHuge}>
               {student.full_name ? student.full_name[0].toUpperCase() : 'A'}
             </div>
             <div>
                <h1 className={styles.studentName}>
                  {student.full_name}
                  <span className={styles.statusPill} style={{ background: `${statusColor}20`, color: statusColor }}>
                    {details?.status || 'Ativo'}
                  </span>
                </h1>
                <p className={styles.studentSub}>Matriculado em {new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
             </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.btnPrimary}>+ Adicionar Sessão/Aviso</button>
          <button className={styles.btnSecondary} onClick={() => window.open(`https://wa.me/${student.phone.replace(/\\D/g, '')}`)}>Falar no WhatsApp</button>
        </div>
      </div>

      {/* TABS MENU */}
      <div className={styles.tabsMenu}>
        <div className={`${styles.tabItem} ${activeTab === 'prontuario' ? styles.tabActive : ''}`} onClick={() => setActiveTab('prontuario')}>
          Prontuário Médico & Pessoal
        </div>
        <div className={`${styles.tabItem} ${activeTab === 'financeiro' ? styles.tabActive : ''}`} onClick={() => setActiveTab('financeiro')}>
          Financeiro & Planos
        </div>
        <div className={`${styles.tabItem} ${activeTab === 'arquivos' ? styles.tabActive : ''}`} onClick={() => setActiveTab('arquivos')}>
          Evolução Física (Fotos/Documentos)
        </div>
        <div className={`${styles.tabItem} ${activeTab === 'historico' ? styles.tabActive : ''}`} onClick={() => setActiveTab('historico')}>
          Histórico e Notas
        </div>
      </div>

      {/* TABS CONTENT */}
      <div className={styles.tabContentArea}>
        
        {activeTab === 'prontuario' && (
          <div className={styles.grid2Col}>
            <div className={styles.cardInfo}>
              <h3>Informações Pessoais</h3>
              <ul>
                <li><strong>Gênero:</strong> {details?.gender || '-'}</li>
                <li><strong>Nascimento:</strong> {details?.birth_date ? new Date(details.birth_date).toLocaleDateString('pt-BR') : '-'}</li>
                <li><strong>CPF:</strong> {details?.cpf || '-'}</li>
                <li><strong>E-mail:</strong> {student.email}</li>
                <li><strong>Telefone:</strong> {student.phone}</li>
                <li><strong>Endereço:</strong> {details?.address_line ? `${details.address_line}, ${details.city} - ${details.state}` : '-'}</li>
              </ul>
              
              <h3 style={{ marginTop: 25 }}>Contato de Emergência</h3>
              <ul>
                <li><strong>Nome:</strong> {details?.emergency_contact_name || '-'}</li>
                <li><strong>Telefone:</strong> {details?.emergency_contact_phone || '-'}</li>
                <li><strong>Parentesco:</strong> {details?.emergency_contact_relation || '-'}</li>
              </ul>
            </div>

            <div className={styles.cardInfo}>
              <h3>Anamnese e Objetivos</h3>
              <div className={styles.highlightBlock}>
                <strong>Objetivo Principal:</strong>
                <p>{details?.goals || 'Não preenchido'}</p>
              </div>

              <div className={styles.highlightBlock} style={{ borderLeftColor: '#ef4444' }}>
                <strong style={{ color: '#ef4444' }}>Restrições Físicas / Lesões:</strong>
                <p>{details?.injuries || 'Nenhuma informada'}</p>
              </div>

              <div className={styles.highlightBlock}>
                <strong>Notas de Anamnese Adicionais:</strong>
                <p>{details?.notes || '-'}</p>
              </div>

              <div className={styles.actionRow} style={{ marginTop: 20 }}>
                 <button className={styles.btnGeneric}>Editar Dados</button>
                 <button className={styles.btnGeneric} style={{color: '#f59e0b', borderColor: '#f59e0b'}}>Atualizar Ficha Avaliativa</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className={styles.financeLayout}>
             <div className={styles.cardInfo}>
               <h3>Resumo Financeiro</h3>
               <div className={styles.financeStatBox}>
                 <span className={styles.statLabel}>Plano Atual</span>
                 <strong className={styles.statValue}>{details?.plan_name_cache || 'Sem plano'}</strong>
               </div>
               <div className={styles.grid2Col} style={{ gap: 15, marginTop: 15 }}>
                  <div className={styles.financeStatBox}>
                    <span className={styles.statLabel}>Mensalidade Fixa</span>
                    <strong className={styles.statValue} style={{ fontSize: '1.2rem'}}>
                      {details?.monthly_fee ? details.monthly_fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Avulso'}
                    </strong>
                  </div>
                  <div className={styles.financeStatBox}>
                    <span className={styles.statLabel}>Dia de Vencimento</span>
                    <strong className={styles.statValue} style={{ fontSize: '1.2rem'}}>
                      {details?.due_day ? `Todo dia ${details.due_day}` : 'Automático'}
                    </strong>
                  </div>
               </div>
               
               <div className={styles.actionRow} style={{ marginTop: 20 }}>
                 <button className={styles.btnPrimary}>Gerar Cobrança Avulsa (Pix)</button>
                 <button className={styles.btnGeneric}>Pausar Mensalidades</button>
               </div>
             </div>

             <div className={styles.cardInfo}>
                <h3>Faturas Recentes</h3>
                <table className={styles.invoiceTable}>
                  <thead>
                    <tr><th>Vencimento</th><th>Valor</th><th>Status</th><th>Ações</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#71717a'}}>
                        Nenhuma fatura gerada para este aluno ainda.
                      </td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'arquivos' && (
          <div className={styles.cardInfo} style={{textAlign: 'center', padding: '60px 20px'}}>
             <div style={{ fontSize: '3rem', marginBottom: 15 }}>📸</div>
             <h3>Evolução Física</h3>
             <p style={{ color: '#a1a1aa' }}>Esta área receberá upload das fotos comparativas de antes e depois e gráficos de bioimpedância.</p>
             <button className={styles.btnGeneric} style={{ marginTop: 20 }}>Fazer Upload de Foto/Doc</button>
          </div>
        )}
        
        {activeTab === 'historico' && (
          <div className={styles.cardInfo}>
            <h3>Sessões Realizadas e Notas</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Acompanhe todas as vezes que o aluno esteve com você e suas observações por treino.</p>
             
            <div className={styles.timeline}>
               <div className={styles.timelineItem}>
                 <div className={styles.timelineDot}></div>
                 <div className={styles.timelineContent}>
                    <strong>Matrícula Realizada no Sistema</strong>
                    <p style={{ fontSize: '0.8rem', color: '#71717a' }}>{new Date(student.created_at).toLocaleDateString('pt-BR')} às {new Date(student.created_at).toLocaleTimeString('pt-BR')}</p>
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
