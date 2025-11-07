-- =====================================================
-- 마이그레이션: 반려동물 동반 여행 커뮤니티 테이블 추가
-- 작성일: 2025-01-08
-- 설명: 반려동물 동반 여행 후기, 팁, 체크리스트 공유 기능을 위한 테이블
-- =====================================================

-- =====================================================
-- pet_travel_posts 테이블: 반려동물 동반 여행 커뮤니티 게시글
-- =====================================================

CREATE TABLE public.pet_travel_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_type TEXT NOT NULL CHECK (post_type IN ('review', 'tip', 'checklist')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    travel_contentid TEXT REFERENCES public.travels(contentid) ON DELETE SET NULL, -- 여행지 ID (후기/정보 공유 시)
    images TEXT[], -- 이미지 URL 배열
    tags TEXT[], -- 태그 배열
    view_count INTEGER DEFAULT 0 NOT NULL,
    like_count INTEGER DEFAULT 0 NOT NULL,
    comment_count INTEGER DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL, -- 공개 여부
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.pet_travel_posts IS '반려동물 동반 여행 커뮤니티 게시글 (후기, 팁, 체크리스트)';
COMMENT ON COLUMN public.pet_travel_posts.post_type IS '게시글 유형 (review: 후기, tip: 팁, checklist: 체크리스트)';
COMMENT ON COLUMN public.pet_travel_posts.travel_contentid IS '관련 여행지 ID (후기/정보 공유 시 사용)';
COMMENT ON COLUMN public.pet_travel_posts.images IS '게시글에 첨부된 이미지 URL 배열';
COMMENT ON COLUMN public.pet_travel_posts.tags IS '게시글 태그 배열 (예: ["강아지", "펜션", "제주도"])';

CREATE INDEX idx_pet_travel_posts_user ON public.pet_travel_posts (user_id);
CREATE INDEX idx_pet_travel_posts_type ON public.pet_travel_posts (post_type);
CREATE INDEX idx_pet_travel_posts_travel ON public.pet_travel_posts (travel_contentid);
CREATE INDEX idx_pet_travel_posts_created ON public.pet_travel_posts (created_at DESC);
CREATE INDEX idx_pet_travel_posts_published ON public.pet_travel_posts (is_published) WHERE is_published = TRUE;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER set_pet_travel_posts_updated_at
BEFORE UPDATE ON public.pet_travel_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- pet_travel_post_likes 테이블: 게시글 좋아요
-- =====================================================

CREATE TABLE public.pet_travel_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.pet_travel_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(post_id, user_id) -- 사용자당 게시글당 하나의 좋아요만
);

COMMENT ON TABLE public.pet_travel_post_likes IS '반려동물 동반 여행 커뮤니티 게시글 좋아요';

CREATE INDEX idx_pet_travel_post_likes_post ON public.pet_travel_post_likes (post_id);
CREATE INDEX idx_pet_travel_post_likes_user ON public.pet_travel_post_likes (user_id);

-- 좋아요 개수 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_pet_travel_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.pet_travel_posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.pet_travel_posts
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pet_travel_post_like_count
AFTER INSERT OR DELETE ON public.pet_travel_post_likes
FOR EACH ROW
EXECUTE FUNCTION update_pet_travel_post_like_count();

-- =====================================================
-- pet_travel_post_comments 테이블: 게시글 댓글
-- =====================================================

CREATE TABLE public.pet_travel_post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.pet_travel_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.pet_travel_post_comments(id) ON DELETE CASCADE, -- 대댓글 지원
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.pet_travel_post_comments IS '반려동물 동반 여행 커뮤니티 게시글 댓글';
COMMENT ON COLUMN public.pet_travel_post_comments.parent_comment_id IS '대댓글인 경우 부모 댓글 ID';

CREATE INDEX idx_pet_travel_post_comments_post ON public.pet_travel_post_comments (post_id);
CREATE INDEX idx_pet_travel_post_comments_user ON public.pet_travel_post_comments (user_id);
CREATE INDEX idx_pet_travel_post_comments_parent ON public.pet_travel_post_comments (parent_comment_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER set_pet_travel_post_comments_updated_at
BEFORE UPDATE ON public.pet_travel_post_comments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 댓글 개수 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_pet_travel_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.pet_travel_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.pet_travel_posts
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pet_travel_post_comment_count
AFTER INSERT OR DELETE ON public.pet_travel_post_comments
FOR EACH ROW
EXECUTE FUNCTION update_pet_travel_post_comment_count();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 반려동물 동반 여행 커뮤니티 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 변경 사항:';
    RAISE NOTICE '   1. pet_travel_posts 테이블 생성 (게시글)';
    RAISE NOTICE '   2. pet_travel_post_likes 테이블 생성 (좋아요)';
    RAISE NOTICE '   3. pet_travel_post_comments 테이블 생성 (댓글)';
    RAISE NOTICE '   4. 좋아요/댓글 개수 자동 업데이트 트리거 추가';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 후기 게시글 작성';
    RAISE NOTICE '   INSERT INTO pet_travel_posts (user_id, post_type, title, content, travel_contentid) VALUES (''<user_uuid>'', ''review'', ''제목'', ''내용'', ''<content_id>'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 팁 게시글 작성';
    RAISE NOTICE '   INSERT INTO pet_travel_posts (user_id, post_type, title, content, tags) VALUES (''<user_uuid>'', ''tip'', ''제목'', ''내용'', ARRAY[''강아지'', ''펜션'']);';
END $$;

