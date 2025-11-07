-- =====================================================
-- 마이그레이션: 반려동물 동반 여행지 리뷰 기능 추가
-- 작성일: 2025-01-08
-- 설명: reviews 테이블에 반려동물 동반 여행 관련 필드 추가
--       반려동물 동반 경험 및 만족도를 리뷰에 포함할 수 있도록 확장
-- =====================================================

-- =====================================================
-- reviews 테이블에 반려동물 관련 필드 추가
-- =====================================================

-- 반려동물 동반 여행 경험 여부 (리뷰 작성자가 반려동물과 함께 방문했는지)
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS pet_friendly_experience BOOLEAN DEFAULT false;

-- 반려동물 동반 만족도 (1-5점, pet_friendly_experience가 true일 때만 사용)
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS pet_friendly_rating INTEGER CHECK (pet_friendly_rating IS NULL OR (pet_friendly_rating >= 1 AND pet_friendly_rating <= 5));

-- 반려동물 동반 경험 상세 설명 (선택적)
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS pet_friendly_comment TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.reviews.pet_friendly_experience IS '반려동물 동반 여행 경험 여부 (true: 반려동물과 함께 방문, false: 일반 방문)';
COMMENT ON COLUMN public.reviews.pet_friendly_rating IS '반려동물 동반 만족도 (1-5점, pet_friendly_experience가 true일 때만 사용)';
COMMENT ON COLUMN public.reviews.pet_friendly_comment IS '반려동물 동반 경험 상세 설명 (선택적)';

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_reviews_pet_friendly_experience ON public.reviews(pet_friendly_experience) WHERE pet_friendly_experience = true;
CREATE INDEX IF NOT EXISTS idx_reviews_pet_friendly_rating ON public.reviews(pet_friendly_rating) WHERE pet_friendly_rating IS NOT NULL;

-- =====================================================
-- 반려동물 동반 리뷰 통계 함수 (선택적)
-- =====================================================

-- 반려동물 동반 리뷰 평균 만족도 계산 함수
CREATE OR REPLACE FUNCTION get_pet_friendly_review_stats(content_id_param TEXT)
RETURNS TABLE (
  average_pet_rating NUMERIC,
  total_pet_reviews BIGINT,
  pet_rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(pet_friendly_rating)::NUMERIC, 2) as average_pet_rating,
    COUNT(*) FILTER (WHERE pet_friendly_experience = true) as total_pet_reviews,
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE pet_friendly_rating = 5),
      '4', COUNT(*) FILTER (WHERE pet_friendly_rating = 4),
      '3', COUNT(*) FILTER (WHERE pet_friendly_rating = 3),
      '2', COUNT(*) FILTER (WHERE pet_friendly_rating = 2),
      '1', COUNT(*) FILTER (WHERE pet_friendly_rating = 1)
    ) as pet_rating_distribution
  FROM public.reviews
  WHERE content_id = content_id_param
    AND pet_friendly_experience = true
    AND pet_friendly_rating IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 함수 설명 추가
COMMENT ON FUNCTION get_pet_friendly_review_stats IS '반려동물 동반 리뷰 통계 조회 함수 (평균 만족도, 총 리뷰 수, 평점 분포)';

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 반려동물 동반 여행지 리뷰 기능 추가 완료!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 변경 사항:';
  RAISE NOTICE '   1. reviews 테이블에 pet_friendly_experience, pet_friendly_rating, pet_friendly_comment 컬럼 추가';
  RAISE NOTICE '   2. 반려동물 동반 리뷰 통계 함수 생성 (get_pet_friendly_review_stats)';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 인덱스: reviews(pet_friendly_experience, pet_friendly_rating)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 사용 예시:';
  RAISE NOTICE '   -- 반려동물 동반 리뷰 작성';
  RAISE NOTICE '   UPDATE reviews SET';
  RAISE NOTICE '     pet_friendly_experience = true,';
  RAISE NOTICE '     pet_friendly_rating = 5,';
  RAISE NOTICE '     pet_friendly_comment = ''반려동물과 함께 방문했고 매우 만족했습니다.''';
  RAISE NOTICE '   WHERE id = ''review_id'';';
  RAISE NOTICE '';
  RAISE NOTICE '   -- 반려동물 동반 리뷰 통계 조회';
  RAISE NOTICE '   SELECT * FROM get_pet_friendly_review_stats(''125266'');';
END $$;

