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

        <div className={styles.headerRight} style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.btnGeneric} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✏️ Editar Aluno</button>
          <button className={styles.btnPrimary} style={{ background: '#ccff00', color: '#000', fontWeight: 'bold' }}>+ Sessão / Treino</button>
          <button className={styles.btnSecondary} onClick={() => window.open(student.phone ? `https://wa.me/${student.phone.replace(/\\D/g, '')}` : '#')}>WhatsApp</button>
        </div>
      </div>

      {/* TABS MENU */}
      <div className={styles.tabsMenu} style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button className={`${styles.tabItem} ${activeTab === 'prontuario' ? styles.tabActive : ''}`} onClick={() => setActiveTab('prontuario')}>
           👤 Dados Pessoais & Prontuário
        </button>
        <button className={`${styles.tabItem} ${activeTab === 'treino' ? styles.tabActive : ''}`} onClick={() => setActiveTab('treino')}>
           🏋️‍♂️ Treinos & Fichas
        </button>
        <button className={`${styles.tabItem} ${activeTab === 'financeiro' ? styles.tabActive : ''}`} onClick={() => setActiveTab('financeiro')}>
           💰 Financeiro & Planos
        </button>
        <button className={`${styles.tabItem} ${activeTab === 'arquivos' ? styles.tabActive : ''}`} onClick={() => setActiveTab('arquivos')}>
           📊 Avaliações Físicas
        </button>
        <button className={`${styles.tabItem} ${activeTab === 'historico' ? styles.tabActive : ''}`} onClick={() => setActiveTab('historico')}>
           📋 Histórico Completo
        </button>
      </div>

      {/* TABS CONTENT */}
      <div className={styles.tabContentArea}>
        
        {activeTab === 'prontuario' && (
          <div className={styles.grid2Col}>
            <div className={styles.cardInfo} style={{ borderTop: '4px solid #ccff00' }}>
              <h3>Informações Pessoais</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 15, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                  <strong style={{ color: '#a1a1aa' }}>E-mail</strong> <span>{student.email || 'Não informado'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                  <strong style={{ color: '#a1a1aa' }}>Telefone</strong> <span>{student.phone || 'Não informado'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                  <strong style={{ color: '#a1a1aa' }}>Nascimento</strong> <span>{details?.birth_date ? new Date(details.birth_date).toLocaleDateString('pt-BR') : '-'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                  <strong style={{ color: '#a1a1aa' }}>CPF</strong> <span>{details?.cpf || '-'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                  <strong style={{ color: '#a1a1aa' }}>Gênero</strong> <span>{details?.gender || '-'}</span>
                </li>
              </ul>
              
              <h3 style={{ marginTop: 25, display: 'flex', alignItems: 'center', gap: 8 }}>📍 Endereço</h3>
              <p style={{ marginTop: 10, color: '#e4e4e7' }}>{details?.address_line ? `${details.address_line}, ${details.city} - ${details.state}` : 'Endereço não cadastrado'}</p>
              {details?.zipcode && <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>CEP: {details.zipcode}</p>}
              
              <h3 style={{ marginTop: 25, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>⚠️ Contato de Emergência</h3>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 15, borderRadius: 8, marginTop: 10 }}>
                <p><strong>Nome:</strong> {details?.emergency_contact_name || '-'}</p>
                <p><strong>Telefone:</strong> {details?.emergency_contact_phone || '-'}</p>
                <p><strong>Parentesco:</strong> {details?.emergency_contact_relation || '-'}</p>
              </div>
            </div>

            <div className={styles.cardInfo}>
              <h3>Prontuário Médico e Observações</h3>
              
              <div className={styles.highlightBlock} style={{ marginTop: 15 }}>
                <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: 5 }}>Objetivo Principal:</strong>
                <p style={{ fontSize: '1.1rem', color: '#fff' }}>{details?.goals || 'Não preenchido'}</p>
              </div>

              <div className={styles.highlightBlock} style={{ borderLeftColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                <strong style={{ color: '#ef4444', fontSize: '1.05rem', display: 'block', marginBottom: 5 }}>Restrições Físicas / Lesões:</strong>
                <p style={{ fontSize: '1.05rem', color: '#ffb3b3' }}>{details?.injuries || 'Nenhuma informada'}</p>
              </div>

              <div className={styles.highlightBlock}>
                <strong style={{ color: '#a1a1aa' }}>Notas de Anamnese Adicionais:</strong>
                <p style={{ marginTop: 8 }}>{details?.notes || '-'}</p>
              </div>

              <div className={styles.actionRow} style={{ marginTop: 30 }}>
                 <button className={styles.btnGeneric} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>📝 Editar Prontuário</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treino' && (
          <div className={styles.grid2Col}>
             <div className={styles.cardInfo}>
               <h3>Ficha de Treino Atual</h3>
               <div style={{ marginTop: 20, textAlign: 'center', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
                 <div style={{ fontSize: '2.5rem', opacity: 0.5, marginBottom: 15 }}>📋</div>
                 <p style={{ color: '#a1a1aa' }}>Nenhuma ficha técnica vinculada a este aluno.</p>
                 <button className={styles.btnPrimary} style={{ background: '#ccff00', color: '#000', marginTop: 15 }}>Criar Ficha de Treino</button>
               </div>
             </div>
             <div className={styles.cardInfo}>
               <h3>Próximos Agendamentos</h3>
               <div style={{ marginTop: 20 }}>
                 <div style={{ padding: 15, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <strong style={{ display: 'block', color: '#fff', fontSize: '1.1rem' }}>Hoje - 18:00</strong>
                     <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Treino Pessoal</span>
                   </div>
                   <button className={styles.btnSecondary} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Check-in</button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className={styles.grid2Col}>
             <div className={styles.cardInfo}>
               <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 15, marginBottom: 15 }}>Resumo do Contrato</h3>
               
               <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: 5 }}>Plano Atual / Frequência</p>
                 <strong style={{ fontSize: '1.4rem', color: '#fff', display: 'block' }}>{details?.plan_name_cache || 'Sem plano recorrente'} <span style={{ fontSize: '0.85rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 12, marginLeft: 10 }}>Mensal</span></strong>
               </div>

               <div className={styles.grid2Col} style={{ gap: 15, marginTop: 15 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: 5 }}>Valor Bruto</p>
                    <strong style={{ fontSize: '1.2rem', color: '#fff' }}>
                      {details?.monthly_fee ? details.monthly_fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Avulso'}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: 5 }}>Vencimento</p>
                    <strong style={{ fontSize: '1.2rem', color: '#fff' }}>
                      {details?.due_day ? `Dia ${details.due_day}` : 'Sob Demanda'}
                    </strong>
                  </div>
               </div>
               
               <div className={styles.actionRow} style={{ marginTop: 25, display: 'flex', gap: 10 }}>
                 <button className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center' }}>💳 Gerar Cobrança Pix</button>
                 <button className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }}>Pausar Mensalidades</button>
               </div>
             </div>

             <div className={styles.cardInfo}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 15, marginBottom: 15 }}>Histórico de Pagamentos</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.invoiceTable} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#71717a', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '10px 5px', fontWeight: 'normal' }}>Vencimento</th>
                        <th style={{ padding: '10px 5px', fontWeight: 'normal' }}>Valor</th>
                        <th style={{ padding: '10px 5px', fontWeight: 'normal' }}>Status</th>
                        <th style={{ padding: '10px 5px', fontWeight: 'normal', textAlign: 'right' }}>Recibo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px 20px', color: '#71717a' }}>
                           <div style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.3 }}>🧾</div>
                           Nenhum histórico de pagamento gerado.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'arquivos' && (
          <div className={styles.cardInfo} style={{ borderTop: '4px solid #3b82f6' }}>
             <h3>Avaliações Físicas e Bioimpedância</h3>
             <p style={{ color: '#a1a1aa', marginTop: '5px' }}>Histórico de medidas, peso, dobras cutâneas e fotos de evolução.</p>
             
             <div style={{ marginTop: 30, textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
                <div style={{ fontSize: '3rem', marginBottom: 15, opacity: 0.5 }}>📈</div>
                <h3 style={{ color: '#fff', marginBottom: 10 }}>Nenhuma avaliação registrada</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Comece a registrar as métricas físicas para visualizar os gráficos de progresso.</p>
                <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginTop: 25 }}>
                   <button className={styles.btnPrimary} style={{ background: '#3b82f6', color: '#fff' }}>+ Nova Avaliação Completa</button>
                   <button className={styles.btnSecondary}>Anexar PDF / Foto</button>
                </div>
             </div>
          </div>
        )}
        
        {activeTab === 'historico' && (
          <div className={styles.cardInfo}>
            <h3>Histórico de Interações</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: 20 }}>Visão geral de todos os contatos, check-ins, treinos e alterações no perfil.</p>
             
            <div className={styles.timeline} style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: 15, paddingLeft: 20 }}>
               <div className={styles.timelineItem} style={{ position: 'relative', marginBottom: 25 }}>
                 <div style={{ width: 12, height: 12, background: '#ccff00', borderRadius: '50%', position: 'absolute', left: -27, top: 5 }}></div>
                 <div className={styles.timelineContent} style={{ background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <strong style={{ color: '#fff', display: 'block', marginBottom: 5 }}>Matrícula Realizada no Sistema</strong>
                    <p style={{ fontSize: '0.85rem', color: '#71717a' }}>{new Date(student.created_at).toLocaleDateString('pt-BR')} às {new Date(student.created_at).toLocaleTimeString('pt-BR')}</p>
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
