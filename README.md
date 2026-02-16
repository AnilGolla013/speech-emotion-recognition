🎤 Speech Emotion Recognition (SER-CNN)

This is a web-based Speech Emotion Recognition system that detects emotions from audio input.
The application allows users to record or upload speech, converts the audio into a Mel-spectrogram, and predicts the emotion using a CNN-style inference flow.

This project mainly focuses on audio processing, visualization, and emotion classification in a simple and understandable way.

💡 Project features

Record audio using the browser microphone or upload an audio file

Convert speech into a Mel-spectrogram

Perform emotion prediction using:

OpenAI API (when API key is provided)

Local heuristic analysis (when API key is not available)

Displays:

Emotion scores (Happy, Sad, Angry, Neutral, Fear, Surprise, Disgust)

Final predicted emotion

Basic audio feature insights

🚀 Getting started
Prerequisites

Node.js 18 or higher

npm (or yarn / pnpm)

Install dependencies
npm install

Run the application
npm run dev

Build for production
npm run build

Preview the production build
npm run preview

🔑 Environment setup (OpenAI API)

To enable real emotion inference, create a file named .env.local in the project root and add your OpenAI API key:

VITE_API_KEY=your_openai_api_key_here

Without API key

The app uses a local heuristic emotion analyzer

It calculates:

RMS energy

Zero-Crossing Rate

Spectral Centroid

Emotion scores are generated dynamically from audio features

This mode is only for testing and demonstration, not a trained CNN model

📂 Important files

App.tsx
Handles UI, audio recording, processing, and prediction flow

components/
UI components:

EmotionCard.tsx

Spectrogram.tsx

ProcessingPipeline.tsx

services/inferenceService.ts
Handles emotion prediction using OpenAI API or local fallback logic

services/audioProcessing.ts
Audio processing utilities and Mel-spectrogram generation

📝 Usage notes

Allow microphone access to test live recording

Provide a valid OpenAI API key for realistic emotion predictions

Local heuristic mode is intended only for development and demos

🤝 Contributing

Fork the repository

Create a new branch

Commit your changes

Open a pull request