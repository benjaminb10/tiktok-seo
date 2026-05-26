"use client";

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Link } from "@tanstack/react-router";

type DataPoint = {
  handle: string;
  avatarUrl: string | null;
  x: number;
  y: number;
};

type LeaderboardScatterChartProps = {
  data: DataPoint[];
  xLabel: string;
  yLabel: string;
  xFormatter?: (val: number) => string;
  yFormatter?: (val: number) => string;
  height?: number;
};

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(1);
}

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  const size = 28;
  const halfSize = size / 2;

  return (
    <g>
      <defs>
        <clipPath id={`clip-${payload.handle}`}>
          <circle cx={cx} cy={cy} r={halfSize} />
        </clipPath>
      </defs>
      {payload.avatarUrl ? (
        <image
          x={cx - halfSize}
          y={cy - halfSize}
          width={size}
          height={size}
          href={payload.avatarUrl}
          clipPath={`url(#clip-${payload.handle})`}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={halfSize}
          fill="hsl(var(--primary))"
          style={{ cursor: "pointer" }}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={halfSize}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={2}
      />
    </g>
  );
}

function CustomTooltip({
  active,
  payload,
  xLabel,
  yLabel,
  xFormatter,
  yFormatter,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
  xLabel: string;
  yLabel: string;
  xFormatter: (val: number) => string;
  yFormatter: (val: number) => string;
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
      <div className="text-sm text-muted-foreground space-y-1">
        <div>{xLabel}: {xFormatter(data.x)}</div>
        <div>{yLabel}: {yFormatter(data.y)}</div>
      </div>
    </div>
  );
}

export function LeaderboardScatterChart({
  data,
  xLabel,
  yLabel,
  xFormatter = formatNumber,
  yFormatter = formatNumber,
  height = 400,
}: LeaderboardScatterChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          tickFormatter={xFormatter}
          tick={{ fontSize: 12 }}
          label={{
            value: xLabel,
            position: "bottom",
            offset: 20,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          tickFormatter={yFormatter}
          tick={{ fontSize: 12 }}
          label={{
            value: yLabel,
            angle: -90,
            position: "insideLeft",
            offset: -10,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))", textAnchor: "middle" },
          }}
        />
        <Tooltip
          content={
            <CustomTooltip
              xLabel={xLabel}
              yLabel={yLabel}
              xFormatter={xFormatter}
              yFormatter={yFormatter}
            />
          }
        />
        <Scatter
          data={data}
          shape={<CustomDot />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
