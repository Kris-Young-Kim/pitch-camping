/**
 * @file logger.ts
 * @description 구조화된 로깅 유틸리티
 *
 * 애플리케이션 전역에서 사용할 로깅 시스템
 * 프로덕션 환경에서는 Vercel Logs에 연동 가능
 *
 * 주요 기능:
 * 1. 로그 레벨 분리 (info, warn, error, debug)
 * 2. 구조화된 로그 포맷
 * 3. 프로덕션/개발 환경별 처리
 * 4. 에러 스택 트레이스 포함
 *
 * @dependencies
 * - 없음 (순수 유틸리티)
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";
// const isProduction = process.env.NODE_ENV === "production"; // 향후 사용 예정

/**
 * 로그 메타데이터 인터페이스
 */
interface LogMetadata {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
  userId?: string;
  requestId?: string;
}

/**
 * 로그 포맷팅
 */
function formatLog(metadata: LogMetadata): string {
  const { level, message, context, timestamp, error } = metadata;

  let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (context && Object.keys(context).length > 0) {
    logMessage += ` | Context: ${JSON.stringify(context)}`;
  }

  if (error) {
    logMessage += ` | Error: ${error.message}`;
    if (error.stack && isDevelopment) {
      logMessage += `\n${error.stack}`;
    }
  }

  return logMessage;
}

/**
 * 로그 출력 (개발 환경: 콘솔, 프로덕션: 구조화된 JSON)
 */
function outputLog(metadata: LogMetadata): void {
  const formatted = formatLog(metadata);

  if (isDevelopment) {
    // 개발 환경: 콘솔에 색상과 함께 출력
    switch (metadata.level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  } else {
    // 프로덕션: 구조화된 JSON으로 출력 (Vercel Logs 연동)
    console.log(JSON.stringify(metadata));
  }
}

/**
 * Info 레벨 로그
 */
export function logInfo(message: string, context?: LogContext): void {
  outputLog({
    level: "info",
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Warning 레벨 로그
 */
export function logWarn(message: string, context?: LogContext): void {
  outputLog({
    level: "warn",
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error 레벨 로그
 */
export function logError(
  message: string,
  error?: Error | unknown,
  context?: LogContext
): void {
  const errorObj =
    error instanceof Error ? error : new Error(String(error || message));

  outputLog({
    level: "error",
    message,
    context,
    timestamp: new Date().toISOString(),
    error: errorObj,
  });
}

/**
 * Debug 레벨 로그 (개발 환경에서만 출력)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (isDevelopment) {
    outputLog({
      level: "debug",
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * API 요청 로그
 */
export function logApiRequest(
  method: string,
  endpoint: string,
  statusCode?: number,
  duration?: number,
  context?: LogContext
): void {
  const apiContext: LogContext = {
    method,
    endpoint,
    ...(statusCode && { statusCode }),
    ...(duration && { duration: `${duration}ms` }),
    ...context,
  };

  if (statusCode && statusCode >= 400) {
    logError(`API 요청 실패: ${method} ${endpoint}`, undefined, apiContext);
  } else {
    logInfo(`API 요청: ${method} ${endpoint}`, apiContext);
  }
}

/**
 * 사용자 활동 로그
 */
export function logUserActivity(
  userId: string,
  action: string,
  context?: LogContext
): void {
  logInfo(`사용자 활동: ${action}`, {
    userId,
    action,
    ...context,
  });
}

/**
 * 성능 메트릭 로그
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: string = "ms",
  context?: LogContext
): void {
  logInfo(`성능 메트릭: ${metric}`, {
    metric,
    value,
    unit,
    ...context,
  });
}

/**
 * 비용 관련 로그
 */
export function logCost(
  service: string,
  operation: string,
  estimatedCost?: number,
  context?: LogContext
): void {
  const costContext: LogContext = {
    service,
    operation,
    ...(estimatedCost && { estimatedCost }),
    ...context,
  };

  logInfo(`비용 추적: ${service} - ${operation}`, costContext);
}

