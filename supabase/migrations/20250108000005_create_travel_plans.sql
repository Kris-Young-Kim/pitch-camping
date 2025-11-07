-- =====================================================
-- 마이그레이션: 여행 일정 계획 기능 추가
-- 작성일: 2025-01-08
-- 설명: 북마크한 여행지를 일정에 추가하여 여행 계획을 세울 수 있는 기능
--       travel_plans 테이블과 travel_plan_items 테이블 생성
-- =====================================================

-- =====================================================
-- travel_plans 테이블 생성 (여행 일정)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.travel_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in_progress', 'completed', 'cancelled')),
    is_public BOOLEAN DEFAULT false, -- 공개 여부
    share_token TEXT UNIQUE, -- 공유 토큰 (공개 일정용)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.travel_plans OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON public.travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_start_date ON public.travel_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON public.travel_plans(status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_share_token ON public.travel_plans(share_token) WHERE share_token IS NOT NULL;

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.travel_plans DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.travel_plans TO anon;
GRANT ALL ON TABLE public.travel_plans TO authenticated;
GRANT ALL ON TABLE public.travel_plans TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.travel_plans IS '여행 일정 계획';
COMMENT ON COLUMN public.travel_plans.user_id IS '일정을 만든 사용자 ID';
COMMENT ON COLUMN public.travel_plans.title IS '일정 제목';
COMMENT ON COLUMN public.travel_plans.description IS '일정 설명';
COMMENT ON COLUMN public.travel_plans.start_date IS '여행 시작일';
COMMENT ON COLUMN public.travel_plans.end_date IS '여행 종료일';
COMMENT ON COLUMN public.travel_plans.status IS '일정 상태: draft(초안), planned(계획됨), in_progress(진행중), completed(완료), cancelled(취소)';
COMMENT ON COLUMN public.travel_plans.is_public IS '공개 여부 (true: 공개, false: 비공개)';
COMMENT ON COLUMN public.travel_plans.share_token IS '공유 토큰 (공개 일정 접근용)';

-- =====================================================
-- travel_plan_items 테이블 생성 (일정별 여행지)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.travel_plan_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL, -- 여행지 contentid
    day_number INTEGER NOT NULL CHECK (day_number >= 1), -- 여행 일차 (1일차, 2일차 등)
    order_index INTEGER NOT NULL DEFAULT 0, -- 같은 일차 내 순서
    visit_date DATE, -- 방문 예정일 (선택적)
    visit_time TIME, -- 방문 예정 시간 (선택적)
    notes TEXT, -- 일정별 메모
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- 같은 일정에서 같은 여행지를 중복 추가하는 것을 방지
    UNIQUE(plan_id, content_id, day_number)
);

-- 테이블 소유자 설정
ALTER TABLE public.travel_plan_items OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_plan_id ON public.travel_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_content_id ON public.travel_plan_items(content_id);
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_day_number ON public.travel_plan_items(plan_id, day_number);
CREATE INDEX IF NOT EXISTS idx_travel_plan_items_visit_date ON public.travel_plan_items(visit_date);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.travel_plan_items DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.travel_plan_items TO anon;
GRANT ALL ON TABLE public.travel_plan_items TO authenticated;
GRANT ALL ON TABLE public.travel_plan_items TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.travel_plan_items IS '여행 일정별 여행지';
COMMENT ON COLUMN public.travel_plan_items.plan_id IS 'travel_plans 테이블의 일정 ID';
COMMENT ON COLUMN public.travel_plan_items.content_id IS '여행지 contentid';
COMMENT ON COLUMN public.travel_plan_items.day_number IS '여행 일차 (1일차, 2일차 등)';
COMMENT ON COLUMN public.travel_plan_items.order_index IS '같은 일차 내 순서 (0부터 시작)';
COMMENT ON COLUMN public.travel_plan_items.visit_date IS '방문 예정일 (선택적)';
COMMENT ON COLUMN public.travel_plan_items.visit_time IS '방문 예정 시간 (선택적)';
COMMENT ON COLUMN public.travel_plan_items.notes IS '일정별 메모';

-- =====================================================
-- updated_at 자동 업데이트 트리거 함수
-- =====================================================

-- travel_plans 테이블용
CREATE OR REPLACE FUNCTION update_travel_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_travel_plan_updated_at ON public.travel_plans;
CREATE TRIGGER trigger_update_travel_plan_updated_at
    BEFORE UPDATE ON public.travel_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_travel_plan_updated_at();

-- travel_plan_items 테이블용
CREATE OR REPLACE FUNCTION update_travel_plan_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_travel_plan_item_updated_at ON public.travel_plan_items;
CREATE TRIGGER trigger_update_travel_plan_item_updated_at
    BEFORE UPDATE ON public.travel_plan_items
    FOR EACH ROW
    EXECUTE FUNCTION update_travel_plan_item_updated_at();

-- =====================================================
-- 공유 토큰 생성 함수
-- =====================================================

CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 공유 토큰 자동 생성 트리거 (is_public이 true일 때)
CREATE OR REPLACE FUNCTION auto_generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_public = true AND (NEW.share_token IS NULL OR NEW.share_token = '') THEN
        NEW.share_token := generate_share_token();
    ELSIF NEW.is_public = false THEN
        NEW.share_token := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_share_token ON public.travel_plans;
CREATE TRIGGER trigger_auto_generate_share_token
    BEFORE INSERT OR UPDATE ON public.travel_plans
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_share_token();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 여행 일정 계획 기능 추가 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 변경 사항:';
    RAISE NOTICE '   1. travel_plans 테이블 생성 (여행 일정)';
    RAISE NOTICE '   2. travel_plan_items 테이블 생성 (일정별 여행지)';
    RAISE NOTICE '   3. 공유 토큰 자동 생성 트리거';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스:';
    RAISE NOTICE '   - travel_plans(user_id, start_date, status, share_token)';
    RAISE NOTICE '   - travel_plan_items(plan_id, content_id, day_number, visit_date)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 여행 일정 생성';
    RAISE NOTICE '   INSERT INTO travel_plans (user_id, title, start_date, end_date)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''제주도 여행'', ''2025-02-01'', ''2025-02-03'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 일정에 여행지 추가';
    RAISE NOTICE '   INSERT INTO travel_plan_items (plan_id, content_id, day_number, order_index)';
    RAISE NOTICE '   VALUES (''plan-uuid'', ''125266'', 1, 0);';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 일정 조회';
    RAISE NOTICE '   SELECT * FROM travel_plans WHERE user_id = ''user-uuid'';';
END $$;

