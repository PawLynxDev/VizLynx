import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Eraser, Palette, Video, Upload, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { auth } from "@clerk/nextjs/server";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { MagnetButton } from "@/components/landing/MagnetButton";
import { AnimatedText, SplitText } from "@/components/landing/AnimatedText";
import { MarqueeLogos } from "@/components/landing/MarqueeLogos";
import { FadeInUp } from "@/components/landing/FadeInUp";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Subtle background noise texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/70" />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="text-center">

            {/* Main Headline with Split Text Animation */}
            <SplitText
              text="Transform Your Product Visually with AI"
              className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl lg:text-8xl"
              delay={0.3}
            />

            {/* Subheadline */}
            <AnimatedText delay={0.8}>
              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
                Professional studio-quality promo photos, brand kits, and videos
                generated in seconds.
              </p>
            </AnimatedText>

            {/* CTA Buttons */}
            <AnimatedText delay={1}>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {userId ? (
                  <MagnetButton>
                    <Link href="/assets">
                      <Button
                        size="lg"
                        className="cursor-pointer bg-gray-900 px-8 py-6 text-base font-semibold shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </MagnetButton>
                ) : (
                  <>
                    <MagnetButton>
                      <Link href="/signup">
                        <Button
                          size="lg"
                          className="cursor-pointer bg-gray-900 px-8 py-6 text-base font-semibold shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md"
                        >
                          Start Creating
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </MagnetButton>
                    <Link href="#features">
                      <Button
                        size="lg"
                        variant="outline"
                        className="cursor-pointer border-2 border-gray-200 bg-white px-8 py-6 text-base font-semibold transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                      >
                        Explore Tools
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </AnimatedText>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Banner */}
      <section className="relative border-y border-gray-100 bg-gray-50 py-4">
        <div className="text-center text-sm font-medium text-gray-400 mb-4">
          Trusted by leading e-commerce brands
        </div>
        <MarqueeLogos />
      </section>

      {/* Core Services - Bento Grid */}
      <section id="features" className="relative px-4 py-32">
        <div className="container mx-auto max-w-7xl">
          <FadeInUp>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
                Premium AI Tools
              </h2>
              <p className="text-lg text-gray-600 md:text-xl">
                Studio-grade results in seconds
              </p>
            </div>
          </FadeInUp>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Block A - Promo Photos (Large) */}
            <FadeInUp delay={0.1} className="lg:col-span-2 lg:row-span-2">
              <Link href="/promote" className="block h-full">
                <SpotlightCard className="h-full">
                  <div className="group relative h-full cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md md:p-12">
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 shadow-sm">
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>

                        <h3 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                          Studio-Grade Product Promos
                        </h3>
                        <p className="mb-6 max-w-lg text-lg text-gray-600">
                          Transform raw product photos into professional marketing images with AI-powered enhancement, smart composition, and automatic copy generation.
                        </p>
                      </div>

                      <div className="inline-flex items-center text-sm font-semibold text-blue-600 transition-all duration-200">
                        Generate Photos
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 opacity-50 blur-3xl" />
                  </div>
                </SpotlightCard>
              </Link>
            </FadeInUp>

            {/* Block B - Background Cutout */}
            <FadeInUp delay={0.2}>
              <Link href="/remove-bg" className="block h-full">
                <SpotlightCard className="h-full">
                  <div className="group relative h-full cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
                    <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 shadow-sm">
                      <Eraser className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="mb-3 text-2xl font-bold text-gray-900">
                      Flawless AI Cutouts
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Remove backgrounds with pixel-perfect precision. Perfect for product catalogs and marketing materials.
                    </p>

                    <div className="inline-flex items-center text-sm font-semibold text-purple-600 transition-all duration-200">
                      Remove Backgrounds
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>

                    <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 opacity-50 blur-3xl" />
                  </div>
                </SpotlightCard>
              </Link>
            </FadeInUp>

            {/* Block C - Brand Kits */}
            <FadeInUp delay={0.3}>
              <Link href="/brand-kits" className="block h-full">
                <SpotlightCard className="h-full">
                  <div className="group relative h-full cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
                    <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 shadow-sm">
                      <Palette className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="mb-3 text-2xl font-bold text-gray-900">
                      Instant Brand Identity
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Create and manage cohesive brand kits with colors, fonts, and logos for consistent marketing.
                    </p>

                    <div className="inline-flex items-center text-sm font-semibold text-emerald-600 transition-all duration-200">
                      Create Brand Kit
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>

                    <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 opacity-50 blur-3xl" />
                  </div>
                </SpotlightCard>
              </Link>
            </FadeInUp>

            {/* Block D - AI Video Generation */}
            <FadeInUp delay={0.4} className="lg:col-span-2">
              <div className="relative h-full cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm md:p-12">
                <div className="flex flex-col justify-between md:flex-row md:items-center">
                  <div className="mb-6 md:mb-0">
                    <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 shadow-sm">
                      <Video className="h-10 w-10 text-white" />
                    </div>

                    <h3 className="mb-3 text-3xl font-bold text-gray-900">
                      Static to Cinematic Video
                    </h3>
                    <p className="mb-6 max-w-lg text-lg text-gray-600">
                      Transform still product images into engaging video content automatically.
                    </p>

                    <div className="inline-flex items-center text-sm font-semibold text-orange-600">
                      Generate Videos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="rounded-2xl bg-gray-100 p-4 shadow-sm">
                      <Video className="h-20 w-20 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-br from-orange-100 to-red-100 opacity-50 blur-3xl" />
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-y border-gray-100 bg-gray-50 px-4 py-32">
        <div className="container mx-auto max-w-5xl">
          <FadeInUp>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                Simple Process
              </h2>
              <p className="text-lg text-gray-600">
                From upload to export in three easy steps
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <FadeInUp delay={0.1}>
              <div className="text-center">
                <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm">
                  <Upload className="h-10 w-10" />
                </div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Step 1
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Upload</h3>
                <p className="text-gray-600">
                  Upload your product photos or existing assets to the platform.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="text-center">
                <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm">
                  <Wand2 className="h-10 w-10" />
                </div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Step 2
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Let AI Enhance
                </h3>
                <p className="text-gray-600">
                  Our AI automatically enhances, composes, and generates marketing content.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div className="text-center">
                <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm">
                  <Download className="h-10 w-10" />
                </div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Step 3
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Export & Sell
                </h3>
                <p className="text-gray-600">
                  Download studio-quality assets ready for your marketing channels.
                </p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-32">
        <div className="container mx-auto max-w-4xl">
          <FadeInUp>
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 text-center shadow-sm md:p-20">
              <div className="relative z-10">
                <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
                  Ready to elevate your brand?
                </h2>
                <p className="mb-8 text-lg text-gray-600 md:text-xl">
                  Join thousands of businesses creating professional content with AI
                </p>

                {userId ? (
                  <MagnetButton>
                    <Link href="/assets">
                      <Button
                        size="lg"
                        className="cursor-pointer bg-gray-900 px-10 py-7 text-lg font-semibold shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </MagnetButton>
                ) : (
                  <MagnetButton>
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="cursor-pointer bg-gray-900 px-10 py-7 text-lg font-semibold shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md"
                      >
                        Start Creating for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </MagnetButton>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 opacity-30 blur-3xl" />
              <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 opacity-30 blur-3xl" />
            </div>
          </FadeInUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
