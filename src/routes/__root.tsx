import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { LandingNavbar } from "#/components/landing-navbar";
import { Sidebar } from "#/components/sidebar";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { ChatProvider } from "#/features/chat/chat-context";
import { ChatSidebar } from "#/features/chat/chat-sidebar";
import { QuotaProvider } from "#/lib/stripe/quota-context";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Viewlify.app - Discover What Makes TikTok Videos Go Viral" },
      { name: "description", content: "Analyze any TikTok account with AI. Detect viral hooks, engagement patterns, and strategies that generate millions of views. AI-powered insights for creators and agencies." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
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
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-01C4J3CLW8" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-01C4J3CLW8');
              `,
            }}
          />
        </head>
        <body>
          <QuotaProvider>
            <ChatProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Outlet />
                </main>
                {showChatSidebar && <ChatSidebar />}
              </div>
            </ChatProvider>
          </QuotaProvider>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-01C4J3CLW8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-01C4J3CLW8');
            `,
          }}
        />
      </head>
      <body>
        <LandingNavbar />
        <Outlet />
        <WhatsAppButton />
        <Scripts />
      </body>
    </html>
  );
}
