"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AutoSignIn from "@/components/ui/AutoSignIn";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getCurrentESUsage, getESPlanLimit } from "@/lib/actions/usage.actions";

interface FormData {
  companyName: string;
  question: string;
  answer: string;
}

interface FormErrors {
  companyName?: string;
  question?: string;
  answer?: string;
}

const ESCorrectionPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    question: "",
    answer: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [usageInfo, setUsageInfo] = useState<{
    currentUsage: number;
    planLimit: number;
    remainingCorrections: number;
  } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "企業名を入力してください";
    }

    if (!formData.question.trim()) {
      newErrors.question = "質問内容を入力してください";
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "回答内容を入力してください";
    } else if (formData.answer.trim().length < 50) {
      newErrors.answer = "回答は50文字以上で入力してください";
    } else if (formData.answer.trim().length > 2000) {
      newErrors.answer = "回答は2000文字以内で入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      console.log("Submitting ES correction:", {
        companyName: formData.companyName,
        question: formData.question,
        answer: formData.answer.substring(0, 100) + "..."
      });

      const response = await fetch("/api/analyze-es", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          question: formData.question,
          answer: formData.answer
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        
        // If the error indicates we should redirect to billing, do so
        if (errorData.redirectToBilling) {
          router.push("/billing");
          return;
        }
        
        throw new Error(errorData.error || "ES分析に失敗しました");
      }

      const result = await response.json();
      console.log("API Result:", result);
      
      if (result.id) {
        // Navigate to results page with the correction ID
        router.push(`/es-correction/result/${result.id}`);
      } else {
        throw new Error("分析結果の取得に失敗しました");
      }
    } catch (error) {
      console.error("ES submission error:", error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "ES分析中にエラーが発生しました。もう一度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load usage information on component mount
  useEffect(() => {
    const loadUsageInfo = async () => {
      try {
        const [currentUsage, planLimit] = await Promise.all([
          getCurrentESUsage(),
          getESPlanLimit()
        ]);
        
        setUsageInfo({
          currentUsage,
          planLimit,
          remainingCorrections: Math.max(0, planLimit - currentUsage)
        });
      } catch (error) {
        console.error("Error loading usage info:", error);
        // Set default values on error
        setUsageInfo({
          currentUsage: 0,
          planLimit: 5,
          remainingCorrections: 5
        });
      } finally {
        setIsLoadingUsage(false);
      }
    };

    loadUsageInfo();
  }, []);

  const isFormValid = formData.companyName.trim() && 
                     formData.question.trim() && 
                     formData.answer.trim().length >= 50 &&
                     formData.answer.trim().length <= 2000;

  const canSubmit = isFormValid && usageInfo && usageInfo.remainingCorrections > 0;

  return (
    <div className="min-h-screen bg-white">
      <AutoSignIn nonClosableModal={true}>
        {/* Header Section */}
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#163300] mb-4 sm:mb-6">
              ES添削の準備をしましょう
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-semibold max-w-2xl mx-auto leading-relaxed">
              エントリーシート情報を入力して、<strong>AI添削</strong>を始めましょう
            </p>
            
            {/* Usage Information */}
        
          </div>

          {/* Form */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* ES Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">
                  1. ES情報
                </h2>

                <div>
                  <label htmlFor="companyName" className="block text-sm sm:text-base font-semibold text-[#163300] mb-2">
                    企業名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="例：株式会社プロイー"
                    className={`
                      w-full px-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-transparent text-sm sm:text-base h-10 sm:h-12
                      ${errors.companyName ? "border-red-500" : "border-gray-300"}
                    `}
                    disabled={isSubmitting}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>
              </div>

              {/* Question Content Section */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">
                  2. 質問内容
                </h2>

                <div>
                  <label htmlFor="question" className="block text-sm sm:text-base font-semibold text-[#163300] mb-2">
                    質問内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => handleInputChange("question", e.target.value)}
                    placeholder="例：志望動機を教えてください（400字以内）"
                    rows={3}
                    className={`
                      w-full px-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-transparent resize-none text-sm sm:text-base min-h-[100px] sm:min-h-[120px]
                      ${errors.question ? "border-red-500" : "border-gray-300"}
                    `}
                    disabled={isSubmitting}
                  />
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-500">{errors.question}</p>
                  )}
                  <p className="mt-2 text-xs sm:text-sm text-gray-600">
                    ESの質問内容をそのまま入力してください。文字数制限がある場合は併せて記載してください。
                  </p>
                </div>
              </div>

              {/* Answer Section */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">
                  3. あなたの回答
                </h2>

                <div>
                  <label htmlFor="answer" className="block text-sm sm:text-base font-semibold text-[#163300] mb-2">
                    あなたの回答 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => handleInputChange("answer", e.target.value)}
                    placeholder="あなたのエントリーシートの回答を入力してください（50文字以上）"
                    rows={8}
                    className={`
                      w-full px-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-transparent resize-none text-sm sm:text-base min-h-[200px] sm:min-h-[240px]
                      ${errors.answer ? "border-red-500" : "border-gray-300"}
                    `}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.answer && (
                      <p className="text-sm text-red-500">{errors.answer}</p>
                    )}
                    <p className={`text-sm ml-auto ${
                      formData.answer.length >= 50 && formData.answer.length <= 2000 
                        ? "text-[#9fe870]" 
                        : formData.answer.length > 2000 
                          ? "text-red-500" 
                          : "text-gray-500"
                    }`}>
                      {formData.answer.length} / 50-2000文字
                    </p>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600">
                    実際に提出予定の回答を入力してください。詳細な分析とフィードバックを提供いたします。
                  </p>
                </div>
              </div>

              {/* Usage Limit Warning */}
              {usageInfo && usageInfo.remainingCorrections === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-semibold">
                    今月のES添削回数の上限（{usageInfo.planLimit}回）に達しました
                  </p>
                  <p className="text-red-600 text-xs mt-1 mb-3">
                    より多くのES添削を利用するには、プランをアップグレードしてください。
                  </p>
                  <button
                    onClick={() => router.push("/billing")}
                    className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    プランをアップグレード
                  </button>
                </div>
              )}

              {/* Submit Error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 sm:pt-5">
                <button
                  type={usageInfo && usageInfo.remainingCorrections === 0 ? "button" : "submit"}
                  onClick={usageInfo && usageInfo.remainingCorrections === 0 ? () => router.push("/billing") : undefined}
                  disabled={(!canSubmit && !(usageInfo && usageInfo.remainingCorrections === 0)) || isSubmitting || isLoadingUsage}
                  className={`
                    w-full h-12 sm:h-14 rounded-full shadow-lg transition-all duration-300 text-base sm:text-lg font-semibold
                    ${(canSubmit || (usageInfo && usageInfo.remainingCorrections === 0)) && !isSubmitting && !isLoadingUsage
                      ? "bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" color="#163300" />
                      <span className="text-sm sm:text-base">AI分析中...</span>
                    </div>
                  ) : isLoadingUsage ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" color="#666" />
                      <span className="text-sm sm:text-base">読み込み中...</span>
                    </div>
                  ) : usageInfo && usageInfo.remainingCorrections === 0 ? (
                    <span className="text-sm sm:text-base">
                      プランをアップグレード
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base">ES添削を開始する</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AutoSignIn>
    </div>
  );
};

export default ESCorrectionPage;