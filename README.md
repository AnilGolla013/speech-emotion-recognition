🎤 Speech Emotion Recognition (SER-CNN)

This is a lightweight web application for recognizing emotions from speech.
The app takes an audio input (recorded or uploaded), converts it into a Mel spectrogram, and then predicts the emotion using a CNN-style inference flow.

The goal of this project is to show how speech emotion recognition works end-to-end, including audio processing, visualization, and emotion prediction.

💡 What this project does

You can record audio directly from the browser or upload an audio file.

The app generates a Mel-spectrogram image from the audio.

It runs an emotion prediction step:

Uses Google GenAI (Gemini) if an API key is provided.

Otherwise, it uses a local heuristic method based on audio features.

Displays:

Emotion scores (Happy, Sad, Angry, Neutral, Fear, Surprise, Disgust)

The dominant emotion

Basic audio feature insights

🚀 Getting started
Prerequisites

Node.js version 18 or higher

npm (or yarn / pnpm)

Install dependencies
npm install

Run the app in development mode
npm run dev

Build the app for production
npm run build

Preview the production build
npm run preview

🔑 Environment setup (Optional but recommended)

This app supports real emotion inference using Google Gemini.

Create a file named .env.local in the project root and add:

VITE_API_KEY=your_api_key_here

If API key is NOT provided

The app automatically switches to a local heuristic analyzer

It uses:

RMS energy

Zero Crossing Rate

Spectral Centroid

This helps generate dynamic emotion scores for testing, but it is not a trained CNN model

📂 Important project files

App.tsx
Main application logic (UI, recording, audio processing)

components/
UI components:

EmotionCard.tsx

Spectrogram.tsx

ProcessingPipeline.tsx

services/geminiService.ts
Handles emotion inference:

Uses @google/genai when API key is available

Falls back to local heuristic analysis if not

services/audioProcessing.ts
Audio processing utilities and spectrogram generation

📝 Usage notes

Allow microphone permission to test live recording.

For more realistic emotion predictions, use a valid Gemini API key.

The local heuristic mode is meant only for development and demo purposes.

🤝 Contributing

Fork the repository

Create a new branch for your changes

Commit your code clearly

Open a pull request with proper description

📄 License

This project is created for educational and learning purposes.

▶ Run and deploy in AI Studio

You can also view and run this app directly in Google AI Studio:

🔗 https://ai.studio/apps/drive/1UdsELrrWzE16brt6OUz6TWaHWoyHe76D

Run locally (Quick steps)

Install dependencies

npm install


Add your Gemini API key in .env.local

Start the app

npm run dev


If you want, I can also:

Rewrite this as a GitHub README for placements

Simplify it further for college project submission

Add CNN explanation section for viva / exams

dont mention the google ai studio just tell that use openApi key to run this project 

Perfect 👍
Here’s the clean, human-written version, updated exactly as you asked — no Google AI Studio mention, only OpenAI API key. Simple, clear, and project-submission friendly.

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

📄 License

This project is developed for educational purposes only.