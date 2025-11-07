-- =====================================================
-- 마이그레이션: 비용 추적 테이블 추가
-- 작성일: 2025-01-08
-- 설명: API 호출 수, 서비스 사용량 등을 추적하여 비용 분석
-- =====================================================

-- =====================================================
-- api_usage_logs 테이블: API 호출 추적
-- =====================================================

CREATE TABLE public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL CHECK (service_name IN ('vercel', 'supabase', 'naver_map', 'tour_api', 'clerk')),
    operation_type TEXT NOT NULL, -- 예: 'function_invocation', 'api_request', 'geocoding', 'search_travel'
    endpoint TEXT, -- API 엔드포인트 또는 함수 이름
    cost_per_unit NUMERIC DEFAULT 0, -- 단위당 비용 (원 또는 달러)
    units NUMERIC DEFAULT 1, -- 사용량 단위 (호출 수, GB, 시간 등)
    total_cost NUMERIC DEFAULT 0, -- 총 비용 (cost_per_unit * units)
    metadata JSONB, -- 추가 메타데이터 (요청 크기, 응답 크기, 실행 시간 등)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.api_usage_logs IS 'API 사용량 및 비용 추적 테이블';
COMMENT ON COLUMN public.api_usage_logs.service_name IS '서비스 이름 (vercel, supabase, naver_map, tour_api, clerk)';
COMMENT ON COLUMN public.api_usage_logs.operation_type IS '작업 유형 (function_invocation, api_request, geocoding 등)';
COMMENT ON COLUMN public.api_usage_logs.endpoint IS 'API 엔드포인트 또는 함수 이름';
COMMENT ON COLUMN public.api_usage_logs.cost_per_unit IS '단위당 비용';
COMMENT ON COLUMN public.api_usage_logs.units IS '사용량 단위';
COMMENT ON COLUMN public.api_usage_logs.total_cost IS '총 비용';
COMMENT ON COLUMN public.api_usage_logs.metadata IS '추가 메타데이터 (JSON 형식)';

CREATE INDEX idx_api_usage_logs_service ON public.api_usage_logs (service_name);
CREATE INDEX idx_api_usage_logs_operation ON public.api_usage_logs (operation_type);
CREATE INDEX idx_api_usage_logs_created ON public.api_usage_logs (created_at DESC);

-- =====================================================
-- service_usage_stats 테이블: 서비스별 사용량 통계 (일별 집계)
-- =====================================================

CREATE TABLE public.service_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL CHECK (service_name IN ('vercel', 'supabase', 'naver_map', 'tour_api', 'clerk')),
    stat_date DATE NOT NULL, -- 통계 날짜
    operation_type TEXT NOT NULL,
    total_units NUMERIC DEFAULT 0, -- 총 사용량
    total_cost NUMERIC DEFAULT 0, -- 총 비용
    metadata JSONB, -- 추가 통계 정보
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(service_name, stat_date, operation_type)
);

COMMENT ON TABLE public.service_usage_stats IS '서비스별 일별 사용량 통계 테이블';
COMMENT ON COLUMN public.service_usage_stats.service_name IS '서비스 이름';
COMMENT ON COLUMN public.service_usage_stats.stat_date IS '통계 날짜';
COMMENT ON COLUMN public.service_usage_stats.operation_type IS '작업 유형';
COMMENT ON COLUMN public.service_usage_stats.total_units IS '총 사용량';
COMMENT ON COLUMN public.service_usage_stats.total_cost IS '총 비용';

CREATE INDEX idx_service_usage_stats_service ON public.service_usage_stats (service_name);
CREATE INDEX idx_service_usage_stats_date ON public.service_usage_stats (stat_date DESC);

-- =====================================================
-- 업데이트 트리거: updated_at 자동 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_service_usage_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_usage_stats_updated_at
    BEFORE UPDATE ON public.service_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_service_usage_stats_updated_at();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 비용 추적 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. api_usage_logs (API 사용량 로그)';
    RAISE NOTICE '   2. service_usage_stats (서비스별 일별 통계)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 네이버 지도 API 호출 기록';
    RAISE NOTICE '   INSERT INTO api_usage_logs (service_name, operation_type, cost_per_unit, units, total_cost)';
    RAISE NOTICE '   VALUES (''naver_map'', ''geocoding'', 0.5, 1, 0.5);';
END $$;

