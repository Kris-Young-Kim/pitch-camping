-- =====================================================
-- 마이그레이션: 통계 테이블 생성
-- 작성일: 2025-11-06
-- 설명: 캠핑장 통계 및 사용자 활동 추적을 위한 테이블 생성
--       - camping_stats: 캠핑장별 통계 (조회수, 북마크 수)
--       - user_activity: 사용자 활동 기록 (조회, 북마크, 공유)
-- =====================================================

-- =====================================================
-- camping_stats 테이블 (캠핑장 통계)
-- =====================================================
-- 캠핑장별 통계 정보를 저장하는 테이블
-- 조회수, 북마크 수 등을 집계하여 관리

CREATE TABLE IF NOT EXISTS public.camping_stats (
    content_id TEXT PRIMARY KEY,  -- 고캠핑 API의 contentId
    view_count INTEGER DEFAULT 0 NOT NULL,
    bookmark_count INTEGER DEFAULT 0 NOT NULL,
    share_count INTEGER DEFAULT 0 NOT NULL,
    last_viewed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.camping_stats OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_camping_stats_view_count ON public.camping_stats(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_camping_stats_bookmark_count ON public.camping_stats(bookmark_count DESC);
CREATE INDEX IF NOT EXISTS idx_camping_stats_updated_at ON public.camping_stats(updated_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.camping_stats DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.camping_stats TO anon;
GRANT ALL ON TABLE public.camping_stats TO authenticated;
GRANT ALL ON TABLE public.camping_stats TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.camping_stats IS '캠핑장별 통계 정보 (조회수, 북마크 수, 공유 수)';
COMMENT ON COLUMN public.camping_stats.content_id IS '고캠핑 API contentId';
COMMENT ON COLUMN public.camping_stats.view_count IS '총 조회 수';
COMMENT ON COLUMN public.camping_stats.bookmark_count IS '총 북마크 수';
COMMENT ON COLUMN public.camping_stats.share_count IS '총 공유 수';

-- =====================================================
-- user_activity 테이블 (사용자 활동 기록)
-- =====================================================
-- 사용자의 활동을 기록하는 테이블
-- 조회, 북마크, 공유 등의 활동을 추적

CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,  -- 고캠핑 API의 contentId
    activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'bookmark', 'share')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.user_activity OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_content_id ON public.user_activity(content_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_content ON public.user_activity(user_id, content_id, activity_type);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.user_activity DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.user_activity TO anon;
GRANT ALL ON TABLE public.user_activity TO authenticated;
GRANT ALL ON TABLE public.user_activity TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.user_activity IS '사용자 활동 기록 (조회, 북마크, 공유)';
COMMENT ON COLUMN public.user_activity.user_id IS 'users 테이블의 사용자 ID (NULL 가능, 비인증 사용자 활동 추적)';
COMMENT ON COLUMN public.user_activity.content_id IS '고캠핑 API contentId';
COMMENT ON COLUMN public.user_activity.activity_type IS '활동 유형: view(조회), bookmark(북마크), share(공유)';

-- =====================================================
-- 통계 업데이트 함수 (트리거용)
-- =====================================================
-- 북마크 추가/삭제 시 camping_stats.bookmark_count 자동 업데이트

CREATE OR REPLACE FUNCTION update_camping_stats_bookmark()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 북마크 추가 시 bookmark_count 증가
        INSERT INTO public.camping_stats (content_id, bookmark_count, updated_at)
        VALUES (NEW.content_id, 1, now())
        ON CONFLICT (content_id) 
        DO UPDATE SET 
            bookmark_count = camping_stats.bookmark_count + 1,
            updated_at = now();
    ELSIF TG_OP = 'DELETE' THEN
        -- 북마크 삭제 시 bookmark_count 감소
        UPDATE public.camping_stats
        SET bookmark_count = GREATEST(bookmark_count - 1, 0),
            updated_at = now()
        WHERE content_id = OLD.content_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_bookmark_stats ON public.bookmarks;
CREATE TRIGGER trigger_update_bookmark_stats
    AFTER INSERT OR DELETE ON public.bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_camping_stats_bookmark();

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 통계 테이블 마이그레이션 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. camping_stats (캠핑장 통계)';
    RAISE NOTICE '   2. user_activity (사용자 활동 기록)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스 생성 완료';
    RAISE NOTICE '⚙️ 트리거 생성: bookmark_count 자동 업데이트';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 조회수 증가';
    RAISE NOTICE '   INSERT INTO camping_stats (content_id, view_count)';
    RAISE NOTICE '   VALUES (''125266'', 1)';
    RAISE NOTICE '   ON CONFLICT (content_id) DO UPDATE SET view_count = camping_stats.view_count + 1;';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 사용자 활동 기록';
    RAISE NOTICE '   INSERT INTO user_activity (user_id, content_id, activity_type)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''125266'', ''view'');';
END $$;

