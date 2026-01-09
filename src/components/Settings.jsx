import { useState } from 'react';
import { ArrowLeft, Type, Palette, Zap, Volume2, Check, Info } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { themes } from '../utils/themes';
import { metronome } from '../utils/audio';

const FONTS = [
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Sorts Mill Goudy', value: "'Sorts Mill Goudy', serif" },
  { name: 'Courier Prime', value: "'Courier Prime', monospace" },
  { name: 'Atkinson Hyperlegible', value: "'Atkinson Hyperlegible', sans-serif" },
];

const TONES = [
  { name: 'Pop', value: 'pop' },
  { name: 'Beep', value: 'beep' },
  { name: 'Click', value: 'click' },
  { name: 'Zap', value: 'zap' },
  { name: 'Power Up', value: 'powerUp' },
  { name: 'Buzz', value: 'buzz' },
  { name: 'Chime', value: 'chime' },
  { name: 'Tick', value: 'tick' },
]

export default function Settings(props) {
  const { onClose } = props;
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('reading');

  const handleChange = (section, key, value) => {
    if (section === 'audio' && key === 'soundType') {
      switch (value) {
        case 'pop':
          metronome.playPop();
          break;
        case 'beep':
          metronome.playBeep();
          break;
        case 'click':
          metronome.playTone();
          break;
        case 'zap':
          metronome.playZap();
          break;
        case 'powerUp':
          metronome.playPowerUp();
          break;
        case 'buzz':
          metronome.playBuzz();
          break;
        case 'chime':
          metronome.playChime();
          break;
        case 'tick':
          metronome.playTick();
          break;
      }
    }
    updateSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });

    // If changing theme to custom, ensure it's marked
    if (section === 'appearance' && key === 'bgColor') {
      // Logic handled in specific inputs
    }
  };

  const handleThemeChange = (key, theme) => {
    updateSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        ...theme,
        // Preserve custom colors if switching back to custom
        bgColor: theme.isCustom ? settings.appearance.bgColor : theme.bgColor,
        textColor: theme.isCustom ? settings.appearance.textColor : theme.textColor,
        focusColor: theme.isCustom ? settings.appearance.focusColor : theme.focusColor,
      }
    });
  };

  const tabs = [
    { id: 'reading', label: 'Reading', icon: Zap },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'font', label: 'Typography', icon: Type },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button onClick={onClose} className="btn-icon">
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>
        <h1>Settings</h1>
        <div className="w-24 flex justify-end">
          {props.installPrompt && (
            <button
              onClick={() => {
                props.installPrompt.prompt();
                props.installPrompt.userChoice.then((choice) => {
                  if (choice.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                  }
                });
              }}
              className="px-4 py-2 bg-(--focus-color) text-black rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Install
            </button>
          )}
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-panel">

          {/* Reading Settings */}
          {activeTab === 'reading' && (
            <div className="settings-section">
              <h2>Reading Preferences</h2>

              <div className="setting-item">
                <label>Default WPM</label>
                <div className="setting-control">
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                    value={settings.reading.wpm}
                    onChange={(e) => handleChange('reading', 'wpm', Number(e.target.value))}
                    className="wpm-slider"
                  />
                  <span className="value-display">{settings.reading.wpm} WPM</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label-group">
                  <label>Auto-Pause at Punctuation</label>
                  <p className="setting-desc">Slightly pause at periods, commas, etc.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.reading.autoPause}
                    onChange={(e) => handleChange('reading', 'autoPause', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              {settings.reading.autoPause && (
                <div className="setting-item">
                  <label>Pause Multiplier</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={settings.reading.punctuationMultiplier}
                      onChange={(e) => handleChange('reading', 'punctuationMultiplier', Number(e.target.value))}
                      className="wpm-slider"
                    />
                    <span className="value-display">{settings.reading.punctuationMultiplier}x</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Theme & Appearance</h2>

              <div className="themes-grid">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    className="theme-card"
                    style={{
                      backgroundColor: theme.isCustom ? '#333' : theme.bgColor,
                      color: theme.isCustom ? '#fff' : theme.textColor,
                      border: settings.appearance.name === theme.name ? `2px solid var(--focus-color)` : '2px solid transparent'
                    }}
                    onClick={() => handleThemeChange(key, theme)}
                  >
                    <div className="theme-preview">Aa</div>
                    <span className="theme-name">{theme.name}</span>
                    {settings.appearance.name === theme.name && (
                      <div className="theme-selected"><Check size={16} /></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Theme Controls */}
              {settings.appearance.name === 'Custom' && (
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label>Background</label>
                      <input
                        type="color"
                        value={settings.appearance.bgColor}
                        onChange={(e) => handleChange('appearance', 'bgColor', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Text</label>
                      <input
                        type="color"
                        value={settings.appearance.textColor}
                        onChange={(e) => handleChange('appearance', 'textColor', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Focus (Highlight)</label>
                      <input
                        type="color"
                        value={settings.appearance.focusColor}
                        onChange={(e) => handleChange('appearance', 'focusColor', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* <div className="setting-item mt-8">
                <label>Dim Overlay Strength</label>
                <div className="setting-control">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.appearance.dimStrength}
                    onChange={(e) => handleChange('appearance', 'dimStrength', Number(e.target.value))}
                    className="wpm-slider"
                  />
                  <span className="value-display">{Math.round(settings.appearance.dimStrength * 100)}%</span>
                </div>
              </div> */}
            </div>
          )}

          {/* Font Settings */}
          {activeTab === 'font' && (
            <div className="settings-section">
              <h2>Typography</h2>

              {/* Font Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {FONTS.map((font) => {
                  const isActive = settings.font.family === font.value

                  return (
                    <button
                      key={font.name}
                      onClick={() => handleChange('font', 'family', font.value)}
                      className={`ui-btn transition duration-200 ease-in-out
                      ${isActive
                          ? 'primary'
                          : ''
                        }`}
                      style={{ fontFamily: font.value }}
                    >
                      <span>{font.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Font Size */}
              <div className="flex justify-between ">
                <div className="setting-item">
                  <label>Font Size</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="24"
                      max="96"
                      step="4"
                      value={settings.font.size}
                      onChange={(e) =>
                        handleChange('font', 'size', Number(e.target.value))
                      }
                      className="wpm-slider"
                    />
                    <span className="value-display">{settings.font.size}px</span>
                  </div>
                </div>

                {/* Font Weight */}
                <div className="setting-item">
                  <label>Font Weight</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="300"
                      max="900"
                      step="100"
                      value={settings.font.weight}
                      onChange={(e) =>
                        handleChange('font', 'weight', Number(e.target.value))
                      }
                      className="wpm-slider"
                    />
                    <span className="value-display">{settings.font.weight}</span>
                  </div>
                </div>
              </div>

              {/* Shared Preview */}
              <div className="squircle mb-8 p-6 rounded-2xl border bg-(--panel-bg)">
                <p
                  className="transition-all"
                  style={{
                    fontFamily: settings.font.family,
                    fontSize: `${settings.font.size}px`,
                    fontWeight: settings.font.weight,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>


          )}


          {/* Audio Settings */}
          {activeTab === 'audio' && (
            <div className="settings-section">
              <h2>Metronome</h2>

              <div className="setting-item">
                <div className="setting-label-group">
                  <label>Enable Metronome</label>
                  <p className="setting-desc">Play a sound on each word</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.audio?.enabled}
                    onChange={(e) => handleChange('audio', 'enabled', e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              {settings.audio?.enabled && (
                <div className="setting-item">
                  <label>Sound Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {TONES.map((tone) => (
                      <button
                        key={tone.value}
                        className={`ui-btn px-4 py-2 rounded-lg border transition-colors cursor-pointer ${settings.audio.soundType === tone.value ? 'primary' : ''
                          }`}
                        onClick={() => handleChange('audio', 'soundType', tone.value)}
                      >
                        {tone.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* About */}
          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>About</h2>

              <div className="space-y-4 text-sm leading-relaxed opacity-90">
                <p className="font-semibold text-base">
                  Florida
                </p>

                <p>
                  <strong>Speed Reading Trainer</strong>
                </p>

                <p>
                  Made by{' '}
                  <a
                    href="https://xanthis.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--focus-color) hover:underline"
                  >
                    Abhinav
                  </a>
                </p>

                <p>
                  Inspired by a YouTube video by{' '}
                  <a
                    href="https://www.youtube.com/watch?v=NdKcDPBQ-Lw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--focus-color) hover:underline"
                  >
                    Buffed
                  </a>{' '}
                  (
                  <a
                    href="https://www.youtube.com/@BuffedYT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--focus-color) hover:underline"
                  >
                    @BuffedYT
                  </a>
                  )
                </p>

                <p>
                  Favicon <em>"Cursor"</em> from{' '}
                  <a
                    href="https://www.svgrepo.com/svg/93131/cursor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--focus-color) hover:underline"
                  >
                    SVGRepo
                  </a>{' '}
                  (CC0)
                </p>

                <p>
                  Fonts provided by{' '}
                  <a
                    href="https://fonts.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--focus-color) hover:underline"
                  >
                    Google Fonts
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
