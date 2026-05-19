import { createFileRoute } from "@tanstack/react-router";
import { PublicProfilePage } from "#/features/profile/public-profile-page";
import { getProfileDetailFn } from "#/lib/tiktok/tiktok.functions";

export const Route = createFileRoute("/profile/$username")({
  component: ProfilePage,
  loader: async ({ params }) => {
    const profileData = await getProfileDetailFn({ data: { username: params.username } });
    return { username: params.username, profileData };
  },
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} - TikTok Analytics | Viewlify.ai` },
      {
        name: "description",
        content: `Analyze @${params.username}'s TikTok performance with AI-powered insights. View engagement rates, top videos, and viral patterns.`,
      },
      { property: "og:title", content: `@${params.username} - TikTok Analytics | Viewlify.ai` },
      {
        property: "og:description",
        content: `Detailed analytics and insights for @${params.username} on TikTok`,
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `https://viewlify.ai/profile/${params.username}` },
      { property: "og:image", content: `https://viewlify.ai/api/og/profile/${params.username}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://viewlify.ai/api/og/profile/${params.username}` },
    ],
  }),
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { profileData } = Route.useLoaderData();

  return <PublicProfilePage username={username} profileData={profileData} />;
}
