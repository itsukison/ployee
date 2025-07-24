import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "プロイーについて | AI面接練習サービスの詳細 - 面接AI練習プラットフォーム",
  description:
    "プロイーは、AI面接官との実践的な面接練習を通じて就活生の内定獲得をサポートします。面接AI、面接対策、就活支援について詳しくご紹介。",
  keywords: [
    "プロイー",
    "AI面接",
    "面接練習",
    "就活対策",
    "AI面接官",
    "面接AI",
    "就職活動支援",
  ],
  openGraph: {
    title: "プロイーについて | AI面接練習サービス",
    description:
      "プロイーは、AI面接官との実践的な面接練習を通じて就活生の内定獲得をサポートします。",
    url: "https://ployee.it.com/about",
    images: [
      {
        url: "https://ployee.it.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "プロイー - AI面接練習サービスについて",
      },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "プロイーについて",
  url: "https://ployee.it.com/about",
  description:
    "プロイーは、AI面接官との実践的な面接練習を通じて就活生の内定獲得をサポートするサービスです。",
  mainEntity: {
    "@type": "Organization",
    name: "プロイー",
    url: "https://ployee.it.com",
    description: "AI面接練習プラットフォーム",
    foundingDate: "2024",
    areaServed: "日本",
    serviceType: "面接練習サービス",
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-6">
              プロイーについて
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <strong>AI面接練習</strong>
              で就活生の内定獲得をサポートする、革新的なプラットフォームです。
            </p>
          </header>

          <main>
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-[#163300] mb-6">
                私たちのミッション
              </h2>
              <div className="bg-gray-50 rounded-xl p-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  就活において「面接」は最も重要な関門の一つです。しかし、多くの学生が面接練習の機会を十分に得られないまま本番に臨んでいるのが現状です。
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  プロイーは、<strong>AI面接官との実践的な練習</strong>
                  を通じて、就活生が自信を持って面接に挑めるよう支援します。24時間いつでも利用可能な
                  <strong>面接AI</strong>
                  により、繰り返し練習することで面接スキルの向上を実現します。
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-[#163300] mb-6">
                サービスの特徴
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <article className="bg-white border-2 border-[#9fe870] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#163300] mb-4">
                    リアルタイム面接練習
                  </h3>
                  <p className="text-gray-600">
                    <strong>AI面接官</strong>
                    がリアルタイムで質問し、自然な会話形式での面接練習が可能です。実際の面接に近い環境で練習できます。
                  </p>
                </article>

                <article className="bg-white border-2 border-[#9fe870] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#163300] mb-4">
                    詳細なフィードバック
                  </h3>
                  <p className="text-gray-600">
                    面接後に詳細な<strong>フィードバック</strong>
                    を提供。改善点だけでなく、強みも発見し、より魅力的なアピールができるようサポートします。
                  </p>
                </article>

                <article className="bg-white border-2 border-[#9fe870] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#163300] mb-4">
                    24時間利用可能
                  </h3>
                  <p className="text-gray-600">
                    時間や場所を選ばず、いつでも<strong>面接練習</strong>
                    が可能。忙しい就活スケジュールの中でも、効率的にスキルアップできます。
                  </p>
                </article>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-[#163300] mb-6">
                なぜプロイーなのか
              </h2>
              <div className="bg-[#163300] rounded-xl p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-[#9fe870]">
                      従来の問題点
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 面接練習の機会が限られている</li>
                      <li>• 客観的なフィードバックを得られない</li>
                      <li>• 本番までに十分な練習ができない</li>
                      <li>• 面接への不安が解消されない</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-[#9fe870]">
                      プロイーの解決策
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• いつでも何度でも練習可能</li>
                      <li>• AIによる客観的で詳細な評価</li>
                      <li>• 実践的な面接環境の提供</li>
                      <li>• 継続的なスキル向上支援</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-[#163300] mb-6">対象者</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">
                    就活生
                  </h3>
                  <p className="text-blue-700">
                    新卒採用を目指す大学生・大学院生。面接に不安を感じている方、面接スキルを向上させたい方に最適です。
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-4">
                    転職希望者
                  </h3>
                  <p className="text-green-700">
                    転職活動中の社会人。久しぶりの面接で不安を感じている方、転職成功率を高めたい方におすすめです。
                  </p>
                </div>
              </div>
            </section>

            <section className="text-center">
              <h2 className="text-3xl font-bold text-[#163300] mb-6">
                今すぐ始めてみませんか？
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                <strong>AI面接練習</strong>
                で、あなたの面接スキルを飛躍的に向上させましょう。
              </p>
              <a
                href="/interview/new"
                className="inline-block bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg"
              >
                無料で面接練習を始める
              </a>
              <p className="text-sm text-gray-500 mt-4">
                ※ 無料プランでは3回まで面接練習が可能です
              </p>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
