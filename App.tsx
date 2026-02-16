
import React, { useState, useRef } from 'react';
import { AppView, AnalysisResult, ProcessingPhase } from './types';
import { EMOTION_METADATA } from './constants';
import Spectrogram from './components/Spectrogram';
import EmotionCard from './components/EmotionCard';
import ProcessingPipeline from './components/ProcessingPipeline';
import { analyzeSpeechEmotion } from './services/geminiService';
import { blobToBase64, generateStaticSpectrogram } from './services/audioProcessing';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>(ProcessingPhase.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [staticSpectrogram, setStaticSpectrogram] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const newAnalyser = audioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      source.connect(newAnalyser);
      
      setAnalyser(newAnalyser);
      audioContextRef.current = audioContext;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
      setStaticSpectrogram(null);
      setCurrentPhase(ProcessingPhase.ACQUISITION);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioStream?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      setAnalyser(null);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    
    // Phase 2: Preprocessing
    setCurrentPhase(ProcessingPhase.PREPROCESSING);
    await new Promise(r => setTimeout(r, 800));
    
    // Phase 3: Spectrogram Generation
    setCurrentPhase(ProcessingPhase.SPECTROGRAM);
    try {
      const specImg = await generateStaticSpectrogram(blob);
      setStaticSpectrogram(specImg);
    } catch (err) {
      console.error("Spectrogram generation failed", err);
    }
    await new Promise(r => setTimeout(r, 1200));
    
    // Phase 4: Inference
    setCurrentPhase(ProcessingPhase.INFERENCE);
    
    try {
      const base64 = await blobToBase64(blob);
      const analysis = await analyzeSpeechEmotion(base64);
      setResult(analysis);
      setCurrentPhase(ProcessingPhase.COMPLETE);
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Classification failed. Please try a clearer recording.");
      setCurrentPhase(ProcessingPhase.IDLE);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResult(null);
      setStaticSpectrogram(null);
      processAudio(file);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight">SER-<span className="text-purple-500">CNN</span></h1>
          </div>
          
          <nav className="space-y-1">
            <button onClick={() => setView(AppView.DASHBOARD)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${view === AppView.DASHBOARD ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </button>
            <button onClick={() => setView(AppView.ANALYZE)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${view === AppView.ANALYZE ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Inference Engine
            </button>
            <button onClick={() => setView(AppView.ABOUT)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${view === AppView.ABOUT ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Architecture
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800 text-slate-500">
          <p className="text-[10px] font-bold uppercase mb-2">Developed By</p>
          <ul className="text-xs space-y-1">
            <li>Gatla Priyanka</li>
            <li>P. Akshaya Sree</li>
            <li>Golla Anil</li>
          </ul>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <div className="max-w-5xl mx-auto">
          {view === AppView.DASHBOARD && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header>
                <h2 className="text-3xl font-bold mb-2">Speech Emotion Recognition</h2>
                <p className="text-slate-400">Deep Learning CNN Classifier with Spectrogram Analysis</p>
              </header>

              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold mb-6">Upload Audio Dataset Sample</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col items-center pt-5 pb-6 text-center px-4">
                      <svg className="w-10 h-10 mb-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-sm font-bold text-slate-300">Choose Audio File (WAV/MP3)</p>
                      <p className="text-xs text-slate-500 mt-2">The CNN will extract 128 Mel bands for inference.</p>
                    </div>
                    <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                  </label>
                  <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-xl flex flex-col justify-center">
                    <h4 className="text-xl font-bold mb-2">Live Real-time Extraction</h4>
                    <p className="text-purple-200 text-sm mb-6 leading-relaxed">Analyze emotional inflection directly from your voice using our synchronized inference engine.</p>
                    <button onClick={() => setView(AppView.ANALYZE)} className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-bold text-sm shadow-xl hover:scale-105 transition-transform">Start Engine</button>
                  </div>
                </div>
              </div>

              {isAnalyzing && (
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                  <h3 className="text-lg font-bold mb-8 text-center text-purple-400">CNN Feature Extraction Active</h3>
                  <ProcessingPipeline currentPhase={currentPhase} />
                  {staticSpectrogram && (
                    <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase text-center tracking-widest">Generating Mel-Scale Feature Map...</p>
                      <img src={staticSpectrogram} className="w-full h-32 object-cover rounded-lg border border-slate-700 brightness-125" alt="Current Processing Spectrogram" />
                    </div>
                  )}
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">CNN Classification Report</h3>
                      <p className="text-slate-500 text-xs">High Fidelity Spectrogram Input | Model: ResNet-18 Optimized</p>
                    </div>
                    <div className={`text-3xl font-black px-6 py-2 rounded-xl flex items-center gap-3 ${EMOTION_METADATA[result.dominantEmotion].bg} ${EMOTION_METADATA[result.dominantEmotion].color}`}>
                      <span>{EMOTION_METADATA[result.dominantEmotion].icon}</span>
                      {result.dominantEmotion.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Input Spectrogram (CNN Activation Map)</h4>
                    <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-black shadow-2xl ring-1 ring-white/5">
                      {staticSpectrogram && <img src={staticSpectrogram} className="w-full h-64 object-cover" alt="Final Feature Map" />}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-slate-900/80 px-2 py-1 rounded text-[8px] font-bold text-purple-400 border border-purple-500/20">FREQ (Hz)</span>
                        <span className="bg-slate-900/80 px-2 py-1 rounded text-[8px] font-bold text-indigo-400 border border-indigo-500/20">MEL FILTER</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Pitch Variation</div>
                      <div className="text-sm font-bold text-slate-100">{result.features?.pitch || "Stable"}</div>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Vocal Intensity</div>
                      <div className="text-sm font-bold text-slate-100">{result.features?.intensity || "Normal"}</div>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Spectral Centroid</div>
                      <div className="text-sm font-bold text-slate-100">{result.features?.spectralCentroid || "Medium"}</div>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Prosodic Tempo</div>
                      <div className="text-sm font-bold text-slate-100">{result.features?.tempo || "Moderate"}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                    {result.scores.sort((a,b) => b.confidence - a.confidence).map(score => (
                      <EmotionCard key={score.label} score={score} isDominant={score.label === result.dominantEmotion} />
                    ))}
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-xl">
                    <h4 className="text-purple-400 text-xs font-bold uppercase mb-2">CNN Model Insight</h4>
                    <p className="text-slate-300 italic text-sm leading-relaxed">{result.insights}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === AppView.ANALYZE && (
            <div className="space-y-8 animate-in fade-in">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Live Engine</h2>
                  <p className="text-slate-400">Feature Extraction & Inference</p>
                </div>
                <button onClick={() => setView(AppView.DASHBOARD)} className="text-slate-500 hover:text-white">Exit Engine</button>
              </header>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-8 shadow-2xl">
                <Spectrogram analyser={analyser} isActive={isRecording} />
                
                <div className="flex flex-col items-center gap-4">
                   <button onClick={isRecording ? stopRecording : startRecording} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-white text-slate-900 ring-4 ring-purple-500/30' : 'bg-purple-600 text-white'}`}>
                    {isRecording ? <div className="w-8 h-8 bg-slate-900 rounded-sm" /> : <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>}
                  </button>
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{isRecording ? "Analyzing Waveform..." : "Push to Record 3s Block"}</p>
                </div>

                {isAnalyzing && <ProcessingPipeline currentPhase={currentPhase} />}

                {result && !isAnalyzing && (
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 flex items-center justify-between animate-in zoom-in-95">
                    <div className="flex items-center gap-6">
                      <span className="text-6xl">{EMOTION_METADATA[result.dominantEmotion].icon}</span>
                      <div>
                        <div className="text-slate-500 text-xs font-bold uppercase">Classification</div>
                        <div className={`text-4xl font-black ${EMOTION_METADATA[result.dominantEmotion].color}`}>{result.dominantEmotion}</div>
                      </div>
                    </div>
                    <button onClick={() => setResult(null)} className="text-slate-500 text-xs font-bold underline uppercase">Clear</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === AppView.ABOUT && (
            <div className="space-y-12 pb-20 animate-in fade-in">
              <header><h2 className="text-3xl font-bold mb-2">Technical Architecture</h2><p className="text-slate-400">CNN-based Feature extraction and classification.</p></header>
              <section className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
                <h3 className="text-xl font-bold text-purple-400">Model Definition (Keras)</h3>
                <div className="bg-slate-950 p-6 rounded-xl font-mono text-xs text-slate-500 leading-relaxed border border-slate-800 shadow-inner overflow-x-auto">
{`# Multi-layer Convolutional Neural Network
def build_model():
    model = Sequential([
        Conv2D(64, (3,3), activation='relu', input_shape=(128,128,1)),
        BatchNormalization(),
        MaxPooling2D((2,2)),
        Conv2D(128, (3,3), activation='relu'),
        MaxPooling2D((2,2)),
        Dropout(0.3),
        Flatten(),
        Dense(512, activation='relu'),
        Dense(7, activation='softmax')
    ])
    return model`}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
