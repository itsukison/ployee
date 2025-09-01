"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserInterviews } from "@/lib/actions/interview.actions";
import AutoSignIn from "@/components/ui/AutoSignIn";
import Folder from "@/components/ui/reactbits/folder";

const InterviewHistoryPage = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper function to translate interview focus to Japanese
  const getInterviewFocusLabel = (focus: string) => {
    const focusMap: { [key: string]: string } = {
      consulting: "コンサルティング業界",
      finance: "金融業界",
      manufacturing: "メーカー・製造業界",
      trading: "商社業界",
      it: "IT・通信業界",
      advertising: "広告・マスコミ業界",
      hr: "人材業界",
      infrastructure: "インフラ業界",
      real_estate: "不動産・建設業界",
    };
    return focusMap[focus] || "面接練習";
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const result = await getUserInterviews(currentPage, 9);
        setInterviews(result.interviews);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AutoSignIn nonClosableModal={true}>
          <div className="mb-8 mt-5">
            <div className="flex items-start justify-between mb-6">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-[#163300] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← ダッシュボード
              </Link>
              <div className="flex-1 text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#163300] mb-4">
                  面接履歴
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  これまでの面接練習履歴を確認できます
                </p>
              </div>
              <div className="w-[120px]"></div> {/* Spacer for centering */}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <h3 className="text-xl font-semibold text-[#163300] mb-2">
                まだ面接練習がありません
              </h3>
              <p className="text-gray-600 mb-6">
                最初の面接練習を始めてみましょう
              </p>
              <Link
                href="/interview/new"
                className="inline-block bg-[#9fe870] text-[#163300] px-6 py-3 rounded-full font-semibold hover:bg-[#8fd960] transition-colors"
              >
                面接練習を始める
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-x-4 gap-y-32 md:grid-cols-2 lg:grid-cols-3 mt-35">
                {interviews.map(
                  (interview: {
                    id: string;
                    companyName?: string;
                    company_name?: string;
                    interviewFocus?: string;
                    interview_focus?: string;
                    created_at: string;
                  }) => {
                    const industryFocus = interview.interviewFocus || interview.interview_focus || "";
                    const industryLabel = getInterviewFocusLabel(industryFocus);
                    
                    return (
                    <div
                      key={interview.id}
                      className="flex flex-col items-center"
                    >
                      {/* Folder Component - increased height and added padding for expansion space */}
                      <div
                        style={{
                          height: "220px",
                          position: "relative",
                          paddingTop: "15px",
                        }}
                      >
                        <Folder
                          size={1.5}
                          color="#9fe870"
                          className="mx-auto"
                          interview={interview}
                        />
                      </div>

                      {/* Interview Details Below Folder */}
                      <div className="text-center space-y-1 -mt-20">
                        <h3 className="text-xl font-semibold text-[#163300]">
                          {interview.companyName || interview.company_name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {industryLabel}
                        </p>
                        <div className="flex flex-col items-center space-y-1 text-sm text-gray-500">
                          <time className="text-xs">
                            {new Date(interview.created_at).toLocaleDateString(
                              "ja-JP",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </time>
                        </div>
                      </div>
                    </div>
                  );
                  }
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-3 mt-12 mb-8">
                  <span className="text-gray-600 text-md">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md text-md font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#9fe870] text-[#163300] hover:bg-[#8fd960]"
                    }`}
                  >
                    前へ
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md text-md font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#9fe870] text-[#163300] hover:bg-[#8fd960]"
                    }`}
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </AutoSignIn>
      </div>
    </div>
  );
};

export default InterviewHistoryPage;
