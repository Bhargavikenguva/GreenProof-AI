-- ==============================================================================
-- GREENPROOF AI — SUPABASE POSTGRESQL MIGRATION
-- Migration: 20261013000000_create_greenproof_schema.sql
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. PROFILES & ROLES TABLE (Links to Supabase auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'reviewer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'user' -- Normal registration always enforces standard user role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. ASSESSMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_description TEXT DEFAULT '',
    
    -- Packaging photo metadata & storage location
    product_image JSONB DEFAULT '{}'::jsonb,
    
    -- Multimodal Vision OCR Findings (Step 2)
    image_analysis JSONB DEFAULT '{
        "productDescription": "",
        "detectedClaims": [],
        "imageObservations": "",
        "ocrUncertainty": null,
        "hasVisibleEnvironmentalClaims": false
    }'::jsonb,
    
    -- Selected Claim to investigate (Step 3)
    selected_claim JSONB DEFAULT NULL,
    
    -- Audit Status: Enforcing exact 4 standardized status labels + workflow states
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (
        status IN (
            'Draft',
            'Claims Detected',
            'Evidence Attached',
            'Supported by available evidence',
            'Insufficient evidence',
            'Potential inconsistency',
            'Needs human review'
        )
    ),
    
    -- Evidence-Based AI Assessment Findings (Step 5 & 6)
    assessment_result JSONB DEFAULT NULL,
    
    -- Specialist Review Flag
    review_request JSONB DEFAULT '{"requested": false, "requestedAt": null, "reason": ""}'::jsonb,
    human_review_decision_id UUID DEFAULT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. EVIDENCE DOCUMENTS TABLE (Step 4)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt')),
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    extraction_status TEXT NOT NULL DEFAULT 'success' CHECK (extraction_status IN ('success', 'partial', 'failed')),
    extracted_text TEXT DEFAULT '',
    page_count INT DEFAULT 1,
    passages JSONB DEFAULT '[]'::jsonb,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_docs_assessment_id ON public.evidence_documents(assessment_id);

-- -----------------------------------------------------------------------------
-- 4. ASSESSMENT VERSIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    assessment_result JSONB NOT NULL,
    trigger TEXT NOT NULL DEFAULT 'initial_assessment',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_versions ON public.assessment_versions(assessment_id, version_number);

-- -----------------------------------------------------------------------------
-- 5. HUMAN REVIEWS TABLE (Specialist Auditor Decisions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.human_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (
        decision IN ('Approved', 'Rejected', 'Clarification Requested', 'Needs Specialist Testing')
    ),
    notes TEXT NOT NULL,
    requested_additional_evidence TEXT[] DEFAULT ARRAY[]::TEXT[],
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assessments 
    DROP CONSTRAINT IF EXISTS fk_human_review_decision;
ALTER TABLE public.assessments
    ADD CONSTRAINT fk_human_review_decision 
    FOREIGN KEY (human_review_decision_id) 
    REFERENCES public.human_reviews(id) 
    ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_reviews ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is reviewer or admin
CREATE OR REPLACE FUNCTION public.is_reviewer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('reviewer', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users read their own profile; reviewers read profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_reviewer_or_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Assessments: users read/write their own; reviewers read all and update decisions
DROP POLICY IF EXISTS "Users can manage own assessments" ON public.assessments;
CREATE POLICY "Users can manage own assessments" ON public.assessments
    FOR ALL USING (auth.uid() = user_id OR public.is_reviewer_or_admin());

-- Evidence Documents: users manage docs for their assessments; reviewers read
DROP POLICY IF EXISTS "Users can manage own evidence" ON public.evidence_documents;
CREATE POLICY "Users can manage own evidence" ON public.evidence_documents
    FOR ALL USING (auth.uid() = uploaded_by OR public.is_reviewer_or_admin());

-- Assessment Versions
DROP POLICY IF EXISTS "Users can read own versions" ON public.assessment_versions;
CREATE POLICY "Users can read own versions" ON public.assessment_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessments a 
            WHERE a.id = assessment_id AND (a.user_id = auth.uid() OR public.is_reviewer_or_admin())
        )
    );

