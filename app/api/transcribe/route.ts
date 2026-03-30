import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: "Kono audio asheni boss!" }, { status: 400 });
    }

    console.log("🎙️ Sending audio to Groq Whisper AI...");

    // Groq API expect kore ekta proper form-data
    const groqData = new FormData();
    groqData.append('file', audioFile, 'voice.webm');
    groqData.append('model', 'whisper-large-v3');
    
    // 🚀 THE FIX: Temperature 0 korle AI hallucinate korbe na (100% strict thakbe)
    groqData.append('temperature', '0.0'); 
    
    // 🚀 THE FIX: Guided Universal Prompt (AI ke direction dewa)
    groqData.append('prompt', 'Please transcribe accurately. Language could be Bengali, Hindi, or English. Ignore background noise and silence. Do not invent words.');
    
    // Note: 'language' parameter ta amra add korlam na jate Auto-Detect bondho na hoy!

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Transcription failed");
    }

    console.log("✅ Whisper Output:", data.text);
    return NextResponse.json({ text: data.text });

  } catch (error: any) {
    console.error("Audio processing crashed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}