import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Player from './components/Player';
import PublicFeed from './pages/PublicFeed';
import AdminDashboard from './pages/AdminDashboard';
import { getSermons } from './services/storage';
import { Sermon } from './types';

const App: React.FC = () => {
  // Global Player State
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initial Load
    setSermons(getSermons());
  }, []);

  const handleDataChange = () => {
    // Refresh list when admin updates data
    setSermons(getSermons());
  };

  const handlePlaySermon = (sermon: Sermon) => {
    if (currentSermon?.id === sermon.id) {
      // Toggle
      setIsPlaying(!isPlaying);
    } else {
      // New Track
      setCurrentSermon(sermon);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = (time: number, duration: number) => {
    // Can be used for analytics or syncing UI
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                <PublicFeed 
                  sermons={sermons} 
                  currentSermonId={currentSermon?.id}
                  isPlaying={isPlaying}
                  onPlay={handlePlaySermon}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminDashboard onDataChange={handleDataChange} />
              } 
            />
          </Routes>
        </main>

        <Player 
          currentSermon={currentSermon}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </HashRouter>
  );
};

export default App;