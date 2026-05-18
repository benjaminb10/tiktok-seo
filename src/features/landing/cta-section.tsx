import { ArrowRight, CheckCircle2, Clock, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl border-2 border-violet-500 bg-gradient-to-br from-pink-500 via-violet-500 to-purple-500 p-12 text-center shadow-2xl sm:p-16">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

          <div className="relative z-10">
            {/* FOMO Badge */}
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Clock className="h-4 w-4" />
              <span>Limited: Free Pro trial ending soon for new signups</span>
            </div>

            <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Join 5,000+ Creators Already Growing Faster
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
              Stop watching your competitors go viral while you're stuck. Start analyzing and growing today.
            </p>

            {/* Social Proof Stats */}
            <div className="mx-auto mb-10 flex max-w-2xl flex-wrap items-center justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>
                  <strong className="font-bold text-white">287</strong> people
                  signed up this week
                </span>
              </div>
              <div className="hidden h-4 w-px bg-white/30 sm:block" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  <strong className="font-bold text-white">4.9/5</strong> rating
                  from 1,200+ reviews
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/app">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group h-14 px-10 text-lg font-semibold shadow-xl"
                >
                  Start Your Free Analysis Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/80">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              No credit card required • 5 free analyses • Cancel anytime
            </p>

            {/* Trust badges */}
            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-6 opacity-80">
              <div className="text-xs text-white/70">
                <div className="mb-1 font-semibold">100% Secure</div>
                <div>SSL Encrypted</div>
              </div>
              <div className="h-8 w-px bg-white/30" />
              <div className="text-xs text-white/70">
                <div className="mb-1 font-semibold">GDPR Compliant</div>
                <div>Data Protected</div>
              </div>
              <div className="h-8 w-px bg-white/30" />
              <div className="text-xs text-white/70">
                <div className="mb-1 font-semibold">24/7 Support</div>
                <div>Always Here</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
