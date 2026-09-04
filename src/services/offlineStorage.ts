/**
 * Offline Mode and Local Telemetry Cache Layer
 * Allows remote boarding parties and offshore vessels to work seamlessly
 */

const STORAGE_KEYS = {
  INCIDENT_CACHE: 'slicktrack_cached_incidents',
  CHECKLIST_CACHE: 'slicktrack_cached_checklist',
  OFFLINE_QUEUE: 'slicktrack_offline_mutation_queue',
  LAST_SYNC: 'slicktrack_last_sync_time'
};

export interface SyncMutation {
  id: string;
  type: 'CHECKLIST_UPDATE' | 'BOARDING_ORDER' | 'DISCREPANCY_FLAG' | 'REPORT_GENERATION';
  timestamp: string;
  payload: Record<string, unknown>;
  synced: boolean;
}

export function saveCachedIncidentData(incidentId: string, data: unknown): void {
  try {
    const existing = getCachedIncidentData();
    existing[incidentId] = {
      timestamp: new Date().toISOString(),
      data
    };
    localStorage.setItem(STORAGE_KEYS.INCIDENT_CACHE, JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to save to local cache', err);
  }
}

export function getCachedIncidentData(): Record<string, { timestamp: string; data: unknown }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENT_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function enqueueOfflineMutation(mutation: Omit<SyncMutation, 'id' | 'timestamp' | 'synced'>): SyncMutation {
  const item: SyncMutation = {
    ...mutation,
    id: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    synced: false
  };

  try {
    const queue = getOfflineQueue();
    queue.push(item);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to enqueue offline mutation', err);
  }

  return item;
}

export function getOfflineQueue(): SyncMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearSyncedQueue(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to clear queue', err);
  }
}

export function getLastSyncTime(): string {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '2024-10-24T05:00:00Z';
}
