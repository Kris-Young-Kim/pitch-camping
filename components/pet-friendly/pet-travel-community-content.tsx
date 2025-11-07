/**
 * @file pet-travel-community-content.tsx
 * @description 반려동물 동반 여행 커뮤니티 메인 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Heart, MessageSquare, Eye, BookOpen, Lightbulb, CheckSquare } from "lucide-react";
import { getPetTravelPosts, type PetTravelPost, type PetTravelPostType } from "@/actions/pet-friendly/community/get-pet-travel-posts";
import { PetTravelPostCard } from "@/components/pet-friendly/pet-travel-post-card";
import { PetTravelPostDialog } from "@/components/pet-friendly/pet-travel-post-dialog";
import { toast } from "sonner";

export function PetTravelCommunityContent() {
  const [activeTab, setActiveTab] = useState<PetTravelPostType | "all">("all");
  const [posts, setPosts] = useState<PetTravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createPostType, setCreatePostType] = useState<PetTravelPostType>("review");

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    console.group("[PetTravelCommunityContent] 게시글 로드 시작");
    setLoading(true);
    try {
      const result = await getPetTravelPosts({
        postType: activeTab === "all" ? undefined : activeTab,
        limit: 20,
        orderBy: "created_at",
      });

      if (result.success && result.posts) {
        console.log("[PetTravelCommunityContent] 게시글 개수:", result.posts.length);
        setPosts(result.posts);
      } else {
        console.error("[PetTravelCommunityContent] 게시글 로드 실패", result.error);
        toast.error(result.error || "게시글을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[PetTravelCommunityContent] 게시글 로드 오류", error);
      toast.error("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const handleCreatePost = (type: PetTravelPostType) => {
    setCreatePostType(type);
    setIsCreateDialogOpen(true);
  };

  const handlePostCreated = () => {
    setIsCreateDialogOpen(false);
    loadPosts();
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            반려동물 동반 여행 커뮤니티
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            반려동물과 함께한 여행 경험을 공유하고 정보를 나눠보세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreatePost("review")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            후기 작성
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreatePost("tip")}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            팁 작성
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreatePost("checklist")}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            체크리스트 작성
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PetTravelPostType | "all")}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="review">후기</TabsTrigger>
          <TabsTrigger value="tip">팁</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              게시글을 불러오는 중...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>아직 게시글이 없습니다.</p>
              <p className="text-sm mt-2">첫 게시글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PetTravelPostCard key={post.id} post={post} onUpdate={loadPosts} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 게시글 작성 다이얼로그 */}
      <PetTravelPostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        postType={createPostType}
        onSuccess={handlePostCreated}
      />
    </div>
  );
}

