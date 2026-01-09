import { openDB } from 'idb';

const DB_NAME = 'florida-db';
const DB_VERSION = 1;

const STORES = {
  DOCUMENTS: 'documents',
  READING_STATES: 'readingStates',
  SETTINGS: 'settings',
};

// Initialize IndexedDB
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Documents store
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const documentStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
        documentStore.createIndex('createdAt', 'createdAt');
      }

      // Reading states store
      if (!db.objectStoreNames.contains(STORES.READING_STATES)) {
        const stateStore = db.createObjectStore(STORES.READING_STATES, { keyPath: 'documentId' });
        stateStore.createIndex('lastUpdated', 'lastUpdated');
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    },
  });
}

// Document operations
export async function saveDocument(document) {
  const db = await initDB();
  return db.put(STORES.DOCUMENTS, document);
}

export async function getDocument(id) {
  const db = await initDB();
  return db.get(STORES.DOCUMENTS, id);
}

export async function toggleFavorite(id) {
  const db = await initDB();
  const doc = await db.get(STORES.DOCUMENTS, id);
  if (doc) {
    doc.isFavorite = !doc.isFavorite;
    await db.put(STORES.DOCUMENTS, doc);
    return doc;
  }
}

export async function getAllDocuments() {
  const db = await initDB();
  return db.getAll(STORES.DOCUMENTS);
}

export async function deleteDocument(id) {
  const db = await initDB();
  const tx = db.transaction([STORES.DOCUMENTS, STORES.READING_STATES], 'readwrite');
  await Promise.all([
    tx.objectStore(STORES.DOCUMENTS).delete(id),
    tx.objectStore(STORES.READING_STATES).delete(id),
    tx.done,
  ]);
}

// Reading state operations
export async function saveReadingState(state) {
  const db = await initDB();
  return db.put(STORES.READING_STATES, {
    ...state,
    lastUpdated: Date.now(),
  });
}

export async function getReadingState(documentId) {
  const db = await initDB();
  return db.get(STORES.READING_STATES, documentId);
}

// Settings operations
export async function saveSettings(settings) {
  const db = await initDB();
  return db.put(STORES.SETTINGS, { id: 'user-settings', ...settings });
}

export async function getSettings() {
  const db = await initDB();
  const settings = await db.get(STORES.SETTINGS, 'user-settings');
  return settings || getDefaultSettings();
}

// Default settings
export function getDefaultSettings() {
  return {
    reading: {
      wpm: 300,
      chunkSize: 1,
      autoPause: true,
      punctuationMultiplier: 1.5,
    },
    appearance: {
      name: 'Dark',
      bgColor: '#0f172a',
      textColor: '#f1f5f9',
      focusColor: '#22d3ee',
      dimStrength: 0.95,
      btnBg: 'rgba(0, 0, 0, 0.5)',
      btnBorder: 'rgba(255, 255, 255, 0.1)',
      btnText: '#f1f5f9',
      type: 'dark',
      isCustom: false
    },
    font: {
      family: "'Courier Prime', monospace",
      size: 48,
      weight: 600,
      lineHeight: 1.2,
    },
    audio: {
      enabled: true,
      volume: 0.5,
      soundType: 'beep',
    },
    user: {
      name: '',
    },
    demoLoaded: false,
  };
}
