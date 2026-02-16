
export type EmotionType = 'Happy' | 'Sad' | 'Angry' | 'Neutral' | 'Fear' | 'Surprise' | 'Disgust';

export interface EmotionScore {
  label: EmotionType;
  confidence: number;
}

export interface AudioFeatures {
  pitch?: string;
  intensity?: string;
  tempo?: string;
  spectralCentroid?: string;
}

export interface AnalysisResult {
  dominantEmotion: EmotionType;
  scores: EmotionScore[];
  transcription?: string;
  insights?: string;
  features?: AudioFeatures;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  ANALYZE = 'analyze',
  RECORDS = 'records',
  ABOUT = 'about'
}

export enum ProcessingPhase {
  IDLE = 'idle',
  ACQUISITION = 'Signal Acquisition',
  PREPROCESSING = 'Preprocessing & Normalization',
  SPECTROGRAM = 'Mel-Spectrogram Generation',
  INFERENCE = 'CNN Model Inference',
  COMPLETE = 'Analysis Complete'
}
