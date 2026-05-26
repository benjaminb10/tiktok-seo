import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";

type ProfileData = {
  handle: string;
  avatarUrl: string | null;
  totalViews: number;
  totalLikes: number;
  totalVideos: number;
};

type RankingTableProps = {
  data: ProfileData[];
  sortBy: "views" | "engagement" | "likes";
  limit?: number;
};

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
        <Trophy className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold text-sm">
        3
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center text-muted-foreground font-medium text-sm">
      {rank}
    </div>
  );
}

export function RankingTable({ data, sortBy, limit = 10 }: RankingTableProps) {
  const sortedData = [...data]
    .map((p) => ({
      ...p,
      engagementRate: p.totalViews > 0 ? (p.totalLikes / p.totalViews) * 100 : 0,
    }))
    .sort((a, b) => {
      if (sortBy === "views") return b.totalViews - a.totalViews;
      if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
      return b.totalLikes - a.totalLikes;
    })
    .slice(0, limit);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right">Engagement</TableHead>
          <TableHead className="text-right">Likes</TableHead>
          <TableHead className="text-right">Videos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((profile, index) => (
          <TableRow key={profile.handle}>
            <TableCell>{getRankBadge(index + 1)}</TableCell>
            <TableCell>
              <Link
                to="/profile/$username"
                params={{ username: profile.handle }}
                className="flex items-center gap-3 hover:underline"
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {profile.handle.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium">@{profile.handle}</span>
              </Link>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatNumber(profile.totalViews)}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={
                  profile.engagementRate >= 10
                    ? "text-purple-600 font-medium"
                    : profile.engagementRate >= 5
                      ? "text-green-600 font-medium"
                      : ""
                }
              >
                {profile.engagementRate.toFixed(1)}%
              </span>
            </TableCell>
            <TableCell className="text-right">
              {formatNumber(profile.totalLikes)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {profile.totalVideos}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
