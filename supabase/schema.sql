-- Criação de Tabelas do SaaS Nerofit (Executar no SQL Editor do Supabase)

-- Habilitação de extensão pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELA TENANTS (Academias/Profissionais - as contas principais)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#4ade80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. TABELA PROFILES (Usuários) vinculada à tabela Auth.users do Supabase
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    cref TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('ADMIN', 'TRAINER', 'NUTRITIONIST', 'STUDENT')) DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. TABELA STUDENTS_EXTRAS (Ficha anamnese básica)
CREATE TABLE public.student_details (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    goals TEXT,
    injuries TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- 4. TABELA PLANS (Planos Financeiros / Mensalidades)
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL, -- Valores sempre em centavos para evitar bug de float
    frequency TEXT CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL')) DEFAULT 'MONTHLY',
    max_sessions_included INTEGER, -- Controle opcional de limite (Ex: plano de 4 aulas/mes)
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 5. TABELA SUBSCRIPTIONS (Assinaturas ativas dos alunos)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING')) DEFAULT 'ACTIVE',
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5A. TABELA INVOICES (Faturas / Cobranças p/ Gateway de Pagamento BR)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('INCOME', 'EXPENSE')) DEFAULT 'INCOME',
    description TEXT,
    amount_cents INTEGER NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'REFUNDED')) DEFAULT 'PENDING',
    due_date DATE NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('PIX', 'CREDIT_CARD', 'BOLETO', 'CASH')),
    gateway_id TEXT, -- ID da cobrança no Asaas ou MercadoPago
    gateway_url TEXT, -- Link da fatura ou link do QR Code PIX
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS DE RLS (Row Level Security) BÁSICAS DE ISOLAMENTO (TENANT ISOLATION)
-- ==============================================================================

-- Tenants: O perfil 'ADMIN' pode ler apenas o seu próprio Tenant.
CREATE POLICY "Users can view their own tenant"
    ON public.tenants FOR SELECT
    USING (id IN (SELECT tenant_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- Profiles: Usuários daquele Tenant podem ver outros do mesmo Tenant (e.g. Professor vê alunos)
CREATE POLICY "Users can view profiles in same tenant"
    ON public.profiles FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Profiles: O usuário dono pode atualizar seu perfil
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- Student details: Pode ser lido por qualquer pessoa no mesmo tenant do dono
CREATE POLICY "Users can view student details in same tenant"
    ON public.student_details FOR SELECT
    USING (
       profile_id IN (
         SELECT p1.id FROM public.profiles p1
         WHERE p1.tenant_id IN (SELECT p2.tenant_id FROM public.profiles p2 WHERE p2.id = auth.uid())
       )
    );

-- Plans & Subscriptions seguem lógica de Tenant Isolation para leitura:
CREATE POLICY "Admins read plans"
    ON public.plans FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins read subscriptions"
    ON public.subscriptions FOR SELECT
    USING (
       student_id IN (
          SELECT p1.id FROM public.profiles p1 
          WHERE p1.tenant_id IN (SELECT p2.tenant_id FROM public.profiles p2 WHERE p2.id = auth.uid() AND role = 'ADMIN')
       )
    );

CREATE POLICY "Admins read invoices"
    ON public.invoices FOR ALL
    USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 6. TABELA AGENDA_EVENTS (Eventos da Agenda)
CREATE TABLE public.agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CONSULTA', 'COMPROMISSO', 'EVENTO')),
    title TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    client_name TEXT,
    client_phone TEXT,
    description TEXT,
    google_meet BOOLEAN DEFAULT false,
    event_type TEXT,
    max_capacity INTEGER,
    cep TEXT,
    address TEXT,
    attendance TEXT CHECK (attendance IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage events in their tenant"
    ON public.agenda_events FOR ALL
    USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =================================================================================
-- 7. TABELA PHYSICAL_EVALUATIONS (Avaliações físicas completas 7 Dobras + Postural)
-- =================================================================================
CREATE TABLE public.physical_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    fat_percentage NUMERIC,
    muscle_mass_kg NUMERIC,
    -- Dobras de Pollock
    fold_chest NUMERIC, fold_abdominal NUMERIC, fold_thigh NUMERIC, 
    fold_triceps NUMERIC, fold_subscapular NUMERIC, fold_suprailiac NUMERIC, fold_midaxillary NUMERIC,
    -- Image urls (from Supabase Storage)
    front_image_url TEXT, side_image_url TEXT, back_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.physical_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evaluations in their tenant"
    ON public.physical_evaluations FOR ALL
    USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =================================================================================
-- 8. TABELA WORKOUT_PRESCRIPTIONS (A Ficha Mãe - ex: Treino A Inverno)
-- =================================================================================
CREATE TABLE public.workout_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, 
    goal TEXT, 
    level TEXT CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workout_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workouts in their tenant"
    ON public.workout_prescriptions FOR ALL
    USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- ==============================================================================
-- NOVIDADE: BIBLIOTECA DE EXERCÍCIOS E TEMPLATES DE ANAMNESE
-- ==============================================================================

CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view exercises in same tenant" ON public.exercises FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('ANAMNESE', 'TERMO_RISCO', 'DIETA')),
    title TEXT NOT NULL,
    content TEXT, -- JSON ou Texto formatado guardando a estrutura do form
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view templates in same tenant" ON public.templates FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- ==============================================================================
-- DADOS MOCKADOS INICIAIS (Apenas para Testes em Dev Local)
-- =================================================================================

-- 9. TABELA WORKOUT_ITEMS (Exercícios dentro da Ficha)
CREATE TABLE public.workout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.workout_prescriptions(id) ON DELETE CASCADE NOT NULL,
    exercise_name TEXT NOT NULL, 
    sets INTEGER NOT NULL DEFAULT 3,
    reps TEXT NOT NULL DEFAULT '10-12', 
    rest_seconds INTEGER DEFAULT 60,
    video_url TEXT, 
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workout_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workout items via prescription"
    ON public.workout_items FOR ALL
    USING (
       prescription_id IN (
          SELECT w.id FROM public.workout_prescriptions w
          WHERE w.tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
       )
    );
