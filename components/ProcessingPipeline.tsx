
import React from 'react';
import { ProcessingPhase } from '../types';

interface ProcessingPipelineProps {
  currentPhase: ProcessingPhase;
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ currentPhase }) => {
  const phases = [
    ProcessingPhase.ACQUISITION,
    ProcessingPhase.PREPROCESSING,
    ProcessingPhase.SPECTROGRAM,
    ProcessingPhase.INFERENCE
  ];

  const getPhaseIndex = (phase: ProcessingPhase) => phases.indexOf(phase);
  const currentIndex = getPhaseIndex(currentPhase);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-purple-500 -translate-y-1/2 z-0 transition-all duration-1000"
          style={{ width: `${Math.max(0, (currentIndex / (phases.length - 1)) * 100)}%` }}
        ></div>

        {phases.map((phase, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={phase} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                isCurrent ? 'bg-purple-500 ring-4 ring-purple-500/20 scale-125' : 
                isActive ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
              }`}>
                {isActive && idx < currentIndex ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{idx + 1}</span>
                )}
              </div>
              <span className={`absolute top-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-tighter ${
                isActive ? 'text-purple-400' : 'text-slate-600'
              }`}>
                {phase}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingPipeline;
