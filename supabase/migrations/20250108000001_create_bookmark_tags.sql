-- =====================================================
-- 마이그레이션: 북마크 태그 테이블 생성
-- 작성일: 2025-01-08
-- 설명: 북마크에 태그를 추가하여 유연한 분류 및 검색 기능 제공
--       다대다 관계를 통해 하나의 북마크에 여러 태그를 추가할 수 있음
-- =====================================================

-- =====================================================
-- bookmark_tags 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bookmark_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT, -- 태그 색상 (선택 사항, 예: "#3B82F6")
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- 사용자별 태그명 중복 방지
    CONSTRAINT unique_user_tag_name UNIQUE(user_id, name)
);

-- 테이블 소유자 설정
ALTER TABLE public.bookmark_tags OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_user_id ON public.bookmark_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_name ON public.bookmark_tags(name);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_created_at ON public.bookmark_tags(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.bookmark_tags DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bookmark_tags TO anon;
GRANT ALL ON TABLE public.bookmark_tags TO authenticated;
GRANT ALL ON TABLE public.bookmark_tags TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.bookmark_tags IS '북마크 태그 - 사용자가 북마크를 분류하기 위한 태그';
COMMENT ON COLUMN public.bookmark_tags.user_id IS 'users 테이블의 사용자 ID';
COMMENT ON COLUMN public.bookmark_tags.name IS '태그명';
COMMENT ON COLUMN public.bookmark_tags.color IS '태그 색상 (HEX 코드, 선택 사항)';

-- =====================================================
-- bookmark_tag_relations 테이블 생성 (다대다 관계)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bookmark_tag_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bookmark_id UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.bookmark_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- 동일 북마크에 동일 태그 중복 방지
    CONSTRAINT unique_bookmark_tag UNIQUE(bookmark_id, tag_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.bookmark_tag_relations OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmark_tag_relations_bookmark_id ON public.bookmark_tag_relations(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tag_relations_tag_id ON public.bookmark_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tag_relations_created_at ON public.bookmark_tag_relations(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.bookmark_tag_relations DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bookmark_tag_relations TO anon;
GRANT ALL ON TABLE public.bookmark_tag_relations TO authenticated;
GRANT ALL ON TABLE public.bookmark_tag_relations TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.bookmark_tag_relations IS '북마크-태그 관계 테이블 (다대다 관계)';
COMMENT ON COLUMN public.bookmark_tag_relations.bookmark_id IS 'bookmarks 테이블의 북마크 ID';
COMMENT ON COLUMN public.bookmark_tag_relations.tag_id IS 'bookmark_tags 테이블의 태그 ID';

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 북마크 태그 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. bookmark_tags (북마크 태그)';
    RAISE NOTICE '   2. bookmark_tag_relations (북마크-태그 관계)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스: bookmark_tags(user_id, name, created_at), bookmark_tag_relations(bookmark_id, tag_id)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 태그 생성';
    RAISE NOTICE '   INSERT INTO bookmark_tags (user_id, name, color)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''가을여행'', ''#FF6B6B'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 북마크에 태그 추가';
    RAISE NOTICE '   INSERT INTO bookmark_tag_relations (bookmark_id, tag_id)';
    RAISE NOTICE '   VALUES (''bookmark-uuid'', ''tag-uuid'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 태그별 북마크 조회';
    RAISE NOTICE '   SELECT b.* FROM bookmarks b';
    RAISE NOTICE '   JOIN bookmark_tag_relations btr ON b.id = btr.bookmark_id';
    RAISE NOTICE '   WHERE btr.tag_id = ''tag-uuid'';';
END $$;

