import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Beauty Creator",
    handle: "@beautyhacks",
    followers: "2.3M followers",
    quote:
      "Increased my average views from 5K to 500K in just 30 days by replicating the viral patterns Viewlify showed me. This tool is a game-changer.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Social Media Agency Owner",
    handle: "Growth Labs Agency",
    followers: "50+ clients",
    quote:
      "We manage 50+ TikTok accounts for clients. Viewlify saves us 20+ hours per week on research and delivers insights our clients love. Worth every penny.",
    rating: 5,
    avatar: "MJ",
  },
  {
    name: "Emma Rodriguez",
    role: "Fitness Coach",
    handle: "@fitwithem",
    followers: "890K followers",
    quote:
      "I was stuck at 50K followers for months. After using Viewlify to analyze top fitness creators, I hit 890K in 6 months. The hook analysis feature is insane.",
    rating: 5,
    avatar: "ER",
  },
  {
    name: "David Park",
    role: "E-commerce Brand",
    handle: "TechGear Co.",
    followers: "$2M in sales",
    quote:
      "We went from 0 to 500K followers and generated $2M in sales through TikTok. Viewlify helped us understand exactly what content our audience wanted.",
    rating: 5,
    avatar: "DP",
  },
  {
    name: "Lisa Thompson",
    role: "Comedy Creator",
    handle: "@lisalaughs",
    followers: "1.8M followers",
    quote:
      "The trend detection feature is incredible. I'm always the first in my niche to jump on new formats. My engagement rate went from 3% to 12%.",
    rating: 5,
    avatar: "LT",
  },
  {
    name: "Alex Kumar",
    role: "Music Producer",
    handle: "@alexbeats",
    followers: "620K followers",
    quote:
      "As a music creator, understanding what makes audio go viral is crucial. Viewlify's competitor analysis showed me exactly which sounds were trending before they blew up.",
    rating: 5,
    avatar: "AK",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-muted-foreground">5,000+ Happy Creators</span>
          </div>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            Real Creators, Real Results
          </h2>
          <p className="text-lg text-muted-foreground">
            See how Viewlify helped creators and agencies achieve viral success
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-lg border bg-background p-6 transition-shadow hover:shadow-sm"
            >
              {/* Quote Icon */}
              <Quote className="mb-4 h-6 w-6 text-muted-foreground/30" />

              {/* Rating */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.handle} · {testimonial.followers}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
