
import React from 'react';
import { EmotionType } from './types';

export const EMOTIONS: EmotionType[] = ['Happy', 'Sad', 'Angry', 'Neutral', 'Fear', 'Surprise', 'Disgust'];

export const EMOTION_METADATA: Record<EmotionType, { color: string; icon: string; bg: string }> = {
  Happy: { color: 'text-yellow-400', icon: '😊', bg: 'bg-yellow-400/10' },
  Sad: { color: 'text-blue-400', icon: '😢', bg: 'bg-blue-400/10' },
  Angry: { color: 'text-red-500', icon: '😠', bg: 'bg-red-500/10' },
  Neutral: { color: 'text-slate-400', icon: '😐', bg: 'bg-slate-400/10' },
  Fear: { color: 'text-purple-400', icon: '😨', bg: 'bg-purple-400/10' },
  Surprise: { color: 'text-pink-400', icon: '😲', bg: 'bg-pink-400/10' },
  Disgust: { color: 'text-emerald-400', icon: '🤢', bg: 'bg-emerald-400/10' },
};
