
import React, { useRef, useEffect } from 'react';

interface SpectrogramProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const Spectrogram: React.FC<SpectrogramProps> = ({ analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Create an off-screen canvas to hold the history
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      if (tempCtx && ctx) {
        // Copy existing image to temp and shift it
        tempCtx.drawImage(canvas, -1, 0);
        
        // Draw new column
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const percent = i / bufferLength;
          const y = canvas.height - (percent * canvas.height);
          
          // Color based on intensity (simplified spectrogram colors)
          const r = value > 128 ? (value - 128) * 2 : 0;
          const g = value < 128 ? value * 2 : 255 - (value - 128) * 2;
          const b = 255 - value;
          
          tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          tempCtx.fillRect(canvas.width - 1, y, 1, canvas.height / bufferLength);
        }
        
        ctx.drawImage(tempCanvas, 0, 0);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isActive]);

  return (
    <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden border border-slate-700">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={200} 
        className="w-full h-full"
      />
      <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white/50 tracking-widest">
        Spectrogram View
      </div>
    </div>
  );
};

export default Spectrogram;
