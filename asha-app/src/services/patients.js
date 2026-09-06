import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import api from "./api";

const RECENT_PATIENTS_KEY = "rhaq_recent_patients";
const MAX_RECENT = 50;

/**
 * Search patients by name/phone. Online, this hits the real backend.
 * Offline, it falls back to a locally cached list of patients this
 * worker has previously searched or registered — not a full patient
 * directory, but enough to re-select someone they've already seen
 * without needing connectivity.
 */
export async function searchPatients(query) {
  const net = await NetInfo.fetch();
  if (net.isConnected) {
    try {
      const res = await api.get("/patients/search", { params: { query } });
      // Cache every result seen online so it's searchable offline later.
      await cacheRecentPatients(res.data.patients);
      return { patients: res.data.patients, offline: false };
    } catch {
      return { patients: await searchCachedPatients(query), offline: true };
    }
  }
  return { patients: await searchCachedPatients(query), offline: true };
}

async function getRecentPatients() {
  const raw = await AsyncStorage.getItem(RECENT_PATIENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function cacheRecentPatients(patients) {
  if (!patients || patients.length === 0) return;
  const existing = await getRecentPatients();
  const byId = new Map(existing.map((p) => [p.user_id, p]));
  for (const p of patients) byId.set(p.user_id, p);
  const merged = Array.from(byId.values()).slice(-MAX_RECENT);
  await AsyncStorage.setItem(RECENT_PATIENTS_KEY, JSON.stringify(merged));
}

/** Also called right after a patient is freshly registered, so a worker
 * can immediately create a referral for them even before the next sync. */
export async function cacheOneLocalPatient({ local_id, name, phone, facility_id }) {
  await cacheRecentPatients([{ user_id: local_id, name, phone, facility_id, is_local_only: true }]);
}

async function searchCachedPatients(query) {
  const patients = await getRecentPatients();
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return patients.filter(
    (p) => p.name?.toLowerCase().includes(q) || p.phone?.includes(q)
  );
}
