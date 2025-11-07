-- =====================================================
-- 마이그레이션: 북마크 폴더 테이블 생성
-- 작성일: 2025-01-08
-- 설명: 북마크를 폴더별로 분류하여 관리할 수 있는 기능
--       사용자별로 폴더를 생성하고 북마크를 분류할 수 있음
-- =====================================================

-- =====================================================
-- bookmark_folders 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bookmark_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT, -- 폴더 색상 (선택 사항, 예: "#3B82F6")
    icon TEXT, -- 폴더 아이콘 (선택 사항, 예: "folder", "star", "heart")
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- 사용자별 폴더명 중복 방지
    CONSTRAINT unique_user_folder_name UNIQUE(user_id, name)
);

-- 테이블 소유자 설정
ALTER TABLE public.bookmark_folders OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmark_folders_user_id ON public.bookmark_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_folders_created_at ON public.bookmark_folders(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.bookmark_folders DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bookmark_folders TO anon;
GRANT ALL ON TABLE public.bookmark_folders TO authenticated;
GRANT ALL ON TABLE public.bookmark_folders TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.bookmark_folders IS '북마크 폴더 - 사용자가 북마크를 분류하기 위한 폴더';
COMMENT ON COLUMN public.bookmark_folders.user_id IS 'users 테이블의 사용자 ID';
COMMENT ON COLUMN public.bookmark_folders.name IS '폴더명';
COMMENT ON COLUMN public.bookmark_folders.description IS '폴더 설명 (선택 사항)';
COMMENT ON COLUMN public.bookmark_folders.color IS '폴더 색상 (HEX 코드, 선택 사항)';
COMMENT ON COLUMN public.bookmark_folders.icon IS '폴더 아이콘 이름 (선택 사항)';

-- =====================================================
-- bookmarks 테이블에 folder_id 컬럼 추가
-- =====================================================

ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.bookmark_folders(id) ON DELETE SET NULL;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder_id ON public.bookmarks(folder_id);

-- 컬럼 설명 추가
COMMENT ON COLUMN public.bookmarks.folder_id IS '북마크가 속한 폴더 ID (NULL이면 폴더 없음)';

-- =====================================================
-- updated_at 자동 업데이트 트리거 함수
-- =====================================================

CREATE OR REPLACE FUNCTION update_bookmark_folder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_bookmark_folder_updated_at ON public.bookmark_folders;
CREATE TRIGGER trigger_update_bookmark_folder_updated_at
    BEFORE UPDATE ON public.bookmark_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_bookmark_folder_updated_at();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 북마크 폴더 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. bookmark_folders (북마크 폴더)';
    RAISE NOTICE '   2. bookmarks 테이블에 folder_id 컬럼 추가';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스: bookmark_folders(user_id, created_at), bookmarks(folder_id)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 폴더 생성';
    RAISE NOTICE '   INSERT INTO bookmark_folders (user_id, name, description, color)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''가을 여행'', ''가을에 가고 싶은 곳들'', ''#FF6B6B'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 북마크를 폴더에 추가';
    RAISE NOTICE '   UPDATE bookmarks SET folder_id = ''folder-uuid'' WHERE id = ''bookmark-uuid'';';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 사용자의 폴더 목록 조회';
    RAISE NOTICE '   SELECT * FROM bookmark_folders WHERE user_id = ''user-uuid'' ORDER BY created_at DESC;';
END $$;

