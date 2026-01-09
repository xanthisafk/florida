import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X, Type, Volume2, VolumeX, LightbulbOff, Lightbulb } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Controls({
  isPlaying,
  wpm,
  onPlay,
  onPause,
  onJump,
  onRestart,
  onExit,
  onWPMChange
}) {
  const { settings, updateSettings } = useSettings();
  const [showTypography, setShowTypography] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);


  const toggleMetronome = () => {
    updateSettings({
      ...settings,
      audio: { ...settings.audio, enabled: !settings.audio.enabled }
    });
  };

  const handleFontChange = (key, value) => {
    updateSettings({
      ...settings,
      font: { ...settings.font, [key]: value }
    });

    // Apply letter spacing CSS variable immediately
    if (key === 'letterSpacing') {
      document.documentElement.style.setProperty('--letter-spacing', `${value}em`);
    }
  };

  // Ensure letter spacing is applied on mount
  useEffect(() => {
    if (settings.font.letterSpacing !== undefined) {
      document.documentElement.style.setProperty('--letter-spacing', `${settings.font.letterSpacing}em`);
    } else {
      document.documentElement.style.setProperty('--letter-spacing', '0em');
    }
  }, []);

  return (
    <>
      <div className={`controls-overlay transition-opacity duration-300 ${lightsOff ? 'opacity-30 pointer-events-none' : 'opacity-100'
        }`}>
        <div className="controls-container">
          {/* Top bar */}
          <div className="controls-top w-full flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowTypography(!showTypography); }}
                  className={`ui-btn icon w-10 h-10 justify-center`}
                  title="Typography"
                >
                  <Type size={20} />
                </button>

                {/* Typography Popover */}
                {showTypography && (
                  <div
                    className="absolute top-full left-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col gap-4 z-50 origin-top-left animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()} // Prevent closing/hiding on click
                  >
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs uppercase opacity-60 font-bold">Font Size</label>
                        <span className="text-xs opacity-60">{settings.font.size}px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="96"
                        step="4"
                        value={settings.font.size}
                        onChange={(e) => handleFontChange('size', Number(e.target.value))}
                        className="wpm-slider w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs uppercase opacity-60 font-bold">Font Weight</label>
                        <span className="text-xs opacity-60">{settings.font.weight}</span>
                      </div>
                      <input
                        type="range"
                        min="300"
                        max="900"
                        step="100"
                        value={settings.font.weight}
                        onChange={(e) => handleFontChange('weight', Number(e.target.value))}
                        className="wpm-slider w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs uppercase opacity-60 font-bold">Letter Spacing</label>
                        <span className="text-xs opacity-60">{settings.font.letterSpacing || 0}em</span>
                      </div>
                      <input
                        type="range"
                        min="-0.1"
                        max="0.5"
                        step="0.01"
                        value={settings.font.letterSpacing || 0}
                        onChange={(e) => handleFontChange('letterSpacing', Number(e.target.value))}
                        className="wpm-slider w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleMetronome}
                className={`ui-btn icon w-10 h-10 justify-center ${settings.audio?.enabled ? 'bg-white/20 border-white/40' : ''}`}
                title="Metronome"
              >
                {settings.audio?.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={() => setLightsOff(!lightsOff)}
                className={`ui-btn icon w-10 h-10 justify-center ${lightsOff ? 'bg-white/20 border-white/40' : ''}`}
                title={lightsOff ? 'Turn lights on' : 'Turn lights off'}
              >
                {lightsOff ? <LightbulbOff size={20} /> : <Lightbulb size={20} />}
              </button>
            </div>

            <button onClick={onExit} className="ui-btn icon h-10 px-4" title="Exit">
              <X size={20} />
              <span>Exit</span>
            </button>
          </div>



          {/* Main controls - Center Bottom */}
          <div className="controls-main-wrapper">
            <div className="controls-main">
              <button onClick={() => onJump(-10)} className="ui-btn icon w-12 h-12 justify-center" title="Back 10">
                <SkipBack size={24} />
              </button>

              <button
                onClick={isPlaying ? onPause : onPlay}
                className="ui-btn icon primary w-20 h-20 flex items-center justify-center rounded-full border-2 border-white/20 hover:border-(--focus-color) hover:scale-105 transition-all bg-black/40 backdrop-blur-md"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={40} className="ml-0.5" /> : <Play size={40} className="ml-1" />}
              </button>

              <button onClick={() => onJump(10)} className="ui-btn icon w-12 h-12 justify-center" title="Forward 10">
                <SkipForward size={24} />
              </button>
            </div>

            <div className="controls-bottom-bar">
              <div className="wpm-control">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={wpm}
                  onChange={(e) => onWPMChange(Number(e.target.value))}
                  className="wpm-slider"
                />
                <span className="wpm-value">{wpm} WPM</span>
              </div>

              <button
                onClick={onRestart}
                className="ui-btn icon w-8 h-8 flex items-center justify-center p-0 hover group"
                title="Restart"
              >
                <RotateCcw
                  className="w-5 h-5 transition-transform duration-1000 group-hover:rotate-360"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
