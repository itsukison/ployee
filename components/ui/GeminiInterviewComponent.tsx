import React, { useState, useRef, useEffect, useCallback } from "react";
import { saveTranscript } from "@/lib/actions/interview.actions";
import { addSessionUsage, canStartSession, getUserPlanLimit, getCurrentUsage } from "@/lib/actions/usage.actions";

// Configuration constants
const SILENCE_THRESHOLD = 0.05;
const SILENCE_DURATION = 1500;
const AUDIO_SAMPLE_RATE = 44100;
const ANALYSIS_INTERVAL = 100;

interface GeminiInterviewComponentProps {
  interviewId: string;
  name?: string;
  experience?: string;
  companyName?: string;
  role?: string;
  jobDescription?: string;
  interviewFocus?: string;
}

export default function GeminiInterviewComponent({
  interviewId,
  name,
  experience,
  companyName,
  role,
  jobDescription,
  interviewFocus,
}: GeminiInterviewComponentProps) {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [silenceTimer, setSilenceTimer] = useState<number>(0);
  const [hasSpokenInCurrentSession, setHasSpokenInCurrentSession] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Conversation tracking
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: number;
    }>
  >([]);
  const [interviewPhase, setInterviewPhase] = useState<
    "introduction" | "experience" | "skills" | "motivation" | "closing"
  >("introduction");
  const [candidateInfo, setCandidateInfo] = useState<{
    name?: string;
    experience?: string;
    skills?: string[];
    interests?: string[];
    university?: string;
    company?: string;
  }>({});

  // Audio references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousSpeakingStateRef = useRef<boolean>(false);
  const hasSpokenInCurrentSessionRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const isPlayingTTSRef = useRef<boolean>(false);
  const currentRecordingSessionRef = useRef<number>(0);

  // Helper: update interview phase
  const updateInterviewPhase = useCallback((history: typeof conversationHistory) => {
    const userMessageCount = history.filter((msg) => msg.role === "user").length;
    if (userMessageCount <= 2) setInterviewPhase("introduction");
    else if (userMessageCount <= 5) setInterviewPhase("experience");
    else if (userMessageCount <= 8) setInterviewPhase("skills");
    else if (userMessageCount <= 11) setInterviewPhase("motivation");
    else setInterviewPhase("closing");
  }, []);

  // Helper: extract candidate info from AI responses
  const updateCandidateInfo = useCallback((aiResponse: string, userTranscript: string) => {
    setCandidateInfo((prev) => {
      const updated = { ...prev };
      
      // Extract name if mentioned - multiple patterns
      if (!updated.name) {
        const namePatterns = [
          /(?:私の名前は|私は)(.+?)(?:です|と申します|と申します|です)/,
          /(?:名前は|名前が)(.+?)(?:です|と申します)/,
          /(?:私は)(.+?)(?:です|と申します)/,
          /(?:候補者は|応募者は)(.+?)(?:です|と申します)/
        ];
        
        for (const pattern of namePatterns) {
          const nameMatch = userTranscript.match(pattern);
          if (nameMatch && nameMatch[1].trim().length > 0) {
            updated.name = nameMatch[1].trim();
            break;
          }
        }
      }
      
      // Extract university/education - comprehensive patterns
      if (!updated.university) {
        const universityPatterns = [
          /(.+?(?:大学|学院|専門学校|短大).+?)(?:です|出身|卒業)/,
          /(?:出身は|卒業は)(.+?(?:大学|学院|専門学校|短大).+?)(?:です|です)/,
          /(.+?(?:大学|学院|専門学校|短大).+?)(?:で|に)(?:通っ|在学|卒業)/,
          /(?:大学は|学校は)(.+?)(?:です|でした)/
        ];
        
        for (const pattern of universityPatterns) {
          const universityMatch = userTranscript.match(pattern);
          if (universityMatch && universityMatch[1].trim().length > 2) {
            updated.university = universityMatch[1].trim();
            break;
          }
        }
      }
      
      // Extract experience/background - more comprehensive patterns
      if (!updated.experience) {
        const experiencePatterns = [
          /(.+?(?:経験|働い|職歴|勤務|在職).+?)/,
          /(.+?(?:年|年間).+?(?:経験|働い|職歴).+?)/,
          /(.+?(?:会社|企業|組織).+?(?:で|に).+?(?:働い|勤務).+?)/
        ];
        
        for (const pattern of experiencePatterns) {
          const experienceMatch = userTranscript.match(pattern);
          if (experienceMatch && experienceMatch[1].trim().length > 5) {
            updated.experience = experienceMatch[1].trim();
            break;
          }
        }
      }
      
      // Extract company names
      if (!updated.company) {
        const companyPatterns = [
          /(.+?(?:会社|企業|株式会社|有限会社|合同会社).+?)(?:で|に)(?:働い|勤務)/,
          /(?:会社は|企業は)(.+?)(?:です|でした)/,
          /(.+?(?:株式会社|有限会社|合同会社).+?)(?:です|でした)/
        ];
        
        for (const pattern of companyPatterns) {
          const companyMatch = userTranscript.match(pattern);
          if (companyMatch && companyMatch[1].trim().length > 2) {
            updated.company = companyMatch[1].trim();
            break;
          }
        }
      }
      
      // Extract skills - more comprehensive patterns
      if (!updated.skills || updated.skills.length === 0) {
        const skillsPatterns = [
          /(.+?(?:スキル|できる|技術|得意|専門).+?)/,
          /(.+?(?:プログラミング|開発|設計|分析|管理).+?)/,
          /(.+?(?:言語|ツール|フレームワーク).+?)/
        ];
        
        for (const pattern of skillsPatterns) {
          const skillsMatch = userTranscript.match(pattern);
          if (skillsMatch && skillsMatch[1].trim().length > 3) {
            updated.skills = [skillsMatch[1].trim()];
            break;
          }
        }
      }
      
      return updated;
    });
  }, []);

  // Helper: format conversation history for context
  const formatConversationHistory = useCallback((history: typeof conversationHistory) => {
    if (history.length === 0) return "まだ会話が始まっていません。";
    
    return history.map((msg, index) => {
      const role = msg.role === "user" ? "候補者" : "面接官";
      const messageNumber = Math.floor(index / 2) + 1;
      const isUserMessage = msg.role === "user";
      
      if (isUserMessage) {
        return `【やり取り${messageNumber}】\n候補者: ${msg.content}\n`;
      } else {
        return `面接官: ${msg.content}\n`;
      }
    }).join("\n");
  }, []);

  // Helper: create comprehensive system prompt
  const createSystemPrompt = useCallback(() => {
    const candidateInfoText = candidateInfo.name 
      ? `\n候補者情報:\n- 名前: ${candidateInfo.name}${candidateInfo.university ? `\n- 大学: ${candidateInfo.university}` : ''}${candidateInfo.company ? `\n- 会社: ${candidateInfo.company}` : ''}${candidateInfo.experience ? `\n- 経験: ${candidateInfo.experience}` : ''}${candidateInfo.skills ? `\n- スキル: ${candidateInfo.skills.join(', ')}` : ''}`
      : "";

    return `あなたは経験豊富な日本企業の面接官です。以下の指針に従って面接を進めてください：

**重要な指示:**
- 会話の履歴を必ず参照し、候補者が既に話した内容を覚えておく
- 候補者の名前、大学、会社、経験、スキルなどの情報を記憶し、後で参照する
- 一貫性のある会話を維持する

**面接の流れ:**
- 自己紹介から始める（introduction段階）
- 経歴・経験について詳しく聞く（experience段階）
- スキルや専門知識を確認（skills段階）
- 志望動機や将来の目標を聞く（motivation段階）
- 質問の機会を提供して締める（closing段階）

**面接官としての態度:**
- 丁寧で敬語を使った話し方
- 候補者の回答に対して適切な深掘り質問
- 1回の応答は1-2個の質問に留める
- 候補者にたくさん話してもらう
- 自然な会話の流れを作る

**記憶の活用:**
- 前の回答を参考にした質問をする
- 候補者の発言に一貫性があるかチェック
- 具体的な例やエピソードを求める
- 候補者の名前を適切に使用する

**現在の面接フェーズ:** ${interviewPhase === "introduction" ? "自己紹介" : interviewPhase === "experience" ? "経歴・経験" : interviewPhase === "skills" ? "スキル確認" : interviewPhase === "motivation" ? "志望動機" : "質疑応答"}

**会話履歴:**
${formatConversationHistory(conversationHistory)}${candidateInfoText}

各回答は1文と必ず簡潔にまとめてください。`;
  }, [conversationHistory, interviewPhase, candidateInfo, formatConversationHistory]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    chunksRef.current = [];
    silenceTimerRef.current = null;
    analysisIntervalRef.current = null;
    currentAudioRef.current = null;
    previousSpeakingStateRef.current = false;
    hasSpokenInCurrentSessionRef.current = false;
    isProcessingRef.current = false;
    isPlayingTTSRef.current = false;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Start a new recording session
  const startNewRecordingSession = useCallback(() => {
    currentRecordingSessionRef.current += 1;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    chunksRef.current = [];
    hasSpokenInCurrentSessionRef.current = false;
    setHasSpokenInCurrentSession(false);
    previousSpeakingStateRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceTimer(0);
    if (streamRef.current && audioContextRef.current) {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: "audio/webm" });
      const sessionId = currentRecordingSessionRef.current;
      recorder.ondataavailable = (e) => {
        if (
          e.data.size > 0 &&
          !isProcessingRef.current &&
          !isPlayingTTSRef.current &&
          sessionId === currentRecordingSessionRef.current
        ) {
          chunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {};
      recorder.onerror = (e) => setError("音声録音エラーが発生しました");
      recorder.onstart = () => {};
      mediaRecorderRef.current = recorder;
      recorder.start(200);
    }
  }, []);

  // Audio level analysis
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || isProcessingRef.current || isPlayingTTSRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = average / 255;
    const currentlySpeaking = normalizedLevel > SILENCE_THRESHOLD;
    const previouslySpeaking = previousSpeakingStateRef.current;
    setIsSpeaking(currentlySpeaking);
    if (currentlySpeaking) {
      hasSpokenInCurrentSessionRef.current = true;
      setHasSpokenInCurrentSession(true);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setSilenceTimer(0);
    } else {
      if (
        hasSpokenInCurrentSessionRef.current &&
        previouslySpeaking &&
        !currentlySpeaking &&
        chunksRef.current.length > 0 &&
        !silenceTimerRef.current &&
        !isProcessingRef.current &&
        !isPlayingTTSRef.current
      ) {
        const startTime = Date.now();
        silenceTimerRef.current = setTimeout(() => {
          sendCurrentAudio();
        }, SILENCE_DURATION);
        const updateTimer = () => {
          const elapsed = Date.now() - startTime;
          setSilenceTimer(Math.min(elapsed, SILENCE_DURATION));
          if (elapsed < SILENCE_DURATION && silenceTimerRef.current) {
            setTimeout(updateTimer, 50);
          }
        };
        updateTimer();
      }
    }
    previousSpeakingStateRef.current = currentlySpeaking;
  }, []);

  // Send current audio to Gemini
  const sendCurrentAudio = useCallback(async () => {
    if (chunksRef.current.length === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    const audioChunks = [...chunksRef.current];
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceTimer(0);
    chunksRef.current = [];
    hasSpokenInCurrentSessionRef.current = false;
    setHasSpokenInCurrentSession(false);
    previousSpeakingStateRef.current = false;
    try {
      setError("");
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      if (audioBlob.size === 0) throw new Error("Empty audio data");
      if (audioBlob.size < 1000) throw new Error("Audio data too small - please speak longer");
      
      const conversationContext = {
        history: conversationHistory,
        phase: interviewPhase,
        candidateInfo: candidateInfo,
        totalExchanges: conversationHistory.filter((msg) => msg.role === "user").length,
        formattedHistory: formatConversationHistory(conversationHistory),
      };
      
      const systemPrompt = createSystemPrompt();
      
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("systemPrompt", systemPrompt);
      formData.append("context", JSON.stringify(conversationContext));
      formData.append("interviewId", interviewId);
      
      const response = await fetch("/api/interview-conversation", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      if (!data.text) throw new Error("No text response from API");
      
      setResponse(data.text);
      
      // Save transcript if available
      if (data.transcript) {
        await saveTranscript(data.transcript, interviewId);
      }
      
      // Update conversation history
      const newUserMessage = {
        role: "user" as const,
        content: data.transcript || "[Audio message]",
        timestamp: Date.now(),
      };
      const newAssistantMessage = {
        role: "assistant" as const,
        content: data.text,
        timestamp: Date.now(),
      };
      
      const newHistory = [...conversationHistory, newUserMessage, newAssistantMessage];
      setConversationHistory(newHistory);
      updateInterviewPhase(newHistory);
      
      // Update candidate info with the new transcript
      if (data.transcript) {
        updateCandidateInfo(data.text, data.transcript);
      }
      
      // Play TTS
      if (data.audio && data.mimeType) {
        const audioData = `data:${data.mimeType};base64,${data.audio}`;
        const audio = new Audio(audioData);
        if (currentAudioRef.current) currentAudioRef.current.pause();
        currentAudioRef.current = audio;
        isPlayingTTSRef.current = true;
        setIsPlayingTTS(true);
        chunksRef.current = [];
        audio.onended = () => {
          currentAudioRef.current = null;
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);
          startNewRecordingSession();
        };
        audio.onerror = () => {
          currentAudioRef.current = null;
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);
          startNewRecordingSession();
        };
        await audio.play();
      } else {
        // No TTS available, continue with text-only response
        console.log('TTS not available, continuing with text-only response');
        startNewRecordingSession();
      }
    } catch (err) {
      setError(`エラーが発生しました: ${err instanceof Error ? err.message : "Unknown error"}`);
      startNewRecordingSession();
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [conversationHistory, interviewPhase, candidateInfo, startNewRecordingSession, updateInterviewPhase, updateCandidateInfo, interviewId, formatConversationHistory, createSystemPrompt]);

  // Start real-time recording
  const startRealTimeRecording = async () => {
    try {
      // Pre-session usage check
      const usageCheck = await canStartSession();
      if (!usageCheck.canStart) {
        setError(`月間利用制限に達しました (${usageCheck.currentUsage}/${usageCheck.planLimit}分)`);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: AUDIO_SAMPLE_RATE,
        },
      });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      setConversationHistory([]);
      setInterviewPhase("introduction");
      setCandidateInfo({});
      setResponse("");
      setError("");
      setSessionStartTime(new Date());
      startNewRecordingSession();
      analysisIntervalRef.current = setInterval(analyzeAudio, ANALYSIS_INTERVAL);
      setIsActive(true);
      setError("");
    } catch (err) {
      setError("マイクへのアクセスに失敗しました");
    }
  };

  // Stop real-time recording
  const stopRealTimeRecording = async () => {
    cleanup();
    setIsActive(false);
    setIsSpeaking(false);
    setSilenceTimer(0);
    setIsPlayingTTS(false);
    setIsProcessing(false);
    currentRecordingSessionRef.current = 0;
    // Track session usage
    if (sessionStartTime) {
      const sessionEndTime = new Date();
      const sessionMinutes = Math.ceil((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60));
      if (sessionMinutes > 0) {
        await addSessionUsage(sessionMinutes);
      }
      setSessionStartTime(null);
    }
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isActive) {
      stopRealTimeRecording();
    } else {
      startRealTimeRecording();
    }
  };

  const silenceProgress = (silenceTimer / SILENCE_DURATION) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI面接システム (Gemini)
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-full font-semibold text-lg transition-all ${
                isActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isActive ? "会話終了" : "会話開始"}
            </button>
          </div>
          {isActive && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={`font-medium ${
                    isSpeaking ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {isPlayingTTS
                    ? "AI応答中..."
                    : isSpeaking
                    ? "音声検出中..."
                    : hasSpokenInCurrentSession
                    ? "音声待機中..."
                    : "話しかけてください..."}
                </span>
              </div>
              {silenceTimer > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-blue-600">
                    送信まで: {Math.ceil((SILENCE_DURATION - silenceTimer) / 1000)}秒
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${silenceProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-500 font-medium">AI処理中...</span>
                </div>
              )}
            </div>
          )}
          {isActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-800">
                  面接フェーズ: {interviewPhase === "introduction"
                    ? "自己紹介"
                    : interviewPhase === "experience"
                    ? "経歴・経験"
                    : interviewPhase === "skills"
                    ? "スキル確認"
                    : interviewPhase === "motivation"
                    ? "志望動機"
                    : "質疑応答"}
                </h3>
                <span className="text-sm text-blue-600">
                  やり取り: {Math.floor(conversationHistory.length / 2)}回
                </span>
              </div>
              {/* Display candidate information if available */}
              {(candidateInfo.name || candidateInfo.university || candidateInfo.company || candidateInfo.experience || candidateInfo.skills) && (
                <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                  <h4 className="font-medium text-blue-800 mb-2">記憶された情報:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {candidateInfo.name && (
                      <div>• 名前: {candidateInfo.name}</div>
                    )}
                    {candidateInfo.university && (
                      <div>• 大学: {candidateInfo.university}</div>
                    )}
                    {candidateInfo.company && (
                      <div>• 会社: {candidateInfo.company}</div>
                    )}
                    {candidateInfo.experience && (
                      <div>• 経験: {candidateInfo.experience}</div>
                    )}
                    {candidateInfo.skills && candidateInfo.skills.length > 0 && (
                      <div>• スキル: {candidateInfo.skills.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">面接官からの質問:</h3>
              <p className="text-green-700">{response}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">面接システムの使い方:</h3>
            <ul className="text-blue-700 space-y-1 ml-4">
              <li>• 「会話開始」をクリックして面接を開始</li>
              <li>• 面接官の質問に音声で回答してください</li>
              <li>• {SILENCE_DURATION / 1000}秒間静かにすると自動的に次の質問が来ます</li>
              <li>• 自己紹介→経歴→スキル→志望動機→質疑応答の順で進みます</li>
              <li>• 具体的なエピソードや例を交えて回答してください</li>
              <li>• 「会話終了」で面接を終了</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 