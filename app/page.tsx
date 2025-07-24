"use client";

import Orb from "../components/ui/reactbits/OrbBackground";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardSwap, { Card } from "../components/ui/reactbits/cardSwap";
import LogoSlider from "../components/ui/LogoSlider";

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "プロイー",
  url: "https://ployee.it.com",
  description:
    "AI面接官との実践的な面接練習で、自信を持って本番に挑めます。24時間いつでも面接練習が可能。",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
    description: "無料プランでは3回まで面接練習が可能",
  },
  creator: {
    "@type": "Organization",
    name: "プロイー開発チーム",
  },
  keywords: "面接AI, AI面接, 面接練習, 就活対策, 面接対策, AI面接官",
  inLanguage: "ja-JP",
  audience: {
    "@type": "Audience",
    audienceType: "就活生, 転職希望者",
  },
};

export default function Home() {
  const router = useRouter();

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
      // Set initial states
      gsap.set(problemTextRef.current, { opacity: 0, y: 50 });
      gsap.set(problemImageRef.current, { opacity: 0, x: -50 });

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
  }, []);

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
          <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mt-16 mb-8">
                <h1
                  ref={heroTitleRef}
                  className="text-4xl text-center lg:text-6xl font-bold text-[#163300] mb-6 leading-tight"
                >
                  内定まで、何度でも叩き込む。
                  <br />
                  <span className="text-[#9fe870]">AI面接官</span>
                  、24時間フル稼働。
                </h1>
                <p
                  ref={heroSubtitleRef}
                  className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-bold text-center"
                >
                  面接で落ちる理由が、いつまでも分からない。
                  <br />
                  そんな不安を、AI面接官が&ldquo;可視化&rdquo;します。
                </p>
                <div
                  ref={heroButtonsRef}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button
                    className="cursor-pointer bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg"
                    onClick={handleClick}
                    aria-label="AI面接練習を無料で体験する"
                  >
                    無料で体験する
                  </button>
                  <button
                    className="cursor-pointer border-2 border-[#163300] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#163300] hover:text-white transition-colors"
                    onClick={handleClick2}
                    aria-label="AI面接サービスの詳細を見る"
                  >
                    サービス詳細
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section
            ref={problemSectionRef}
            className="py-20 bg-gray-200/100 backdrop-blur-sm relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div ref={problemImageRef} className="flex-1 mr-20">
                <img
                  src="/soundwave.png"
                  alt="AI面接練習中の音声波形イメージ - リアルタイム対話"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div ref={problemTextRef} className="max-w-4xl text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#163300]">
                  そんなあなたのために、
                  <br />
                  私たちは<strong>AI面接官</strong>を開発しました。
                </h2>
                <p className="text-gray-600 font-bold mt-6">
                  <strong>AIとリアルタイムで対話</strong>
                  しながら、実際の面接に近い形式で練習ができます。
                  <br />
                  いつでも・何度でも挑戦可能。
                </p>
              </div>
            </div>
          </section>

          {/* Logo Slider Section */}
          <LogoSlider />

          {/* Features Section */}
          <section className="py-20 relative z-10 mt-10 -mb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="sr-only">AI面接練習サービスの特徴</h2>
              <div className="flex items-center gap-16">
                {/* Text Content - Left Side */}
                <div className="flex-1 mb-10">
                  <h2 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-8">
                    プロイーの3つの特徴
                  </h2>
                  <div className="space-y-6">
                    <p className="text-xl text-gray-600 leading-relaxed">
                      AIとの<strong>リアルタイム対話</strong>
                      で実践的な面接練習を行い、
                      <strong>詳細な分析とフィードバック</strong>を通じて、
                      あなたの面接スキルを総合的に向上させます。
                    </p>
                  </div>
                </div>

                {/* CardSwap Component - Right Side */}
                <div
                  className="flex-1 relative mb-25"
                  style={{ marginTop: "-180px" }}
                >
                  <div style={{ height: "600px", position: "relative" }}>
                    <CardSwap
                      cardDistance={60}
                      verticalDistance={70}
                      delay={5000}
                      pauseOnHover={false}
                    >
                      {/* Lime Card */}
                      <Card customClass="!bg-[#9fe870] !border-[#9fe870]">
                        <div className="p-8 text-[#2D5016] h-full flex flex-col">
                          {/* Interview Icon */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                              <div className="w-12 h-12 bg-[#2D5016]/10 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-[#2D5016]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 leading-tight">
                              リアルタイム
                              <br />
                              面接練習
                            </h3>

                            <div className="w-12 h-0.5 bg-[#2D5016]/30 mb-4"></div>

                            <p className="text-[#2D5016]/80 text-sm leading-relaxed mb-4">
                              AIが面接官として質問し、自然な会話形式で面接の流れを体験できます。音声認識とリアルタイム応答で、実際の面接に近い環境を提供します。緊張感のある本格的な練習が可能です。
                            </p>

                            <div className="w-full h-0.5 bg-[#2D5016]/20 mb-6"></div>

                            <button className="bg-[#2D5016] text-white px-4 py-3 rounded-3xl text-sm font-medium hover:bg-[#2D5016]/90 transition-colors">
                              今すぐ試す →
                            </button>
                          </div>
                        </div>
                      </Card>

                      {/* Green Card */}
                      <Card customClass="!bg-[#163300] !border-[#163300]">
                        <div className="p-8 text-white h-full flex flex-col">
                          {/* Performance Icon */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                              <div className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center">
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 leading-tight">
                              面接パフォーマンス
                              <br />
                              評価
                            </h3>

                            <div className="w-12 h-0.5 bg-white/30 mb-4"></div>

                            <p className="text-gray-200 text-sm leading-relaxed mb-4">
                              多角的な視点からあなたの面接パフォーマンスを分析・評価します。話し方、表情、回答内容、論理性など細かい項目まで詳細に分析し、具体的な改善点を提示します。
                            </p>

                            <div className="w-full h-0.5 bg-white/20 mb-6"></div>

                            <button className="bg-[#9fe870] text-[#163300] px-4 py-3 rounded-3xl text-sm font-medium hover:bg-[#9fe870]/90 transition-colors">
                              評価を見る →
                            </button>
                          </div>
                        </div>
                      </Card>

                      {/* Pink Card */}
                      <Card customClass="!bg-[#f5b0ea] !border-[#f5b0ea]">
                        <div className="p-8 text-[#721C24] h-full flex flex-col">
                          {/* Feedback Icon */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                              <div className="w-12 h-12 bg-[#721C24]/10 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-[#721C24]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 leading-tight">
                              フィードバックと
                              <br />
                              強み発見
                            </h3>

                            <div className="w-12 h-0.5 bg-[#721C24]/30 mb-4"></div>

                            <p className="text-[#721C24]/80 text-sm leading-relaxed mb-4">
                              弱点の改善だけでなく、あなたの長所も発見し、より魅力的にアピールできるようサポートします。個人の特性を活かした回答パターンの提案や、自信を持って話せるポイントを明確化します。
                            </p>

                            <div className="w-full h-0.5 bg-[#721C24]/20 mb-6"></div>

                            <button className="bg-[#721C24] text-white px-4 py-3 rounded-3xl text-sm font-medium hover:bg-[#721C24]/90 transition-colors">
                              強みを発見 →
                            </button>
                          </div>
                        </div>
                      </Card>
                    </CardSwap>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Transformation Section */}
          <section className="w-full flex justify-center items-center py-32 bg-transparent mt-15">
            <div
              className="w-full max-w-5xl rounded-[48px] bg-[#163300] flex flex-col items-center px-8 pt-28 pb-20 relative"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            >
              <img
                src="/interviewericon.png"
                alt="Interviewer Icon"
                className="w-80 h-80 object-contain absolute -top-40 left-1/2 -translate-x-1/2 drop-shadow-xl"
                style={{ zIndex: 2 }}
                draggable={false}
              />
              <h2 className="text-5xl md:text-6xl font-extrabold text-[#9fe870] text-center mb-6 leading-tight mt-2">
                過去問で鍛えられたAI面接官が
                <br />
                あなたの自信を引き出す
              </h2>
              <p className="text-lg md:text-xl text-white text-center mb-10 max-w-2xl">
                豊富な過去問データでAIが徹底指導。自信を持って本番に挑もう
              </p>
              <button
                className="bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-xl transition-colors shadow-lg"
                onClick={() => router.push("/interview/new")}
              >
                AI面接を無料で体験する
              </button>
            </div>
          </section>

          {/* AI Interview Speed Comparison Section */}
          <section
            ref={speedSectionRef}
            className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
          >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#9fe870]/5 to-[#163300]/5"></div>
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#9fe870]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#163300]/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Main Header */}
              <div ref={speedHeaderRef} className="text-center mb-20">
                <div className="inline-flex items-center bg-[#9fe870]/20 px-6 py-2 rounded-full mb-6">
                  <svg
                    className="w-5 h-5 text-[#163300] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-[#163300] font-semibold">
                    革新的な学習体験
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-[#163300] mb-8 leading-tight">
                  従来の面接練習より
                  <br />
                  <span className="text-[#9fe870] relative">
                    5倍
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#9fe870]/30 rounded-full"></div>
                  </span>
                  効率的
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  書籍や動画での学習では限界がある。
                  <br />
                  AI面接官との
                  <em className="italic font-semibold">リアルタイム対話</em>で、
                  実践的なスキルを短時間で身につけることができます。
                </p>
              </div>

              {/* Speed Comparison Cards */}
              <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-16 -mt-2">
                {/* Traditional Study Card */}
                <div
                  ref={keyboardCardRef}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 relative overflow-hidden transition-all duration-500"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-2xl">
                        <svg
                          className="w-8 h-8 text-gray-600"
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
                        <h3 className="text-2xl font-bold text-gray-800">
                          従来の学習方法
                        </h3>
                        <p className="text-gray-500">参考書・動画学習</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-red-500">
                        週5時間
                      </div>
                      <div className="text-sm text-gray-500">
                        必要な学習時間
                      </div>
                    </div>
                  </div>

                  {/* Content Area - Fixed Height */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 h-80 relative overflow-hidden">
                    {/* Progress Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-150"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse animation-delay-300"></div>
                      </div>
                    </div>

                    {/* Content with Fixed Container */}
                    <div className="h-full flex flex-col justify-between">
                      <div className="space-y-4 text-gray-700">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 mt-1"></div>
                          <div className="typing-text-slow min-h-[1.5rem]">
                            自己分析をして...志望動機を考えて...
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 mt-1"></div>
                          <div className="typing-text-slow min-h-[1.5rem] animation-delay-300">
                            想定質問を暗記して...一人で練習して...
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 mt-1"></div>
                          <div className="typing-text-slow min-h-[1.5rem] animation-delay-600">
                            でも本番では緊張して上手く話せない...
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 mt-1"></div>
                          <div className="typing-text-slow min-h-[1.5rem] animation-delay-900">
                            改善点がよく分からない...
                          </div>
                        </div>
                      </div>

                      {/* Bottom Status */}
                      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-red-500 flex-shrink-0"
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
                          <p className="text-red-600 font-medium">
                            フィードバックが不十分・成長が見えにくい
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Interview Card */}
                <div
                  ref={flowCardRef}
                  className="group bg-[#9fe870]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#9fe870]/30 relative overflow-hidden transition-all duration-500"
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#9fe870]/20 to-[#163300]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>

                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-[#9fe870]/20 rounded-2xl">
                          <svg
                            className="w-8 h-8 text-[#163300]"
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
                          <h3 className="text-2xl font-bold text-[#163300]">
                            AI面接練習
                          </h3>
                          <p className="text-[#163300]/70">AI面接官との対話</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-[#9fe870]">
                          週1時間
                        </div>
                        <div className="text-sm text-[#163300]/70">
                          効率的な学習時間
                        </div>
                      </div>
                    </div>

                    {/* Content Area - Fixed Height */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-80 relative overflow-hidden border border-[#9fe870]/20">
                      {/* AI Voice Indicator */}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center space-x-2 bg-[#9fe870]/30 px-3 py-2 rounded-full">
                          <div className="w-2 h-2 bg-[#163300] rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-[#163300] rounded-full animate-pulse animation-delay-150"></div>
                          <div className="w-2 h-2 bg-[#163300] rounded-full animate-pulse animation-delay-300"></div>
                          <span className="text-xs text-[#163300] font-medium ml-2">
                            AI対話中
                          </span>
                        </div>
                      </div>

                      {/* Content with Fixed Container */}
                      <div className="h-full flex flex-col justify-between">
                        <div className="space-y-4 text-[#163300]">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-[#9fe870] flex-shrink-0 mt-1 flex items-center justify-center">
                              <div className="w-2 h-2 bg-[#163300] rounded-full"></div>
                            </div>
                            <div className="typing-text-fast min-h-[1.5rem]">
                              AI面接官：&ldquo;志望動機を教えてください&rdquo;
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 mt-1 flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <div className="typing-text-fast min-h-[1.5rem] animation-delay-200">
                              あなた：&ldquo;御社の革新的な技術に...&rdquo;
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-[#9fe870] flex-shrink-0 mt-1 flex items-center justify-center">
                              <div className="w-2 h-2 bg-[#163300] rounded-full"></div>
                            </div>
                            <div className="typing-text-fast min-h-[1.5rem] animation-delay-400">
                              AI面接官：&ldquo;具体的にはどのような...&rdquo;
                            </div>
                          </div>
                          <div className="space-y-2 mt-6">
                            <div className="flex items-center space-x-2 text-sm">
                              <svg
                                className="w-4 h-4 text-[#9fe870]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>リアルタイムフィードバック</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <svg
                                className="w-4 h-4 text-[#9fe870]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>改善点の具体的提案</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Status */}
                        <div className="bg-[#9fe870]/20 backdrop-blur-sm border border-[#9fe870] rounded-xl p-4">
                          <div className="flex items-center space-x-2">
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
                            <p className="text-[#163300] font-medium">
                              詳細な分析とパーソナライズドフィードバック
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="inline-flex flex-col items-center">
                  <button
                    className="group relative bg-[#9fe870] text-[#163300] px-12 py-5 rounded-4xl font-bold text-xl transition-all duration-300 hover:scale-105"
                    onClick={() => router.push("/interview/new")}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r rounded-4xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <span className="relative flex items-center space-x-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>今すぐAI面接練習を体験する</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </button>
                  <p className="text-gray-500 text-sm mt-3">
                    無料で3回まで体験可能
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer - now positioned normally after all content */}
        <footer ref={footerRef} className="bg-[#163300] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">プロイー</h3>
                <p className="text-gray-300">AI面接練習で内定を掴む</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">サービス</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      AI面接練習
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      フィードバック
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      料金プラン
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">サポート</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      ヘルプセンター
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      お問い合わせ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      利用規約
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">会社情報</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      会社概要
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      プライバシーポリシー
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      採用情報
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-300">
                © 2024 プロイー. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
