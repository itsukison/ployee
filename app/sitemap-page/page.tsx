import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "サイトマップ | プロイー - AI面接練習プラットフォーム",
  description:
    "プロイーのサイトマップ。AI面接練習、面接対策、就活支援に関するすべてのページをご確認いただけます。",
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapPage() {
  const pages = [
    {
      title: "ホーム",
      url: "/",
      description: "プロイーのメインページ。AI面接練習サービスの概要をご紹介。",
    },
    {
      title: "プロイーについて",
      url: "/about",
      description: "プロイーのサービス詳細、特徴、使命について詳しくご説明。",
    },
    {
      title: "面接対策のコツ・テクニック",
      url: "/tips",
      description:
        "面接成功のための実践的なアドバイスとAI面接練習の効果的な活用法。",
    },
    {
      title: "新しい面接練習を始める",
      url: "/interview/new",
      description: "AI面接官との実践的な面接練習を今すぐ開始。",
    },
    {
      title: "面接練習",
      url: "/interview",
      description: "進行中の面接練習セッションにアクセス。",
    },
    {
      title: "過去の面接履歴",
      url: "/past",
      description: "これまでの面接練習の記録とフィードバックを確認。",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-6">
            サイトマップ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            プロイーの全ページへのリンクをまとめました。お探しのページを見つけてください。
          </p>
        </header>

        <main>
          <div className="space-y-6">
            {pages.map((page, index) => (
              <article
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-[#163300] mb-3">
                  <Link
                    href={page.url}
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    {page.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-3">{page.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">URL:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    https://ployee.it.com{page.url}
                  </code>
                </div>
              </article>
            ))}
          </div>

          <section className="mt-16 bg-[#163300] rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#9fe870]">
              AI面接練習を始めませんか？
            </h2>
            <p className="text-gray-300 mb-6">
              24時間いつでも利用可能なAI面接官との練習で、面接スキルを向上させましょう。
            </p>
            <Link
              href="/interview/new"
              className="inline-block bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg"
            >
              今すぐ面接練習を始める
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
