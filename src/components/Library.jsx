import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, BookOpen, Settings as SettingsIcon, Star, AlertCircle, X, Edit2, Book } from 'lucide-react';
import { getAllDocuments, deleteDocument, getReadingState, saveDocument, toggleFavorite } from '../utils/db';
import { processDocument } from '../utils/textProcessor';
import { useSettings } from '../contexts/SettingsContext';

export default function Library({ onOpenDocument, onOpenSettings }) {
  const { settings, updateSettings } = useSettings();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [renameDoc, setRenameDoc] = useState(null); // Doc to rename
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    loadDocuments();
    checkDemoLoad();
  }, []);

  async function checkDemoLoad() {
    // Only verify once per session or use a flag to prevent double-calls in strict mode
    if (sessionStorage.getItem('demoChecked')) return;
    sessionStorage.setItem('demoChecked', 'true');

    if (settings && !settings.demoLoaded) {
      try {
        const docs = await getAllDocuments();
        const demoExists = docs.some(d => d.title === 'A Study in Scarlet.txt' || d.title === 'A Study in Scarlet');

        if (demoExists) {
          updateSettings({ ...settings, demoLoaded: true });
          return;
        }

        const response = await fetch('/Arthur Conan Doyle - A Study in Scarlet.txt');
        if (!response.ok) throw new Error('Demo file not found');

        const blob = await response.blob();
        const file = new File([blob], 'A Study in Scarlet.txt', { type: 'text/plain' });
        const doc = await processDocument(file);

        await saveDocument(doc);

        updateSettings({
          ...settings,
          demoLoaded: true
        });

        await loadDocuments();
      } catch (error) {
        console.warn('Failed to load demo document:', error);
      }
    }
  }

  async function loadDocuments() {
    const docs = await getAllDocuments();
    // Sort by date (newest first)
    docs.sort((a, b) => b.createdAt - a.createdAt);
    setDocuments(docs);
    setLoading(false);
  }

  async function handleFileUpload(files) {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const document = await processDocument(file);
        await saveDocument(document);
      }
      await loadDocuments();
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Failed to process document. Please try again.');
    }
    setUploading(false);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    await deleteDocument(deleteConfirm);
    setDeleteConfirm(null);
    await loadDocuments();
  }

  async function handleToggleFavorite(id, e) {
    e.stopPropagation();
    await toggleFavorite(id);
    await loadDocuments();
  }

  async function handleRename() {
    if (!renameDoc || !renameText.trim()) return;
    const updatedDoc = { ...renameDoc, title: renameText.trim() };
    await saveDocument(updatedDoc);
    setRenameDoc(null);
    setRenameText('');
    await loadDocuments();
  }

  async function handleOpenDocument(doc) {
    const state = await getReadingState(doc.id);
    onOpenDocument(doc, state);
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  if (loading) {
    return <div className="library-loading">Loading library...</div>;
  }

  const headerStyle = {
    fontFamily: settings.font.family,
    color: settings.appearance.focusColor,
    background: 'transparent',
    WebkitTextFillColor: settings.appearance.focusColor,
  };

  const favorites = documents.filter(d => d.isFavorite);
  const allDocs = documents;

  return (
    <div className="library">
      <div className="library-header-container">
        <div className="library-header">
          <h1 style={headerStyle}>Florida</h1>
          <p className="library-subtitle">Speed Reading Trainer</p>
        </div>
        <button onClick={onOpenSettings} className="ui-btn icon settings-btn" title="Settings">
          <SettingsIcon size={24} />
        </button>
      </div>

      {/* Upload area */}
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload size={48} />
        <h2>Upload Document</h2>
        <p>Drag and drop or click to browse</p>
        <p className="upload-formats">Supports TXT, PDF, and EPUB files</p>
        <input
          type="file"
          accept=".txt,.pdf,.epub"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="upload-input"
          disabled={uploading}
        />
        {uploading && <div className="upload-progress">Processing...</div>}
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="document-list mb-8">
          <div className="flex items-center gap-2 mb-4 text-yellow-500">
            <Star size={"1.25rem"} fill="currentColor" />
            <h2 className="text-xl font-bold text-white leading-none mb-0! pb-0!">Favorites</h2>
          </div>
          <div className="document-grid">
            {favorites.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpen={() => handleOpenDocument(doc)}
                onDelete={(e) => { e.stopPropagation(); setDeleteConfirm(doc.id); }}
                onFavorite={(e) => handleToggleFavorite(doc.id, e)}
                onRename={(e) => { e.stopPropagation(); setRenameDoc(doc); setRenameText(doc.title); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Documents Section */}
      {documents.length > 0 ? (
        <div className="document-list">
          <div className="flex items-center gap-2 mb-4">
            <Book size={"1.25rem"} />
            <h2 className="text-xl font-bold text-white leading-none mb-0! pb-0!">Library</h2>
          </div>
          <div className="document-grid">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpen={() => handleOpenDocument(doc)}
                onDelete={(e) => { e.stopPropagation(); setDeleteConfirm(doc.id); }}
                onFavorite={(e) => handleToggleFavorite(doc.id, e)}
                onRename={(e) => { e.stopPropagation(); setRenameDoc(doc); setRenameText(doc.title); }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="library-empty">
          <BookOpen size={64} />
          <p>No documents yet</p>
          <p className="text-sm">Upload a document to start reading</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertCircle size={28} />
              <h3 className="text-xl font-bold text-white">Delete Document?</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Rename Document</h3>
            <input
              type="text"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-6 focus:border-(--focus-color) outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRenameDoc(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 rounded-lg bg-(--focus-color) text-black font-medium transition-colors hover:opacity-90"
                disabled={!renameText.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({ document, onOpen, onDelete, onFavorite, onRename }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadProgress() {
      const state = await getReadingState(document.id);
      if (state) {
        const pct = (state.currentWordIndex / document.words.length) * 100;
        setProgress(Math.round(pct));
      }
    }
    loadProgress();
  }, [document]);

  const getFileIcon = () => {
    return <FileText size={24} />;
  };

  return (
    <div className="document-card group" onClick={onOpen}>
      <div className="document-card-header">
        {getFileIcon()}
        <div className="flex gap-1">
          <button
            className="cursor-pointer document-action p-1.5 rounded text-slate-500 hover:text-(--focus-color) hover:bg-white/10 transition-colors"
            onClick={onRename}
            title="Rename document"
          >
            <Edit2 size={16} />
          </button>
          <button
            className={`cursor-pointer document-action p-1.5 rounded transition-colors ${document.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`}
            onClick={onFavorite}
            title={document.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star size={18} fill={document.isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            className="cursor-pointer document-action p-1.5 rounded text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            onClick={onDelete}
            title="Delete document"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="document-title truncate pr-2">{document.title}</h3>

      <div className="document-meta">
        <span className="document-type">{document.type.toUpperCase()}</span>
        <span className="document-words">{document.words.length} words</span>
      </div>

      {progress > 0 && (
        <div className="document-progress">
          <div className="document-progress-bar">
            <div
              className="document-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="document-progress-text">{progress}% complete</span>
        </div>
      )}
    </div>
  );
}
