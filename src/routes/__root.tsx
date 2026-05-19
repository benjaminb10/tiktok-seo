import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { LandingNavbar } from "#/components/landing-navbar";
import { Sidebar } from "#/components/sidebar";
import { ChatProvider } from "#/features/chat/chat-context";
import { ChatSidebar } from "#/features/chat/chat-sidebar";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Viewlify.ai - Discover What Makes TikTok Videos Go Viral" },
      { name: "description", content: "Analyze any TikTok account with AI. Detect viral hooks, engagement patterns, and strategies that generate millions of views. AI-powered insights for creators and agencies." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app") ||
                     location.pathname.startsWith("/analyses") ||
                     location.pathname.startsWith("/exports") ||
                     location.pathname.startsWith("/settings") ||
                     location.pathname.startsWith("/help");
  const showChatSidebar = location.pathname.startsWith("/app");

  if (isAppRoute) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <ChatProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <Outlet />
              </main>
              {showChatSidebar && <ChatSidebar />}
            </div>
          </ChatProvider>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <LandingNavbar />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
