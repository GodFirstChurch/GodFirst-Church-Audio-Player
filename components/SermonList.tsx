import React from 'react';
import { Sermon } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface SermonListProps {
  sermons: Sermon[];
  currentSermonId?: string;
  isPlaying: boolean;
  onPlay: (sermon: Sermon) => void;
}

const SermonList: React.FC<SermonListProps> = ({ sermons, currentSermonId, isPlaying, onPlay }) => {
  if (sermons.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
           </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 brand-font">No sermons found</h3>
        <p className="text-slate-500 mt-1">Check back later for new uploads.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-32">
      {sermons.map((sermon) => {
        const isCurrent = currentSermonId === sermon.id;
        const active = isCurrent && isPlaying;

        return (
          <div 
            key={sermon.id} 
            className={`group relative bg-white rounded-xl p-4 border transition-all duration-200 ${
              isCurrent ? 'border-sky-300 shadow-md ring-1 ring-sky-200' : 'border-slate-100 shadow-sm hover:border-sky-200'
            }`}
          >
            <div className="flex gap-4">
              {/* Play Button */}
              <button
                onClick={() => onPlay(sermon)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  active 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-600'
                }`}
              >
                {active ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                   <div>
                      <h3 className={`font-semibold text-lg leading-tight mb-1 brand-font uppercase ${isCurrent ? 'text-sky-600' : 'text-slate-800'}`}>
                        {sermon.title}
                      </h3>
                      <p className="text-sm text-sky-500 font-medium">{sermon.preacher}</p>
                   </div>
                   <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{sermon.date}</span>
                </div>
                
                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wide">{sermon.series}</p>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{sermon.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {sermon.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-100">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SermonList;