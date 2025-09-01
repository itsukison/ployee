"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoSignIn from "@/components/ui/AutoSignIn";
import {
  canStartSession,
  getCurrentESUsage,
  getESPlanLimit,
  getUserPlanName,
  getUserPlanLimit,
} from "@/lib/actions/usage.actions";
import { MessageCircle, History, Edit, FileText } from "lucide-react";
import { PlanAndUsageWidgets } from "@/components/ui/plan-and-usage-widgets";

const DashboardPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    planName: string;
    remainingInterviews: number;
    remainingES: number;
    planLimitInterviews: number;
    planLimitES: number;
    currentUsageInterviews: number;
    currentUsageES: number;
    isLoading: boolean;
  }>({
    planName: "",
    remainingInterviews: 0,
    remainingES: 0,
    planLimitInterviews: 0,
    planLimitES: 0,
    currentUsageInterviews: 0,
    currentUsageES: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const [sessionInfo, planName, esUsage, esLimit, interviewLimit] =
          await Promise.all([
            canStartSession(),
            getUserPlanName(),
            getCurrentESUsage(),
            getESPlanLimit(),
            getUserPlanLimit(),
          ]);

        setUserInfo({
          planName,
          remainingInterviews: sessionInfo.remainingInterviews,
          remainingES: Math.max(0, esLimit - esUsage),
          planLimitInterviews: interviewLimit,
          planLimitES: esLimit,
          currentUsageInterviews: sessionInfo.currentUsage,
          currentUsageES: esUsage,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserInfo();
  }, []);

  const dashboardOptions = [
    {
      id: "new-interview",
      title: "新しいAI面接",
      description: "AI面接官との実践的な面接練習を始める",
      icon: MessageCircle,
      route: "/interview/new",
    },
    {
      id: "past-interviews",
      title: "過去の面接",
      description: "これまでの面接練習履歴を確認する",
      icon: History,
      route: "/past",
    },
    {
      id: "es-correction",
      title: "ES添削",
      description: "エントリーシートをAIが詳細分析・添削",
      icon: Edit,
      route: "/es-correction",
    },
    {
      id: "past-es-corrections",
      title: "過去のES添削",
      description: "これまでのES添削履歴を確認する",
      icon: FileText,
      route: "/es-correction/history",
    },
  ];

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AutoSignIn nonClosableModal={true}>
        {/* Modern Hero Section */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-[#f8fffe] pt-20 pb-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#163300] mb-4">
                ダッシュボード
              </h1>
            </div>

            {/* Modern User Plan Info */}
            <div className="max-w-4xl mx-auto mb-8">
              <PlanAndUsageWidgets
                planName={userInfo.planName}
                remainingInterviews={userInfo.remainingInterviews}
                remainingES={userInfo.remainingES}
                planLimitInterviews={userInfo.planLimitInterviews}
                planLimitES={userInfo.planLimitES}
                currentUsageInterviews={userInfo.currentUsageInterviews}
                currentUsageES={userInfo.currentUsageES}
                loading={userInfo.isLoading}
              />
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Welcome Message */}
          <div className="mb-12 -mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#163300] mb-3">
              何から始めますか？
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              AI面接練習とES添削で、あなたの就活・転職活動を全面サポート
            </p>
          </div>

          {/* Modern Dashboard Cards Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-16">
            {dashboardOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  onClick={() => handleCardClick(option.route)}
                  className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#9fe870]/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_rgba(159,232,112,0.15)] hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[#9fe870]/20 group-hover:to-[#8fd960]/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#9fe870]/25">
                        <IconComponent className="w-8 h-8 text-gray-600 group-hover:text-[#163300] transition-colors duration-300" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-[#9fe870]/0 to-[#8fd960]/0 group-hover:from-[#9fe870]/20 group-hover:to-[#8fd960]/20 rounded-2xl transition-all duration-300 -z-10 blur-sm"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#163300] transition-colors duration-300">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {option.description}
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-[#9fe870] transition-colors duration-300">
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-[#f8fffe] to-white border-t border-gray-100 mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              {/* Logo and Company Info */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="text-2xl font-bold text-[#163300]">
                    プロイー
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  AI面接練習で理想の未来を掴む
                </p>
                <div className="text-sm text-gray-500">
                  © 2025 プロイー. All rights reserved.
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-base font-bold text-[#163300] mb-4">
                  サービス
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/interview/new"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      AI面接練習
                    </a>
                  </li>
                  <li>
                    <a
                      href="/es-correction"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      フィードバック分析
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pricing"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      料金プラン
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-base font-bold text-[#163300] mb-4">
                  リソース
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/help"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      ヘルプセンター
                    </a>
                  </li>
                  <li>
                    <a
                      href="/interview-guide"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      面接対策ガイド
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      お問い合わせ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Solutions */}
              <div>
                <h3 className="text-base font-bold text-[#163300] mb-4">
                  ソリューション
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="/students"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      就活生向け
                    </a>
                  </li>
                  <li>
                    <span className="text-sm text-gray-400">
                      転職者向け（近日公開）
                    </span>
                  </li>
                  <li>
                    <a
                      href="/enterprise"
                      className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                    >
                      企業向け
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  2025年 プロイー開発チーム
                </div>
                <div className="flex gap-6">
                  <a
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                  >
                    利用規約
                  </a>
                  <a
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-[#163300] transition-colors duration-200"
                  >
                    プライバシーポリシー
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </AutoSignIn>
    </div>
  );
};

export default DashboardPage;