-- Human Reviews: reviewers create decisions; owners read decisions
DROP POLICY IF EXISTS "Reviewers can manage reviews" ON public.human_reviews;
CREATE POLICY "Reviewers can manage reviews" ON public.human_reviews
    FOR ALL USING (public.is_reviewer_or_admin() OR EXISTS (
        SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS (Packaging Photos & Evidence Documents)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('packaging-photos', 'packaging-photos', true),
    ('evidence-documents', 'evidence-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Anyone can read packaging-photos; authenticated can upload
DROP POLICY IF EXISTS "Public packaging photo read" ON storage.objects;
CREATE POLICY "Public packaging photo read" ON storage.objects
    FOR SELECT USING (bucket_id = 'packaging-photos');

DROP POLICY IF EXISTS "Authenticated users upload packaging photo" ON storage.objects;
CREATE POLICY "Authenticated users upload packaging photo" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'packaging-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Evidence documents access restricted" ON storage.objects;
CREATE POLICY "Evidence documents access restricted" ON storage.objects
    FOR ALL USING (bucket_id = 'evidence-documents' AND auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 8. ENVIRONMENT VARIABLES SQL GENERATOR FUNCTION
-- Executes a SQL command: SELECT * FROM get_greenproof_env_variables();
-- Returns all required environment variables ready to paste into your .env files!
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_greenproof_env_variables()
RETURNS TABLE(target TEXT, variable_name TEXT, recommended_value TEXT, description TEXT) AS $$
BEGIN
    -- Backend Variables
    RETURN QUERY VALUES
        ('BACKEND', 'PORT', '5000', 'Local Express API port'),
        ('BACKEND', 'NODE_ENV', 'development', 'Runtime environment (development / production)'),
        ('BACKEND', 'SUPABASE_URL', current_setting('request.headers', true)::json->>'host', 'Supabase project API URL'),
        ('BACKEND', 'SUPABASE_SERVICE_ROLE_KEY', 'your_service_role_key_from_dashboard', 'Supabase Secret Service Role Key for server administration'),
        ('BACKEND', 'JWT_SECRET', encode(gen_random_bytes(32), 'hex'), 'Generated secure 32-byte JWT signing secret'),
        ('BACKEND', 'JWT_EXPIRES_IN', '7d', 'Authentication token validity lifespan'),
        ('BACKEND', 'GEMINI_API_KEY', 'your_gemini_api_key_from_google_ai_studio', 'Official Google Gemini 2.5 Flash API Key'),
        ('BACKEND', 'CLIENT_URL', 'http://localhost:5173', 'Allowed frontend origins for CORS');

    -- Frontend Variables
    RETURN QUERY VALUES
        ('FRONTEND', 'VITE_API_URL', 'http://localhost:5000/api', 'Backend API endpoint'),
        ('FRONTEND', 'VITE_BACKEND_URL', 'http://localhost:5000', 'Backend base origin for serving packaging uploads'),
        ('FRONTEND', 'VITE_SUPABASE_URL', current_setting('request.headers', true)::json->>'host', 'Supabase URL for direct client connectivity'),
        ('FRONTEND', 'VITE_SUPABASE_ANON_KEY', 'your_supabase_anon_public_key', 'Supabase Anonymous Public Key'),
        ('FRONTEND', 'VITE_APP_NAME', 'GreenProof AI', 'Application branding title');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Formatted text function for instant copy-pasting
CREATE OR REPLACE FUNCTION public.print_env_template()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
    rec RECORD;
BEGIN
    result := E'# ==========================================\n# GREENPROOF AI - GENERATED CONFIGURATION\n# ==========================================\n\n# --- SERVER .ENV ---\n';
    FOR rec IN SELECT * FROM public.get_greenproof_env_variables() WHERE target = 'BACKEND' LOOP
        result := result || rec.variable_name || '=' || rec.recommended_value || E'\n';
    END LOOP;
    
    result := result || E'\n# --- CLIENT .ENV ---\n';
    FOR rec IN SELECT * FROM public.get_greenproof_env_variables() WHERE target = 'FRONTEND' LOOP
        result := result || rec.variable_name || '=' || rec.recommended_value || E'\n';
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
