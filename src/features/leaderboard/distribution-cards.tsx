"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type ProfileData = {
  totalViews: number;
  totalLikes: number;
  totalVideos: number;
};

type DistributionCardsProps = {
  profiles: ProfileData[];
};

type DistributionBucket = {
  label: string;
  count: number;
};

function calculateViewsDistribution(profiles: ProfileData[]): DistributionBucket[] {
  const buckets = [
    { label: "0-10K", min: 0, max: 10_000, count: 0 },
    { label: "10K-100K", min: 10_000, max: 100_000, count: 0 },
    { label: "100K-1M", min: 100_000, max: 1_000_000, count: 0 },
    { label: "1M+", min: 1_000_000, max: Infinity, count: 0 },
  ];

  for (const profile of profiles) {
    for (const bucket of buckets) {
      if (profile.totalViews >= bucket.min && profile.totalViews < bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function calculateEngagementDistribution(profiles: ProfileData[]): DistributionBucket[] {
  const buckets = [
    { label: "0-2%", min: 0, max: 2, count: 0 },
    { label: "2-5%", min: 2, max: 5, count: 0 },
    { label: "5-10%", min: 5, max: 10, count: 0 },
    { label: "10%+", min: 10, max: Infinity, count: 0 },
  ];

  for (const profile of profiles) {
    const engagement = profile.totalViews > 0
      ? (profile.totalLikes / profile.totalViews) * 100
      : 0;

    for (const bucket of buckets) {
      if (engagement >= bucket.min && engagement < bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function calculateVideosDistribution(profiles: ProfileData[]): DistributionBucket[] {
  const buckets = [
    { label: "1-10", min: 1, max: 11, count: 0 },
    { label: "10-50", min: 10, max: 51, count: 0 },
    { label: "50-100", min: 50, max: 101, count: 0 },
    { label: "100+", min: 100, max: Infinity, count: 0 },
  ];

  for (const profile of profiles) {
    for (const bucket of buckets) {
      if (profile.totalVideos >= bucket.min && profile.totalVideos < bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function MiniBarChart({ data, color }: { data: DistributionBucket[]; color: string }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={entry.label}
              fill={entry.count === maxCount ? color : `${color}66`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionCards({ profiles }: DistributionCardsProps) {
  const viewsDistribution = calculateViewsDistribution(profiles);
  const engagementDistribution = calculateEngagementDistribution(profiles);
  const videosDistribution = calculateVideosDistribution(profiles);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Views Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniBarChart data={viewsDistribution} color="hsl(var(--primary))" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Engagement Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniBarChart data={engagementDistribution} color="hsl(142, 76%, 36%)" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Videos Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniBarChart data={videosDistribution} color="hsl(221, 83%, 53%)" />
        </CardContent>
      </Card>
    </div>
  );
}
