import { TabItem } from '@/lib/types';

let db: IDBDatabase | null = null;

const DB_NAME = 'SearchWiseDB';
const DB_VERSION = 1;
const TABS_STORE_NAME = 'tabs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening database.');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TABS_STORE_NAME)) {
        db.createObjectStore(TABS_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getTabs(): Promise<TabItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TABS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(TABS_STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject('Error fetching tabs.');
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveTabs(tabs: TabItem[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TABS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(TABS_STORE_NAME);
    
    // Clear existing tabs
    const clearRequest = store.clear();
    clearRequest.onerror = () => reject('Error clearing tabs.');
    clearRequest.onsuccess = () => {
      // Add new tabs
      if (tabs.length === 0) {
        resolve();
        return;
      }
      
      let count = 0;
      tabs.forEach(tab => {
        const addRequest = store.add(tab);
        addRequest.onsuccess = () => {
          count++;
          if (count === tabs.length) {
            resolve();
          }
        };
        addRequest.onerror = () => reject(`Error adding tab: ${tab.id}`);
      });
    };
  });
}
