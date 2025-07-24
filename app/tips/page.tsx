import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "面接対策のコツ・テクニック | AI面接練習で成功する方法 - プロイー",
  description:
    "面接成功のための実践的なコツやテクニックをご紹介。AI面接練習の効果的な活用法から面接本番での注意点まで、就活・転職に役立つ情報満載。",
  keywords: [
    "面接対策",
    "面接コツ",
    "面接テクニック",
    "AI面接練習",
    "就活対策",
    "転職面接",
    "面接準備",
    "面接質問",
    "面接マナー",
    "就職活動",
    "面接不安",
    "面接成功法",
  ],
  openGraph: {
    title: "面接対策のコツ・テクニック | AI面接練習で成功する方法",
    description:
      "面接成功のための実践的なコツやテクニックをご紹介。AI面接練習の効果的な活用法から面接本番での注意点まで。",
    url: "https://ployee.it.com/tips",
    images: [
      {
        url: "https://ployee.it.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "面接対策のコツ・テクニック - プロイー",
      },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "面接対策のコツ・テクニック",
  url: "https://ployee.it.com/tips",
  description: "面接成功のための実践的なコツやテクニックを紹介するページ",
  mainEntity: {
    "@type": "Article",
    headline: "AI面接練習で成功する面接対策のコツ",
    description: "面接対策の実践的なテクニックとAI面接練習の効果的な活用法",
    author: {
      "@type": "Organization",
      name: "プロイー",
    },
    publisher: {
      "@type": "Organization",
      name: "プロイー",
    },
  },
};

export default function TipsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-6">
              面接対策のコツ・テクニック
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <strong>AI面接練習</strong>
              を効果的に活用して、面接成功率を大幅に向上させる実践的な方法をご紹介します。
            </p>
          </header>

          <main className="space-y-16">
            {/* AI面接練習の効果的な活用法 */}
            <section>
              <h2 className="text-3xl font-bold text-[#163300] mb-8">
                AI面接練習の効果的な活用法
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <article className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">
                    📝 事前準備をしっかりと
                  </h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• 志望動機や自己PRを明確にしておく</li>
                    <li>• 企業研究を事前に行う</li>
                    <li>• よく聞かれる質問の回答を準備する</li>
                    <li>
                      • <strong>AI面接練習</strong>で本番に近い環境を体験
                    </li>
                  </ul>
                </article>

                <article className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-4">
                    🔄 繰り返し練習の重要性
                  </h3>
                  <ul className="space-y-2 text-green-700">
                    <li>• 同じ質問でも毎回違う角度で回答</li>
                    <li>• フィードバックを基に改善点を修正</li>
                    <li>• 話し方やトーンの調整</li>
                    <li>• 自然な会話の流れを身につける</li>
                  </ul>
                </article>
              </div>
            </section>

            {/* 面接でよく聞かれる質問と対策 */}
            <section>
              <h2 className="text-3xl font-bold text-[#163300] mb-8">
                面接でよく聞かれる質問と対策
              </h2>
              <div className="space-y-6">
                <div className="bg-white border-l-4 border-[#9fe870] p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-[#163300] mb-3">
                    「自己紹介をお願いします」
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        ❌ NGな回答例
                      </h4>
                      <p className="text-gray-600 text-sm">
                        「○○大学の△△です。趣味は読書です。よろしくお願いします。」
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        ✅ 良い回答例
                      </h4>
                      <p className="text-gray-600 text-sm">
                        「○○大学の△△と申します。学生時代は□□に力を入れ、××という成果を上げました。この経験を活かして御社で□□に貢献したいと考えています。」
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-[#9fe870] p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-[#163300] mb-3">
                    「なぜ弊社を志望されましたか？」
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      💡 回答のポイント
                    </h4>
                    <ul className="space-y-1 text-yellow-700 text-sm">
                      <li>• 企業の事業内容や理念への共感</li>
                      <li>• 自分のスキルや経験との関連性</li>
                      <li>• 具体的な貢献方法の提示</li>
                      <li>• 競合他社との差別化ポイント</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 面接マナーと身だしなみ */}
            <section>
              <h2 className="text-3xl font-bold text-[#163300] mb-8">
                面接マナーと身だしなみのポイント
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <article className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    👔 服装・身だしなみ
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• 清潔感のあるスーツ着用</li>
                    <li>• 髪型は整え、派手すぎない</li>
                    <li>• 靴は磨いておく</li>
                    <li>• アクセサリーは控えめに</li>
                    <li>• 香水は使用しない</li>
                  </ul>
                </article>

                <article className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    🚪 入退室のマナー
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• ノックは3回、返事を待つ</li>
                    <li>• 「失礼いたします」で入室</li>
                    <li>• ドアは静かに閉める</li>
                    <li>• 着席は「お座りください」の後</li>
                    <li>• 退室時も挨拶を忘れずに</li>
                  </ul>
                </article>

                <article className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    💬 話し方のコツ
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• 明るくハキハキと話す</li>
                    <li>• 相手の目を見て話す</li>
                    <li>• 適度な間を取る</li>
                    <li>• 敬語を正しく使う</li>
                    <li>• 結論から先に述べる</li>
                  </ul>
                </article>
              </div>
            </section>

            {/* 面接不安の克服法 */}
            <section>
              <h2 className="text-3xl font-bold text-[#163300] mb-8">
                面接不安の克服法
              </h2>
              <div className="bg-[#163300] rounded-xl p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-[#9fe870]">
                      😰 面接不安の原因
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 準備不足による自信のなさ</li>
                      <li>• 失敗への恐怖心</li>
                      <li>• 未知の状況への不安</li>
                      <li>• 完璧主義的な思考</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-[#9fe870]">
                      💪 不安克服の方法
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        • <strong>AI面接練習</strong>で場慣れする
                      </li>
                      <li>• 深呼吸とリラックス法の習得</li>
                      <li>• ポジティブな自己暗示</li>
                      <li>• 失敗を学習機会として捉える</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* オンライン面接の注意点 */}
            <section>
              <h2 className="text-3xl font-bold text-[#163300] mb-8">
                オンライン面接の注意点
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#163300]">
                    🖥️ 技術的な準備
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• カメラとマイクの動作確認</li>
                      <li>• インターネット接続の安定性チェック</li>
                      <li>• 使用するアプリケーションの操作確認</li>
                      <li>• バックアップ接続手段の準備</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#163300]">
                    🏠 環境整備
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• 静かで集中できる場所の確保</li>
                      <li>• 適切な照明の設定</li>
                      <li>• 背景はシンプルに保つ</li>
                      <li>• カメラの位置と角度の調整</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* プロイーでの練習のススメ */}
            <section className="text-center bg-gradient-to-r from-[#9fe870] to-[#8fd960] rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-[#163300] mb-6">
                プロイーで実践的な面接練習を
              </h2>
              <p className="text-lg text-[#163300] mb-8 max-w-3xl mx-auto">
                これらのテクニックを<strong>AI面接練習</strong>
                で実際に試してみませんか？
                <br />
                24時間いつでも利用可能で、客観的なフィードバックを受けることができます。
              </p>
              <div className="space-y-4">
                <a
                  href="/interview/new"
                  className="inline-block bg-[#163300] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#0f2600] transition-colors shadow-lg"
                >
                  今すぐ面接練習を始める
                </a>
                <p className="text-sm text-[#163300]">
                  ※ 無料プランでは3回まで面接練習が可能です
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
