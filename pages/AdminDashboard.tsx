import React, { useState, useRef, useEffect } from 'react';
import { Sermon, AdminView } from '../types';
import { subscribeToSermons, saveSermon, deleteSermon, importSermons } from '../services/storage';
import { ChevronLeft } from '../components/Icons';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<AdminView>(AdminView.LOGIN);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'godfirst') {
      setView(AdminView.LIST);
      setError('');
    } else {
      setError('Incorrect password. (Hint: godfirst)');
    }
  };

  if (view === AdminView.LOGIN) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-amber-400 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 brand-font uppercase">Admin Access</h2>
          <p className="text-slate-500 mb-6">Enter password to manage sermons.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition uppercase tracking-wide">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminManager setView={setView} view={view} />;
};

const AdminManager: React.FC<{ setView: (v: AdminView) => void, view: AdminView }> = ({ setView, view }) => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Subscribe to changes (Real-time updates)
    const unsubscribe = subscribeToSermons(setSermons);
    return () => unsubscribe();
  }, []);

  const handleEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setView(AdminView.EDIT);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      setIsDeleting(true);
      try {
        await deleteSermon(id);
      } catch (e) {
        alert("Failed to delete sermon");
      } finally {
        setIsDeleting(false);
        setDeleteConfirmId(null);
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId(prev => prev === id ? null : prev);
      }, 3000);
    }
  };

  const handleSave = async (sermon: Sermon) => {
    try {
      await saveSermon(sermon);
      setView(AdminView.LIST);
    } catch (e) {
      alert("Failed to save sermon. Check console.");
    }
  };

  // Export Data
  const handleExport = () => {
    const data = JSON.stringify(sermons, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `godfirst-sermons-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Data
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importSermons(content);
        if (success) {
          alert("Data restored successfully!");
        } else {
          alert("Failed to restore data. Invalid file format.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (view === AdminView.LIST) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 brand-font uppercase">Manage Sermons</h2>
          
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden" 
            />
            
            <button 
              onClick={handleExport}
              className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 font-medium text-xs uppercase tracking-wide border border-slate-200"
              title="Download backup"
            >
              ⬇ Backup
            </button>
            <button 
              onClick={handleImportClick}
              className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 font-medium text-xs uppercase tracking-wide border border-slate-200"
              title="Restore from backup"
            >
              ⬆ Restore
            </button>
            <button 
              onClick={() => { setEditingSermon(null); setView(AdminView.CREATE); }}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 font-medium uppercase text-sm tracking-wide shadow-sm"
            >
              + Add New
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 hidden sm:table-cell">Preacher</th>
                <th className="px-6 py-4 hidden sm:table-cell">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sermons.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{s.title}</div>
                    <div className="sm:hidden text-xs text-slate-500 mt-1">{s.preacher} • {s.date}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{s.preacher}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">{s.date}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(s)} className="text-sky-600 hover:text-sky-800 font-medium text-sm uppercase">Edit</button>
                    <button 
                      disabled={isDeleting}
                      onClick={() => handleDelete(s.id)} 
                      className={`font-medium text-sm uppercase transition-all duration-200 ${
                        deleteConfirmId === s.id 
                          ? 'bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 shadow-sm' 
                          : 'text-red-600 hover:text-red-800'
                      } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {deleteConfirmId === s.id ? (isDeleting ? '...' : 'Sure?') : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {sermons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No sermons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <SermonForm 
      initialData={editingSermon} 
      onSave={handleSave} 
      onCancel={() => setView(AdminView.LIST)} 
    />
  );
};

const SermonForm: React.FC<{ initialData: Sermon | null, onSave: (s: Sermon) => Promise<void>, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Sermon>>(initialData || {
    title: '',
    preacher: 'Rev. David Jenkins',
    series: '',
    date: new Date().toISOString().split('T')[0],
    scripture: '',
    description: '',
    audioUrl: '',
    tags: []
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.audioUrl) {
      alert("Title and Audio URL are required");
      return;
    }
    
    setIsSaving(true);
    await onSave({
      id: initialData?.id || Date.now().toString(), // Date.now() is just a placeholder for LocalStorage fallback, Firebase ignores it for new docs
      title: formData.title!,
      preacher: formData.preacher || '',
      series: formData.series || 'Sunday Service',
      date: formData.date || '',
      scripture: formData.scripture || '',
      description: formData.description || '',
      audioUrl: formData.audioUrl!,
      tags: formData.tags || [],
      duration: 'Unknown'
    });
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={onCancel} className="flex items-center text-slate-500 hover:text-slate-800 mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-slate-900 brand-font uppercase">{initialData ? 'Edit Sermon' : 'Add New Sermon'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                required
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date"
                required
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preacher</label>
              <input 
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                value={formData.preacher} 
                onChange={e => setFormData({...formData, preacher: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Series</label>
              <input 
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                value={formData.series} 
                onChange={e => setFormData({...formData, series: e.target.value})} 
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Scripture Reference</label>
             <input 
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g. John 3:16"
                value={formData.scripture} 
                onChange={e => setFormData({...formData, scripture: e.target.value})} 
              />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
             <textarea 
                rows={3}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
          </div>

          {/* New Audio Process Section */}
          <div className="border-t border-slate-100 pt-8 space-y-8">
            <h3 className="text-lg font-bold text-slate-900 brand-font uppercase border-b border-slate-100 pb-2">Upload Process</h3>
            
            <div className="flex gap-4 items-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200">1</div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Upload & Link</h4>
                 <p className="text-sm text-slate-600 mb-2">Upload MP3 to Open Drive, get 'Direct Link', and paste below.</p>
                 <div className="flex gap-2">
                   <input 
                      required
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                      placeholder="Paste 'Direct Link (streaming)' here..."
                      value={formData.audioUrl} 
                      onChange={e => setFormData({...formData, audioUrl: e.target.value})} 
                    />
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
             <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
             <button 
                type="submit" 
                disabled={isSaving}
                className={`px-6 py-2 bg-sky-500 text-white font-medium rounded-lg shadow-sm uppercase tracking-wide flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-sky-600'}`}
             >
               {isSaving ? 'Saving...' : 'Save Sermon'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;