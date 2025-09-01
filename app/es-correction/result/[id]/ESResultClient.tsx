"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AutoSignIn from "@/components/ui/AutoSignIn";
import { InterviewRadarChart } from "@/components/ui/charter";

interface ESCorrectionData {
  id: string;
  company_name: string;
  question: string;
  answer: string;
  ai_feedback: string;
  overall_score: number;
  match_score: number;
  structure_score: number;
  basic_score: number;
  created_at: string;
  status: string;
}

interface ESResultClientProps {
  esData: ESCorrectionData;
}

interface FeedbackSection {
  title: string;
  content: string;
}

const ESResultClient = ({ esData }: ESResultClientProps) => {
  const router = useRouter();

  const formatFeedback = (feedback: string): FeedbackSection[] => {
    const sections = feedback.split(/【([^】]+)】/).filter(Boolean);
    const formattedSections: FeedbackSection[] = [];

    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i];
      const content = sections[i + 1];

      if (title && content) {
        formattedSections.push({ title, content: content.trim() });
      }
    }

    return formattedSections;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "優秀";
    if (score >= 80) return "良好";
    if (score >= 70) return "改善の余地あり";
    return "要改善";
  };

  const feedbackSections = formatFeedback(esData.ai_feedback);

  // Create chart data for the radar chart
  const chartData = [
    { criteria: "求める人材とのマッチ", score: esData.match_score },
    { criteria: "ESの構成", score: esData.structure_score },
    { criteria: "基本チェック", score: esData.basic_score },
    {
      criteria: "内容の充実度",
      score: Math.min(100, esData.overall_score + 10),
    },
    {
      criteria: "志望動機の明確さ",
      score: Math.min(100, esData.match_score + 5),
    },
  ];

  // Organize feedback sections by merging ESの構成 with 基本チェック
  const organizeFeedbackSections = (sections: FeedbackSection[]) => {
    const mergedSections: FeedbackSection[] = [];
    let mergedContent = "";

    sections.forEach((section) => {
      if (section.title.includes("求める人材とのマッチ")) {
        mergedSections.push({
          title: "求める人材とのマッチ",
          content: section.content,
        });
      } else if (
        section.title.includes("ESの構成") ||
        section.title.includes("基本チェック")
      ) {
        mergedContent += section.content + "\n\n";
      } else if (section.title.includes("改善提案")) {
        mergedSections.push({
          title: "改善提案",
          content: section.content,
        });
      } else if (
        !section.title.includes("ES総合点") &&
        !section.title.includes("ESの構成") &&
        !section.title.includes("基本チェック")
      ) {
        mergedSections.push(section);
      }
    });

    // Insert merged section
    if (mergedContent) {
      mergedSections.splice(1, 0, {
        title: "ESの構成・基本チェック",
        content: mergedContent.trim(),
      });
    }

    return mergedSections;
  };

  const organizedFeedbackSections = organizeFeedbackSections(feedbackSections);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <AutoSignIn nonClosableModal={true}>
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#163300] mb-4 sm:mb-6">
              ES添削結果
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-semibold max-w-3xl mx-auto leading-relaxed">
              <strong>{esData.company_name}</strong>{" "}
              のエントリーシート分析結果をお届けします
            </p>
          </div>

          {/* Overall Assessment with Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start mb-8 sm:mb-12">
            {/* Left Column: Score and Feedback */}
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              {/* Score Display */}
              <div className="text-center lg:text-left">
                <div className="flex items-end gap-2 sm:gap-3 justify-center lg:justify-start">
                  <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#163300]">
                    {esData.overall_score}
                  </span>
                  <span className="pb-1 sm:pb-2 text-base sm:text-lg text-gray-500 font-medium">
                    /100
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-[#163300] mt-2">
                  {getScoreLabel(esData.overall_score)}
                </p>
              </div>

              {/* Feedback Text */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#163300] mb-3 sm:mb-4">
                  総合フィードバック
                </h3>
                <div className="bg-gray-100 rounded-3xl p-4 sm:p-6 text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                  {esData.overall_score >= 90
                    ? "素晴らしいエントリーシートです！企業が求める人材像に非常にマッチしており、高い評価を受けるでしょう。"
                    : esData.overall_score >= 80
                    ? "良好なエントリーシートです。企業の求める人材像に概ねマッチしており、選考通過の可能性が高いです。"
                    : esData.overall_score >= 70
                    ? "改善の余地がありますが、基本的な要件は満たしています。提案された改善点を参考にしてみてください。"
                    : "大幅な改善が必要です。企業の求める人材像とのギャップが大きいため、内容の見直しをお勧めします。"}
                </div>
              </div>
            </div>

            {/* Right Column: Chart */}
            <div className="flex justify-center lg:justify-start order-1 lg:order-2">
              <div className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]">
                <InterviewRadarChart
                  data={chartData}
                  frameless={true}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* AI Analysis Results */}
          <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
            <h2 className="text-3xl font-bold text-[#163300] mb-8 sm:mb-10 text-center">
              AI分析結果
            </h2>
            {organizedFeedbackSections.map((section, index) => (
              <div
                key={index}
                className="border-l-4 border-[#9fe870] pl-4 sm:pl-6"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-[#163300] mb-3 sm:mb-4">
                  {section.title}
                </h3>
                <div className="bg-gray-100 rounded-3xl p-4 sm:p-6 text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Original Submission */}
          <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#163300] mb-6 sm:mb-8 text-center">
              提出内容
            </h2>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#163300] mb-3 sm:mb-4">
                質問
              </h3>
              <div className="bg-gray-100 rounded-3xl p-4 sm:p-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                {esData.question}
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#163300] mb-3 sm:mb-4">
                あなたの回答
              </h3>
              <div className="bg-gray-100 rounded-3xl p-4 sm:p-6 text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {esData.answer}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 sm:mt-12 lg:mt-16 justify-center">
            <button
              onClick={() => router.push("/es-correction")}
              className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              新しいES添削を始める
            </button>
            <button
              onClick={() => router.push("/es-correction/history")}
              className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              過去のES添削を見る
            </button>
          </div>
        </AutoSignIn>
      </div>
    </div>
  );
};

export default ESResultClient;
