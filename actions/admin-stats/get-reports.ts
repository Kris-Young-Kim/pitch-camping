/**
 * @file get-reports.ts
 * @description 리포트 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface Report {
  id: string;
  templateId: string | null;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  format: string;
  createdAt: string;
}

export interface GetReportsResult {
  success: boolean;
  reports?: Report[];
  error?: string;
}

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

export async function getReports(limit: number = 50): Promise<GetReportsResult> {
  console.group("[getReports] 리포트 목록 조회 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getReports] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    const { data: reports, error } = await supabase
      .from("reports")
      .select("id, template_id, report_type, period_start, period_end, title, format, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getReports] 리포트 조회 실패:", error);
      console.groupEnd();
      return { success: false, error: "리포트를 불러오는데 실패했습니다." };
    }

    const formattedReports: Report[] = (reports || []).map((r) => ({
      id: r.id,
      templateId: r.template_id,
      reportType: r.report_type,
      periodStart: r.period_start,
      periodEnd: r.period_end,
      title: r.title,
      format: r.format,
      createdAt: r.created_at,
    }));

    console.log("[getReports] 리포트 조회 완료:", formattedReports.length, "개");
    console.groupEnd();

    return {
      success: true,
      reports: formattedReports,
    };
  } catch (error) {
    console.error("[getReports] 리포트 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "리포트를 불러오는데 실패했습니다.",
    };
  }
}

