import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Player from './components/Player';
import PublicFeed from './pages/PublicFeed';
import AdminDashboard from './pages/AdminDashboard';
import { subscribeToSermons } from './services/storage';
import { Sermon } from './types';
import { isBackendConfigured } from './services/firebase';

const App: React.FC = () => {
  // Global Player State
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time subscription
    const unsubscribe = subscribeToSermons((data) => {
      setSermons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        
        {!isBackendConfigured() && (
          <div className="bg-amber-100 text-amber-800 text-xs text-center py-1 font-medium border-b border-amber-200">
            Running in Local Demo Mode. Configure Firebase for shared data.
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
             </div>
          ) : (
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
                  <AdminDashboard />
                } 
              />
            </Routes>
          )}
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