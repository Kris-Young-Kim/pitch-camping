/**
 * @file review-section.tsx
 * @description 캠핑장 리뷰 섹션 컴포넌트
 *
 * 리뷰 목록 표시 및 리뷰 작성 폼을 포함하는 섹션
 *
 * 주요 기능:
 * 1. 리뷰 목록 표시
 * 2. 평균 평점 표시
 * 3. 리뷰 작성 폼
 * 4. 리뷰 수정/삭제 (본인 리뷰만)
 *
 * @dependencies
 * - lib/api/reviews.ts: 리뷰 API 함수
 * - components/camping-detail/review-card.tsx: 리뷰 카드 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - components/ui/form.tsx: Form 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Plus, Edit2, Trash2 } from "lucide-react";
import {
  getReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  type Review,
  type ReviewStats,
} from "@/lib/api/reviews";
import { toast } from "sonner";

interface ReviewSectionProps {
  contentId: string;
}

export function ReviewSection({ contentId }: ReviewSectionProps) {
  const { isSignedIn } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 리뷰 목록 및 통계 조회
  useEffect(() => {
    const fetchReviews = async () => {
      console.group(`[ReviewSection] 리뷰 데이터 조회: ${contentId}`);
      setLoading(true);

      try {
        const [reviewsData, statsData] = await Promise.all([
          getReviews(contentId, 20),
          getReviewStats(contentId),
        ]);

        setReviews(reviewsData);
        setStats(statsData);
      } catch (err) {
        console.error("[ReviewSection] 리뷰 조회 오류:", err);
        toast.error("리뷰를 불러오는데 실패했습니다");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchReviews();
  }, [contentId]);

  // 리뷰 작성/수정
  const handleSubmit = async () => {
    if (!isSignedIn) {
      toast.error("로그인이 필요합니다");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("평점을 선택해주세요");
      return;
    }

    setSubmitting(true);
    console.group(`[ReviewSection] 리뷰 ${editingReviewId ? "수정" : "작성"}`);

    try {
      let result;
      if (editingReviewId) {
        result = await updateReview(editingReviewId, rating, comment);
      } else {
        result = await createReview(contentId, rating, comment);
      }

      if (result.success) {
        toast.success(editingReviewId ? "리뷰가 수정되었습니다" : "리뷰가 작성되었습니다");
        setShowForm(false);
        setComment("");
        setRating(5);
        setEditingReviewId(null);

        // 리뷰 목록 다시 조회
        const [reviewsData, statsData] = await Promise.all([
          getReviews(contentId, 20),
          getReviewStats(contentId),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } else {
        toast.error(result.error || "리뷰 작성에 실패했습니다");
      }
    } catch (err) {
      console.error("[ReviewSection] 리뷰 작성 오류:", err);
      toast.error("리뷰 작성 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
      console.groupEnd();
    }
  };

  // 리뷰 삭제
  const handleDelete = async (reviewId: string) => {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    console.group(`[ReviewSection] 리뷰 삭제: ${reviewId}`);

    try {
      const result = await deleteReview(reviewId);

      if (result.success) {
        toast.success("리뷰가 삭제되었습니다");
        setReviews(reviews.filter((r) => r.id !== reviewId));

        // 통계 다시 조회
        const statsData = await getReviewStats(contentId);
        setStats(statsData);
      } else {
        toast.error(result.error || "리뷰 삭제에 실패했습니다");
      }
    } catch (err) {
      console.error("[ReviewSection] 리뷰 삭제 오류:", err);
      toast.error("리뷰 삭제 중 오류가 발생했습니다");
    } finally {
      console.groupEnd();
    }
  };

  // 리뷰 수정 모드로 전환
  const handleEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setShowForm(true);
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        리뷰 및 평점
      </h2>

      {/* 평균 평점 표시 */}
      {stats && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                총 {stats.totalReviews}개의 리뷰
              </div>
              {/* 평점 분포 표시 */}
              <div className="mt-2 space-y-1">
                {stats.ratingDistribution
                  .reverse()
                  .map((dist) => (
                    <div key={dist.rating} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                        {dist.rating}점
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.totalReviews > 0
                                ? (dist.count / stats.totalReviews) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                        {dist.count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 작성 버튼 */}
      {isSignedIn && (
        <div className="mb-6">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              리뷰 작성
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  평점
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  리뷰 내용 (선택사항)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="리뷰를 작성해주세요..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="default"
                >
                  {editingReviewId ? "수정" : "작성"}
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setComment("");
                    setRating(5);
                    setEditingReviewId(null);
                  }}
                  variant="outline"
                  disabled={submitting}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 리뷰 목록 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>아직 리뷰가 없습니다.</p>
          {isSignedIn && (
            <p className="text-sm mt-2">첫 리뷰를 작성해보세요!</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
}

function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const { userId } = useAuth();
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    // TODO: 현재 사용자 확인 로직 구현
    // Clerk userId와 review.user_id를 비교
    setIsCurrentUser(false); // 임시
  }, [userId, review.user_id]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-gray-900 dark:text-white">
            {review.user_name || "익명"}
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(review.created_at).toLocaleDateString("ko-KR")}
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
      )}

      {isCurrentUser && (
        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(review)}
            className="h-8"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            수정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(review.id)}
            className="h-8 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            삭제
          </Button>
        </div>
      )}
    </div>
  );
}

