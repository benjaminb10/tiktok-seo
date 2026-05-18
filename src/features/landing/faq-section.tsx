import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How is Viewlify different from TikTok's native analytics?",
    answer:
      "TikTok's native analytics only show basic metrics for your own account. Viewlify lets you analyze ANY profile (including competitors), provides AI-powered insights on viral patterns, detects hooks that work, and offers predictive trend analysis. Plus, we show you 20+ advanced metrics TikTok doesn't provide.",
  },
  {
    question: "Can I analyze competitors' profiles?",
    answer:
      "Yes! That's one of Viewlify's most powerful features. You can analyze any public TikTok profile to understand their content strategy, viral patterns, engagement rates, and top-performing videos. This helps you learn from successful creators in your niche.",
  },
  {
    question: "Is there a free trial or free plan?",
    answer:
      "Yes, we offer a free forever plan that lets you analyze 5 profiles per month with basic analytics. For unlimited access and advanced AI features, you can start a 14-day free trial of our Pro plan (no credit card required).",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "Our AI has been trained on over 10 million viral TikTok videos and uses advanced pattern recognition to identify what makes content successful. The accuracy improves continuously as we analyze more data. Thousands of creators trust our insights to guide their content strategy.",
  },
  {
    question: "Is this against TikTok's terms of service?",
    answer:
      "No, Viewlify only analyzes publicly available data from TikTok profiles. We don't access private accounts, violate user privacy, or engage in any practices that violate TikTok's terms of service. We're a legitimate analytics tool similar to social media monitoring platforms.",
  },
  {
    question: "What data can I export?",
    answer:
      "You can export all analytics data to CSV format, including video performance metrics, engagement rates, viral patterns, and AI insights. This is perfect for creating reports, tracking progress, or sharing insights with clients or team members.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with Viewlify for any reason, just contact our support team within 14 days of purchase for a full refund. No questions asked.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely! You can cancel your subscription at any time from your account settings. There are no cancellation fees or long-term contracts. If you cancel, you'll continue to have access until the end of your billing period.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-muted/50"
      >
        <span className="font-semibold">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Viewlify
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border bg-muted/30 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold">Still have questions?</h3>
          <p className="mb-4 text-muted-foreground">
            Our support team is here to help you succeed
          </p>
          <a
            href="mailto:support@viewlify.ai"
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-500 hover:text-violet-600"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
}
