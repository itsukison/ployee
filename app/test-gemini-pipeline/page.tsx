"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// Configuration constants
const SILENCE_THRESHOLD = 0.05; // Audio level below which is considered silence
const SILENCE_DURATION = 1500; // Wait 1.5 seconds of silence before sending
const AUDIO_SAMPLE_RATE = 44100;
const ANALYSIS_INTERVAL = 100; // Check audio levels every 100ms

export default function TestGeminiPipeline() {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [silenceTimer, setSilenceTimer] = useState<number>(0);
  const [hasSpokenInCurrentSession, setHasSpokenInCurrentSession] =
    useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // Enhanced conversation tracking
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

  // Complete cleanup function
  const cleanup = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
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

    // Reset all refs
    chunksRef.current = [];
    silenceTimerRef.current = null;
    analysisIntervalRef.current = null;
    currentAudioRef.current = null;
    previousSpeakingStateRef.current = false;
    hasSpokenInCurrentSessionRef.current = false;
    isProcessingRef.current = false;
    isPlayingTTSRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Helper function to update interview phase
  const updateInterviewPhase = useCallback(
    (history: typeof conversationHistory) => {
      const userMessageCount = history.filter(
        (msg) => msg.role === "user"
      ).length;

      if (userMessageCount <= 2) {
        setInterviewPhase("introduction");
      } else if (userMessageCount <= 5) {
        setInterviewPhase("experience");
      } else if (userMessageCount <= 8) {
        setInterviewPhase("skills");
      } else if (userMessageCount <= 11) {
        setInterviewPhase("motivation");
      } else {
        setInterviewPhase("closing");
      }
    },
    []
  );

  // Helper function to extract candidate info (basic implementation)
  const updateCandidateInfo = useCallback((aiResponse: string) => {
    // This is a simple implementation - you could make this more sophisticated
    // by using NLP or asking the AI to return structured data
    setCandidateInfo((prev) => ({
      ...prev,
      // Add logic to extract info from AI response if needed
    }));
  }, []);

  // Start a new recording session
  const startNewRecordingSession = useCallback(() => {
    // Increment session counter
    currentRecordingSessionRef.current += 1;

    // Stop current recorder if exists
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Clear all chunks and reset state
    chunksRef.current = [];
    hasSpokenInCurrentSessionRef.current = false;
    setHasSpokenInCurrentSession(false);
    previousSpeakingStateRef.current = false;

    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceTimer(0);

    // Restart MediaRecorder with fresh state
    if (streamRef.current && audioContextRef.current) {
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: "audio/webm",
      });

      const sessionId = currentRecordingSessionRef.current;

      recorder.ondataavailable = (e) => {
        // Only accept chunks if this is still the current session and conditions are met
        if (
          e.data.size > 0 &&
          !isProcessingRef.current &&
          !isPlayingTTSRef.current &&
          sessionId === currentRecordingSessionRef.current
        ) {
          console.log(
            "Audio chunk received:",
            e.data.size,
            "bytes",
            "Session:",
            sessionId
          );
          chunksRef.current.push(e.data);
        } else {
          console.log("Audio chunk rejected:", {
            size: e.data.size,
            processing: isProcessingRef.current,
            playingTTS: isPlayingTTSRef.current,
            sessionMatch: sessionId === currentRecordingSessionRef.current,
          });
        }
      };

      recorder.onstop = () => {
        console.log("MediaRecorder stopped for session:", sessionId);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setError("音声録音エラーが発生しました");
      };

      recorder.onstart = () => {
        console.log("MediaRecorder started for session:", sessionId);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200); // Collect data every 200ms
    }
  }, []);

  // Audio level analysis
  const analyzeAudio = useCallback(() => {
    if (
      !analyserRef.current ||
      isProcessingRef.current ||
      isPlayingTTSRef.current
    )
      return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = average / 255;

    const currentlySpeaking = normalizedLevel > SILENCE_THRESHOLD;
    const previouslySpeaking = previousSpeakingStateRef.current;

    setIsSpeaking(currentlySpeaking);

    if (currentlySpeaking) {
      // User is currently speaking
      hasSpokenInCurrentSessionRef.current = true;
      setHasSpokenInCurrentSession(true);

      // Clear any existing silence timer since user is speaking
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setSilenceTimer(0);
    } else {
      // User is not currently speaking
      // Only start silence timer if:
      // 1. User has spoken in this session AND
      // 2. We're transitioning from speaking to not speaking AND
      // 3. We have audio chunks to send AND
      // 4. No timer is already running AND
      // 5. We're not currently processing
      if (
        hasSpokenInCurrentSessionRef.current &&
        previouslySpeaking &&
        !currentlySpeaking &&
        chunksRef.current.length > 0 &&
        !silenceTimerRef.current &&
        !isProcessingRef.current &&
        !isPlayingTTSRef.current
      ) {
        console.log("Starting silence timer - transition detected", {
          hasSpoken: hasSpokenInCurrentSessionRef.current,
          previouslySpeaking,
          currentlySpeaking,
          chunksLength: chunksRef.current.length,
          timerExists: !!silenceTimerRef.current,
          isProcessing: isProcessingRef.current,
        });

        const startTime = Date.now();
        silenceTimerRef.current = setTimeout(() => {
          console.log("Silence timer fired - sending audio");
          sendCurrentAudio();
        }, SILENCE_DURATION);

        // Update silence timer display
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

    // Update previous speaking state AFTER the transition check
    previousSpeakingStateRef.current = currentlySpeaking;
  }, []);

  // Send current audio to Gemini
  const sendCurrentAudio = useCallback(async () => {
    if (chunksRef.current.length === 0 || isProcessingRef.current) return;

    console.log("Sending audio to Gemini...");

    // Set processing state immediately
    isProcessingRef.current = true;
    setIsProcessing(true);

    // Create a copy of the current chunks before clearing
    const audioChunks = [...chunksRef.current];

    // Clear silence timer immediately
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceTimer(0);

    // Clear chunks and reset state for next session
    chunksRef.current = [];
    hasSpokenInCurrentSessionRef.current = false;
    setHasSpokenInCurrentSession(false);
    previousSpeakingStateRef.current = false;

    try {
      setError("");

      // Create audio blob from the copied chunks
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      // Validate audio blob
      if (audioBlob.size === 0) {
        throw new Error("Empty audio data");
      }

      // Additional validation - check if blob is too small
      if (audioBlob.size < 1000) {
        // Less than 1KB is probably not valid audio
        throw new Error("Audio data too small - please speak longer");
      }

      console.log("Audio blob created:", {
        size: audioBlob.size,
        type: audioBlob.type,
        chunksCount: audioChunks.length,
      });

      // Build conversation context
      const conversationContext = {
        history: conversationHistory,
        phase: interviewPhase,
        candidateInfo: candidateInfo,
        totalExchanges: conversationHistory.filter((msg) => msg.role === "user")
          .length,
      };

      // Enhanced system prompt for interviewer behavior
      const systemPrompt = `あなたは経験豊富な日本企業の面接官です。以下の指針に従って面接を進めてください：

  発言は全て簡潔にまとめてください。

1. **面接の流れ**:
   - 自己紹介から始める（introduction段階）
   - 経歴・経験について詳しく聞く（experience段階）
   - スキルや専門知識を確認（skills段階）
   - 志望動機や将来の目標を聞く（motivation段階）
   - 質問の機会を提供して締める（closing段階）

2. **面接官としての態度**:
   - 丁寧で敬語を使った話し方
   - 候補者の回答に対して適切な深掘り質問
   - 1回の応答は1-2個の質問に留める
   - 候補者にたくさん話してもらう
   - 自然な会話の流れを作る

3. **記憶の活用**:
   - 前の回答を参考にした質問をする
   - 候補者の発言に一貫性があるかチェック
   - 具体的な例やエピソードを求める

各回答は1文と必ず簡潔にまとめてください。`;

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("systemPrompt", systemPrompt);
      formData.append("context", JSON.stringify(conversationContext));

      const response = await fetch("/api/interview-conversation", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!data.text) {
        throw new Error("No text response from API");
      }

      setResponse(data.text);

      // Update conversation history with both user input and AI response
      const newUserMessage = {
        role: "user" as const,
        content: "[Audio message]", // You could add transcription here if available
        timestamp: Date.now(),
      };

      const newAssistantMessage = {
        role: "assistant" as const,
        content: data.text,
        timestamp: Date.now(),
      };

      const newHistory = [
        ...conversationHistory,
        newUserMessage,
        newAssistantMessage,
      ];
      setConversationHistory(newHistory);

      // Update interview phase based on conversation length
      updateInterviewPhase(newHistory);

      // Extract candidate info from AI response (basic implementation)
      updateCandidateInfo(data.text);

      // Play the TTS audio smoothly
      if (data.audio) {
        const audioData = `data:${data.mimeType};base64,${data.audio}`;
        const audio = new Audio(audioData);

        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }

        currentAudioRef.current = audio;

        // Set TTS playing state
        isPlayingTTSRef.current = true;
        setIsPlayingTTS(true);

        // Clear any existing chunks while TTS is playing
        chunksRef.current = [];

        audio.onended = () => {
          console.log("TTS playback ended, starting new recording session");
          currentAudioRef.current = null;
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);

          // Start a completely fresh recording session
          startNewRecordingSession();
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          currentAudioRef.current = null;
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);

          // Start a fresh recording session even on error
          startNewRecordingSession();
        };

        await audio.play();
      } else {
        // No TTS audio, start new recording session immediately
        startNewRecordingSession();
      }
    } catch (err) {
      console.error("Error in sendCurrentAudio:", err);
      setError(
        `エラーが発生しました: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );

      // Start new recording session even on error
      startNewRecordingSession();
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    conversationHistory,
    interviewPhase,
    candidateInfo,
    startNewRecordingSession,
    updateInterviewPhase,
    updateCandidateInfo,
  ]);

  // Start real-time recording
  const startRealTimeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: AUDIO_SAMPLE_RATE,
        },
      });

      streamRef.current = stream;

      // Set up audio context for analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Reset conversation state for new interview
      setConversationHistory([]);
      setInterviewPhase("introduction");
      setCandidateInfo({});
      setResponse("");
      setError("");

      // Start the first recording session
      startNewRecordingSession();

      // Start audio analysis
      analysisIntervalRef.current = setInterval(
        analyzeAudio,
        ANALYSIS_INTERVAL
      );

      setIsActive(true);
      setError("");
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("マイクへのアクセスに失敗しました");
    }
  };

  // Stop real-time recording
  const stopRealTimeRecording = () => {
    cleanup();
    setIsActive(false);
    setIsSpeaking(false);
    setSilenceTimer(0);
    setIsPlayingTTS(false);
    setIsProcessing(false);
    currentRecordingSessionRef.current = 0;
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isActive) {
      stopRealTimeRecording();
    } else {
      startRealTimeRecording();
    }
  };

  // Calculate silence progress percentage
  const silenceProgress = (silenceTimer / SILENCE_DURATION) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI面接システム
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Recording Controls */}
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

          {/* Real-time Status */}
          {isActive && (
            <div className="text-center space-y-4">
              {/* Speaking Indicator */}
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

              {/* Silence Timer */}
              {silenceTimer > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-blue-600">
                    送信まで:{" "}
                    {Math.ceil((SILENCE_DURATION - silenceTimer) / 1000)}秒
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${silenceProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-500 font-medium">AI処理中...</span>
                </div>
              )}
            </div>
          )}

          {/* Interview Phase & Stats */}
          {isActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-800">
                  面接フェーズ:{" "}
                  {interviewPhase === "introduction"
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
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                面接官からの質問:
              </h3>
              <p className="text-green-700">{response}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              面接システムの使い方:
            </h3>
            <ul className="text-blue-700 space-y-1 ml-4">
              <li>• 「会話開始」をクリックして面接を開始</li>
              <li>• 面接官の質問に音声で回答してください</li>
              <li>
                • {SILENCE_DURATION / 1000}
                秒間静かにすると自動的に次の質問が来ます
              </li>
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
