export type PricingTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out Viewlify.app",
    features: [
      "1 analysis per day",
      "20 videos max per analysis",
      "Basic stats & insights",
      "7-day history",
      "Watermark on shares",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Creator",
    price: "29",
    description: "For solo creators and influencers",
    features: [
      "20 analyses per month",
      "200 videos max per analysis",
      "AI-powered insights",
      "CSV & PDF exports",
      "3-month history",
      "Compare 2 accounts",
      "No watermark",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "79",
    description: "For agencies and brands",
    features: [
      "Unlimited analyses",
      "Unlimited videos",
      "Advanced AI insights",
      "Competitor tracking (10 accounts)",
      "Email & Slack alerts",
      "Multi-account comparison (5)",
      "Automated reports",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Agency",
    price: "199",
    description: "For large teams and agencies",
    features: [
      "Everything in Pro",
      "Multi-workspaces (5 teams)",
      "White-label branding",
      "API access",
      "Webhooks",
      "Dedicated account manager",
      "Custom integrations",
      "SLA 99.9%",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];
