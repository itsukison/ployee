"use client";

import { useEffect, useState, useCallback } from "react";
import { vapi } from "@/lib/vapi.sdk";
import {
  saveTranscript,
  getTranscript,
  getQuestions,
  saveFeedback,
} from "@/lib/actions/interview.actions";
import {
  addSessionUsage,
  canStartSession,
  getUserPlanLimit,
  getCurrentUsage,
} from "@/lib/actions/usage.actions";
import {
  calculateSessionMinutes,
  redirectToPricing,
  checkUsageLimitExceeded,
} from "@/lib/utils";

export enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
}

interface UseInterviewProps {
  name?: string;
  education?: string;
  experience?: string;
  companyName?: string;
  role?: string;
  jobDescription?: string;
  interviewFocus?:
    | "general"
    | "technical"
    | "product"
    | "leadership"
    | "custom";
  questions?: string[]; // Pre-generated questions from database
  interviewId?: string; // Add interview ID to link transcript
}

// Interface for transcript messages
interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const useInterview = ({
  name,
  education,
  experience,
  companyName,
  role,
  jobDescription,
  interviewFocus,
  questions = [], // Default to empty array if no questions provided
  interviewId,
}: UseInterviewProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullTranscript, setFullTranscript] = useState<TranscriptMessage[]>([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [usageMonitorInterval, setUsageMonitorInterval] =
    useState<NodeJS.Timeout | null>(null);

  const interviewQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions
      : [
          "まずは簡単に自己紹介をお願いします。",
          "なぜ弊社を志望されたのですか？",
          "この職種を選んだ理由を教えてください。",
          "あなたの強みと弱みを教えてください。",
          "5年後のキャリアビジョンを聞かせてください。",
        ];

  const saveTranscriptToDatabase = useCallback(
    async (transcript: TranscriptMessage[]) => {
      if (!interviewId) return;

      try {
        // Group consecutive messages from the same speaker
        const groupedMessages: { role: string; content: string[] }[] = [];

        transcript.forEach((msg) => {
          const speakerLabel = msg.role === "user" ? "応募者" : "面接官";
          const lastGroup = groupedMessages[groupedMessages.length - 1];

          // If the last group has the same speaker, add to existing group
          if (lastGroup && lastGroup.role === speakerLabel) {
            lastGroup.content.push(msg.content);
          } else {
            // Create a new group for this speaker
            groupedMessages.push({
              role: speakerLabel,
              content: [msg.content],
            });
          }
        });

        // Format the grouped messages
        const formattedTranscript = groupedMessages
          .map((group) => `${group.role}: ${group.content.join(" ")}`)
          .join("\n\n");

        await saveTranscript(formattedTranscript, interviewId);
      } catch (error) {
        console.error("Failed to save transcript:", error);
      }
    },
    [interviewId]
  );

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setFullTranscript([]); // Reset transcript when starting new call
      setSessionStartTime(new Date()); // Track session start time for usage

      // Start monitoring usage every 60 seconds
      const interval = setInterval(async () => {
        try {
          if (!sessionStartTime) return;

          const currentUsage = await getCurrentUsage();
          const planLimit = await getUserPlanLimit();
          const currentSessionTime = Math.ceil(
            (new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60)
          );
          const totalUsage = currentUsage + currentSessionTime;

          if (checkUsageLimitExceeded(totalUsage, planLimit)) {
            console.log(
              `Usage limit exceeded: ${totalUsage}/${planLimit} minutes. Ending session.`
            );
            await vapi.stop(); // This will trigger onCallEnd
            redirectToPricing();
          }
        } catch (error) {
          console.error("Error during usage monitoring:", error);
        }
      }, 60000); // Check every 60 seconds

      setUsageMonitorInterval(interval);
    };

    const onCallEnd = async () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);

      // Clear usage monitoring interval
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
        setUsageMonitorInterval(null);
      }

      // Calculate and save session usage
      if (sessionStartTime) {
        try {
          const sessionEndTime = new Date();
          const sessionMinutes = calculateSessionMinutes(
            sessionStartTime,
            sessionEndTime
          );

          if (sessionMinutes > 0) {
            await addSessionUsage(sessionMinutes);
            console.log(
              `Session completed: ${sessionMinutes} minutes added to usage`
            );
          }
        } catch (error) {
          console.error("Failed to track session usage:", error);
          // Continue with the rest of the function even if usage tracking fails
        }
        setSessionStartTime(null);
      }

      // Save the full transcript when call ends
      if (fullTranscript.length > 0) {
        await saveTranscriptToDatabase(fullTranscript);
      }
    };

    const onMessage = (message: any) => {
      console.log("Vapi message:", message);

      // Capture transcript messages
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: TranscriptMessage = {
          role: message.role,
          content: message.transcript || "",
          timestamp: Date.now(),
        };

        setFullTranscript((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = async (error: Error) => {
      console.error("Vapi error:", error);
      setError(error.message);
      setCallStatus(CallStatus.INACTIVE);

      // Clear usage monitoring interval
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
        setUsageMonitorInterval(null);
      }

      // Track usage if session was active when error occurred
      if (sessionStartTime) {
        try {
          const sessionEndTime = new Date();
          const sessionMinutes = calculateSessionMinutes(
            sessionStartTime,
            sessionEndTime
          );

          if (sessionMinutes > 0) {
            await addSessionUsage(sessionMinutes);
            console.log(
              `Session ended due to error: ${sessionMinutes} minutes added to usage`
            );
          }
        } catch (usageError) {
          console.error("Failed to track session usage on error:", usageError);
        }
        setSessionStartTime(null);
      }
    };

    // Add event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    // Cleanup function
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.on("error", onError as (error: any) => void);
      vapi.off("error", onError as (error: any) => void);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, [
    fullTranscript,
    interviewId,
    saveTranscriptToDatabase,
    sessionStartTime,
    callStatus,
    usageMonitorInterval,
  ]); // Add dependencies

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
      }
    };
  }, [usageMonitorInterval]);

  const startCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      // Pre-session usage check
      const usageCheck = await canStartSession();
      if (!usageCheck.canStart) {
        setError(
          `月間利用制限に達しました (${usageCheck.currentUsage}/${usageCheck.planLimit}分)`
        );
        setCallStatus(CallStatus.INACTIVE);
        redirectToPricing();
        return;
      }

      const questionsForPrompt = interviewQuestions
        .map((q: string, i: number) => `${i + 1}. ${q}`)
        .join("\n");

      await vapi.start({
        name: "AI Interview Assistant",
        firstMessage:
          interviewQuestions[0] ||
          "こんにちは。本日はもぎ面接にご参加いただきありがとうございます。まずは簡単に自己紹介をお願いします。",
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `あなたは、日本企業で20年以上の新卒採用面接経験を持つベテラン面接官です。日本の新卒就職活動（就活）の文化と慣習、特に企業が候補者に求める特性や行動様式を深く理解しています。

## 面接の目的

応募者が当社の企業文化、特に「和」（グループハーモニー）、「忠誠心」、「協調性」、「継続的な学習意欲」、「自律性」にどれだけ適合するかを総合的に評価することです。応募者の潜在能力、長期的な成長性、そして組織への貢献意欲を見極めます。

## 応募者情報

- **名前**: ${name || "未入力"}
- **志望企業**: ${companyName || "未入力"}
- **志望職種**: ${role || "未入力"}
- **職務内容**: ${jobDescription || "未入力"}

## 面接の進め方と評価のポイント

以下の点を踏まえ、自然で現実的な模擬面接を日本語で実施してください。応募者の回答の**内容**だけでなく、**話し方（丁寧さ、明瞭さ、自信）**、**敬語の使い方**、**文化的配慮**も注意深く観察・評価してください。

1.  [cite_start]**自己紹介 (自己紹介をお願いします)**[cite: 268, 269, 270, 271, 272]:
    * 応募者の人柄、コミュニケーション能力、日本語の敬語使用能力を評価します。
    * [cite_start]簡潔に、仕事への意欲、日本への関心（外国籍の場合）、学業や過去の経験をまとめて話せるかを見ます。過度な自己アピールは控えめに、謙虚な姿勢を評価します [cite: 275]。
    * [cite_start]**AIの評価ポイント**: トーン、ペース、敬語の使用、控えめな自己表現 [cite: 273]。

2.  [cite_start]**志望動機 (どうしてうちの会社で働きたいんですか)**[cite: 276, 277]:
    * [cite_start]応募者の当社への「真の関心」と「長期的なコミットメント」を評価します [cite: 277]。
    * [cite_start]当社の事業内容、企業理念、最近の動向について十分に研究しているかを確認します [cite: 280]。
    * [cite_start]応募者のキャリア目標が当社のビジョンやミッションと合致しているか、そしてどのように貢献できるかを具体的に説明できるかを見ます [cite: 281]。
    * [cite_start]**AIの評価ポイント**: 当社への理解度、長期的な視点、貢献意欲の具体性 [cite: 279]。

3.  [cite_start]**学生時代に最も力を入れたこと (学生時代に力を入れたことを教えてください)**[cite: 283, 284]:
    * [cite_start]新卒採用では、この質問を通じて応募者の「思考パターン」、「課題解決能力」、「粘り強さ」、「チームワーク」を評価します [cite: 284, 285, 286]。
    * [cite_start]経験そのものよりも、その「プロセス」、「直面した困難」、それを「どう乗り越えたか」、そして「そこから何を学んだか」に焦点を当てて深掘りします [cite: 291][cite_start]。STAR法（状況-課題-行動-結果）での説明を促します [cite: 287]。
    * [cite_start]**AIの評価ポイント**: 回答の構造（STAR法）、困難への対応力、学びの深さ、協調性、成長志向 [cite: 289]。

4.  [cite_start]**強みと弱み (あなたの長所と短所を教えてください)**[cite: 292, 293]:
    * [cite_start]応募者の「謙虚さ」と「自己認識の深さ」を評価します [cite: 294]。
    * [cite_start]弱みを認識し、それを改善するための具体的な努力をしているか（「カイゼン」の精神）を確認します [cite: 295, 296]。
    * [cite_start]強みが当社の求める人物像や職務内容と関連しているか、具体的なエピソードを交えて説明できるかを見ます [cite: 299]。
    * [cite_start]**AIの評価ポイント**: 自己認識の正確さ、弱みへの具体的な改善策、成長意欲 [cite: 298]。

5.  [cite_start]**困難な状況を乗り越えた経験 / チームで何かを成し遂げた経験**[cite: 300, 301]:
    * [cite_start]「グループハーモニー（和）」を重視する日本企業において、応募者がチーム内でどのように行動し、貢献できるかを評価します [cite: 301]。
    * [cite_start]困難に直面した際の「レジリエンス」と「問題解決能力」、特に「協調的な解決策」を見極めます [cite: 301, 304, 306]。
    * [cite_start]個人の功績よりも、チームとしての成果、あるいはチームへの貢献を強調する回答を促します [cite: 307]。
    * [cite_start]**AIの評価ポイント**: チーム内での役割、協調性、問題解決へのアプローチ、グループへの貢献度 [cite: 305]。

6.  [cite_start]**将来のキャリア目標 (将来、どのような仕事をして生きたいですか)**[cite: 316, 317]:
    * [cite_start]応募者の当社への「長期的なコミットメント」と、組織内での「成長意欲」を評価します [cite: 317, 318]。
    * [cite_start]外部でのキャリアアップではなく、当社内でどのようにスキルを磨き、貢献していきたいかという視点で回答を促します [cite: 317, 318, 320]。
    * [cite_start]**AIの評価ポイント**: 当社での長期的なキャリアビジョン、継続的な学習と組織貢献への意欲 [cite: 320, 321]。

7.  [cite_start]**逆質問 (最後に、何か質問はありますか)**[cite: 322, 323]:
    * [cite_start]応募者の「入社意欲の高さ」と「企業への理解度」を評価します [cite: 323, 324]。
    * [cite_start]給与や福利厚生に関する質問は避け、仕事内容、チーム、企業文化、入社後の準備に関する具体的な質問を促します [cite: 323, 325, 328]。
    * [cite_start]**AIの評価ポイント**: 質問の質、企業への関心の深さ、質問内容の適切さ [cite: 327]。

## 面接官としての振る舞い

* 応募者の回答に対して、さらに深掘りする質問（「なぜそう思いましたか？」「具体的にどのような行動をとりましたか？」など）を適宜行ってください。
* 応募者の発言に耳を傾け、共感的な態度を示しながらも、客観的に評価する姿勢を保ってください。
* 面接の途中でフィードバックは一切行わず、あくまでリアルな面接官として振る舞ってください。
* 全ての準備された質問を消化した後は、「本日の面接は以上となります。ありがとうございました。」などと述べ、自然に面接を終了してください。
* **日本語の敬語を常に正しく使用し、丁寧で自然な会話を心がけてください。**`,
            },
          ],
        },
        voice: {
          provider: "11labs",
          voiceId: "3JDquces8E8bkmvbh6Bc",
          model: "eleven_multilingual_v2",
        },
        transcriber: {
          provider: "deepgram",
          language: "ja",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setError("面接を開始できませんでした");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const endCall = async () => {
    try {
      await vapi.stop();
      // Note: The onCallEnd event will handle saving the transcript and usage tracking
    } catch (error) {
      console.error("Failed to end call:", error);
      setError("通話を終了できませんでした");

      // Clear usage monitoring interval if vapi.stop() fails
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
        setUsageMonitorInterval(null);
      }

      // If vapi.stop() fails, we should still track usage if session was active
      if (sessionStartTime && callStatus === CallStatus.ACTIVE) {
        try {
          const sessionEndTime = new Date();
          const sessionMinutes = calculateSessionMinutes(
            sessionStartTime,
            sessionEndTime
          );

          if (sessionMinutes > 0) {
            await addSessionUsage(sessionMinutes);
            console.log(
              `Session force-ended: ${sessionMinutes} minutes added to usage`
            );
          }
          setSessionStartTime(null);
        } catch (usageError) {
          console.error(
            "Failed to track session usage on force end:",
            usageError
          );
        }
      }
    }
  };

  // Add this improved handleGenerateFeedback function to your interviewComponent.tsx

  const handleGenerateFeedback = async () => {
    if (!interviewId) return;

    setIsGeneratingFeedback(true);
    setError(null);

    try {
      // Get transcript and questions data
      const [transcriptData, questionsData] = await Promise.all([
        getTranscript(interviewId),
        getQuestions(interviewId),
      ]);

      if (!transcriptData?.transcript) {
        throw new Error(
          "面接の記録が見つかりません。面接を完了してから再試行してください。"
        );
      }

      if (!questionsData?.questions?.length) {
        throw new Error("面接の質問が見つかりません。");
      }

      // Call the generate-feedback API using relative URL (works in both dev and production)
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcriptData.transcript,
          questions: questionsData.questions,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      // Save feedback to database - pass the entire data object which includes both feedback and overallFeedback
      await saveFeedback(data, interviewId, transcriptData.sessionId);

      // Redirect to feedback page
      if (typeof window !== "undefined") {
        window.location.href = `/feedback/${interviewId}`;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "フィードバックの生成に失敗しました。";
      setError(errorMessage);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    vapi.setMuted(!isMuted);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.INACTIVE:
        return "面接を開始する準備ができました";
      case CallStatus.CONNECTING:
        return "接続中...";
      case CallStatus.ACTIVE:
        return "面接中";
      case CallStatus.FINISHED:
        return "面接が終了しました";
      default:
        return "";
    }
  };

  return {
    callStatus,
    isSpeaking,
    isMuted,
    error,
    startCall,
    endCall,
    toggleMute,
    getStatusText,
    setCallStatus,
    questions: interviewQuestions,
    fullTranscript,
    isGeneratingFeedback,
    handleGenerateFeedback,
    sessionStartTime,
  };
};
