import { useState, useEffect } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface POSDatabase extends DBSchema {
  orders: {
    key: string;
    value: any;
  };
  products: {
    key: string;
    value: any;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'order' | 'product' | 'user';
      data: any;
      timestamp: number;
    };
  };
}

export const useOfflineStorage = () => {
  const [db, setDb] = useState<IDBPDatabase<POSDatabase> | null>(null);

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB<POSDatabase>('pos-db', 1, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('orders')) {
            db.createObjectStore('orders', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('products')) {
            db.createObjectStore('products', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
          }
        },
      });
      setDb(database);
    };

    initDB();
  }, []);

  const saveToOffline = async (store: keyof POSDatabase, data: any) => {
    if (!db) return;
    await db.put(store, data);
  };

  const getFromOffline = async (store: keyof POSDatabase, key: string) => {
    if (!db) return null;
    return await db.get(store, key);
  };

  const getAllFromOffline = async (store: keyof POSDatabase) => {
    if (!db) return [];
    return await db.getAll(store);
  };

  const addToSyncQueue = async (type: 'order' | 'product' | 'user', data: any) => {
    if (!db) return;
    const queueItem = {
      id: `${type}-${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
    };
    await db.put('syncQueue', queueItem);
  };

  const getSyncQueue = async () => {
    if (!db) return [];
    return await db.getAll('syncQueue');
  };

  const clearSyncQueue = async () => {
    if (!db) return;
    await db.clear('syncQueue');
  };

  return {
    db,
    saveToOffline,
    getFromOffline,
    getAllFromOffline,
    addToSyncQueue,
    getSyncQueue,
    clearSyncQueue,
  };
};