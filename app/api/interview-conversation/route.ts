import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { CreateSupabaseClient } from '@/lib/supbase';

// Configure runtime for Vercel
export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Initialize TTS client with proper credentials handling
let ttsClient: TextToSpeechClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Use JSON credentials for deployment (Vercel, etc.)
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  ttsClient = new TextToSpeechClient({ credentials });
} else {
  // Use file path for local development
  ttsClient = new TextToSpeechClient();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const conversationContext = formData.get('context') as string || '';
    const systemPrompt = formData.get('systemPrompt') as string || '';
    const interviewId = formData.get('interviewId') as string || '';

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Parse conversation context
    let context = {};
    try {
      context = JSON.parse(conversationContext);
    } catch (e) {
      console.warn('Failed to parse conversation context:', e);
    }

    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create a comprehensive prompt that emphasizes conversation memory
    const enhancedPrompt = `${systemPrompt}

**重要な指示:**
- 会話履歴を必ず詳しく読み、候補者が実際に話した具体的な内容を参照してください
- 候補者の名前、大学、経験、スキルなどの情報を正確に記憶し、質問に答える際に使用してください
- 会話の一貫性を保ち、前の質問や回答に関連した質問をしてください
- 候補者の名前が分かっている場合は、適切に名前を呼んでください
- 具体的な数字、会社名、技術名など、候補者が言及した詳細を覚えておいてください

**会話履歴の活用方法:**
- 候補者が言及した具体的な情報（名前、大学、会社、年数、技術など）を必ず記憶する
- 質問に答える際は、履歴から該当する情報を探して正確に回答する
- 新しい質問をする際は、履歴の内容を踏まえて関連性のある質問をする
- 会話履歴を分析し、候補者が繰り返し強調した価値観や特徴について深掘りする質問をしてください。
- 候補者が既に話した内容を繰り返し聞かない

**具体的な回答方法:**
- 候補者が「私の名前を覚えていますか？」と聞いた場合：履歴から実際の名前を探し、「はい、○○さんですね」と正確に回答する
- 候補者が「私の大学は？」と聞いた場合：履歴から実際の大学名を探し、「○○大学ですね」と正確に回答する
- 候補者が「私の会社は？」と聞いた場合：履歴から実際の会社名を探し、「○○会社ですね」と正確に回答する
- 情報が見つからない場合：「申し訳ございませんが、まだその情報をお聞きしていません」と正直に答える

**現在の音声入力に対する応答:**
候補者の音声入力を聞いて、会話履歴を参照しながら適切な面接官としての応答をしてください。

**応答形式:**
以下のJSON形式で応答してください：
{
  "text": "面接官の応答テキスト（日本語）",
  "transcript": "候補者の音声の文字起こし（日本語）"
}

**注意事項:**
- 候補者が「私の名前を覚えていますか？」と聞いた場合、履歴から実際の名前を探して正確に回答する
- 候補者が「私の大学は？」と聞いた場合、履歴から実際の大学名を探して正確に回答する
- 具体的な情報がない場合は、「申し訳ございませんが、まだその情報をお聞きしていません」と正直に答える
- 応答は簡潔で、1-2文程度にまとめてください`;

    // Generate content with audio
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type,
          data: Buffer.from(audioBuffer).toString('base64')
        }
      },
      enhancedPrompt
    ]);

    // Try to parse JSON from Gemini response
    let responseText = result.response.text();
    let aiText = responseText;
    let transcript = undefined;
    
    try {
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiText = parsed.text || responseText;
        transcript = parsed.transcript;
      } else {
        // Fallback: treat as plain text
        aiText = responseText;
      }
    } catch (e) {
      // Fallback: treat as plain text
      aiText = responseText;
      console.warn('Failed to parse JSON response:', e);
    }

    // Generate TTS audio
    let audioBase64 = null;
    let mimeType = null;
    
    try {
      const ttsRequest = {
        input: { text: aiText },
        voice: { 
          languageCode: 'ja-JP',
          name: 'ja-JP-Neural2-C', // Professional male voice
          ssmlGender: 'MALE' as const
        },
        audioConfig: { 
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0.0
        },
      };

      const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
      audioBase64 = Buffer.from(ttsResponse.audioContent!).toString('base64');
      mimeType = 'audio/mp3';
    } catch (ttsError) {
      console.warn('TTS generation failed, continuing with text-only response:', ttsError);
      // Continue without TTS - the frontend will handle text-only responses
    }
    
    // Optionally, save transcript to DB here if you want to do it server-side
    // if (transcript && interviewId) {
    //   const supabase = CreateSupabaseClient();
    //   await supabase.from('session_history').insert({
    //     transcript,
    //     interview_id: interviewId,
    //     created_at: new Date().toISOString(),
    //   });
    // }

    // Return both text, transcript, and audio (if available)
    return NextResponse.json({
      text: aiText,
      transcript,
      audio: audioBase64,
      mimeType: mimeType
    });

  } catch (error) {
    console.error("Error in interview conversation:", error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to process conversation: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to process conversation" 
    }, { status: 500 });
  }
}