"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInterview } from "@/lib/actions/interview.actions";
import { canStartSession } from "@/lib/actions/usage.actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "お名前を入力してください",
  }),

  education: z.string().min(1, {
    message: "学歴を入力してください",
  }),

  companyName: z.string().min(1, {
    message: "会社名を入力してください",
  }),

  position: z.string().min(1, {
    message: "職種を入力してください",
  }),

  interviewFocus: z.enum(
    [
      "consulting",
      "finance",
      "manufacturing",
      "trading",
      "it",
      "advertising",
      "hr",
      "infrastructure",
      "real_estate",
    ],
    {
      required_error: "志望業界を選択してください",
    }
  ),
});

const interviewFocusOptions = [
  { value: "consulting", label: "コンサル" },
  { value: "finance", label: "金融" },
  { value: "manufacturing", label: "メーカー" },
  { value: "trading", label: "商社" },
  { value: "it", label: "IT・通信" },
  { value: "advertising", label: "広告・マスコミ" },
  { value: "hr", label: "人材" },
  { value: "infrastructure", label: "インフラ" },
  { value: "real_estate", label: "不動産・建設" },
] as const;

export function InterviewForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<z.infer<
    typeof formSchema
  > | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      education: "",
      companyName: "",
      position: "",
    },
  });

  // Handle authentication check and form submission
  useEffect(() => {
    if (isLoaded && isSignedIn && pendingFormData) {
      // User just signed in and we have pending form data, proceed with submission
      setShowAuthModal(false); // Hide the modal
      handleAuthenticatedSubmit(pendingFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, pendingFormData]);

  // Add effect to make modal non-closable when authentication is required
  useEffect(() => {
    if (showAuthModal) {
      // Add CSS to hide close button and prevent ESC key
      const style = document.createElement("style");
      style.id = "non-closable-modal-style";
      style.textContent = `
        .cl-modalCloseButton {
          display: none !important;
        }
        .cl-modalBackdrop {
          pointer-events: none !important;
        }
        .cl-modalContent {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);

      // Prevent ESC key from closing modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("keydown", handleKeyDown, true);

      return () => {
        // Cleanup when component unmounts or modal is closed
        const existingStyle = document.getElementById(
          "non-closable-modal-style"
        );
        if (existingStyle) {
          existingStyle.remove();
        }
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [showAuthModal]);

  const handleAuthenticatedSubmit = async (
    values: z.infer<typeof formSchema>
  ) => {
    setIsSubmitting(true);
    try {
      // Check usage limits before creating interview
      const usageCheck = await canStartSession();

      if (!usageCheck.canStart) {
        // Redirect to billing page if usage limit exceeded
        router.push("/billing");
        return;
      }

      const interview = await createInterview(values);
      if (interview) {
        router.push(`/interview/${interview.id}`);
      } else {
        console.error("Failed to create interview");
        router.push("/");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      setIsSubmitting(false);
    } finally {
      setPendingFormData(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check if user is authenticated
    if (!isLoaded) {
      return; // Wait for auth to load
    }

    if (!isSignedIn) {
      // Store form data and trigger authentication
      setPendingFormData(values);
      setShowAuthModal(true);

      // Automatically trigger the hidden sign-in button
      setTimeout(() => {
        signInButtonRef.current?.click();
      }, 100);

      return;
    }

    // User is already authenticated, proceed directly
    await handleAuthenticatedSubmit(values);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8"
        >
          {/* Personal Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">
              1. 個人情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-[#163300]">
                      お名前 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例: 田中太郎"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-[#163300]">
                      学歴 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例: 東京大学工学部卒業"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Job Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">
              2. 求人情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-[#163300]">
                      会社名 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例: 株式会社サンプル"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-[#163300]">
                      職種 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例: 営業職、エンジニア、企画職"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Industry Preference Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">
              3. 志望業界
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="interviewFocus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-[#163300]">
                      志望業界 <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                          <SelectValue placeholder="志望する業界を選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewFocusOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-sm sm:text-base"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      選択した業界に特化した質問を含む面接練習を行います
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 sm:pt-5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 sm:h-14 bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] 
                  text-base sm:text-lg font-semibold rounded-full shadow-lg transition-colors cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" color="#163300" />
                  <span className="text-sm sm:text-base">面接を準備中...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base">
                  面接セッションを開始する
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Hidden sign-in button that gets triggered when form is submitted without auth */}
      {showAuthModal && (
        <SignInButton mode="modal" forceRedirectUrl="/interview/new">
          <button
            ref={signInButtonRef}
            style={{ display: "none" }}
            aria-hidden="true"
          >
            Hidden Sign In
          </button>
        </SignInButton>
      )}
    </div>
  );
}
