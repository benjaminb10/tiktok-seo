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
    gradient: "from-pink-500 to-rose-500",
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
    gradient: "from-violet-500 to-purple-500",
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
    gradient: "from-blue-500 to-cyan-500",
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
    gradient: "from-green-500 to-emerald-500",
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
    gradient: "from-orange-500 to-amber-500",
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
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-muted-foreground">5,000+ Happy Creators</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Real Creators, Real Results
          </h2>
          <p className="text-lg text-muted-foreground">
            See how Viewlify helped creators and agencies achieve viral success
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group relative rounded-2xl border bg-background p-6 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Quote Icon */}
              <Quote className="mb-4 h-8 w-8 text-violet-500/20" />

              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-sm text-muted-foreground">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-sm font-bold text-white`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-xs font-medium text-violet-500">
                    {testimonial.handle} • {testimonial.followers}
                  </div>
                </div>
              </div>

              {/* Hover glow */}
              <div
                className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-0 blur-2xl transition-opacity group-hover:opacity-10`}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Join thousands of creators achieving viral success with Viewlify
          </p>
        </div>
      </div>
    </section>
  );
}
