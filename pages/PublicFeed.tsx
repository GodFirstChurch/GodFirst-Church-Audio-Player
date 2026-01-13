import React, { useMemo, useState } from 'react';
import SermonList from '../components/SermonList';
import { Sermon } from '../types';

interface PublicFeedProps {
  sermons: Sermon[];
  currentSermonId?: string;
  isPlaying: boolean;
  onPlay: (sermon: Sermon) => void;
}

const PublicFeed: React.FC<PublicFeedProps> = ({ sermons, currentSermonId, isPlaying, onPlay }) => {
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('All');

  // Derive unique series
  const allSeries = useMemo(() => {
    const series = new Set(sermons.map(s => s.series));
    return ['All', ...Array.from(series)];
  }, [sermons]);

  // Filter logic
  const filteredSermons = useMemo(() => {
    return sermons.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                            s.preacher.toLowerCase().includes(search.toLowerCase());
      const matchesSeries = selectedSeries === 'All' || s.series === selectedSeries;
      return matchesSearch && matchesSeries;
    });
  }, [sermons, search, selectedSeries]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 brand-font uppercase">Latest Sermons</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search title or preacher..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select 
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {allSeries.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Series' : s}</option>
            ))}
          </select>
        </div>
      </div>

      <SermonList 
        sermons={filteredSermons} 
        currentSermonId={currentSermonId}
        isPlaying={isPlaying}
        onPlay={onPlay}
      />
    </div>
  );
};

export default PublicFeed;