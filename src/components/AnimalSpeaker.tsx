import { useCallback, useState } from 'react';
import type { AnimalKind } from '../types';
import { getCopy } from '../lib/i18n';
import { FoxMascot } from './FoxMascot';

interface AnimalSpeakerProps {
  speaker: AnimalKind;
  phrase: string;
  locale: 'ru' | 'uk';
}

const animalEmoji: Record<AnimalKind, string> = {
  fox: '🦊',
  cat: '🐱',
  panda: '🐼',
  rabbit: '🐰',
  owl: '🦉',
};

export function AnimalSpeaker({ speaker, phrase, locale }: AnimalSpeakerProps) {
  const [speaking, setSpeaking] = useState(false);
  const t = getCopy(locale);

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [phrase]);

  return (
    <div className={`animal-speaker animal-speaker--${speaker} ${speaking ? 'animal-speaker--speaking' : ''}`}>
      <div className="animal-speaker__avatar" aria-hidden="true">
        {speaker === 'fox' ? <FoxMascot size="medium" mood={speaking ? 'excited' : 'hello'} /> : <span>{animalEmoji[speaker]}</span>}
      </div>
      <div className="animal-speaker__copy">
        <strong>{animalEmoji[speaker]} {phrase}</strong>
        <button type="button" className="listen-button" onClick={speak}>
          <span aria-hidden="true">🔊</span>{t.listen}
        </button>
      </div>
    </div>
  );
}
