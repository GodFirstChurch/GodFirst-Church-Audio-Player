import { Sermon } from '../types';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

// --- Local Storage Fallback (for when Firebase is not set up) ---
const STORAGE_KEY = 'godfirst_sermons_db_v1';

const SEED_DATA: Sermon[] = [
  {
    id: '1',
    title: 'The Foundation of Faith',
    preacher: 'Rev. David Jenkins',
    series: 'Unshakeable',
    date: '2023-10-22',
    scripture: 'Hebrews 11:1-3',
    description: 'Exploring what it means to have faith that stands firm in the face of uncertainty.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '34:12',
    tags: ['Faith', 'Trust', 'Foundation']
  },
  {
    id: '2',
    title: 'Walking in Love',
    preacher: 'Sarah Williams',
    series: 'Community Life',
    date: '2023-10-29',
    scripture: '1 Corinthians 13',
    description: 'Love is not just a feeling, it is an action we practice daily within the church family.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '28:45',
    tags: ['Love', 'Community', 'Action']
  }
];

// Helper to get local data safely
const getLocalSermons = (): Sermon[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Data corrupted");
    return parsed;
  } catch (e) {
    console.warn("Local storage corrupted, resetting to seed data", e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
};

// --- Public API ---

/**
 * Subscribes to the sermon list.
 * @param callback Function called whenever the list updates.
 * @returns Unsubscribe function.
 */
export const subscribeToSermons = (callback: (sermons: Sermon[]) => void): () => void => {
  if (db) {
    // Firebase Real-time Listener
    const q = query(collection(db, 'sermons'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sermons: Sermon[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Sermon));
      callback(sermons);
    }, (error) => {
      console.error("Firebase sync error:", error);
      // Fallback to local on error?
      callback(getLocalSermons());
    });
    return unsubscribe;
  } else {
    // Local Storage Mock Listener
    // We invoke immediately
    callback(getLocalSermons());
    
    // And listen for other tabs changing storage
    const handler = () => {
      callback(getLocalSermons());
    };
    window.addEventListener('storage', handler);
    // Custom event for same-tab updates
    window.addEventListener('local-sermon-update', handler);
    
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('local-sermon-update', handler);
    };
  }
};

/**
 * Saves or Updates a sermon.
 */
export const saveSermon = async (sermon: Sermon): Promise<void> => {
  if (db) {
    try {
      // Determine if this is a new item (Local numeric ID) or existing item (Firebase string ID)
      // Firebase IDs are alphanumeric strings. Local IDs are generated via Date.now() (numbers).
      const isNumericId = /^\d+$/.test(sermon.id);
      
      if (isNumericId) {
        // New Item -> Add to collection, letting Firebase generate a new ID
        const { id, ...data } = sermon; // strip the temporary local ID
        await addDoc(collection(db, 'sermons'), data);
      } else {
        // Existing Item -> Update specific document
        const { id, ...data } = sermon;
        const sermonRef = doc(db, 'sermons', id);
        await updateDoc(sermonRef, data);
      }
    } catch (e) {
      console.error("Error saving to Firebase", e);
      throw e;
    }
  } else {
    // Local Storage
    const sermons = getLocalSermons();
    const index = sermons.findIndex(s => s.id === sermon.id);
    
    if (index >= 0) {
      sermons[index] = sermon;
    } else {
      sermons.unshift(sermon);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sermons));
    window.dispatchEvent(new Event('local-sermon-update'));
  }
};

/**
 * Deletes a sermon.
 */
export const deleteSermon = async (id: string): Promise<void> => {
  if (db) {
    await deleteDoc(doc(db, 'sermons', id));
  } else {
    const sermons = getLocalSermons();
    // Filter out the sermon with the matching ID
    const filtered = sermons.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('local-sermon-update'));
  }
};

/**
 * Bulk import (Admin feature)
 */
export const importSermons = async (jsonData: string): Promise<boolean> => {
  try {
    const parsed = JSON.parse(jsonData);
    if (!Array.isArray(parsed)) return false;

    if (db) {
      // For firebase, we batch add
      // Caution: This could cause many writes. Limit to 50 for demo.
      const batchLimit = parsed.slice(0, 50);
      for (const s of batchLimit) {
        const { id, ...data } = s; // New IDs will be generated
        await addDoc(collection(db, 'sermons'), data);
      }
      return true;
    } else {
      localStorage.setItem(STORAGE_KEY, jsonData);
      window.dispatchEvent(new Event('local-sermon-update'));
      return true;
    }
  } catch (e) {
    console.error("Failed to import data", e);
    return false;
  }
};