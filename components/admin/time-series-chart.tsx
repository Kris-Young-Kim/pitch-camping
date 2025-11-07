/**
 * @file time-series-chart.tsx
 * @description 시간대별 통계 라인 차트 컴포넌트
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeSeriesStats } from "@/actions/admin-stats/get-time-series-stats";

interface TimeSeriesChartProps {
  data: TimeSeriesStats[];
  title?: string;
}

export function TimeSeriesChart({ data, title = "시간대별 통계" }: TimeSeriesChartProps) {
  // 날짜 포맷팅 (YYYY-MM-DD -> MM/DD)
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              name="사용자"
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#10b981"
              strokeWidth={2}
              name="조회수"
            />
            <Line
              type="monotone"
              dataKey="bookmarks"
              stroke="#f59e0b"
              strokeWidth={2}
              name="북마크"
            />
            <Line
              type="monotone"
              dataKey="reviews"
              stroke="#ef4444"
              strokeWidth={2}
              name="리뷰"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

