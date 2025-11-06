/**
 * @file popularity.ts
 * @description 인기도 점수 계산 유틸리티
 *
 * 캠핑장의 인기도 점수를 계산하는 순수 함수
 * 클라이언트/서버 양쪽에서 사용 가능
 *
 * @dependencies
 * - 없음 (순수 함수)
 */

/**
 * 인기도 점수 계산
 * @param viewCount 조회수
 * @param bookmarkCount 북마크 수
 * @param shareCount 공유 수
 * @returns 인기도 점수 (0-100)
 */
export function calculatePopularityScore(
  viewCount: number,
  bookmarkCount: number,
  shareCount: number,
): number {
  // 가중치: 조회수 1점, 북마크 10점, 공유 5점
  const weights = {
    view: 1,
    bookmark: 10,
    share: 5,
  };

  const score =
    viewCount * weights.view +
    bookmarkCount * weights.bookmark +
    shareCount * weights.share;

  // 최대 점수를 100으로 정규화 (임의의 최대값 설정)
  const maxScore = 10000; // 조정 가능
  return Math.min(100, Math.round((score / maxScore) * 100));
}
