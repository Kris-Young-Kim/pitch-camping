-- =====================================================
-- 마이그레이션: 성능 모니터링 테이블 추가
-- 작성일: 2025-01-08
-- 설명: API 응답 시간, 페이지 로드 시간, 에러율 등을 추적하는 테이블
-- =====================================================

-- =====================================================
-- performance_metrics 테이블: 성능 메트릭 저장
-- =====================================================

CREATE TABLE public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL CHECK (metric_type IN ('api_response', 'page_load', 'web_vital', 'db_query')),
    metric_name TEXT NOT NULL, -- 예: 'api_response_time', 'lcp', 'fid', 'cls'
    endpoint TEXT, -- API 엔드포인트 또는 페이지 경로
    value NUMERIC NOT NULL, -- 메트릭 값 (ms 또는 기타 단위)
    unit TEXT DEFAULT 'ms', -- 단위 (ms, s, count 등)
    metadata JSONB, -- 추가 메타데이터 (에러 정보, 쿼리 정보 등)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.performance_metrics IS '성능 메트릭 저장 테이블 (API 응답 시간, 페이지 로드 시간, Web Vitals 등)';
COMMENT ON COLUMN public.performance_metrics.metric_type IS '메트릭 유형 (api_response, page_load, web_vital, db_query)';
COMMENT ON COLUMN public.performance_metrics.metric_name IS '메트릭 이름 (예: api_response_time, lcp, fid, cls)';
COMMENT ON COLUMN public.performance_metrics.endpoint IS 'API 엔드포인트 또는 페이지 경로';
COMMENT ON COLUMN public.performance_metrics.value IS '메트릭 값';
COMMENT ON COLUMN public.performance_metrics.metadata IS '추가 메타데이터 (JSON 형식)';

CREATE INDEX idx_performance_metrics_type ON public.performance_metrics (metric_type);
CREATE INDEX idx_performance_metrics_name ON public.performance_metrics (metric_name);
CREATE INDEX idx_performance_metrics_endpoint ON public.performance_metrics (endpoint);
CREATE INDEX idx_performance_metrics_created ON public.performance_metrics (created_at DESC);

-- =====================================================
-- error_logs 테이블: 에러 로그 저장
-- =====================================================

CREATE TABLE public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL CHECK (error_type IN ('api_error', 'page_error', 'db_error', 'other')),
    error_message TEXT NOT NULL,
    error_stack TEXT, -- 스택 트레이스
    endpoint TEXT, -- 에러가 발생한 엔드포인트 또는 페이지
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 에러 발생 사용자 (선택적)
    metadata JSONB, -- 추가 메타데이터 (요청 정보, 브라우저 정보 등)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.error_logs IS '에러 로그 저장 테이블';
COMMENT ON COLUMN public.error_logs.error_type IS '에러 유형 (api_error, page_error, db_error, other)';
COMMENT ON COLUMN public.error_logs.error_message IS '에러 메시지';
COMMENT ON COLUMN public.error_logs.error_stack IS '스택 트레이스';
COMMENT ON COLUMN public.error_logs.endpoint IS '에러가 발생한 엔드포인트 또는 페이지';
COMMENT ON COLUMN public.error_logs.metadata IS '추가 메타데이터 (JSON 형식)';

CREATE INDEX idx_error_logs_type ON public.error_logs (error_type);
CREATE INDEX idx_error_logs_endpoint ON public.error_logs (endpoint);
CREATE INDEX idx_error_logs_created ON public.error_logs (created_at DESC);

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 성능 모니터링 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. performance_metrics (성능 메트릭)';
    RAISE NOTICE '   2. error_logs (에러 로그)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- API 응답 시간 기록';
    RAISE NOTICE '   INSERT INTO performance_metrics (metric_type, metric_name, endpoint, value) VALUES (''api_response'', ''api_response_time'', ''/api/travels'', 250);';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 에러 로그 기록';
    RAISE NOTICE '   INSERT INTO error_logs (error_type, error_message, endpoint) VALUES (''api_error'', ''Internal Server Error'', ''/api/travels'');';
END $$;

