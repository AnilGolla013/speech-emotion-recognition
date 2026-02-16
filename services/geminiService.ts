import { AnalysisResult } from "../types";

// Attempts to run a real GenAI inference when an API key is provided and
// the SDK can be dynamically imported. Falls back to a deterministic
// mock result for browser/local development so the dashboard always shows data.
export const analyzeSpeechEmotion = async (audioBase64: string, mimeType: string = 'audio/wav'): Promise<AnalysisResult> => {
  // Prefer Vite env variable first, then process.env (build-time), else undefined
  // Using import.meta.env keeps keys out of the bundle when not provided.
  const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) || (process.env && (process.env as any).API_KEY);

  if (apiKey) {
    try {
      const genai = await import('@google/genai');
      const { GoogleGenAI, Type } = genai as any;

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: audioBase64,
                  mimeType: mimeType
                }
              },
              {
                text: `Perform a high-precision Speech Emotion Recognition (SER) analysis. Return a JSON object with dominantEmotion, scores (array), features, and insights.`
              }
            ]
          }
        ],
        config: {
          systemInstruction: "Expert SER-CNN Inference Engine.",
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dominantEmotion: { type: Type.STRING },
              scores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ["label", "confidence"]
                }
              },
              features: {
                type: Type.OBJECT,
                properties: {
                  pitch: { type: Type.STRING },
                  intensity: { type: Type.STRING },
                  tempo: { type: Type.STRING },
                  spectralCentroid: { type: Type.STRING }
                }
              },
              insights: { type: Type.STRING }
            },
            required: ["dominantEmotion", "scores"]
          }
        }
      });

      try {
        const text = response.text;
        if (!text) throw new Error('Empty response from AI');
        return JSON.parse(text.trim()) as AnalysisResult;
      } catch (e) {
        console.error('Inference parse error', e);
        // Fall through to mock fallback below
      }
    } catch (e) {
      console.error('GenAI invocation failed', e);
      // Fall through to mock fallback
    }
  }

  // Fallback heuristic for development: analyze the provided base64 audio
  // to compute simple features (RMS energy, zero-crossing rate, spectral centroid)
  // and map those to emotion scores so outputs change with input.
  const base64ToArrayBuffer = (b64: string) => {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const analyzeAudioFromBase64 = async (b64: string) => {
    try {
      const arrayBuffer = base64ToArrayBuffer(b64);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      const sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.numberOfChannels ? audioBuffer.getChannelData(0) : new Float32Array([]);

      // Compute RMS
      let sumSq = 0;
      for (let i = 0; i < channelData.length; i++) sumSq += channelData[i] * channelData[i];
      const rms = Math.sqrt(sumSq / Math.max(1, channelData.length));

      // Zero-crossing rate
      let zc = 0;
      for (let i = 1; i < channelData.length; i++) if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) zc++;
      const zcr = zc / Math.max(1, channelData.length);

      // Small FFT for spectral centroid (first N samples)
      const N = 512;
      const fftSize = Math.min(N, channelData.length);
      const x = channelData.slice(0, fftSize);
      const mags = new Float32Array(Math.floor(fftSize / 2));
      // naive DFT (O(N^2)) but small N is fine here
      for (let k = 0; k < mags.length; k++) {
        let re = 0, im = 0;
        for (let n = 0; n < fftSize; n++) {
          const angle = (2 * Math.PI * k * n) / fftSize;
          re += x[n] * Math.cos(angle);
          im -= x[n] * Math.sin(angle);
        }
        mags[k] = Math.sqrt(re * re + im * im);
      }
      let magSum = 0, centroidNum = 0;
      for (let k = 0; k < mags.length; k++) {
        magSum += mags[k];
        centroidNum += k * mags[k];
      }
      const centroidBin = magSum > 0 ? centroidNum / magSum : 0;
      const spectralCentroidHz = centroidBin * (sampleRate / 2) / Math.max(1, mags.length);

      audioCtx.close();

      return { rms, zcr, spectralCentroidHz };
    } catch (e) {
      console.warn('Fallback audio analysis failed', e);
      return null;
    }
  };

  const softmax = (arr: number[]) => {
    const max = Math.max(...arr);
    const exps = arr.map(v => Math.exp(v - max));
    const s = exps.reduce((a,b) => a + b, 0);
    return exps.map(v => v / s);
  };

  const EMOTIONS = ['Happy','Sad','Angry','Neutral','Fear','Surprise','Disgust'] as const;

  const analysis = await analyzeAudioFromBase64(audioBase64).catch(() => null);

  // Default neutral values
  let rms = 0.02, zcr = 0.01, centroid = 1000;
  if (analysis) {
    rms = analysis.rms;
    zcr = analysis.zcr;
    centroid = analysis.spectralCentroidHz;
  }

  // Heuristics: compute a score value per emotion (higher => more likely)
  const values: number[] = [];
  for (const emo of EMOTIONS) {
    let v = 0;
    if (emo === 'Angry') v = (rms * 5) + (centroid > 3000 ? 1.0 : 0) + (zcr * 50);
    if (emo === 'Surprise') v = (rms * 4) + (zcr * 40) + (centroid > 2000 ? 0.6 : 0);
    if (emo === 'Happy') v = (rms * 3) + (zcr * 20) + (centroid > 1500 ? 0.4 : 0);
    if (emo === 'Sad') v = (1 - Math.min(1, rms * 20)) + (centroid < 800 ? 0.6 : 0);
    if (emo === 'Neutral') v = (1 - Math.abs(rms - 0.02) * 50) + (Math.max(0, 0.05 - zcr) * 20);
    if (emo === 'Fear') v = (zcr * 30) + (centroid > 2500 ? 0.3 : 0);
    if (emo === 'Disgust') v = (rms * 2) + (centroid < 700 ? 0.8 : 0) + (zcr * 5);
    // small jitter to avoid exact ties
    v += (Math.random() - 0.5) * 0.05;
    values.push(v);
  }

  const probs = softmax(values);
  const scores = EMOTIONS.map((label, idx) => ({ label: label as any, confidence: Math.round(probs[idx] * 100) / 100 }));
  scores.sort((a,b) => b.confidence - a.confidence);

  const dominantEmotion = scores[0].label;
  const features = {
    pitch: rms > 0.05 ? 'High' : rms < 0.015 ? 'Low' : 'Normal',
    intensity: rms > 0.04 ? 'Loud' : 'Soft',
    tempo: zcr > 0.02 ? 'Fast' : 'Slow',
    spectralCentroid: centroid > 2000 ? 'Bright' : centroid > 1000 ? 'Mid' : 'Dark'
  };

  const insights = `Heuristic analysis: rms=${rms.toFixed(4)}, zcr=${zcr.toFixed(4)}, centroid=${Math.round(centroid)}Hz`;

  return {
    dominantEmotion: dominantEmotion as any,
    scores: scores as any,
    features,
    insights
  };
};
