// lib/brain.ts

export type BrainResponse = {
  text: string;
  modelUsed: "GEMINI" | "LLAMA" | "QWEN";
  circuitTripped: string | null; 
};

// 🛑 FIX: Notun parameter `preferredEngine` add kora holo
export async function askBrain(prompt: string, systemInstruction: string = "You are an expert AI.", preferredEngine: string = "GEMINI"): Promise<BrainResponse> {
  let circuitTrippedReason: string | null = null;

  // ==========================================
  // 1️⃣ PRIORITY 1: GEMINI (Only if preferredEngine is GEMINI)
  // ==========================================
  if (preferredEngine === "GEMINI") {
    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) throw new Error("GEMINI_API_KEY missing");

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gemini Error");

      return {
        text: data.candidates[0].content.parts[0].text,
        modelUsed: "GEMINI",
        circuitTripped: null
      };

    } catch (error: any) {
      console.error("Gemini failed:", error.message);
      circuitTrippedReason = `Gemini Suspended (${error.message.includes('Quota') ? 'Quota Exceeded' : 'Timeout/Error'}) → Routing to Llama 3`;
    }
  }

  // ==========================================
  // 2️⃣ PRIORITY 2: LLAMA 3.3 (Runs if Gemini failed, OR if preferredEngine was already LLAMA)
  // ==========================================
  if (preferredEngine === "GEMINI" || preferredEngine === "LLAMA") {
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) throw new Error("GROQ_API_KEY missing");

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Groq Error");

      return {
        text: data.choices[0].message.content,
        modelUsed: "LLAMA",
        // Jodi direct LLAMA te dhoke, tahole kono error dekhabe na, chupchap kaj korbe!
        circuitTripped: circuitTrippedReason 
      };

    } catch (error: any) {
      console.error("Llama failed:", error.message);
      circuitTrippedReason = `Llama Suspended (${error.message}) → Routing to Qwen`;
    }
  }

  // ==========================================
  // 3️⃣ PRIORITY 3: QWEN 2.5 (Fallback of the fallback)
  // ==========================================
  try {
    const hfKey = process.env.HF_TOKEN;
    if (!hfKey) throw new Error("HF_TOKEN missing");

    const res = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfKey}`
      },
      body: JSON.stringify({
        inputs: `${systemInstruction}\nUser: ${prompt}\nAssistant:`,
        parameters: { max_new_tokens: 2000 }
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "HF Error");

    let finalAnswer = data[0].generated_text.split("Assistant:").pop().trim();

    return {
      text: finalAnswer,
      modelUsed: "QWEN",
      circuitTripped: circuitTrippedReason
    };

  } catch (error: any) {
    throw new Error("🚨 ALL SYSTEMS CRASHED! No LLM available.");
  }
}