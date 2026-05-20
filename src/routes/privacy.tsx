import { createFileRoute } from "@tanstack/react-router";
import { LandingFooter } from "#/components/landing-footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Viewlify.ai" },
      { name: "description", content: "Privacy Policy for Viewlify.ai - TikTok Analytics Platform" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-violet-50 to-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 2025</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Viewlify.ai ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our TikTok analytics platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Account Information:</strong> When you sign in with Google, we receive your name, email address, and profile picture.</li>
              <li><strong>TikTok Data:</strong> We analyze publicly available TikTok profile and video data that you request to analyze.</li>
              <li><strong>Usage Data:</strong> We collect information about how you interact with our service to improve user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and maintain our analytics service</li>
              <li>Authenticate your account</li>
              <li>Generate insights and reports based on TikTok data</li>
              <li>Improve and personalize our service</li>
              <li>Communicate with you about updates and features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Storage and Security</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data is stored securely using industry-standard encryption. We use Cloudflare's infrastructure to ensure data protection and availability. We retain your data only as long as necessary to provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal information. We may share data with third-party service providers who assist us in operating our platform (such as cloud hosting providers), but only as necessary to provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:contact@viewlify.ai" className="text-primary hover:underline">
                contact@viewlify.ai
              </a>
            </p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
