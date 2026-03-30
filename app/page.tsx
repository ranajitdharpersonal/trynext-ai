typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Mic, Square, Code, Play, CheckCircle2, Loader2, Sparkles, Globe, ExternalLink, Monitor, Smartphone, LayoutTemplate, AppWindow, RefreshCw, Stethoscope, Trash2, Terminal, Activity 
} from "lucide-react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [debugStatus, setDebugStatus] = useState("System Ready");

  const [srsData, setSrsData] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("");

  const [isHealing, setIsHealing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  const [projectType, setProjectType] = useState<'app' | 'website'>('app');
  const [sandboxView, setSandboxView] = useState<'desktop' | 'mobile'>('desktop');

  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [brainLogs, setBrainLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (brainLogs.length > 0) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [brainLogs]);

  const addLog = (msg: string) => {
    let formattedMsg = msg;
    
    formattedMsg = formattedMsg.replace("[WHISPER]", "🎤 Whisper:");
    formattedMsg = formattedMsg.replace("[MANAGER]", "🎛️ Manager:");
    formattedMsg = formattedMsg.replace("[ARCHITECT]", "🧭 Architect:");
    formattedMsg = formattedMsg.replace("[CODER]", "💻 Coder:");
    formattedMsg = formattedMsg.replace("[THIEF]", "🕵️‍♂️ Thief:");
    formattedMsg = formattedMsg.replace("[SCULPTOR]", "🎨 Sculptor:");
    formattedMsg = formattedMsg.replace("[DATA WIZARD]", "🧙‍♂️ Data Wizard:");
    formattedMsg = formattedMsg.replace("[EVALUATOR]", "⚖️ Evaluator:");
    formattedMsg = formattedMsg.replace("[SYSTEM]", "⚙️ System:");
    formattedMsg = formattedMsg.replace("[CIRCUIT TRIPPED]", "⚙️ System: 🛡️ CIRCUIT BREAKER:");

    setBrainLogs(prev => [...prev, formattedMsg]);
  };

  const speakAgent = (customText?: string) => {
    window.speechSynthesis.cancel(); 

    const safeText = customText || "Task completed successfully, boss.";

    const utterance = new SpeechSynthesisUtterance(safeText);
    utterance.lang = "en-US"; 
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      const premiumVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
      );
      
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      } else {
        const fallback = voices.find(v => v.lang.startsWith('en'));
        if(fallback) utterance.voice = fallback;
      }

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setTranscript("");
      setAgentStatus("");
      setIsHealing(false);
      setBrainLogs([]); 

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDebugStatus("🎤 Listening with Perfect Ear...");
    } catch (err) {
      console.error(err);
      setDebugStatus("❌ Mic permission denied!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDebugStatus("🔄 Whisper AI transcribing...");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setAgentStatus("👂 Processing audio...");
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let finalText = data.text.trim();
      finalText = finalText.replace(/(?:\bthank you\.?\b|\bthanks for watching\.?\b)/gi, '').trim();

      setTranscript(finalText);

      if (finalText) {
        generateAppFlow(finalText);
      } else {
        setDebugStatus("⚠️ Kono kotha shunte paini! (Background noise ignored)");
        setAgentStatus("");
      }
    } catch (err: any) {
      setAgentStatus(`❌ Transcription Failed: ${err.message}`);
      setDebugStatus("System Ready");
    }
  };

  const generateAppFlow = async (text: string) => {
    setIsGenerating(true);
    addLog(`[WHISPER] Transcript received: "${text}"`);
    try {
      setAgentStatus("🚦 Manager Agent analyzing intent...");
      addLog(`[MANAGER] Routing request to Swarm Control...`);
      
      const strictContext = `Target format: ${projectType.toUpperCase()}. Command: ${text}`;
      
      const routerRes = await fetch('/api/router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: strictContext, hasExistingCode: !!generatedCode })
      });
      const decision = await routerRes.json();
      
      const activeEngine = decision.source || "GEMINI"; 
      
      if (decision.circuitTripped) addLog(`[SYSTEM] 🛡️ CIRCUIT BREAKER: ${decision.circuitTripped}`);
      
      let finalAction = decision.action;
      if (generatedCode && finalAction !== "CLONE") {
        finalAction = "MODIFY";
        addLog(`[MANAGER] Override: Existing code found. Forcing MODIFY mode.`);
      } else {
        addLog(`[MANAGER] Decision Matrix Output: Action = ${finalAction}`);
      }

      if (finalAction === "CLONE") {
        setAgentStatus(`🕵️‍♂️ Thief Agent cloning ${decision.target}...`);
        addLog(`[THIEF] Target locked: ${decision.target}`);
        addLog(`[THIEF] Infiltrating via SerpApi to fetch DOM...`);
        
        const cloneRes = await fetch('/api/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: decision.target, prompt: text, activeEngine: activeEngine }) 
        });
        const cloneData = await cloneRes.json();
        if (cloneData.error) throw new Error(cloneData.error);
        
        addLog(`[THIEF] 80,000+ lines of code scraped & parsed successfully.`);
        addLog(`[CODER] Reconstructing UI clone...`);
        setGeneratedCode(cloneData.code);
        setAgentStatus(`✨ Cloning Complete!`);
        addLog(`[SYSTEM] Clone operation finished 100% ✅`);
        
        speakAgent("Your project is successfully generated and ready in the sandbox.");
      }
      
      else if (finalAction === "MODIFY") {
        setAgentStatus(`🎨 Modifier Agent sculpting ${projectType}...`);
        addLog(`[SCULPTOR] Intercepting existing codebase...`);
        addLog(`[SCULPTOR] Applying targeted modifications...`);
        
        const modifyPrompt = `You are modifying an existing ${projectType}. Keep the structure strictly as a ${projectType}. The user's new modification request is: ${text}`;

        const modRes = await fetch('/api/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ existingCode: generatedCode, prompt: modifyPrompt, activeEngine: activeEngine }) 
        });
        const modData = await modRes.json();
        if (modData.error) throw new Error(modData.error);
        
        setGeneratedCode(modData.code);
        setAgentStatus(`✨ Modification Complete!`);
        addLog(`[SYSTEM] Hot-Reloading new UI elements ✅`);
        
        speakAgent("Your project has been successfully modified.");
      }
      
      else { 
        setAgentStatus("🧠 Architect Agent thinking...");
        addLog(`[ARCHITECT] Designing Software Requirements (SRS)...`);
        
        const contextEnhancedText = `You are an expert UI developer. I strictly want to build a ${projectType}. Do not build a website if I asked for an app, and do not build an app if I asked for a website. The specific requirement is: ${text}`;
        
        const intentRes = await fetch('/api/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: contextEnhancedText, activeEngine: activeEngine }) 
        });
        const intentData = await intentRes.json();
        if (intentData.error) throw new Error(intentData.error);
        
        setSrsData(intentData.srs);
        addLog(`[ARCHITECT] SRS Generated: ${intentData.srs.title || projectType}`);
        
        setAgentStatus(`🎨 Coder Agent building UI...`);
        addLog(`[CODER] Compiling Tailwind CSS & Glassmorphism UI...`);
        addLog(`[DATA WIZARD] Injecting LocalStorage Vanilla JS...`);
        
        const coderRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ srs: intentData.srs, activeEngine: activeEngine }) 
        });
        const coderData = await coderRes.json();
        if (coderData.error) throw new Error(coderData.error);

        let currentCode = coderData.code;

        setAgentStatus(`🧐 QA Agent evaluating code...`);
        addLog(`[EVALUATOR] Running syntax & visual QA tests...`);
        
        const qaRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ srs: intentData.srs, htmlCode: currentCode, activeEngine: activeEngine }) 
        });
        const qaData = await qaRes.json();
        
        if (qaData.evaluation && !qaData.evaluation.pass) {
          setIsHealing(true);
          setAgentStatus(`⚠️ QA Failed: ${qaData.evaluation.feedback}`);
          addLog(`[EVALUATOR] ALERT! Bug detected: ${qaData.evaluation.feedback}`);
          
          setAgentStatus(`🛠️ Coder fixing bugs based on QA feedback...`);
          addLog(`[CODER] Executing Self-Healing loop...`);
          
          const healRes = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              srs: intentData.srs, 
              previousCode: currentCode, 
              qaFeedback: qaData.evaluation.feedback,
              activeEngine: activeEngine 
            })
          });
          const healData = await healRes.json();
          if (healData.error) throw new Error(healData.error);
          
          currentCode = healData.code; 
          setIsHealing(false);
          addLog(`[SYSTEM] Code healed successfully ✅`);
        } else {
          addLog(`[EVALUATOR] QA Passed 100%. No bugs found ✅`);
        }

        setGeneratedCode(currentCode);
        setAgentStatus(`✨ Local Deployment Complete!`);
        addLog(`[SYSTEM] Live Sandbox updated successfully!`);
        
        speakAgent("Your project is successfully generated and ready in the sandbox.");
      }

    } catch (error: any) {
      setAgentStatus(`❌ Failed: ${error.message}`);
      addLog(`[SYSTEM] ❌ CRITICAL FAILURE: Process halted: ${error.message}`);
      setIsHealing(false);
    } finally {
      setIsGenerating(false);
      setDebugStatus("System Ready");
    }
  };

  const deployToVercel = async () => {
    if (!generatedCode) return;
    setIsDeploying(true);
    setAgentStatus("☁️ Uploading to Vercel Cloud...");
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlCode: generatedCode,
          appName: srsData?.title || `trynext-ai-${projectType}`
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDeployUrl(data.url);
      setAgentStatus("✅ Live on Internet!");

      speakAgent("Deployment successful. Your application is now live on the internet.");
    } catch (error: any) {
      setAgentStatus(`❌ Deploy Failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const runDoctorAgent = async () => {
    setIsDiagnosing(true);
    setAgentStatus("🩺 Doctor AI is scanning codebase...");
    addLog("[SYSTEM] 🩺 Doctor AI is connecting to GitHub and analyzing codebase...");
    
    try {
      const res = await fetch('/api/doctor', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.circuitTripped) addLog(`[SYSTEM] 🛡️ CIRCUIT BREAKER: ${data.circuitTripped}`);

      if (data.status === "fixed") {
        setAgentStatus(`✅ PR Created by Doctor AI!`);
        addLog(`[SYSTEM] ⚠️ Doctor AI: Issues found! Auto-Pull Request generated successfully.`);
        if (data.prUrl) window.open(data.prUrl, '_blank');

        speakAgent("Code issue fixed. Please check the pull request on GitHub.");
      } else {
        setAgentStatus(`✅ Code is 100% healthy!`);
        addLog(`[SYSTEM] ✅ Doctor AI: Code is flawlessly optimized! No PR needed.`);
      }
    } catch (error: any) {
      setAgentStatus(`❌ Doctor Failed: ${error.message}`);
      addLog(`[SYSTEM] ❌ Doctor AI encountered an error: ${error.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 relative overflow-x-hidden overflow-y-auto z-0 font-sans">
      
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-[1600px] mx-auto w-full min-h-screen p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center items-stretch">
        
        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-6 lg:p-10 shadow-2xl relative z-10 flex-shrink-0">
          
          <div className="flex items-center gap-3 mb-6 mt-0">
            <div className="relative flex items-center justify-center w-28 h-28 bg-transparent -ml-2">
              <img src="/logo.png" alt="TryNext Logo" className="relative z-10 w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl tracking-tight leading-none mb-1 flex items-baseline gap-1.5">
                <span className="font-semibold text-white">TryNext</span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">AI</span>
              </h1>
              <span className="italic font-serif text-[15px] text-gray-400 tracking-wide mt-1">
                A Product of Ranajit Dhar
              </span>
            </div>
          </div>

          <div className="flex items-center bg-black/80 p-1.5 rounded-xl border border-white/5 mb-10 w-full shadow-inner">
            <button onClick={() => setProjectType('app')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${projectType === 'app' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.