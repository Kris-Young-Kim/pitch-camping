-- =====================================================
-- 마이그레이션: 북마크 노트/메모 기능 추가
-- 작성일: 2025-01-08
-- 설명: bookmarks 테이블에 노트/메모 필드 추가
--       각 북마크에 개인 메모를 추가할 수 있도록 확장
-- =====================================================

-- =====================================================
-- bookmarks 테이블에 노트 필드 추가
-- =====================================================

-- 북마크 노트/메모 (사용자가 추가한 개인 메모)
ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS note TEXT;

-- 노트 업데이트 날짜
ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS note_updated_at TIMESTAMPTZ;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.bookmarks.note IS '북마크에 대한 사용자 개인 메모/노트';
COMMENT ON COLUMN public.bookmarks.note_updated_at IS '노트 마지막 업데이트 날짜';

-- 인덱스 생성 (메모 검색 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_note ON public.bookmarks USING gin(to_tsvector('korean', COALESCE(note, ''))) WHERE note IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookmarks_has_note ON public.bookmarks(note) WHERE note IS NOT NULL;

-- =====================================================
-- 노트 업데이트 날짜 자동 갱신 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION update_bookmark_note_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- note가 변경된 경우에만 업데이트
    IF NEW.note IS DISTINCT FROM OLD.note THEN
        NEW.note_updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_bookmark_note_updated_at ON public.bookmarks;
CREATE TRIGGER trigger_update_bookmark_note_updated_at
    BEFORE UPDATE ON public.bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_bookmark_note_updated_at();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 북마크 노트/메모 기능 추가 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 변경 사항:';
    RAISE NOTICE '   1. bookmarks 테이블에 note, note_updated_at 컬럼 추가';
    RAISE NOTICE '   2. 메모 검색을 위한 인덱스 생성 (Full-text search)';
    RAISE NOTICE '   3. 노트 업데이트 날짜 자동 갱신 트리거 생성';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스: bookmarks(note) - Full-text search 지원';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 북마크에 메모 추가';
    RAISE NOTICE '   UPDATE bookmarks SET note = ''이 여행지는 가족과 함께 가기 좋은 곳입니다.''';
    RAISE NOTICE '   WHERE id = ''bookmark_id'';';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 메모가 있는 북마크 조회';
    RAISE NOTICE '   SELECT * FROM bookmarks WHERE note IS NOT NULL;';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 메모 검색 (Full-text search)';
    RAISE NOTICE '   SELECT * FROM bookmarks';
    RAISE NOTICE '   WHERE to_tsvector(''korean'', note) @@ to_tsquery(''korean'', ''가족'');';
END $$;

