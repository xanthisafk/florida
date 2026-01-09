import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings, getDefaultSettings } from '../utils/db';
import { applyTheme } from '../utils/themes';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const savedSettings = await getSettings();
    const defaultSettings = getDefaultSettings();
    
    // Deep merge to ensure all keys exist (e.g. user, audio.btnBg)
    const mergedSettings = {
      ...defaultSettings,
      ...savedSettings,
      reading: { ...defaultSettings.reading, ...(savedSettings?.reading || {}) },
      appearance: { ...defaultSettings.appearance, ...(savedSettings?.appearance || {}) },
      font: { ...defaultSettings.font, ...(savedSettings?.font || {}) },
      audio: { ...defaultSettings.audio, ...(savedSettings?.audio || {}) },
      user: { ...defaultSettings.user, ...(savedSettings?.user || {}) },
    };
    
    setSettings(mergedSettings);
    applyTheme(mergedSettings.appearance);
    applyFontSettings(mergedSettings.font);
    setLoading(false);
  }

  function applyFontSettings(font) {
    const root = document.documentElement;
    root.style.setProperty('--font-family', font.family);
    root.style.setProperty('--font-size', `${font.size}px`);
    root.style.setProperty('--font-weight', font.weight);
    root.style.setProperty('--line-height', font.lineHeight);
  }

  async function updateSettings(newSettings) {
    setSettings(newSettings);
    await saveSettings(newSettings);
    applyTheme(newSettings.appearance);
    applyFontSettings(newSettings.font);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
      Loading...
    </div>;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
