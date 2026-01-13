import { Sermon } from '../types';

const STORAGE_KEY = 'godfirst_sermons_db_v1';

// Seed data to show initially
const SEED_DATA: Sermon[] = [
  {
    id: '1',
    title: 'The Foundation of Faith',
    preacher: 'Rev. David Jenkins',
    series: 'Unshakeable',
    date: '2023-10-22',
    scripture: 'Hebrews 11:1-3',
    description: 'Exploring what it means to have faith that stands firm in the face of uncertainty.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Public domain sample
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Public domain sample
    duration: '28:45',
    tags: ['Love', 'Community', 'Action']
  }
];

export const getSermons = (): Sermon[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const saveSermon = (sermon: Sermon): void => {
  const sermons = getSermons();
  const index = sermons.findIndex(s => s.id === sermon.id);
  
  if (index >= 0) {
    sermons[index] = sermon;
  } else {
    sermons.unshift(sermon); // Add to top
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sermons));
};

export const deleteSermon = (id: string): void => {
  const sermons = getSermons();
  const filtered = sermons.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const importSermons = (jsonData: string): boolean => {
  try {
    const parsed = JSON.parse(jsonData);
    if (Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, jsonData);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Failed to import data", e);
    return false;
  }
};