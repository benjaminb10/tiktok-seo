import { LandingFooter } from "#/components/landing-footer";
import { HeroSection } from "./hero-section";
import { TrustBar } from "./trust-bar";
import { ProblemSolutionSection } from "./problem-solution-section";
import { BenefitsSection } from "./benefits-section";
import { FeaturesSection } from "./features-section";
import { UseCasesSection } from "./use-cases-section";
import { HowItWorksSection } from "./how-it-works-section";
import { TestimonialsSection } from "./testimonials-section";
import { PricingPreviewSection } from "./pricing-preview-section";
import { FAQSection } from "./faq-section";
import { CTASection } from "./cta-section";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustBar />
      <ProblemSolutionSection />
      <BenefitsSection />
      <FeaturesSection />
      <UseCasesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingPreviewSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
