import { useSettings } from '../contexts/SettingsContext';
import { useRSVP } from '../hooks/useRSVP';
import WordDisplay from './WordDisplay';
import Controls from './Controls';

export default function ReaderView({ document, initialState, onExit }) {
  const { settings } = useSettings();
  const rsvp = useRSVP(document, initialState, settings);

  return (
    <div className="reader-view">
      {/* Background overlay */}
      <div className="reader-overlay" />
      
      {/* Main content */}
      <div className="reader-content">
        {/* Progress bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${rsvp.progress}%` }}
          />
        </div>

        {/* Word display */}
        <div className="reader-word-container">
          <WordDisplay word={rsvp.currentWord} />
        </div>

        {/* Progress text */}
        <div className="reader-progress-text">
          {rsvp.currentIndex + 1} / {document.words.length}
        </div>
      </div>

      {/* Controls */}
      <Controls
        isPlaying={rsvp.isPlaying}
        wpm={rsvp.wpm}
        onPlay={rsvp.play}
        onPause={rsvp.pause}
        onJump={rsvp.jump}
        onRestart={rsvp.restart}
        onExit={onExit}
        onWPMChange={rsvp.changeWPM}
      />
    </div>
  );
}
