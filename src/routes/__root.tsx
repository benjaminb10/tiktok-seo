import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import { Menu, MessageSquare, X } from "lucide-react";
import { LandingNavbar } from "#/components/landing-navbar";
import { Sidebar } from "#/components/sidebar";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { ChatProvider } from "#/features/chat/chat-context";
import { ChatSidebar } from "#/features/chat/chat-sidebar";
import { QuotaProvider } from "#/lib/stripe/quota-context";
import { Button } from "#/components/ui/button";
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

function AppLayout({ showChatSidebar }: { showChatSidebar: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - hidden on mobile, shown on lg+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold">Viewlify<span className="text-xs font-medium text-muted-foreground/80">.app</span></span>
          {showChatSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
          {!showChatSidebar && <div className="w-9" />}
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Chat sidebar overlay on mobile */}
      {showChatSidebar && chatOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Chat Sidebar - hidden on mobile/tablet, shown on xl+ or when toggled */}
      {showChatSidebar && (
        <div
          className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-200 xl:relative xl:translate-x-0 ${
            chatOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ChatSidebar onClose={() => setChatOpen(false)} />
        </div>
      )}

      {/* Floating chat button on tablet (between lg and xl) */}
      {showChatSidebar && (
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg xl:hidden"
          onClick={() => setChatOpen(!chatOpen)}
        >
          {chatOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </Button>
      )}
    </div>
  );
}

function RootComponent() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app") ||
                     location.pathname.startsWith("/dashboard") ||
                     location.pathname.startsWith("/analyses") ||
                     location.pathname.startsWith("/discover") ||
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
              <AppLayout showChatSidebar={showChatSidebar} />
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
