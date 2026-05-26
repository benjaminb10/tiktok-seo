import { LandingFooter } from "#/components/landing-footer";
import { HeroSection } from "./hero-section";
import { ProblemSection } from "./problem-section";
import { FeaturesSection } from "./features-section";
import { SocialProofSection } from "./social-proof-section";
import { HowItWorksSection } from "./how-it-works-section";
import { PricingPreviewSection } from "./pricing-preview-section";
import { FAQSection } from "./faq-section";
import { CTASection } from "./cta-section";

/**
 * Landing page structure using PAS (Problem-Agitate-Solution) framework:
 *
 * 1. Hero - Attention: Clear value proposition
 * 2. Problem - Problem: Pain points creators face
 * 3. Features - Solution: How we solve the problems
 * 4. Social Proof - Agitate/Proof: Show real value examples
 * 5. How It Works - Simplify: Make it feel easy
 * 6. Pricing - Offer: Clear options
 * 7. FAQ - Overcome objections
 * 8. CTA - Action: Final push
 */
export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <SocialProofSection />
      <HowItWorksSection />
      <PricingPreviewSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
