export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  series: string;
  date: string;
  scripture: string;
  description: string;
  audioUrl: string;
  duration?: string;
  tags: string[];
}

export interface PlayerState {
  currentSermon: Sermon | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  currentTime: number;
  duration: number;
}

export enum AdminView {
  LOGIN = 'LOGIN',
  LIST = 'LIST',
  EDIT = 'EDIT',
  CREATE = 'CREATE'
}