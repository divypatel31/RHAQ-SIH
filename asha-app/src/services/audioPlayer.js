// asha-app/src/services/audioPlayer.js
import * as Speech from "expo-speech";

let isSpeaking = false;

/** 
 * Safe replacement for audioPlayer that completely removes expo-av 
 * to prevent native module crashes in Expo Go. Uses expo-speech instead.
 */
export async function playBase64Audio(base64Audio, textToSpeak = "Audio playback simulation.") {
  try {
    await Speech.stop();
    
    // If text was passed alongside, speak it natively
    if (textToSpeak) {
      Speech.speak(textToSpeak, {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
      });
    } else {
      console.log("Bhashini base64 audio received, but expo-av is disabled in Expo Go.");
    }
  } catch (err) {
    console.log("Audio playback error:", err);
  }
}

export async function stopAudio() {
  try {
    await Speech.stop();
  } catch (err) {
    // Ignore errors on stop
  }
}
