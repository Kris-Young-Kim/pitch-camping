/**
 * @file app/api/reports/[reportId]/download/route.ts
 * @description 리포트 다운로드 API Route
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

async function checkAdminPermission(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    if (adminUserIds.includes(userId)) return true;

    return false;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  console.group("[ReportDownload] 리포트 다운로드 요청");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[ReportDownload] 관리자 권한 없음");
      console.groupEnd();
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { reportId } = await params;
    const supabase = getServiceRoleClient();

    const { data: report, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      console.error("[ReportDownload] 리포트 조회 실패:", error);
      console.groupEnd();
      return NextResponse.json({ error: "리포트를 찾을 수 없습니다." }, { status: 404 });
    }

    // JSON 형식으로 반환
    const response = NextResponse.json(report.data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${report.title}.json"`,
      },
    });

    console.log("[ReportDownload] 리포트 다운로드 완료:", reportId);
    console.groupEnd();

    return response;
  } catch (error) {
    console.error("[ReportDownload] 리포트 다운로드 오류:", error);
    console.groupEnd();
    return NextResponse.json(
      { error: "리포트 다운로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

