const steps = [
  {
    step: "1",
    title: "Enter a username",
    description: "Paste any TikTok @username or profile URL",
  },
  {
    step: "2",
    title: "Get the analysis",
    description: "We fetch and analyze all public videos",
  },
  {
    step: "3",
    title: "Explore insights",
    description: "Browse metrics, sort videos, export data",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            How it works
          </h2>
          <p className="text-muted-foreground">
            Three simple steps
          </p>
        </div>

        {/* Steps - Notion style: horizontal on desktop */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              {/* Step number */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {step.step}
              </div>

              {/* Content */}
              <h3 className="mb-2 font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
