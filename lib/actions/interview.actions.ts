"use server"

import { auth } from "@clerk/nextjs/server"
import { CreateSupabaseClient } from "../supbase"

// Type definition based on the form schema
type CreateInterview = {
  name: string;
  education: string;
  experience?: string;
  companyName: string;
  role: string;
  jobDescription?: string;
  interviewFocus: "hr" | "case" | "technical" | "final";
}

async function generateInterviewQuestions({
  name,
  experience,
  companyName,
  role,
  jobDescription,
  interviewFocus,
}: {
  name: string;
  experience?: string;
  companyName: string;
  role: string;
  jobDescription?: string;
  interviewFocus: string;
}): Promise<string[]> {
  try {
    // Import OpenAI directly to avoid self-referential API calls
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
あなたは日本企業で20年間の面接経験を持つ、新卒採用に精通した人事担当者です。日本の新卒就活における企業文化、特に「人柄」「協調性」「成長性」「企業への定着性」を重視する採用方針を深く理解しています。

## 質問生成の目的

応募者の潜在能力、人間性、そして当社へのフィット感を効率的に見極めるため、各応募者の情報に基づいた、**簡潔かつ本質的な質問**を5つ生成してください。各質問は、応募者の具体的なエピソードや考えを自然に引き出し、面接官（AI自身）がさらに深掘りできるよう設計してください。

## 応募者情報

- **名前**: ${name || "未入力"}
- **志望企業**: ${companyName || "未入力"}
- **志望職種**: ${role || "未入力"}
- **職務内容**: ${jobDescription || "未入力"}

## 質問生成の条件

* **質問は日本語で作成し、各質問は1文で完結させ、非常に簡潔な表現にしてください。**
* **応募者情報にある名前（${name}）が利用可能な場合は、質問文中で積極的に活用し、パーソナルな印象を与えてください。**
* **複数の内容を一つの質問にまとめず、聞き出したいポイントを一つに絞ってください。**
* **深掘り質問を誘発するような、本質を問うオープンエンドな質問にしてください。**
* 新卒採用として、以下の評価項目を網羅できるよう、バランスよく質問を構成してください。
    * 自己認識と自己表現（自己紹介含む）
    * 当社への関心と志望度（企業理解、入社意欲）
    * 学生時代または過去の経験における「学び」「困難への対処」「チームでの貢献」
    * 人柄とコミュニケーション能力
    * 将来性、成長意欲、キャリアビジョン
* 応募者の「職歴・経験」は新卒のため、「学生時代の経験」として考慮してください。
* 質問のみを番号付きリストで出力してください（説明や追加コメントは一切不要）。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは経験豊富な人事担当者で、効果的な面接質問を作成する専門家です。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }, {
      timeout: 25000, // 25 seconds timeout
    });

    const questionsText = completion.choices[0]?.message?.content || "";
    
    // Parse the numbered list and extract questions
    const questions = questionsText
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(question => question.length > 0);

    const finalQuestions = questions.length >= 5 ? questions.slice(0, 5) : questions;

    return finalQuestions.length > 0 ? finalQuestions : [
      "まずは簡単に自己紹介をお願いします。",
      "なぜ弊社を志望されたのですか？",
      "この職種を選んだ理由を教えてください。",
      "あなたの強みと弱みを教えてください。",
      "5年後のキャリアビジョンを聞かせてください。"
    ];
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return [
      "まずは簡単に自己紹介をお願いします。",
      "なぜ弊社を志望されたのですか？",
      "この職種を選んだ理由を教えてください。",
      "あなたの強みと弱みを教えてください。",
      "5年後のキャリアビジョンを聞かせてください。"
    ];
  }
}

export const createInterview = async (formData: CreateInterview) => {
    const {userId: author} = await auth()
    
    if (!author) {
        throw new Error("User not authenticated")
    }
    
    // Generate questions using OpenAI
    const questions = await generateInterviewQuestions({
        name: formData.name,
        experience: formData.experience,
        companyName: formData.companyName,
        role: formData.role,
        jobDescription: formData.jobDescription,
        interviewFocus: formData.interviewFocus,
    });

    const supabase = CreateSupabaseClient()
    
    const {data, error} = await supabase
        .from("interviews")
        .insert({
            ...formData,
            author,
            questions: JSON.stringify(questions)
        })
        .select();

    if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
    }
    
    if (!data) {
        throw new Error("No data returned from database")
    }

    return data[0];
}

