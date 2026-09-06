import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

let currentSound = null;

/** Plays a base64-encoded WAV string (as returned by Bhashini TTS). */
export async function playBase64Audio(base64Audio) {
  // Stop anything already playing so multiple read-aloud taps don't overlap.
  if (currentSound) {
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }

  const fileUri = `${FileSystem.cacheDirectory}rhaq_tts_${Date.now()}.wav`;
  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: true });
  currentSound = sound;

  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.didJustFinish) {
      sound.unloadAsync().catch(() => {});
      if (currentSound === sound) currentSound = null;
    }
  });
}

export async function stopAudio() {
  if (currentSound) {
    await currentSound.stopAsync().catch(() => {});
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
