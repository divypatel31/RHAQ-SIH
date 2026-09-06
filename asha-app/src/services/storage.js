import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "rhaq_token";
const USER_KEY = "rhaq_user";
const DEVICE_ID_KEY = "rhaq_device_id";

// Persisting the session lets a worker who logged in once keep using the
// app offline indefinitely — they only need connectivity for the very
// first login, not every time they open the app.
export async function saveSession(token, user) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadSession() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  return { token, user: JSON.parse(userRaw) };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

// A stable per-device ID so the backend's offline_sync_log can tell which
// device queued/synced a given action — useful for debugging sync issues.
export async function getDeviceId() {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
