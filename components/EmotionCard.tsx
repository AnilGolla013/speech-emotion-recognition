
import React from 'react';
import { EmotionScore } from '../types';
import { EMOTION_METADATA } from '../constants';

const EmotionCard: React.FC<{ score: EmotionScore; isDominant: boolean }> = ({ score, isDominant }) => {
  const meta = EMOTION_METADATA[score.label];
  const percentage = Math.round(score.confidence * 100);

  return (
    <div className={`p-4 rounded-xl transition-all duration-300 ${isDominant ? 'ring-2 ring-purple-500 scale-105' : 'bg-slate-800/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{meta.icon}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
          {score.label}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{percentage}%</div>
      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isDominant ? 'bg-purple-500' : 'bg-slate-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default EmotionCard;
