import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Bookmark, Shirt } from "lucide-react";
import FadeInView from "@/components/FadeInView";

export default function TrialRoomBanner() {
  return (
    <section className="w-full bg-[#FAF7F2] px-6 py-14 sm:px-10 lg:px-16" aria-label="AI Virtual Trial Room Showcase">
      <div className="mx-auto max-w-7xl">
        <FadeInView
          y={28}
          margin="-60px"
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#2B2420] via-[#382D27] to-[#1E1814] p-8 text-white shadow-2xl sm:p-12 lg:p-16"
        >
          {/* Subtle decorative background glow circles */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#C05620]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[#8E3D14]/25 blur-3xl" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7DCC4]/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#F7F2E7] backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#E7C182]" />
                <span className="uppercase tracking-wider">AI Virtual Trial Room</span>
                <span className="rounded-full bg-[#C05620] px-1.5 py-0.2 text-[10px] font-bold text-white">
                  NEW
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-[#FAF7F2] sm:text-4xl lg:text-5xl">
                See How It Looks on <span className="italic text-[#E7C182]">You</span> Before You Buy.
              </h2>

              {/* Description */}
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#D5C9B8] sm:text-base">
                Eliminate sizing doubt and fitting guesswork. Upload your photo and watch our diffusion AI drape garments onto your exact body posture, generating realistic fabric folds, contours, and ambient lighting.
              </p>

              {/* Feature Points */}
              <div className="mt-6 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm text-[#F0E6D2]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#E7C182] shrink-0" />
                  <span>Interactive Split Before/After Slider</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#E7C182] shrink-0" />
                  <span>Supports Shirts, Pants &amp; Dresses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#E7C182] shrink-0" />
                  <span>Save Favorite Looks to Your Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#E7C182] shrink-0" />
                  <span>100% Free Zero-Cost Inference</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="group flex items-center gap-2 rounded-xl bg-linear-to-r from-[#C05620] to-[#8E3D14] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#A84918] hover:to-[#782E09] hover:shadow-xl hover:scale-[1.02]"
                >
                  <Sparkles className="h-4 w-4 text-[#F7F2E7] transition-transform duration-300 group-hover:rotate-12" />
                  <span>Try Outfits with AI</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/dashboard/buyer/looks"
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-medium text-[#FAF7F2] backdrop-blur-xs transition-colors hover:bg-white/10 hover:border-white/30"
                >
                  <Bookmark className="h-4 w-4 text-[#E7C182]" />
                  <span>My Saved Looks</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
                {/* Floating Mock Preview Card */}
                <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-[#E7DCC4]/20 bg-[#1F1915]">
                  {/* Decorative AI Simulation Mockup */}
                  <div className="absolute inset-0 flex flex-col justify-between p-5">
                    {/* Header tags inside card */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#2B2420]/80 px-3 py-1 text-[11px] font-medium text-[#FAF7F2] backdrop-blur-xs border border-white/10">
                        <Shirt className="h-3 w-3 text-[#E7C182]" />
                        <span>Garment Warping Active</span>
                      </span>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    </div>

                    {/* Middle Graphic / Pose Alignment Visual */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-[#C05620]/30 to-[#8E3D14]/30 border border-[#C05620]/40 shadow-inner">
                        <Sparkles className="h-10 w-10 text-[#E7C182] animate-pulse" />
                      </div>
                      <p className="font-serif text-lg font-medium text-[#FAF7F2]">
                        Photorealistic Latent Diffusion
                      </p>
                      <p className="mt-1 text-xs text-[#D5C9B8]">
                        Human Pose Masking &bull; Flow Matching
                      </p>
                    </div>

                    {/* Bottom Status pill */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-xs">
                      <div className="flex items-center justify-between text-xs text-[#E7C182]">
                        <span>Try-On Status</span>
                        <span className="font-mono text-[11px] text-emerald-400">Ready in 18s</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-4/5 rounded-full bg-linear-to-r from-[#C05620] to-[#E7C182]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating pill badges on corners */}
                <div className="absolute -bottom-3 -left-3 rounded-full border border-white/20 bg-[#2B2420] px-3.5 py-1.5 text-xs font-semibold text-[#FAF7F2] shadow-lg flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Real Body Geometry</span>
                </div>
                <div className="absolute -top-3 -right-3 rounded-full border border-[#C05620]/40 bg-[#BE531D] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F7F2E7]" />
                  <span>OOTDiffusion 2.0</span>
                </div>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
