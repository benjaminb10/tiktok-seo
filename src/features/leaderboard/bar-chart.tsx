"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Link } from "@tanstack/react-router";

type DataPoint = {
  handle: string;
  avatarUrl: string | null;
  value: number;
};

type LeaderboardBarChartProps = {
  data: DataPoint[];
  valueLabel: string;
  valueFormatter?: (val: number) => string;
  limit?: number;
  height?: number;
};

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function CustomTooltip({
  active,
  payload,
  valueLabel,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
  valueLabel: string;
  valueFormatter: (val: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        {data.avatarUrl && (
          <img
            src={data.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="font-semibold">@{data.handle}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {valueLabel}: {valueFormatter(data.value)}
      </div>
    </div>
  );
}

function CustomYAxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value: string };
  data: DataPoint[];
}) {
  const { x, y, payload, data } = props;
  if (!x || !y || !payload) return null;

  const item = data.find((d) => d.handle === payload.value);
  if (!item) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      {item.avatarUrl ? (
        <>
          <defs>
            <clipPath id={`yaxis-clip-${item.handle}`}>
              <circle cx={-120} cy={0} r={12} />
            </clipPath>
          </defs>
          <image
            x={-132}
            y={-12}
            width={24}
            height={24}
            href={item.avatarUrl}
            clipPath={`url(#yaxis-clip-${item.handle})`}
          />
          <circle
            cx={-120}
            cy={0}
            r={12}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        </>
      ) : (
        <circle cx={-120} cy={0} r={12} fill="hsl(var(--primary))" />
      )}
      <text
        x={-100}
        y={4}
        textAnchor="start"
        fill="hsl(var(--foreground))"
        fontSize={12}
      >
        @{item.handle.length > 15 ? `${item.handle.slice(0, 15)}...` : item.handle}
      </text>
    </g>
  );
}

export function LeaderboardBarChart({
  data,
  valueLabel,
  valueFormatter = formatNumber,
  limit = 10,
  height,
}: LeaderboardBarChartProps) {
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const chartHeight = height || Math.max(300, sortedData.length * 50);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 150, bottom: 10 }}
      >
        <XAxis
          type="number"
          tickFormatter={valueFormatter}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="handle"
          tick={<CustomYAxisTick data={sortedData} />}
          width={150}
        />
        <Tooltip
          content={
            <CustomTooltip
              valueLabel={valueLabel}
              valueFormatter={valueFormatter}
            />
          }
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {sortedData.map((entry, index) => (
            <Cell
              key={entry.handle}
              fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
