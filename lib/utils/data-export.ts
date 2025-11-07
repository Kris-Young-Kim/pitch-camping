/**
 * @file data-export.ts
 * @description 데이터 내보내기 유틸리티 (CSV, JSON 변환)
 */

/**
 * 데이터를 CSV 형식으로 변환
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  // 헤더 추출
  const headers = Object.keys(data[0]);
  
  // CSV 헤더 생성
  const csvHeaders = headers.map((header) => `"${header}"`).join(",");
  
  // CSV 행 생성
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        // 값이 객체나 배열인 경우 JSON 문자열로 변환
        if (value === null || value === undefined) {
          return '""';
        }
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // 문자열에 쉼표나 따옴표가 있으면 이스케이프
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  // BOM 추가 (Excel에서 한글 깨짐 방지)
  const BOM = "\uFEFF";
  return BOM + [csvHeaders, ...csvRows].join("\n");
}

/**
 * 데이터를 JSON 형식으로 변환
 */
export function convertToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * 중첩된 객체를 평탄화 (CSV 변환용)
 */
export function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        flattened[newKey] = "";
      } else if (Array.isArray(value)) {
        // 배열은 JSON 문자열로 변환
        flattened[newKey] = JSON.stringify(value);
      } else if (typeof value === "object") {
        // 중첩 객체는 재귀적으로 평탄화
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * 배열 데이터를 평탄화된 배열로 변환
 */
export function flattenArray(data: any[]): any[] {
  return data.map((item) => flattenObject(item));
}

