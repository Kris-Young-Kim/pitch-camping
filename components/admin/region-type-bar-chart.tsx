/**
 * @file region-type-bar-chart.tsx
 * @description 지역별/타입별 통계 바 차트 컴포넌트
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RegionStats, TypeStats } from "@/actions/admin-stats/get-region-type-stats";

interface RegionTypeBarChartProps {
  regionStats?: RegionStats[];
  typeStats?: TypeStats[];
}

export function RegionTypeBarChart({ regionStats = [], typeStats = [] }: RegionTypeBarChartProps) {
  const regionData = regionStats.slice(0, 10).map((stat) => ({
    name: stat.areaname,
    여행지: stat.travelCount,
    조회수: stat.viewCount,
    북마크: stat.bookmarkCount,
    리뷰: stat.reviewCount,
  }));

  const typeData = typeStats.slice(0, 10).map((stat) => ({
    name: stat.typeName,
    여행지: stat.travelCount,
    조회수: stat.viewCount,
    북마크: stat.bookmarkCount,
    리뷰: stat.reviewCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>지역별/타입별 통계</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">지역별</TabsTrigger>
            <TabsTrigger value="type">타입별</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="여행지" fill="#3b82f6" />
                <Bar dataKey="조회수" fill="#10b981" />
                <Bar dataKey="북마크" fill="#f59e0b" />
                <Bar dataKey="리뷰" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="type">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="여행지" fill="#3b82f6" />
                <Bar dataKey="조회수" fill="#10b981" />
                <Bar dataKey="북마크" fill="#f59e0b" />
                <Bar dataKey="리뷰" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

