-- =====================================================
-- 마이그레이션: 리뷰 테이블 생성
-- 작성일: 2025-11-06
-- 설명: 사용자 리뷰 및 평점 시스템을 위한 테이블 생성
--       - reviews: 캠핑장 리뷰 및 평점
--       - review_helpful: 리뷰 도움됨 기능 (선택적)
-- =====================================================

-- =====================================================
-- reviews 테이블 (리뷰 및 평점)
-- =====================================================
-- 사용자가 캠핑장에 대한 리뷰와 평점을 작성하는 테이블
-- 각 사용자는 동일한 캠핑장에 한 번만 리뷰 작성 가능

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,  -- 고캠핑 API의 contentId
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- 동일 사용자가 같은 캠핑장에 중복 리뷰 작성 방지
    CONSTRAINT unique_user_review UNIQUE(user_id, content_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.reviews OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_content_id ON public.reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.reviews IS '캠핑장 리뷰 및 평점';
COMMENT ON COLUMN public.reviews.user_id IS 'users 테이블의 사용자 ID';
COMMENT ON COLUMN public.reviews.content_id IS '고캠핑 API contentId';
COMMENT ON COLUMN public.reviews.rating IS '평점 (1-5점)';
COMMENT ON COLUMN public.reviews.comment IS '리뷰 내용';

-- =====================================================
-- review_helpful 테이블 (리뷰 도움됨 기능)
-- =====================================================
-- 사용자가 리뷰에 "도움됨" 표시를 남길 수 있는 기능
-- 각 사용자는 동일한 리뷰에 한 번만 도움됨 표시 가능

CREATE TABLE IF NOT EXISTS public.review_helpful (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- 동일 사용자가 같은 리뷰에 중복 도움됨 표시 방지
    CONSTRAINT unique_review_helpful UNIQUE(review_id, user_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.review_helpful OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON public.review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON public.review_helpful(user_id);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.review_helpful DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.review_helpful TO anon;
GRANT ALL ON TABLE public.review_helpful TO authenticated;
GRANT ALL ON TABLE public.review_helpful TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.review_helpful IS '리뷰 도움됨 표시';
COMMENT ON COLUMN public.review_helpful.review_id IS 'reviews 테이블의 리뷰 ID';
COMMENT ON COLUMN public.review_helpful.user_id IS 'users 테이블의 사용자 ID';

-- =====================================================
-- 평균 평점 계산 함수
-- =====================================================
-- 특정 캠핑장의 평균 평점을 계산하는 함수

CREATE OR REPLACE FUNCTION get_average_rating(p_content_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM public.reviews
    WHERE content_id = p_content_id;
    
    RETURN ROUND(avg_rating, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 리뷰 개수 조회 함수
-- =====================================================
-- 특정 캠핑장의 리뷰 개수를 조회하는 함수

CREATE OR REPLACE FUNCTION get_review_count(p_content_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    review_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO review_count
    FROM public.reviews
    WHERE content_id = p_content_id;
    
    RETURN COALESCE(review_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 리뷰 테이블 마이그레이션 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. reviews (리뷰 및 평점)';
    RAISE NOTICE '   2. review_helpful (리뷰 도움됨 표시)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스 생성 완료';
    RAISE NOTICE '⚙️ 함수 생성: get_average_rating, get_review_count';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 리뷰 작성';
    RAISE NOTICE '   INSERT INTO reviews (user_id, content_id, rating, comment)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''125266'', 5, ''정말 좋은 캠핑장입니다!'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 평균 평점 조회';
    RAISE NOTICE '   SELECT get_average_rating(''125266'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 리뷰 개수 조회';
    RAISE NOTICE '   SELECT get_review_count(''125266'');';
END $$;

