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

    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create the prompt with context
    const prompt = `${systemPrompt}\n\nConversation Context:\n${conversationContext}\n\nPlease respond to the user's audio input appropriately in Japanese. Keep responses natural and conversational. Also, provide a transcript of the user's speech if possible. Respond in JSON: { text: string, transcript?: string }`;
    
    // Generate content with audio
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type,
          data: Buffer.from(audioBuffer).toString('base64')
        }
      },
      prompt
    ]);

    // Try to parse JSON from Gemini response
    let responseText = result.response.text();
    let aiText = responseText;
    let transcript = undefined;
    try {
      const parsed = JSON.parse(responseText);
      aiText = parsed.text || responseText;
      transcript = parsed.transcript;
    } catch (e) {
      // Fallback: treat as plain text
      aiText = responseText;
    }

    // Generate TTS audio
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
    
    // Optionally, save transcript to DB here if you want to do it server-side
    // if (transcript && interviewId) {
    //   const supabase = CreateSupabaseClient();
    //   await supabase.from('session_history').insert({
    //     transcript,
    //     interview_id: interviewId,
    //     created_at: new Date().toISOString(),
    //   });
    // }

    // Return both text, transcript, and audio
    return NextResponse.json({
      text: aiText,
      transcript,
      audio: Buffer.from(ttsResponse.audioContent!).toString('base64'),
      mimeType: 'audio/mp3'
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