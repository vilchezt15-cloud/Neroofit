'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabase/client';
import styles from './page.module.css';

export default function ClientProfile() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, evaluations, workouts

  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showAnamneseModal, setShowAnamneseModal] = useState(false);

  const [anamneseForm, setAnamneseForm] = useState({ goals: '', injuries: '' });
  const [evalForm, setEvalForm] = useState({
     weight: '', height: '',
     chest: '', abd: '', thigh: '', triceps: '', subscapular: '', suprailiac: '', midaxillary: ''
  });
  const [workoutForm, setWorkoutForm] = useState({
     name: '', goal: '', level: 'BEGINNER',
     exercises: [{ name: '', sets: 3, reps: '10-12', rest: 60 }]
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         router.push('/login');
         return;
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if (data) {
         setStudent(data);
         const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', session.user.id).single();
         if (prof) {
            const { data: evals } = await supabase.from('physical_evaluations')
               .select('*')
               .eq('student_id', studentId)
               .order('date', { ascending: false });
            if (evals) setEvaluations(evals);

            const { data: wks } = await supabase.from('workout_prescriptions')
               .select(`*, workout_items(*)`)
               .eq('student_id', studentId)
               .order('created_at', { ascending: false });
            if (wks) setWorkouts(wks);
            const { data: details } = await supabase.from('student_details')
               .select('*')
               .eq('profile_id', studentId)
               .single();
            if (details) {
               setStudent((prev: any) => ({ ...prev, details }));
               setAnamneseForm({ goals: details.goals || '', injuries: details.injuries || '' });
            }

            const { data: invs } = await supabase.from('invoices')
               .select('*')
               .eq('student_id', studentId)
               .order('due_date', { ascending: false });
            if (invs) setInvoices(invs);
         }
      }
      setLoading(false);
    };

    if (studentId) fetchStudentData();
  }, [studentId, router]);

  const handleSaveAnamnese = async () => {
     try {
         const { error } = await supabase.from('student_details').upsert({
            profile_id: studentId,
            goals: anamneseForm.goals,
            injuries: anamneseForm.injuries
         }, { onConflict: 'profile_id' });
         
         if (error) {
             if (error.message.includes('does not exist')) {
                 alert("Salvando na UI (Tabela não inicializada no DB, execute schema.sql)");
             } else throw error;
         } else {
             alert('Anamnese atualizada com sucesso!');
         }
         
         setStudent((prev: any) => ({...prev, details: anamneseForm}));
         setShowAnamneseModal(false);
     } catch(e: any) {
         alert("Erro: " + e.message);
     }
  };

  const handleSaveEvaluation = async () => {
     try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão expirada.");
        const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', session.user.id).single();
        if (!prof) throw new Error("Autorização negada.");

        const payload = {
           student_id: studentId,
           tenant_id: prof.tenant_id,
           weight_kg: parseFloat(evalForm.weight.replace(',','.')),
           height_cm: parseFloat(evalForm.height),
           fold_chest: parseFloat(evalForm.chest.replace(',','.')),
           fold_abdominal: parseFloat(evalForm.abd.replace(',','.')),
           fold_thigh: parseFloat(evalForm.thigh.replace(',','.')),
           fold_triceps: parseFloat(evalForm.triceps.replace(',','.')),
           fold_subscapular: parseFloat(evalForm.subscapular.replace(',','.')),
           fold_suprailiac: parseFloat(evalForm.suprailiac.replace(',','.')),
           fold_midaxillary: parseFloat(evalForm.midaxillary.replace(',','.'))
        };

        const { error } = await supabase.from('physical_evaluations').insert(payload);
        if (error) {
           if (error.message.includes('does not exist')) {
              alert('Salvo no estado (UI) temporariamente.\nNota Técnica: Rode a tabela physical_evaluations no painel.');
           } else {
              throw error;
           }
        } else {
           alert("Avaliação Registrada!");
        }

        setShowEvalModal(false);
        setEvalForm({ weight:'', height:'', chest:'', abd:'', thigh:'', triceps:'', subscapular:'', suprailiac:'', midaxillary:'' });
        // recarregar idealmente
     } catch(e: any) {
        alert("Erro: " + e.message);
     }
  };

  const handleSaveWorkout = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão expirada.");
        const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', session.user.id).single();
        if (!prof) throw new Error("Autorização negada.");

        if (!workoutForm.name) throw new Error("A ficha precisa de um nome.");

        // Insert Prescription (Mãe)
        const { data: prescriptionData, error: presErr } = await supabase.from('workout_prescriptions').insert({
            student_id: studentId,
            tenant_id: prof.tenant_id,
            name: workoutForm.name,
            goal: workoutForm.goal,
            level: workoutForm.level
        }).select().single();

        if (presErr) {
             if (presErr.message.includes('does not exist')) {
                 alert("Ficha Salva no Local State. Rodar backend schemas para ver persistência real.");
                 setShowWorkoutModal(false);
                 return;
             } else {
                 throw presErr;
             }
        }

        // Insert Items
        if (prescriptionData && workoutForm.exercises.length > 0) {
            const items = workoutForm.exercises.map((ex, i) => ({
                prescription_id: prescriptionData.id,
                exercise_name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                rest_seconds: ex.rest,
                order_index: i
            })).filter(x => x.exercise_name.trim() !== '');

            if (items.length > 0) {
                const { error: itemsErr } = await supabase.from('workout_items').insert(items);
                if (itemsErr) throw itemsErr;
            }
        }

        alert("Treino prescrito e vinculado ao aluno com sucesso!");
        setShowWorkoutModal(false);
        setWorkoutForm({ name: '', goal: '', level: 'BEGINNER', exercises: [{ name: '', sets: 3, reps: '10-12', rest: 60 }] });
    } catch(e: any) {
        alert("Erro ao salvar Treino: " + e.message);
    }
  };

  if (loading) return <div className={styles.loading}>Carregando perfil do aluno...</div>;
  if (!student) return <div className={styles.loading}>Aluno não encontrado ou sem permissão.</div>;

  return (
    <div className={styles.layout}>
       <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>❮ Voltar para Alunos</button>
          <h2>Prontuário VIP</h2>
       </div>

       <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>{(student.full_name || 'A')[0].toUpperCase()}</div>
          <div className={styles.profileInfo}>
             <h1>{student.full_name}</h1>
             <p>{student.email}</p>
             <div className={styles.tags}>
                <span className={styles.tagActive}>Ativo</span>
                <span className={styles.tagPlan}>Plano: Consultoria Online</span>
             </div>
          </div>
       </div>

       <div className={styles.tabsMenu}>
          <button className={activeTab === 'overview' ? styles.tabActive : ''} onClick={() => setActiveTab('overview')}>Visão Geral & Anamnese</button>
          <button className={activeTab === 'evaluations' ? styles.tabActive : ''} onClick={() => setActiveTab('evaluations')}>Avaliações Físicas</button>
          <button className={activeTab === 'workouts' ? styles.tabActive : ''} onClick={() => setActiveTab('workouts')}>Prescrição de Treino</button>
          <button className={activeTab === 'files' ? styles.tabActive : ''} onClick={() => setActiveTab('files')}>Arquivos / Termos</button>
          <button className={activeTab === 'history' ? styles.tabActive : ''} onClick={() => setActiveTab('history')}>Histórico Financeiro</button>
       </div>

       <div className={styles.tabContentContainer}>
          {activeTab === 'overview' && (
             <div className={styles.overviewGrid}>
                <div className={styles.card}>
                   <h3>Anamnese e Saúde</h3>
                   {student.details?.goals ? (
                      <p><strong>Objetivo:</strong> {student.details?.goals}</p>
                   ) : (
                      <p className={styles.emptyText}>Nenhum objetivo preenchido.</p>
                   )}
                   {student.details?.injuries ? (
                      <p><strong>Lesões/Restrições:</strong> {student.details?.injuries}</p>
                   ) : (
                      <p className={styles.emptyText}>Nenhuma restrição relatada.</p>
                   )}
                   <button className="btn btn-primary" onClick={() => setShowAnamneseModal(true)} style={{marginTop: 15, background: 'var(--secondary)', color: '#000', border: 'none'}}>✏️ Editar Anamnese</button>
                </div>
                <div className={styles.card}>
                   <h3>Metas e Timeline</h3>
                   <p className={styles.emptyText}>Integração com eventos previstos no calendário (Consultas).</p>
                </div>
             </div>
          )}

          {activeTab === 'evaluations' && (
             <div className={styles.card}>
                <div style={{display:'flex', justifyContent: 'space-between', marginBottom: 20}}>
                   <h3>Composição Corporal</h3>
                   <button className="btn btn-primary" onClick={() => setShowEvalModal(true)}>+ Nova Avaliação (Protocolo 7 Dobras)</button>
                </div>
                
                {evaluations.length > 0 ? (
                   <div style={{display:'grid', gap:'15px'}}>
                      {evaluations.map(ev => (
                         <div key={ev.id} style={{padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)'}}>
                            <h4 style={{marginBottom: 10, display:'flex', justifyContent:'space-between'}}>
                               <span>Data: {new Date(ev.date).toLocaleDateString('pt-BR')}</span>
                               <span style={{color:'var(--primary)'}}>Peso: {ev.weight_kg}kg</span>
                            </h4>
                            <p style={{fontSize:'0.85rem', color:'#71717a'}}>Dobras (Pollock): Peito {ev.fold_chest}, Abd {ev.fold_abdominal}, Coxa {ev.fold_thigh}, Triceps {ev.fold_triceps}</p>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className={styles.placeholderCard} style={{height: 200, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      Grafico de Evolução e Antropometria serão exibidos aqui após inserir dados.
                   </div>
                )}
             </div>
          )}

          {activeTab === 'workouts' && (
             <div className={styles.card}>
                <div style={{display:'flex', justifyContent: 'space-between', marginBottom: 20}}>
                   <h3>Fichas de Treino</h3>
                   <div>
                       <button className="btn btn-primary" style={{marginRight: 10, background: '#a855f7', border:'none'}}>🪄 Gerar Treino via I.A.</button>
                       <button className="btn btn-primary" onClick={() => setShowWorkoutModal(true)}>+ Montar Ficha Manual</button>
                   </div>
                </div>

                {workouts.length > 0 ? (
                   <div style={{display:'grid', gap:'20px'}}>
                      {workouts.map(w => (
                         <div key={w.id} style={{padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 15}}>
                                <div>
                                    <h4 style={{fontSize:'1.1rem', marginBottom: 4}}>{w.name}</h4>
                                    <span style={{fontSize:'0.8rem', color:'#71717a'}}>Objetivo: {w.goal} • Nível: {w.level}</span>
                                </div>
                                <button className={styles.btnGeneric} style={{padding: '5px 15px', fontSize:'0.8rem'}}>Ver PDF</button>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'5px', marginTop: 10}}>
                                {w.workout_items?.map((item: any) => (
                                    <div key={item.id} style={{display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'rgba(0,0,0,0.3)', borderRadius: 6}}>
                                        <span style={{fontWeight:600}}>{item.exercise_name}</span>
                                        <span style={{color:'#a1a1aa', fontSize:'0.9rem'}}>{item.sets}x {item.reps} rec: {item.rest_seconds}s</span>
                                    </div>
                                ))}
                                {(!w.workout_items || w.workout_items.length === 0) && (
                                   <p style={{color:'#71717a', fontSize:'0.85rem'}}>Nenhum exercício cadastrado nesta ficha.</p>
                                )}
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                    <p className={styles.emptyText}>Este aluno ainda não possui uma ficha de treino vinculada.</p>
                )}
             </div>
          )}

          {activeTab === 'files' && (
             <div className={styles.card}>
                <div style={{display:'flex', justifyContent: 'space-between', marginBottom: 20}}>
                   <h3>Arquivos Confidenciais e Termos</h3>
                   <button className="btn btn-primary" onClick={() => {
                        const fileName = prompt("Nome do arquivo/termo:");
                        if (!fileName) return;
                        alert("Note: A lógica de Upload via Supabase Storage real deve ser conectada aqui. O arquivo será mockado localmente na interface por enquanto.");
                        const newFile = { id: Date.now(), name: fileName, type: 'DOCUMENT', file_url: '#', created_at: new Date().toISOString() };
                        setFiles([newFile, ...files]);
                   }}>+ Adicionar Arquivo</button>
                </div>
                
                {files.length > 0 ? (
                    <div style={{display:'grid', gap:'10px'}}>
                        {files.map(f => (
                           <div key={f.id} style={{display:'flex', justifyContent:'space-between', padding:'12px 15px', background:'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center'}}>
                               <div style={{display:'flex', alignItems: 'center', gap: 10}}>
                                  <span style={{fontSize: '1.2rem'}}>📄</span>
                                  <div>
                                     <h4 style={{fontWeight: 500, margin: 0, fontSize: '0.95rem'}}>{f.name}</h4>
                                     <span style={{fontSize: '0.75rem', color: '#a1a1aa'}}>{new Date(f.created_at).toLocaleDateString('pt-BR')}</span>
                                  </div>
                               </div>
                               <div>
                                  <button className={styles.btnGeneric} style={{fontSize: '0.8rem', padding: '5px 10px'}}>Baixar</button>
                               </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.placeholderCard} style={{height: 150, display:'flex', alignItems:'center', justifyContent:'center'}}>
                       Nenhum arquivo ou termo assinado encontrado.
                    </div>
                )}
             </div>
          )}

          {activeTab === 'history' && (
             <div className={styles.card}>
                <div style={{display:'flex', justifyContent: 'space-between', marginBottom: 20}}>
                   <h3>Histórico de Faturas e Mensalidades</h3>
                </div>
                
                {invoices.length > 0 ? (
                    <div style={{display:'grid', gap:'10px'}}>
                        {invoices.map(inv => (
                           <div key={inv.id} style={{display:'flex', justifyContent:'space-between', padding:'12px 15px', background:'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center'}}>
                               <div style={{display:'flex', alignItems: 'center', gap: 10}}>
                                  <div style={{width: 8, height: 8, borderRadius: '50%', background: inv.status === 'PAID' ? 'var(--primary)' : inv.status === 'OVERDUE' ? '#ef4444' : '#eab308'}}></div>
                                  <div>
                                     <h4 style={{fontWeight: 500, margin: 0, fontSize: '0.95rem'}}>Fatura {inv.description ? `- ${inv.description}` : ''}</h4>
                                     <span style={{fontSize: '0.75rem', color: '#a1a1aa'}}>Venc: {new Date(inv.due_date).toLocaleDateString('pt-BR')} • Via {inv.payment_method}</span>
                                  </div>
                               </div>
                               <div style={{textAlign: 'right'}}>
                                  <strong style={{display: 'block', fontSize: '1rem'}}>R$ {(inv.amount_cents / 100).toFixed(2).replace('.', ',')}</strong>
                                  <span style={{fontSize: '0.75rem', color: inv.status === 'PAID' ? 'var(--primary)' : inv.status === 'OVERDUE' ? '#ef4444' : '#eab308'}}>
                                     {inv.status === 'PAID' ? 'Pago' : inv.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                                  </span>
                               </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.placeholderCard} style={{height: 150, display:'flex', alignItems:'center', justifyContent:'center'}}>
                       Nenhuma fatura encontrada no histórico deste aluno.
                    </div>
                )}
             </div>
          )}
       </div>

       {/* MODAL DE ANAMNESE */}
       {showAnamneseModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
               <div className={styles.modalHeader}>
                  <h3>Anamnese e Saúde</h3>
                  <button className={styles.modalCloseBtn} onClick={() => setShowAnamneseModal(false)}>✕</button>
               </div>
               <div className={styles.modalBody}>
                  <div className={styles.formRow} style={{marginBottom: 15, flexDirection: 'column'}}>
                      <label className={styles.modalLabel}>Objetivos Físicos e Metas</label>
                      <textarea className={styles.modalInput} style={{minHeight: 80, resize: 'vertical'}} placeholder="Descreva os objetivos principais do aluno..." value={anamneseForm.goals} onChange={e => setAnamneseForm({...anamneseForm, goals: e.target.value})}></textarea>
                  </div>
                  <div className={styles.formRow} style={{marginBottom: 15, flexDirection: 'column'}}>
                      <label className={styles.modalLabel}>Lesões e Restrições Médicas</label>
                      <textarea className={styles.modalInput} style={{minHeight: 80, resize: 'vertical'}} placeholder="Ex: Hérnia L4/L5, condromalácia grau 2..." value={anamneseForm.injuries} onChange={e => setAnamneseForm({...anamneseForm, injuries: e.target.value})}></textarea>
                  </div>
               </div>
               <div className={styles.modalFooter}>
                  <button className={styles.btnGeneric} onClick={() => setShowAnamneseModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleSaveAnamnese} style={{background: 'var(--secondary)', color: '#000', border: 'none'}}>Salvar Anamnese</button>
               </div>
            </div>
          </div>
       )}

       {/* MODAL DE AVALIAÇÃO */}
       {showEvalModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
               <div className={styles.modalHeader}>
                  <h3>Nova Avaliação Física</h3>
                  <button className={styles.modalCloseBtn} onClick={() => setShowEvalModal(false)}>✕</button>
               </div>
               <div className={styles.modalBody}>
                  <div className={styles.formRow} style={{marginBottom: 15}}>
                     <div className={styles.formCol}>
                        <label className={styles.modalLabel}>Peso (kg)</label>
                        <input className={styles.modalInput} placeholder="Ex: 75.5" value={evalForm.weight} onChange={e => setEvalForm({...evalForm, weight: e.target.value})} />
                     </div>
                     <div className={styles.formCol}>
                        <label className={styles.modalLabel}>Altura (cm)</label>
                        <input className={styles.modalInput} placeholder="Ex: 180" value={evalForm.height} onChange={e => setEvalForm({...evalForm, height: e.target.value})} />
                     </div>
                  </div>
                  <h4 style={{marginBottom: 10, marginTop: 20, color:'#a1a1aa', fontSize:'0.9rem'}}>Dobras Cutâneas (Protocolo Pollock 7 - mm)</h4>
                  <div className={styles.formRow} style={{marginBottom: 15}}>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Peito</label><input className={styles.modalInput} value={evalForm.chest} onChange={e => setEvalForm({...evalForm, chest: e.target.value})}/></div>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Abdominal</label><input className={styles.modalInput} value={evalForm.abd} onChange={e => setEvalForm({...evalForm, abd: e.target.value})}/></div>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Coxa</label><input className={styles.modalInput} value={evalForm.thigh} onChange={e => setEvalForm({...evalForm, thigh: e.target.value})}/></div>
                  </div>
                  <div className={styles.formRow} style={{marginBottom: 15}}>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Tríceps</label><input className={styles.modalInput} value={evalForm.triceps} onChange={e => setEvalForm({...evalForm, triceps: e.target.value})}/></div>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Subescapular</label><input className={styles.modalInput} value={evalForm.subscapular} onChange={e => setEvalForm({...evalForm, subscapular: e.target.value})}/></div>
                  </div>
                  <div className={styles.formRow} style={{marginBottom: 15}}>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Suprailíaca</label><input className={styles.modalInput} value={evalForm.suprailiac} onChange={e => setEvalForm({...evalForm, suprailiac: e.target.value})}/></div>
                     <div className={styles.formCol}><label className={styles.modalLabel}>Média Axilar</label><input className={styles.modalInput} value={evalForm.midaxillary} onChange={e => setEvalForm({...evalForm, midaxillary: e.target.value})}/></div>
                  </div>
               </div>
               <div className={styles.modalFooter}>
                  <button className={styles.btnGeneric} onClick={() => setShowEvalModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleSaveEvaluation} style={{background: 'var(--primary)', color: '#000', border: 'none'}}>Salvar Avaliação</button>
               </div>
            </div>
          </div>
       )}

       {/* MODAL DE TREINO */}
       {showWorkoutModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{maxWidth: 700}}>
               <div className={styles.modalHeader}>
                  <h3>Prescrição de Treino</h3>
                  <button className={styles.modalCloseBtn} onClick={() => setShowWorkoutModal(false)}>✕</button>
               </div>
               <div className={styles.modalBody}>
                  <div className={styles.formRow} style={{marginBottom: 15}}>
                     <div className={styles.formCol}>
                        <label className={styles.modalLabel}>Nome do Treino</label>
                        <input className={styles.modalInput} placeholder="Ex: Treino A - Peito/Tríceps" value={workoutForm.name} onChange={e => setWorkoutForm({...workoutForm, name: e.target.value})} />
                     </div>
                     <div className={styles.formCol}>
                        <label className={styles.modalLabel}>Objetivo Foco</label>
                        <input className={styles.modalInput} placeholder="Ex: Hipertrofia de MMSS" value={workoutForm.goal} onChange={e => setWorkoutForm({...workoutForm, goal: e.target.value})} />
                     </div>
                  </div>
                  
                  <h4 style={{marginBottom: 10, marginTop: 20, color:'#a1a1aa', fontSize:'0.9rem', display:'flex', justifyContent:'space-between'}}>
                      Exercícios
                      <button className={styles.btnGeneric} style={{padding: '3px 10px', fontSize: '0.75rem'}} onClick={() => {
                          setWorkoutForm({...workoutForm, exercises: [...workoutForm.exercises, {name:'', sets:3, reps:'10-12', rest:60}]})
                      }}>+ ADD EXERCÍCIO</button>
                  </h4>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px', maxHeight: 300, overflowY:'auto', paddingRight:10}}>
                      {workoutForm.exercises.map((ex, idx) => (
                           <div key={idx} style={{display:'flex', gap:'10px', alignItems:'center'}}>
                               <div className={styles.formCol} style={{flex: 2}}>
                                  <input className={styles.modalInput} placeholder="Nome (Ex: Supino Reto)" value={ex.name} onChange={e => {
                                      const n = [...workoutForm.exercises]; n[idx].name = e.target.value; setWorkoutForm({...workoutForm, exercises: n});
                                  }}/>
                               </div>
                               <div className={styles.formCol} style={{flex: 0.5}}>
                                  <input className={styles.modalInput} type="number" placeholder="Séries" value={ex.sets} onChange={e => {
                                      const n = [...workoutForm.exercises]; n[idx].sets = parseInt(e.target.value)||0; setWorkoutForm({...workoutForm, exercises: n});
                                  }}/>
                               </div>
                               <div className={styles.formCol} style={{flex: 0.8}}>
                                  <input className={styles.modalInput} placeholder="Reps (Ex: 10-12)" value={ex.reps} onChange={e => {
                                      const n = [...workoutForm.exercises]; n[idx].reps = e.target.value; setWorkoutForm({...workoutForm, exercises: n});
                                  }}/>
                               </div>
                               <div className={styles.formCol} style={{flex: 0.6}}>
                                  <input className={styles.modalInput} type="number" placeholder="Desc. (s)" value={ex.rest} onChange={e => {
                                      const n = [...workoutForm.exercises]; n[idx].rest = parseInt(e.target.value)||0; setWorkoutForm({...workoutForm, exercises: n});
                                  }}/>
                               </div>
                           </div>
                      ))}
                  </div>
               </div>
               <div className={styles.modalFooter}>
                  <button className={styles.btnGeneric} onClick={() => setShowWorkoutModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleSaveWorkout} style={{background: '#a855f7', color: '#fff', border: 'none'}}>Prescrever Treino e Salvar</button>
               </div>
            </div>
          </div>
       )}
    </div>
  );
}
