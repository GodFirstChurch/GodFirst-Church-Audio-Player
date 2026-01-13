import React, { useState, useRef } from 'react';
import { Sermon, AdminView } from '../types';
import { getSermons, saveSermon, deleteSermon, importSermons } from '../services/storage';
import { ChevronLeft } from '../components/Icons';

interface AdminDashboardProps {
  onDataChange: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onDataChange }) => {
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

  return <AdminManager setView={setView} view={view} onDataChange={onDataChange} />;
};

const AdminManager: React.FC<{ setView: (v: AdminView) => void, view: AdminView, onDataChange: () => void }> = ({ setView, view, onDataChange }) => {
  const [sermons, setSermons] = useState<Sermon[]>(getSermons());
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = () => {
    setSermons(getSermons());
    onDataChange();
  };

  const handleEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setView(AdminView.EDIT);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      deleteSermon(id);
      refreshList();
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Reset after 3 seconds if not confirmed
      setTimeout(() => {
        setDeleteConfirmId(prev => prev === id ? null : prev);
      }, 3000);
    }
  };

  const handleSave = (sermon: Sermon) => {
    saveSermon(sermon);
    refreshList();
    setView(AdminView.LIST);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importSermons(content);
        if (success) {
          alert("Data restored successfully!");
          refreshList();
        } else {
          alert("Failed to restore data. Invalid file format.");
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  if (view === AdminView.LIST) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 brand-font uppercase">Manage Sermons</h2>
          
          <div className="flex gap-2">
            {/* Hidden File Input */}
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
                      onClick={() => handleDelete(s.id)} 
                      className={`font-medium text-sm uppercase transition-all duration-200 ${
                        deleteConfirmId === s.id 
                          ? 'bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 shadow-sm' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      {deleteConfirmId === s.id ? 'Sure?' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {sermons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No sermons yet. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-sky-50 border border-sky-100 p-4 rounded-lg text-sm text-sky-900">
          <strong>Note on Storage:</strong> Please follow the 4-step process below to host MP3s on Open Drive.
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

const SermonForm: React.FC<{ initialData: Sermon | null, onSave: (s: Sermon) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.audioUrl) {
      alert("Title and Audio URL are required");
      return;
    }
    
    onSave({
      id: initialData?.id || Date.now().toString(),
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
            
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200">1</div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Check File Size</h4>
                 <p className="text-sm text-slate-600">Ensure MP3 is smaller than 100MB. If larger, use Audacity to compress.</p>
               </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200">2</div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Upload to Open Drive</h4>
                 <p className="text-sm text-slate-600 mb-2">Login and upload the sermon file.</p>
                 <a href="https://www.opendrive.com/files/MTJfMTkzOTExNF9BcTM0MQ" target="_blank" rel="noreferrer" className="text-sky-600 text-sm underline font-medium block mb-2 break-all hover:text-sky-700">
                    https://www.opendrive.com/files/MTJfMTkzOTExNF9BcTM0MQ
                 </a>
                 <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm text-slate-700 inline-block">
                    <p className="mb-0.5"><span className="font-semibold text-slate-900">Username:</span> Rhys@Godfirstchurchbarry.com</p>
                    <p><span className="font-semibold text-slate-900">Password:</span> (Ask Rhys if needed)</p>
                 </div>
               </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200">3</div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Get Direct Link</h4>
                 <p className="text-sm text-slate-600">Right click on the file in Open Drive, select <strong>'Links'</strong>, then copy the <strong>'Direct Link (streaming)'</strong>.</p>
               </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center border border-sky-200">4</div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Enter Details & Save</h4>
                 <p className="text-sm text-slate-600 mb-2">Fill in the details above, paste the 'Direct Link (streaming)' below, and click Save.</p>
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
             <button type="submit" className="px-6 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 shadow-sm uppercase tracking-wide">Save Sermon</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;