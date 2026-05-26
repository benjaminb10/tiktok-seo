import { createFileRoute } from "@tanstack/react-router";
import { LandingFooter } from "#/components/landing-footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service | Viewlify.app" },
      { name: "description", content: "Terms of Service for Viewlify.app - TikTok Analytics Platform" },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 2025</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Viewlify.app ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Viewlify.app is a TikTok analytics platform that provides insights, statistics, and AI-powered analysis of publicly available TikTok content. We help creators and businesses understand their TikTok performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-3">To use certain features of the Service, you must:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Create an account using Google Sign-In</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape or collect data from the Service without permission</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Violate TikTok's Terms of Service through your use of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Viewlify.app and are protected by international copyright, trademark, and other intellectual property laws. TikTok data displayed through our Service remains the property of TikTok and its users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Accuracy</h2>
            <p className="text-gray-600 leading-relaxed">
              While we strive to provide accurate analytics, we cannot guarantee the accuracy, completeness, or timeliness of the data. TikTok may change its platform at any time, which may affect the availability or accuracy of our analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, Viewlify.app shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Service Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We may also update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account at any time for violations of these Terms or for any other reason at our discretion. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:contact@viewlify.app" className="text-primary hover:underline">
                contact@viewlify.app
              </a>
            </p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
