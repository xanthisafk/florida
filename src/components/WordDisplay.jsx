export default function WordDisplay({ word }) {
  // Fallback for empty state or loading
  if (!word || !word.text) {
    return (
      <div className="word-display">
        <div className="word-part word-before"></div>
        <div className="word-part word-focus">&nbsp;</div>
        <div className="word-part word-after"></div>
      </div>
    );
  }

  const { text, focusIndex } = word;

  // Slice based on the pre-calculated index
  const before = text.slice(0, focusIndex);
  const focus = text[focusIndex];
  const after = text.slice(focusIndex + 1);

  return (
    <div className="word-display">
      <div className="word-part word-before">{before}</div>
      <div className="word-part word-focus">{focus}</div>
      <div className="word-part word-after">{after}</div>
    </div>
  );
}