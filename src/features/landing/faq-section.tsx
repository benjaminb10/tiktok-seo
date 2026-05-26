import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "#/lib/utils";

const faqs = [
  {
    question: "Is this free?",
    answer:
      "Yes, you get 1 free analysis per month (up to 20 videos). Paid plans offer more analyses and additional features like CSV export and AI insights.",
  },
  {
    question: "How does it work?",
    answer:
      "Enter any public TikTok username. We fetch their public videos and calculate metrics like engagement rate, average views, and identify top-performing content. Takes about 30 seconds.",
  },
  {
    question: "Can I analyze any account?",
    answer:
      "You can analyze any public TikTok profile. Private accounts cannot be analyzed since we only access publicly available data.",
  },
  {
    question: "Is this affiliated with TikTok?",
    answer:
      "No. Viewlify is an independent tool, not affiliated with or endorsed by TikTok.",
  },
  {
    question: "What metrics do you show?",
    answer:
      "Views, likes, comments, shares, engagement rate, posting frequency, video duration, and content pattern analysis.",
  },
  {
    question: "Can I export the data?",
    answer:
      "Yes, paid plans include CSV export for all video data and metrics.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            FAQ
          </h2>
        </div>

        {/* FAQ list - Notion style accordion */}
        <div className="divide-y rounded-lg border bg-background">
          {faqs.map((faq, index) => (
            <div key={faq.question}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="text-sm font-medium text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="border-t bg-muted/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
