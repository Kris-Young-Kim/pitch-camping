/**
 * @file export-backup.ts
 * @description 대량 데이터 백업 내보내기 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
import { convertToJSON } from "@/lib/utils/data-export";

export interface ExportBackupResult {
  success: boolean;
  filename?: string;
  content?: string;
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

export async function exportBackup(): Promise<ExportBackupResult> {
  console.group("[exportBackup] 백업 데이터 내보내기 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[exportBackup] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `backup-${timestamp}.json`;

    // 주요 테이블 데이터 수집
    const backupData: any = {
      exportedAt: new Date().toISOString(),
      tables: {},
    };

    // users 테이블
    const { data: users } = await supabase.from("users").select("*").limit(10000);
    backupData.tables.users = users || [];

    // travels 테이블
    const { data: travels } = await supabase.from("travels").select("*").limit(10000);
    backupData.tables.travels = travels || [];

    // bookmarks 테이블
    const { data: bookmarks } = await supabase.from("bookmarks").select("*").limit(10000);
    backupData.tables.bookmarks = bookmarks || [];

    // reviews 테이블
    const { data: reviews } = await supabase.from("reviews").select("*").limit(10000);
    backupData.tables.reviews = reviews || [];

    // bookmark_folders 테이블
    const { data: folders } = await supabase.from("bookmark_folders").select("*");
    backupData.tables.bookmark_folders = folders || [];

    // bookmark_tags 테이블
    const { data: tags } = await supabase.from("bookmark_tags").select("*");
    backupData.tables.bookmark_tags = tags || [];

    // travel_plans 테이블
    const { data: plans } = await supabase.from("travel_plans").select("*");
    backupData.tables.travel_plans = plans || [];

    // performance_metrics 테이블 (최근 1000개)
    const { data: performanceMetrics } = await supabase
      .from("performance_metrics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    backupData.tables.performance_metrics = performanceMetrics || [];

    // error_logs 테이블 (최근 1000개)
    const { data: errorLogs } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    backupData.tables.error_logs = errorLogs || [];

    // api_usage_logs 테이블 (최근 1000개)
    const { data: apiUsageLogs } = await supabase
      .from("api_usage_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    backupData.tables.api_usage_logs = apiUsageLogs || [];

    // reports 테이블
    const { data: reports } = await supabase.from("reports").select("*");
    backupData.tables.reports = reports || [];

    // alert_rules 테이블
    const { data: alertRules } = await supabase.from("alert_rules").select("*");
    backupData.tables.alert_rules = alertRules || [];

    // alert_history 테이블 (최근 1000개)
    const { data: alertHistory } = await supabase
      .from("alert_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    backupData.tables.alert_history = alertHistory || [];

    const content = convertToJSON(backupData);

    console.log("[exportBackup] 백업 완료:", filename);
    console.groupEnd();

    return {
      success: true,
      filename,
      content,
    };
  } catch (error) {
    console.error("[exportBackup] 백업 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "백업 데이터 내보내기 중 오류가 발생했습니다.",
    };
  }
}

