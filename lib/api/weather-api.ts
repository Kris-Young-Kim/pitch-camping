/**
 * @file weather-api.ts
 * @description 날씨 API 클라이언트 모듈
 *
 * OpenWeatherMap API를 사용하여 날씨 정보를 조회하는 클라이언트
 * 향후 기상청 Open API로 전환 가능하도록 구조 설계
 *
 * 주요 기능:
 * 1. 현재 날씨 조회 (위도/경도 기반)
 * 2. 일주일 예보 조회
 * 3. 날씨 데이터 정규화
 *
 * @dependencies
 * - OpenWeatherMap API (https://openweathermap.org/api)
 */

import { logError, logInfo } from "@/lib/utils/logger";

/**
 * 날씨 정보 타입
 */
export interface WeatherData {
  temperature: number; // 현재 온도 (섭씨)
  feelsLike: number; // 체감 온도
  humidity: number; // 습도 (%)
  description: string; // 날씨 설명 (예: "맑음", "비")
  icon: string; // 날씨 아이콘 코드
  windSpeed: number; // 풍속 (m/s)
  windDirection?: number; // 풍향 (도)
  pressure?: number; // 기압 (hPa)
  visibility?: number; // 가시거리 (km)
  uvIndex?: number; // 자외선 지수
  location: {
    lat: number;
    lon: number;
    name?: string; // 지역명
  };
}

/**
 * 일주일 예보 항목 타입
 */
export interface ForecastItem {
  date: string; // 날짜 (ISO 8601)
  dateText: string; // 날짜 텍스트 (예: "2024-01-15")
  dayOfWeek: string; // 요일 (예: "월요일")
  tempMin: number; // 최저 온도
  tempMax: number; // 최고 온도
  description: string; // 날씨 설명
  icon: string; // 날씨 아이콘 코드
  humidity: number; // 습도
  windSpeed: number; // 풍속
  precipitation?: number; // 강수 확률 (%)
}

/**
 * OpenWeatherMap API 클라이언트
 */
export class WeatherApiClient {
  private apiKey: string;
  private baseUrl: string = "https://api.openweathermap.org/data/2.5";
  private readonly timeout: number = 10000; // 10초

  constructor() {
    // 환경 변수에서 API 키 가져오기
    this.apiKey =
      process.env.OPENWEATHER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
      "";

    if (!this.apiKey) {
      logError(
        "[WeatherApiClient] OpenWeatherMap API 키가 설정되지 않았습니다."
      );
    }
  }

  /**
   * API 요청 공통 메서드
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append("appid", this.apiKey);
    url.searchParams.append("units", "metric"); // 섭씨 온도
    url.searchParams.append("lang", "kr"); // 한국어

    // 추가 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const startTime = Date.now();
    try {
      logInfo(`[WeatherApiClient] API 요청: ${endpoint}`, { params });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        next: {
          revalidate: 300, // 5분 캐시
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `날씨 API 요청 실패: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      logInfo(`[WeatherApiClient] API 응답 성공 (${responseTime}ms)`, {
        endpoint,
      });

      return data as T;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logError(`[WeatherApiClient] API 요청 오류 (${responseTime}ms)`, {
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 현재 날씨 조회
   * @param lat 위도 (WGS84)
   * @param lon 경도 (WGS84)
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const data = await this.request<{
        coord: { lat: number; lon: number };
        weather: Array<{
          main: string;
          description: string;
          icon: string;
        }>;
        main: {
          temp: number;
          feels_like: number;
          humidity: number;
          pressure: number;
        };
        wind: {
          speed: number;
          deg?: number;
        };
        visibility?: number;
        name?: string;
      }>("weather", {
        lat,
        lon,
      });

      const weather = data.weather[0];

      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: weather.description,
        icon: weather.icon,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        visibility: data.visibility ? data.visibility / 1000 : undefined, // m -> km
        location: {
          lat: data.coord.lat,
          lon: data.coord.lon,
          name: data.name,
        },
      };
    } catch (error) {
      logError("[WeatherApiClient] 현재 날씨 조회 실패", { lat, lon, error });
      throw error;
    }
  }

  /**
   * 일주일 예보 조회
   * @param lat 위도 (WGS84)
   * @param lon 경도 (WGS84)
   */
  async getForecast(lat: number, lon: number): Promise<ForecastItem[]> {
    try {
      const data = await this.request<{
        list: Array<{
          dt: number; // Unix timestamp
          main: {
            temp_min: number;
            temp_max: number;
            humidity: number;
          };
          weather: Array<{
            description: string;
            icon: string;
          }>;
          wind: {
            speed: number;
          };
          pop?: number; // 강수 확률 (0-1)
          dt_txt: string; // "2024-01-15 12:00:00"
        }>;
      }>("forecast", {
        lat,
        lon,
        cnt: 40, // 5일치 데이터 (3시간 간격)
      });

      // 날짜별로 그룹화하고 하루의 최고/최저 온도 계산
      const dailyForecast = new Map<string, ForecastItem>();

      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split("T")[0]; // "2024-01-15"
        const dayOfWeek = date.toLocaleDateString("ko-KR", {
          weekday: "long",
        });

        const existing = dailyForecast.get(dateKey);

        if (!existing) {
          dailyForecast.set(dateKey, {
            date: dateKey,
            dateText: dateKey,
            dayOfWeek,
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            precipitation: item.pop ? Math.round(item.pop * 100) : undefined,
          });
        } else {
          // 최고/최저 온도 업데이트
          existing.tempMin = Math.min(existing.tempMin, Math.round(item.main.temp_min));
          existing.tempMax = Math.max(existing.tempMax, Math.round(item.main.temp_max));
          // 강수 확률이 높은 것으로 업데이트
          if (item.pop && (!existing.precipitation || item.pop > existing.precipitation / 100)) {
            existing.precipitation = Math.round(item.pop * 100);
          }
        }
      });

      // 7일치만 반환 (오늘 제외)
      const forecastArray = Array.from(dailyForecast.values())
        .slice(0, 7)
        .map((item) => ({
          ...item,
          date: new Date(item.date).toISOString(),
        }));

      return forecastArray;
    } catch (error) {
      logError("[WeatherApiClient] 일주일 예보 조회 실패", { lat, lon, error });
      throw error;
    }
  }
}

/**
 * WeatherApiClient 싱글톤 인스턴스
 */
export const weatherApi = new WeatherApiClient();

