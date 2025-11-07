-- =====================================================
-- 마이그레이션: 리포트 테이블 추가
-- 작성일: 2025-01-08
-- 설명: 리포트 생성 및 템플릿 관리
-- =====================================================

-- =====================================================
-- report_templates 테이블: 리포트 템플릿 저장
-- =====================================================

CREATE TABLE public.report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 템플릿 이름
    description TEXT, -- 템플릿 설명
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')), -- 리포트 유형
    metrics JSONB NOT NULL, -- 포함할 지표 목록 (JSON 배열)
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'html', 'json')), -- 리포트 형식
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 생성자
    is_public BOOLEAN DEFAULT false, -- 공개 템플릿 여부
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.report_templates IS '리포트 템플릿 저장 테이블';
COMMENT ON COLUMN public.report_templates.name IS '템플릿 이름';
COMMENT ON COLUMN public.report_templates.description IS '템플릿 설명';
COMMENT ON COLUMN public.report_templates.report_type IS '리포트 유형 (daily, weekly, monthly, custom)';
COMMENT ON COLUMN public.report_templates.metrics IS '포함할 지표 목록 (JSON 배열)';
COMMENT ON COLUMN public.report_templates.format IS '리포트 형식 (pdf, html, json)';
COMMENT ON COLUMN public.report_templates.is_public IS '공개 템플릿 여부';

CREATE INDEX idx_report_templates_type ON public.report_templates (report_type);
CREATE INDEX idx_report_templates_created_by ON public.report_templates (created_by);

-- =====================================================
-- reports 테이블: 생성된 리포트 저장
-- =====================================================

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL, -- 사용된 템플릿
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')), -- 리포트 유형
    period_start DATE NOT NULL, -- 리포트 기간 시작
    period_end DATE NOT NULL, -- 리포트 기간 종료
    title TEXT NOT NULL, -- 리포트 제목
    data JSONB NOT NULL, -- 리포트 데이터 (JSON)
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'html', 'json')), -- 리포트 형식
    file_path TEXT, -- 파일 경로 (저장된 경우)
    file_size BIGINT, -- 파일 크기 (bytes)
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 생성자
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.reports IS '생성된 리포트 저장 테이블';
COMMENT ON COLUMN public.reports.template_id IS '사용된 템플릿 ID';
COMMENT ON COLUMN public.reports.report_type IS '리포트 유형';
COMMENT ON COLUMN public.reports.period_start IS '리포트 기간 시작';
COMMENT ON COLUMN public.reports.period_end IS '리포트 기간 종료';
COMMENT ON COLUMN public.reports.title IS '리포트 제목';
COMMENT ON COLUMN public.reports.data IS '리포트 데이터 (JSON)';
COMMENT ON COLUMN public.reports.format IS '리포트 형식';
COMMENT ON COLUMN public.reports.file_path IS '파일 경로';
COMMENT ON COLUMN public.reports.file_size IS '파일 크기 (bytes)';

CREATE INDEX idx_reports_type ON public.reports (report_type);
CREATE INDEX idx_reports_period ON public.reports (period_start, period_end);
CREATE INDEX idx_reports_created_by ON public.reports (created_by);
CREATE INDEX idx_reports_created_at ON public.reports (created_at DESC);

-- =====================================================
-- 업데이트 트리거: updated_at 자동 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_report_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_templates_updated_at
    BEFORE UPDATE ON public.report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_report_templates_updated_at();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 리포트 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. report_templates (리포트 템플릿)';
    RAISE NOTICE '   2. reports (생성된 리포트)';
END $$;

