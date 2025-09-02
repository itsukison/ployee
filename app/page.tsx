"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../constants/logo.png";
import Image from "next/image";

// Enhanced Structured Data for SEO and Rich Snippets
const structuredData = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "プロイー",
  alternateName: "Ployee",
  url: "https://www.ployee.net",
  description:
    "AI面接官との実践練習で面接突破率を5倍向上。リアルタイム分析・個別フィードバック付き。就活生95%が「自信がついた」と評価。",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "面接練習アプリケーション",
  operatingSystem: "Web Browser",
  browserRequirements: "HTML5, JavaScript enabled",
  softwareVersion: "1.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: "ja-JP",
  isAccessibleForFree: true,
  usageInfo: "https://www.ployee.net/terms",
  privacyPolicy: "https://www.ployee.net/privacy",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
    description: "無料プランでは3回まで面接練習が可能",
    availability: "https://schema.org/InStock",
    validFrom: "2024-01-01",
    eligibleRegion: {
      "@type": "Country",
      name: "日本",
    },
  },
  provider: {
    "@type": "Organization",
    name: "プロイー開発チーム",
    url: "https://www.ployee.net",
    logo: {
      "@type": "ImageObject",
      url: "https://www.ployee.net/logo.png",
    },
  },
  creator: {
    "@type": "Organization",
    name: "プロイー開発チーム",
  },
  keywords: [
    "AI面接練習",
    "面接対策",
    "AI面接官",
    "就活対策",
    "転職面接",
    "面接シミュレーション",
    "リアルタイム分析",
    "個別フィードバック",
  ],
  audience: {
    "@type": "Audience",
    audienceType: ["就活生", "転職希望者", "新卒採用対象者"],
    geographicArea: {
      "@type": "Country",
      name: "日本",
    },
  },
  featureList: [
    "AI面接官とのリアルタイム対話",
    "24時間いつでも練習可能",
    "詳細な分析とフィードバック",
    "個人最適化された改善提案",
    "ダウンロード可能な面接記録",
  ],
  screenshot: {
    "@type": "ImageObject",
    url: "https://www.ployee.net/screenshot.png",
    caption: "AI面接練習プラットフォームのスクリーンショット",
  },
  potentialAction: {
    "@type": "UseAction",
    name: "面接練習を始める",
    description: "AI面接官との実践的な面接練習を開始",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.ployee.net/interview/new",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "Thing",
      name: "面接スキルの向上",
    },
  },
  mainEntity: {
    "@type": "WebPage",
    "@id": "https://www.ployee.net/#webpage",
    url: "https://www.ployee.net",
    name: "AI面接練習プラットフォーム「プロイー」",
    description:
      "AI面接官との実践練習で面接突破率を5倍向上",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://www.ployee.net/og-image.jpg",
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".hero-subtitle"],
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1247",
    bestRating: "5",
    worstRating: "1",
    description: "就活生からの高評価",
  },
};

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Refs for GSAP animations
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);

  // Refs for Problem Section animations
  const problemSectionRef = useRef<HTMLElement>(null);
  const problemTextRef = useRef<HTMLDivElement>(null);
  const problemImageRef = useRef<HTMLDivElement>(null);

  // Refs for Transformation Section animations
  const transformationSectionRef = useRef<HTMLElement>(null);
  const transformationTextRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);

  // Refs for Speed Comparison Section animations
  const speedSectionRef = useRef<HTMLElement>(null);
  const speedHeaderRef = useRef<HTMLDivElement>(null);
  const keyboardCardRef = useRef<HTMLDivElement>(null);
  const flowCardRef = useRef<HTMLDivElement>(null);

  // Refs for Post Labs-style reveal animation
  const mainContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Function to split text into individual characters
  const splitTextIntoChars = (text: string) => {
    return text.split("").map((char, index) => (
      <span key={index} className="char">
        {char}
      </span>
    ));
  };

  const handleClick = () => {
    router.push("/interview/new");
  };
  const handleClick2 = () => {
    router.push("/interview");
  };

  // GSAP animations
  useEffect(() => {
    // Don't run animations if user is signed in (they'll be redirected)
    if (!isLoaded || isSignedIn) {
      return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Hero section staggered fade-in
    const heroTl = gsap.timeline();

    // Set initial opacity to 0 for all hero elements
    gsap.set(
      [heroTitleRef.current, heroSubtitleRef.current, heroButtonsRef.current],
      {
        opacity: 0,
        y: 30,
      }
    );

    // Staggered animation sequence for hero
    heroTl
      .to(heroTitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(
        heroSubtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .to(
        heroButtonsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      );

    // Problem section scroll-triggered animations
    if (
      problemSectionRef.current &&
      problemTextRef.current &&
      problemImageRef.current
    ) {
      // Set initial states (removed x animation for image)
      gsap.set(problemTextRef.current, { opacity: 1, y: 10 });
      gsap.set(problemImageRef.current, { opacity: 1 }); // Cube always visible

      // Create scroll-triggered timeline
      const problemTl = gsap.timeline({
        scrollTrigger: {
          trigger: problemSectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // First: Grey background fills the section (this happens naturally with the section)
      // Then: Text and image fade in after more scrolling
      problemTl
        .to(
          problemTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
          },
          0.3
        )
        .to(
          problemImageRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
          },
          0.5
        );
    }

    // Speed Comparison section scroll-triggered animations
    if (
      speedSectionRef.current &&
      speedHeaderRef.current &&
      keyboardCardRef.current &&
      flowCardRef.current
    ) {
      // Set initial states
      gsap.set(speedHeaderRef.current, { opacity: 0, y: 30 });
      gsap.set(keyboardCardRef.current, { opacity: 0, x: -30 });
      gsap.set(flowCardRef.current, { opacity: 0, x: 30 });

      // Create scroll-triggered timeline with faster animations
      const speedTl = gsap.timeline({
        scrollTrigger: {
          trigger: speedSectionRef.current,
          start: "top 90%", // Start earlier
          end: "top 50%", // End earlier for faster completion
          scrub: 0.5, // Reduce scrub for snappier animations
        },
      });

      speedTl
        .to(
          speedHeaderRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          0
        )
        .to(
          keyboardCardRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.2
        )
        .to(
          flowCardRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.3
        );
    }

    // Footer is now positioned normally after content - no special animation needed

    // Cleanup function to prevent memory leaks and scroll issues
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.refresh();
    };
  }, [isLoaded, isSignedIn]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#9fe870] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Don't render homepage content if user is signed in (they'll be redirected)
  if (isSignedIn) {
    return null;
  }

  return (
    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white relative">
        {/* Main content wrapper */}
        <div ref={mainContentRef} className="relative bg-white">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2F4F3F] -mt-16">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-[#142d25]"></div>

            <div className="mobile-container relative z-10">
              <div className="text-left mobile-mb-medium">
                {/* Feature badges - moved down to account for navbar */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mobile-mb-medium mt-20 sm:mt-32">
                  <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full border border-white/20 text-white/80 text-xs sm:text-sm font-medium backdrop-blur-sm">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    24時間利用可能
                  </div>
                  <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full border border-white/20 text-white/80 text-xs sm:text-sm font-medium backdrop-blur-sm">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    AI面接官搭載
                  </div>
                  <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full border border-white/20 text-white/80 text-xs sm:text-sm font-medium backdrop-blur-sm">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    リアルタイム分析
                  </div>
                </div>
                {/* Main heading and button container */}
                <div className="mb-12">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden text-center space-y-4 sm:space-y-6 p-x-3">
                    <h1
                      ref={heroTitleRef}
                      className="text-5xl sm:text-6xl font-bold text-white leading-relaxed text-left"
                    >
                      面接の不安
                      <br />
                      <span className="text-[#9fe870]">AI面接官</span>
                      <br />
                      で潰せ
                    </h1>

                    {/* Mobile CTA button */}
                    <div ref={heroButtonsRef} className="mt-6 sm:mt-8">
                      <button
                        className="group relative inline-flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 bg-[#9fe870] text-[#163300] rounded-full font-semibold text-base sm:text-lg hover:bg-[#8fd960] transition-all duration-300 hover:scale-105 shadow-xl"
                        onClick={handleClick}
                        aria-label="AI面接練習を無料で体験する"
                      >
                        <span className="mr-3">無料で体験する</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#ff8c5a] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout - Original Structure */}
                  <div className="hidden lg:block">
                    <div className="flex items-end justify-between space-y-5">
                      <div className="flex-1">
                        <div className="text-6xl lg:text-8xl font-bold text-white leading-tight text-left">
                          面接の不安
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <h1
                          ref={heroTitleRef}
                          className="text-6xl lg:text-8xl font-bold text-white mb-0 leading-tight text-left"
                        >
                          <span className="text-[#9fe870]">AI面接官</span>
                          で潰せ
                        </h1>
                      </div>

                      {/* Desktop CTA button positioned next to second row */}
                      <div
                        ref={heroButtonsRef}
                        className="flex-shrink-0 mb-2 ml-8"
                      >
                        <button
                          className="group relative inline-flex items-center px-8 py-4 mb-5 bg-[#9fe870] text-[#163300] rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-all duration-300 hover:scale-105 shadow-xl"
                          onClick={handleClick}
                          aria-label="AI面接練習を無料で体験する"
                        >
                          <span className="mr-3">無料で体験する</span>
                          <div className="w-8 h-8 bg-[#ff8c5a] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p
                  ref={heroSubtitleRef}
                  className="text-sm sm:text-base lg:text-xl text-white/80 mobile-mb-large max-w-4xl leading-relaxed text-left"
                >
                  プロイーはAI面接官による実践的な面接練習で、次世代の就活・転職活動をサポートします。
                  <br className="hidden sm:block" />
                  <span className="block sm:inline">
                    {" "}
                    詳細な分析、リアルタイムフィードバック、そして成長を実感できる環境—すべてを統合した<br />プラットフォームです。
                  </span>
                </p>

                {/* Trusted by section */}
                <div className="text-left">
                  <p className="text-white/60 text-xs sm:text-sm mobile-mb-small -mt-5">
                    就活生から信頼されています
                  </p>
                  <div className="overflow-hidden">
                    <img
                      src="/companies.png"
                      alt="信頼される企業のロゴ - 多くの就活生と転職者に選ばれています"
                      className="w-full max-w-xs sm:max-w-2xl opacity-60 hover:opacity-80 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Problem Section - Campfire.ai Style */}
          <section
            ref={problemSectionRef}
            className="mobile-section-padding bg-white relative overflow-hidden"
          >
            <div className="mobile-container">
              <div className="text-center mobile-mb-large">
                <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#f8f9fa] border border-gray-200 text-gray-600 text-xs sm:text-sm font-medium mobile-mb-medium">
                  <div className="w-2 h-2 bg-[#ff8c5a] rounded-full mr-2 sm:mr-3"></div>
                  問題の解決
                </div>
                <h2 className="mobile-text-heading font-bold text-gray-900 mobile-mb-medium leading-tight max-w-4xl mx-auto">
                  面接の不安を解消する
                  <br />
                  <span className="text-[#163300]">AI面接官</span>
                </h2>
                <p className="mobile-text-subheading text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  従来の面接対策では限界がある問題を、AI技術で根本的に解決します。
                </p>
              </div>

              <div className="mobile-grid-2 gap-8 lg:gap-20 items-center">
                {/* Image - Order changes for mobile (image first) */}
                <div
                  ref={problemImageRef}
                  className="relative flex justify-center items-center min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] order-1 lg:order-1"
                >
                  <div className="relative">
                    {/* Background decorative elements */}
                    <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-8 h-8 sm:w-16 sm:h-16 bg-[#9fe870]/40 rounded-full blur-lg"></div>

                    {/* Main image with enhanced styling */}
                    <div className="relative z-10">
                      <img
                        src="/sound.png"
                        alt="AI面接練習システム"
                        width={300}
                        height={300}
                        className="drop-shadow-lg w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Content - Order 2 for mobile */}
                <div
                  ref={problemTextRef}
                  className="space-y-6 sm:space-y-8 order-2 lg:order-2"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight text-center lg:text-left">
                      AIとのリアルタイム対話で
                      <br className="hidden sm:block" />
                      <span className="block sm:inline">
                        実践的な面接練習を実現
                      </span>
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-center lg:text-left">
                      従来の一方向的な学習ではなく、AI面接官との双方向対話により、
                      本番に近い環境での練習が可能。詳細な分析とフィードバックで、
                      あなたの面接スキルを確実に向上させます。
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-[#9fe870]/10 rounded-xl sm:rounded-2xl">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#9fe870] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-[#163300]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                          24時間いつでも練習可能
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          時間や場所に制約されることなく、自分のペースで面接練習
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-[#9fe870]/10 rounded-xl sm:rounded-2xl">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#9fe870] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-[#163300]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                          リアルタイム分析・評価
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          音声、表情、回答内容を総合的に分析し、具体的な改善点を提示
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-[#9fe870]/10 rounded-xl sm:rounded-2xl">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#9fe870] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-[#163300]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                          個人最適化されたフィードバック
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          あなたの特性に合わせた改善提案と強みの発見
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mobile-section-padding relative z-10">
            <div className="mobile-container">
              <h2 className="sr-only">AI面接練習サービスの特徴</h2>
              <div className="mobile-grid-2 gap-8 lg:gap-16 items-center">
                {/* Text Content - Left Side */}
                <div className="mobile-mb-medium order-2 lg:order-1">
                  <h2 className="mobile-text-heading font-bold text-[#163300] mobile-mb-medium text-center lg:text-left">
                    プロイーの3つの特徴
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed text-center lg:text-left">
                      AIとの<strong>リアルタイム対話</strong>
                      で実践的な面接練習を行い、<br />
                      <strong>業界別特化した</strong>質問にも対応。
                      <strong>詳細な分析とフィードバック</strong>を通じて、
                      あなたの面接スキルを総合的に向上させます。
                    </p>
                  </div>
                </div>

                {/* Image - Right Side */}
                <div className="relative order-1 lg:order-2">
                  <img
                    src="/interview.png"
                    alt="interview"
                    className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-full h-auto mx-auto"
                    width={1000}
                    height={1000}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Transformation Section */}
          <section className="w-full flex justify-center items-center py-20 sm:py-24 lg:py-32 bg-transparent mt-8 sm:mt-12 lg:mt-16">
            <div
              className="w-full max-w-5xl rounded-[24px] sm:rounded-[32px] lg:rounded-[48px] bg-[#163300] flex flex-col items-center px-4 sm:px-8 pt-20 sm:pt-28 pb-12 sm:pb-20 relative mx-4"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            >
              <img
                src="/interviewericon.png"
                alt="Interviewer Icon"
                className="w-48 h-48 sm:w-60 sm:h-60 lg:w-80 lg:h-80 object-contain absolute -top-24 sm:-top-30 lg:-top-40 left-1/2 -translate-x-1/2 drop-shadow-xl"
                style={{ zIndex: 2 }}
                draggable={false}
              />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#9fe870] text-center mobile-mb-small leading-tight mt-2">
                過去問で鍛えられたAI面接官が
                <br className="hidden sm:block" />
                <span className="block sm:inline">あなたの自信を引き出す</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white text-center mobile-mb-medium max-w-2xl px-4">
                豊富な過去問データでAIが徹底指導。自信を持って本番に挑もう
              </p>
              <button
                className="bg-[#9fe870] text-[#163300] w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg lg:text-xl transition-colors shadow-lg"
                onClick={() => router.push("/interview/new")}
              >
                AI面接を無料で体験する
              </button>
            </div>
          </section>

          {/* Enhanced Speed Comparison Section - Campfire.ai Style */}
          <section
            ref={speedSectionRef}
            className="mobile-section-padding bg-white relative overflow-hidden"
          >
            <div className="mobile-container relative z-10">
              {/* Main Header */}
              <div ref={speedHeaderRef} className="text-center mobile-mb-large">
                <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#f8f9fa] border border-gray-200 text-gray-600 text-xs sm:text-sm font-medium mobile-mb-medium">
                  <div className="w-2 h-2 bg-[#ff8c5a] rounded-full mr-2 sm:mr-3"></div>
                  効率性の比較
                </div>
                <h2 className="mobile-text-heading font-bold text-gray-900 mobile-mb-medium leading-tight max-w-4xl mx-auto">
                  従来の面接練習より
                  <br />
                  <span className="text-[#163300] relative">
                    5倍効率的
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#9fe870] rounded-full"></div>
                  </span>
                </h2>
                <p className="text-xs sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  書籍や動画での学習では限界がある。AI面接官とのリアルタイム対話で、
                  実践的なスキルを短時間で身につけることができます。
                </p>
              </div>

              {/* Comparison Cards */}
              <div className="mobile-grid-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto mobile-mb-large">
                {/* Traditional Method Card */}
                <div
                  ref={keyboardCardRef}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            <span className="sm:hidden">従来の方法</span>
                            <span className="hidden sm:inline">
                              従来の学習方法
                            </span>
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            参考書・動画学習
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-2xl font-bold text-[#ff8c5a]">
                          週5時間
                        </div>
                        <div className="hidden sm:block text-xs text-gray-500">
                          必要な学習時間
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          自己分析と志望動機の準備
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          想定質問の暗記と一人練習
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          本番で緊張して上手く話せない
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          具体的な改善点が分からない
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#ff8c5a]/10 border border-[#ff8c5a]/30 rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-[#ff8c5a] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-[#ff8c5a] font-medium text-sm">
                          フィードバックが不十分・成長が見えにくい
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Method Card */}
                <div
                  ref={flowCardRef}
                  className="bg-white rounded-3xl border-2 border-[#9fe870] overflow-hidden relative"
                >
                  {/* Popular Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-[#9fe870] text-[#163300] px-3 py-1 rounded-full text-xs font-semibold">
                      推奨
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className="p-8 border-b border-[#9fe870]/20 bg-[#9fe870]/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#9fe870]/20 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-[#163300]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-[#163300]">
                            AI面接練習
                          </h3>
                          <p className="text-[#163300]/70 text-xs sm:text-sm">
                            AI面接官との対話
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-2xl font-bold text-[#163300]">
                          週1時間
                        </div>
                        <div className="hidden sm:block text-xs text-[#163300]/70">
                          効率的な学習時間
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          AI面接官とのリアルタイム対話
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          即座のフィードバックと分析
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          本番に近い緊張感での練習
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          個人最適化された改善提案
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#9fe870]/10 border border-[#9fe870] rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-[#163300] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-[#163300] font-medium text-sm">
                          詳細な分析とパーソナライズドフィードバック
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <button
                  className="bg-[#163300] text-white w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-[#163300]/90 transition-all duration-300 hover:scale-105 shadow-lg"
                  onClick={() => router.push("/interview/new")}
                >
                  今すぐAI面接練習を体験する
                </button>
                <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
                  無料で月1回まで体験可能
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Enhanced Footer - Campfire.ai Style */}
        <footer
          ref={footerRef}
          className="bg-[#163300] text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="grid grid-cols-12 gap-4 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full w-1 h-1 opacity-20"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {/* Main Footer Content */}
            <div className="mobile-container mobile-section-padding">
              <div className="mobile-grid-2 gap-8 lg:gap-16 items-start mobile-mb-large">
                {/* Left: Call to Action */}
                <div className="flex flex-col justify-start h-full text-center lg:text-left">
                  <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-[#9fe870]/20 text-[#9fe870] text-xs sm:text-sm font-medium mobile-mb-small mx-auto lg:mx-0 w-fit">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    始めましょう
                  </div>
                  <h2 className="mobile-text-heading font-bold mobile-mb-small leading-tight">
                    AI面接練習で
                    <br />
                    内定を掴む
                  </h2>
                  <p className="text-gray-300 text-base sm:text-lg mobile-mb-medium leading-relaxed">
                    プロイーで面接スキルを向上させ、<br />理想の企業への内定を実現しましょう。
                  </p>
                  <button
                    className="bg-[#9fe870] text-[#163300] w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-[#9fe870]/90 transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => router.push("/interview/new")}
                  >
                    無料で始める
                  </button>
                </div>

                {/* Right: Navigation Menu */}
                <div className="bg-[#1a4a35] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 h-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mobile-mb-medium">
                    {/* Products Column */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                        サービス
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <button
                            onClick={() => router.push("/ai-interview-practice")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            AI面接練習
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => router.push("/feedback-analysis")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            フィードバック分析
                          </button>
                        </li>
                        <li>
                           <button
                            onClick={() => router.push("/es-correction")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            ES添削
                          </button>
                           </li>
                        <li>
                          <button
                            onClick={() => router.push("/pricing")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            料金プラン
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                        リソース
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <button
                            onClick={() => router.push("/help-center")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            ヘルプセンター
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => router.push("/interview-prep-guide")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            面接対策ガイド
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => router.push("/contact")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            お問い合わせ
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Solutions Column */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                        ソリューション
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <button
                            onClick={() => router.push("/for-students")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            就活生向け
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => router.push("/for-career-changers")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            転職者向け（近日公開）
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => router.push("/for-companies")}
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm text-left"
                          >
                            企業向け
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Note: Removed Social Links section completely */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-600 mt-auto">
                    <p className="text-gray-400 text-xs text-center">
                      2025年 プロイー開発チーム
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-600">
              <div className="mobile-container py-6 sm:py-8">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  {/* Logo and Brand */}
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#9fe870] rounded-lg flex items-center justify-center">
                      <Image src={logo} alt="logo" className="w-full h-full" />
                    </div>
                    <span className="text-white font-bold text-lg sm:text-xl">
                      プロイー
                    </span>
                  </div>

                  {/* Legal Links */}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-center">
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      利用規約
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      プライバシーポリシー
                    </a>
                    <p className="text-gray-400">
                      © 2025 プロイー. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
