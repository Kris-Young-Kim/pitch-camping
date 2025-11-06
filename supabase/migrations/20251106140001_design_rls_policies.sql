-- =====================================================
-- 마이그레이션: RLS 보안 정책 설계 (프로덕션 준비)
-- 작성일: 2025-11-06
-- 설명: 프로덕션 배포 전 보안 정책 설계 및 문서화
--       개발 환경에서는 RLS를 비활성화하되, 프로덕션 배포 전 적용
--       
-- 주의: 이 파일은 정책 설계만 포함하며, 실제로는 활성화하지 않음
--       프로덕션 배포 시 별도 마이그레이션으로 활성화
-- =====================================================

-- =====================================================
-- users 테이블 RLS 정책 설계
-- =====================================================

-- RLS 활성화 (프로덕션 배포 시 주석 해제)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 자신의 데이터만 조회 가능
-- CREATE POLICY "Users can view own data"
--     ON public.users FOR SELECT
--     USING (auth.jwt()->>'sub' = clerk_id);

-- INSERT 정책: 새 사용자 생성 가능 (Clerk 동기화 시)
-- CREATE POLICY "Users can create own record"
--     ON public.users FOR INSERT
--     WITH CHECK (auth.jwt()->>'sub' = clerk_id);

-- UPDATE 정책: 자신의 데이터만 수정 가능
-- CREATE POLICY "Users can update own data"
--     ON public.users FOR UPDATE
--     USING (auth.jwt()->>'sub' = clerk_id)
--     WITH CHECK (auth.jwt()->>'sub' = clerk_id);

-- DELETE 정책: 자신의 데이터만 삭제 가능 (선택적)
-- CREATE POLICY "Users can delete own data"
--     ON public.users FOR DELETE
--     USING (auth.jwt()->>'sub' = clerk_id);

-- =====================================================
-- bookmarks 테이블 RLS 정책 설계
-- =====================================================

-- RLS 활성화 (프로덕션 배포 시 주석 해제)
-- ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 자신의 북마크만 조회 가능
-- CREATE POLICY "Users can view own bookmarks"
--     ON public.bookmarks FOR SELECT
--     USING (
--         auth.jwt()->>'sub' = (
--             SELECT clerk_id FROM public.users WHERE id = user_id
--         )
--     );

-- INSERT 정책: 자신의 북마크만 추가 가능
-- CREATE POLICY "Users can create own bookmarks"
--     ON public.bookmarks FOR INSERT
--     WITH CHECK (
--         auth.jwt()->>'sub' = (
--             SELECT clerk_id FROM public.users WHERE id = user_id
--         )
--     );

-- DELETE 정책: 자신의 북마크만 삭제 가능
-- CREATE POLICY "Users can delete own bookmarks"
--     ON public.bookmarks FOR DELETE
--     USING (
--         auth.jwt()->>'sub' = (
--             SELECT clerk_id FROM public.users WHERE id = user_id
--         )
--     );

-- =====================================================
-- camping_stats 테이블 RLS 정책 설계
-- =====================================================

-- 통계 테이블은 읽기 전용으로 공개 (RLS 비활성화 유지)
-- 또는 인증된 사용자만 조회 가능하도록 설정 가능

-- RLS 활성화 (프로덕션 배포 시 주석 해제)
-- ALTER TABLE public.camping_stats ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 모든 인증된 사용자가 조회 가능
-- CREATE POLICY "Authenticated users can view stats"
--     ON public.camping_stats FOR SELECT
--     TO authenticated
--     USING (true);

-- =====================================================
-- user_activity 테이블 RLS 정책 설계
-- =====================================================

-- RLS 활성화 (프로덕션 배포 시 주석 해제)
-- ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 자신의 활동만 조회 가능
-- CREATE POLICY "Users can view own activity"
--     ON public.user_activity FOR SELECT
--     USING (
--         user_id IS NULL OR
--         auth.jwt()->>'sub' = (
--             SELECT clerk_id FROM public.users WHERE id = user_id
--         )
--     );

-- INSERT 정책: 자신의 활동만 기록 가능
-- CREATE POLICY "Users can create own activity"
--     ON public.user_activity FOR INSERT
--     WITH CHECK (
--         user_id IS NULL OR
--         auth.jwt()->>'sub' = (
--             SELECT clerk_id FROM public.users WHERE id = user_id
--         )
--     );

-- =====================================================
-- 참고: Clerk + Supabase 통합 시 주의사항
-- =====================================================
-- Clerk의 JWT 토큰에서 user ID는 'sub' 클레임에 저장됨
-- auth.jwt()->>'sub'는 Clerk의 user ID를 반환
-- users 테이블의 clerk_id와 일치해야 함

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ RLS 정책 설계 문서 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 설계된 정책:';
    RAISE NOTICE '   - users: 자신의 데이터만 CRUD';
    RAISE NOTICE '   - bookmarks: 자신의 북마크만 CRUD';
    RAISE NOTICE '   - camping_stats: 인증된 사용자 조회 가능';
    RAISE NOTICE '   - user_activity: 자신의 활동만 조회/기록';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ 주의:';
    RAISE NOTICE '   이 파일은 정책 설계만 포함합니다.';
    RAISE NOTICE '   프로덕션 배포 시 별도 마이그레이션으로 활성화하세요.';
    RAISE NOTICE '   개발 환경에서는 RLS를 비활성화하여 작업합니다.';
END $$;

