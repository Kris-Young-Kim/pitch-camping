/**
 * @file get-pet-travel-posts.ts
 * @description 반려동물 동반 여행 커뮤니티 게시글 조회 Server Action
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export type PetTravelPostType = "review" | "tip" | "checklist";

export interface PetTravelPost {
  id: string;
  userId: string;
  userName: string;
  postType: PetTravelPostType;
  title: string;
  content: string;
  travelContentId: string | null;
  images: string[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
}

export interface GetPetTravelPostsResult {
  success: boolean;
  posts?: PetTravelPost[];
  totalCount?: number;
  error?: string;
}

export interface GetPetTravelPostsInput {
  postType?: PetTravelPostType;
  travelContentId?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "like_count" | "view_count" | "comment_count";
}

export async function getPetTravelPosts(
  input: GetPetTravelPostsInput = {}
): Promise<GetPetTravelPostsResult> {
  console.group("[getPetTravelPosts] 커뮤니티 게시글 조회 시작");
  logInfo("[getPetTravelPosts] 조회 요청", input);

  try {
    const supabase = createClerkSupabaseClient();

    let query = supabase
      .from("pet_travel_posts")
      .select(
        `
        id,
        user_id,
        post_type,
        title,
        content,
        travel_contentid,
        images,
        tags,
        view_count,
        like_count,
        comment_count,
        is_published,
        created_at,
        updated_at,
        users!inner(name)
      `
      )
      .eq("is_published", true);

    // 필터 적용
    if (input.postType) {
      query = query.eq("post_type", input.postType);
    }

    if (input.travelContentId) {
      query = query.eq("travel_contentid", input.travelContentId);
    }

    if (input.tag) {
      query = query.contains("tags", [input.tag]);
    }

    // 정렬
    const orderBy = input.orderBy || "created_at";
    const ascending = orderBy === "created_at" ? false : true;
    query = query.order(orderBy, { ascending });

    // 페이지네이션
    const limit = input.limit || 20;
    const offset = input.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[getPetTravelPosts] 게시글 조회 실패:", error);
      logError(
        "[getPetTravelPosts] 게시글 조회 실패",
        error instanceof Error ? error : new Error(String(error))
      );
      console.groupEnd();
      return { success: false, error: "게시글을 불러오는데 실패했습니다." };
    }

    const posts: PetTravelPost[] = (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.users?.name || "익명",
      postType: item.post_type,
      title: item.title,
      content: item.content,
      travelContentId: item.travel_contentid,
      images: item.images || [],
      tags: item.tags || [],
      viewCount: item.view_count || 0,
      likeCount: item.like_count || 0,
      commentCount: item.comment_count || 0,
      isPublished: item.is_published,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    logInfo("[getPetTravelPosts] 게시글 조회 완료", {
      count: posts.length,
      totalCount: count || 0,
    });
    console.groupEnd();

    return {
      success: true,
      posts,
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("[getPetTravelPosts] 게시글 조회 오류:", error);
    logError(
      "[getPetTravelPosts] 게시글 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "게시글을 불러오는데 실패했습니다." };
  }
}

