import { useState, useEffect } from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import Library from './components/Library';
import ReaderView from './components/ReaderView';
import Settings from './components/Settings';
import { useDynamicFavicon } from './hooks/useDynamicFavicon';

function App() {

  useDynamicFavicon();

  const [currentDocument, setCurrentDocument] = useState(null);
  const [readingState, setReadingState] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  function handleOpenDocument(document, state) {
    setCurrentDocument(document);
    setReadingState(state);
  }

  function handleExitReader() {
    setCurrentDocument(null);
    setReadingState(null);
  }

  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <SettingsProvider>
      {currentDocument ? (
        <ReaderView
          document={currentDocument}
          initialState={readingState}
          onExit={handleExitReader}
        />
      ) : showSettings ? (
        <Settings
          onClose={() => setShowSettings(false)}
          installPrompt={installPrompt}
        />
      ) : (
        <Library
          onOpenDocument={handleOpenDocument}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
    </SettingsProvider>
  );
}

export default App;