export const getUserInterviews = async (page: number = 1, limit: number = 9) => {
    const {userId: author} = await auth()
    
    const supabase = CreateSupabaseClient()
    const offset = (page - 1) * limit;
    
    const {data, error, count} = await supabase
        .from("interviews")
        .select("*", { count: 'exact' })
        .eq("author", author)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
    }

    return {
        interviews: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

export const getAllInterviews = async (
    page: number = 1, 
    limit: number = 12, 
    filter?: string, 
    sortBy: string = 'newest'
) => {
    const supabase = CreateSupabaseClient()
    const offset = (page - 1) * limit;
    
    let query = supabase
        .from("interviews")
        .select("*", { count: 'exact' });
    
    // Apply filter
    if (filter && filter !== 'all') {
        query = query.eq('interviewFocus', filter);
    }
    
    // Apply sorting
    switch (sortBy) {
        case 'oldest':
            query = query.order("created_at", { ascending: true });
            break;
        case 'popularity':
            // For now, we'll use creation date as a proxy for popularity
            // In the future, you could add a views or interactions column
            query = query.order("created_at", { ascending: false });
            break;
        case 'newest':
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }
    
    query = query.range(offset, offset + limit - 1);

    const {data, error, count} = await query;

    if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
    }

    return {
        interviews: data || [],
        total: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: offset + limit < (count || 0),
        hasPrevPage: page > 1
    };
}

export const saveTranscript = async (transcript: string, interviewId?: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!transcript) {
        throw new Error("Transcript is required");
    }

    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .insert({
            transcript: transcript,
            user_id: userId,
            interview_id: interviewId,
            created_at: new Date().toISOString()
        })
        .select();

    if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to save transcript: ${error.message}`);
    }

    return {
        success: true,
        sessionId: data[0].id,
        message: "Transcript saved successfully"
    };
}

export const getTranscript = async (interviewId: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select('*')
        .eq('user_id', userId)
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No transcript found
            return null;
        }
        console.error("Database error:", error);
        throw new Error(`Failed to fetch transcript: ${error.message}`);
    }

    return {
        transcript: data.transcript,
        sessionId: data.id,
        createdAt: data.created_at
    };
}

export const getQuestions = async (interviewId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabase = CreateSupabaseClient();

  const { data, error } = await supabase
    .from('interviews')
    .select('questions')
    .eq('id', interviewId)
    .eq('author', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  let parsedQuestions: string[] = [];
  
  if (data.questions) {
    if (Array.isArray(data.questions)) {
      parsedQuestions = data.questions;
    } else if (typeof data.questions === 'string') {
      try {
        parsedQuestions = JSON.parse(data.questions);
      } catch {
        parsedQuestions = [];
      }
    }
  }

  return {
    questions: parsedQuestions,
    interviewId: interviewId
  };
}

export const getFeedback = async (interviewId: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select('feedback, overall_feedback, id, created_at')
        .eq('user_id', userId)
        .eq('interview_id', interviewId)
        .not('feedback', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No feedback found
            return null;
        }
        console.error("Database error:", error);
        throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return {
        feedback: data.feedback,
        overallFeedback: data.overall_feedback,
        sessionId: data.id,
        createdAt: data.created_at
    };
}

export const saveFeedback = async (feedbackData: any, interviewId?: string, sessionId?: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!feedbackData) {
        throw new Error("Feedback is required");
    }

    const supabase = CreateSupabaseClient();
    
    // Extract overall feedback to save in separate column
    const overallFeedback = feedbackData.overallFeedback || null;
    
    // If sessionId is provided, update existing session_history record
    if (sessionId) {
        const { data, error } = await supabase
            .from('session_history')
            .update({
                feedback: feedbackData,
                overall_feedback: overallFeedback
            })
            .eq('id', sessionId)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error("Database error:", error);
            throw new Error(`Failed to update feedback: ${error.message}`);
        }

        return {
            success: true,
            sessionId: sessionId,
            message: "Feedback updated successfully"
        };
    } else {
        // Create new session_history record with feedback
        const { data, error } = await supabase
            .from('session_history')
            .insert({
                feedback: feedbackData,
                overall_feedback: overallFeedback,
                user_id: userId,
                interview_id: interviewId,
                created_at: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error("Database error:", error);
            throw new Error(`Failed to save feedback: ${error.message}`);
        }

        return {
            success: true,
            sessionId: data[0].id,
            message: "Feedback saved successfully"
        };
    }
}