import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import api from "./api";
import { getDeviceId } from "./storage";

const QUEUE_KEY = "rhaq_offline_queue";
const FACILITIES_CACHE_KEY = "rhaq_facilities_cache";

function genLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function readQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Queue an action (patient_registration | referral | high_risk_followup)
 * for later sync. Returns the locally-generated id immediately so the UI
 * can show the record right away with a "pending sync" badge, whether or
 * not the device currently has connectivity.
 */
export async function queueAction(entity_type, payload) {
  const queue = await readQueue();
  const local_id = genLocalId();
  queue.push({
    local_id,
    entity_type,
    payload,
    status: "pending", // pending | failed
    created_at: new Date().toISOString(),
  });
  await writeQueue(queue);

  // Best-effort immediate sync attempt; if it's offline this just fails
  // silently and the item stays queued for the next reconnect/manual sync.
  const net = await NetInfo.fetch();
  if (net.isConnected) {
    flushQueue().catch(() => {});
  }

  return local_id;
}

export async function getQueuedActions() {
  return readQueue();
}

export async function getPendingCount() {
  const queue = await readQueue();
  return queue.filter((a) => a.status !== "synced").length;
}

/**
 * Push every pending queued action to the server in one batch call.
 * Safe to call repeatedly — a no-op if the queue is empty. Items the
 * server successfully applies are removed from the local queue; failed
 * items stay queued and are retried on the next sync.
 */
export async function flushQueue() {
  const queue = await readQueue();
  const pending = queue.filter((a) => a.status !== "synced");
  if (pending.length === 0) return { synced: 0, failed: 0 };

  const device_id = await getDeviceId();
  const items = pending.map((a) => ({
    local_id: a.local_id,
    entity_type: a.entity_type,
    payload: a.payload,
  }));

  let results = [];
  try {
    const res = await api.post("/sync/batch", { device_id, items });
    results = res.data.results || [];
  } catch (err) {
    // Network/server failure — leave everything queued, try again later.
    return { synced: 0, failed: 0, error: true };
  }

  const syncedIds = new Set(results.filter((r) => r.status === "synced").map((r) => r.local_id));
  const remaining = queue.filter((a) => !syncedIds.has(a.local_id));
  await writeQueue(remaining);

  return { synced: syncedIds.size, failed: results.length - syncedIds.size };
}

/** Call once at app startup so a reconnect automatically drains the queue. */
export function registerAutoSync() {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      flushQueue().catch(() => {});
    }
  });
}

// --- Facility cache, so the referral/registration forms have something to
// show even when the device is offline and can't hit GET /facilities. ---
export async function cacheFacilities(facilities) {
  await AsyncStorage.setItem(FACILITIES_CACHE_KEY, JSON.stringify(facilities));
}

export async function getCachedFacilities() {
  const raw = await AsyncStorage.getItem(FACILITIES_CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}
