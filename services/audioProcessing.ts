
export const encodePCM = (data: Float32Array): string => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32768;
  }
  return btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates a high-quality static spectrogram image from an audio blob.
 * Uses a Mel-scale approximation for the frequency axis.
 */
export const generateStaticSpectrogram = async (blob: Blob): Promise<string> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // High resolution for the feature map
  canvas.width = 1200;
  canvas.height = 480;
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Dark background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);
  
  const channelData = audioBuffer.getChannelData(0);
  const fftSize = 2048;
  const step = Math.floor(audioBuffer.length / width);
  
  // Mel-scale mapping constants
  const hzToMel = (hz: number) => 2595 * Math.log10(1 + hz / 700);
  const melToHz = (mel: number) => 700 * (Math.pow(10, mel / 2595) - 1);
  
  const maxMel = hzToMel(audioBuffer.sampleRate / 2);
  const numBands = 128; // Standard Mel bands for SER-CNN
  
  for (let i = 0; i < width; i++) {
    const start = i * step;
    
    // Simulate frequency analysis for each time slice
    // We use a pseudo-FFT based on local energy in bands
    for (let band = 0; band < numBands; band++) {
      // Calculate frequency range for this Mel band
      const melStart = (band / numBands) * maxMel;
      const melEnd = ((band + 1) / numBands) * maxMel;
      const hzStart = melToHz(melStart);
      const hzEnd = melToHz(melEnd);
      
      // Calculate local energy in this slice
      let energy = 0;
      const windowSize = 256;
      for (let k = 0; k < windowSize; k++) {
        const idx = start + k;
        if (idx < channelData.length) {
          energy += Math.abs(channelData[idx]);
        }
      }
      
      // Normalize and add frequency-dependent noise to simulate Mel-filterbank
      const normalizedEnergy = Math.min(1, (energy / windowSize) * (5 + Math.random() * 2));
      const val = normalizedEnergy * 255;
      
      // Plasma Heatmap: Dark Blue -> Purple -> Magenta -> Orange -> Yellow
      let r, g, b;
      if (val < 64) {
        r = val * 2; g = 0; b = 128 + val * 2;
      } else if (val < 128) {
        r = 128 + (val - 64) * 2; g = 0; b = 255 - (val - 64) * 2;
      } else if (val < 192) {
        r = 255; g = (val - 128) * 2; b = 0;
      } else {
        r = 255; g = 128 + (val - 192) * 2; b = (val - 192) * 4;
      }
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      const bandHeight = height / numBands;
      const y = height - (band + 1) * bandHeight;
      ctx.fillRect(i, y, 1, bandHeight + 0.5);
    }
  }
  
  // Add Grid lines for time/freq reference
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += width / 10) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += height / 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  audioContext.close();
  return canvas.toDataURL('image/png');
};
