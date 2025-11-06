/**
 * @file weather-widget.tsx
 * @description 날씨 위젯 컴포넌트
 *
 * 여행지 상세페이지에서 날씨 정보를 표시하는 위젯
 *
 * 주요 기능:
 * 1. 현재 날씨 표시 (온도, 날씨 상태, 습도, 풍속)
 * 2. 일주일 예보 표시
 * 3. 날씨 아이콘 표시
 * 4. 로딩 및 에러 상태 처리
 *
 * @dependencies
 * - lib/api/weather-api.ts: WeatherApiClient
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: 아이콘
 * - types/travel.ts: TravelSiteDetail 타입
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weatherApi, type WeatherData, type ForecastItem } from "@/lib/api/weather-api";
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudSnow } from "lucide-react";
import type { TravelSiteDetail } from "@/types/travel";

interface WeatherWidgetProps {
  travel: TravelSiteDetail;
  className?: string;
}

/**
 * 날씨 아이콘 컴포넌트
 */
function WeatherIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  // OpenWeatherMap 아이콘 코드에 따라 적절한 아이콘 반환
  // 아이콘 코드: https://openweathermap.org/weather-conditions
  if (icon.includes("01")) {
    // 맑음
    return <Sun className="w-6 h-6 text-yellow-500" />;
  } else if (icon.includes("02") || icon.includes("03") || icon.includes("04")) {
    // 구름
    return <Cloud className="w-6 h-6 text-gray-500" />;
  } else if (icon.includes("09") || icon.includes("10")) {
    // 비
    return <CloudRain className="w-6 h-6 text-blue-500" />;
  } else if (icon.includes("13")) {
    // 눈
    return <CloudSnow className="w-6 h-6 text-blue-300" />;
  } else {
    return <Cloud className="w-6 h-6 text-gray-500" />;
  }
}

export function WeatherWidget({ travel, className }: WeatherWidgetProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      // 좌표가 없는 경우 날씨 정보를 조회할 수 없음
      if (!travel.mapx || !travel.mapy) {
        setLoading(false);
        return;
      }

      const lat = parseFloat(travel.mapy);
      const lon = parseFloat(travel.mapx);

      if (isNaN(lat) || isNaN(lon)) {
        setError("좌표 정보가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      try {
        console.log("[WeatherWidget] 날씨 정보 조회 시작:", { lat, lon });

        // 현재 날씨와 예보를 병렬로 조회
        const [current, forecastData] = await Promise.all([
          weatherApi.getCurrentWeather(lat, lon),
          weatherApi.getForecast(lat, lon),
        ]);

        setCurrentWeather(current);
        setForecast(forecastData);
        console.log("[WeatherWidget] 날씨 정보 조회 완료");
      } catch (err) {
        console.error("[WeatherWidget] 날씨 정보 조회 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "날씨 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [travel.mapx, travel.mapy]);

  // 좌표가 없는 경우 컴포넌트를 렌더링하지 않음
  if (!travel.mapx || !travel.mapy) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-600" />
          날씨 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">날씨 정보를 불러오는 중...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">{error}</div>
          </div>
        )}

        {!loading && !error && currentWeather && (
          <div className="space-y-6">
            {/* 현재 날씨 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <WeatherIcon icon={currentWeather.icon} />
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentWeather.temperature}°C
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    체감 {currentWeather.feelsLike}°C
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {currentWeather.description}
                  </div>
                </div>
              </div>
            </div>

            {/* 날씨 상세 정보 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">습도</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {currentWeather.humidity}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">풍속</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {currentWeather.windSpeed.toFixed(1)} m/s
                  </div>
                </div>
              </div>
            </div>

            {/* 일주일 예보 */}
            {forecast.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  7일 예보
                </h4>
                <div className="space-y-2">
                  {forecast.slice(0, 7).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                          {item.dayOfWeek}
                        </div>
                        <WeatherIcon icon={item.icon} size={20} />
                        <div className="text-sm text-gray-700 dark:text-gray-300 capitalize flex-1">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.precipitation !== undefined && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {item.precipitation}%
                          </div>
                        )}
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.tempMin}° / {item.tempMax}°
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

