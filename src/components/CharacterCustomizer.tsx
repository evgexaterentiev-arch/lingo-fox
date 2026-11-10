import { useState } from 'react';
import type { AvatarConfig, AnimalKind, AvatarAccessory, AvatarColor, AvatarExpression, Locale } from '../types';
import { getCopy } from '../lib/i18n';
import { CharacterMascot } from './CharacterMascot';

interface CharacterCustomizerProps {
  locale: Locale;
  value: AvatarConfig;
  onSave: (avatar: AvatarConfig) => void;
  onClose: () => void;
}

const animals: AnimalKind[] = ['fox', 'cat', 'panda', 'rabbit', 'owl'];
const colors: AvatarColor[] = ['sunset', 'mint', 'berry', 'sky'];
const accessories: AvatarAccessory[] = ['none', 'glasses', 'scarf', 'crown'];
const expressions: AvatarExpression[] = ['happy', 'calm', 'excited'];

const animalLabels: Record<AnimalKind, string> = { fox: '🦊', cat: '🐱', panda: '🐼', rabbit: '🐰', owl: '🦉' };
const accessoryLabels: Record<AvatarAccessory, string> = { none: 'Без аксессуара', glasses: 'Очки', scarf: 'Шарф', crown: 'Корона' };

export function CharacterCustomizer({ locale, value, onSave, onClose }: CharacterCustomizerProps) {
  const [draft, setDraft] = useState(value);
  const t = getCopy(locale);

  return (
    <main className="app-shell customizer-screen">
      <header className="profile-header">
        <button className="back-button" type="button" onClick={onClose} aria-label="Назад">←</button>
        <h1>{t.customize}</h1>
        <div />
      </header>
      <div className={`customizer-preview customizer-preview--${draft.color}`}>
        <CharacterMascot avatar={draft} size="large" mood={draft.expression === 'excited' ? 'excited' : draft.expression === 'calm' ? 'think' : 'hello'} />
        <span className="customizer-accessory" aria-label={accessoryLabels[draft.accessory]}>{draft.accessory === 'none' ? '' : accessoryLabels[draft.accessory]}</span>
      </div>
      <CustomizerRow title={t.animal}>
        {animals.map((animal) => <button key={animal} className={`customizer-choice ${draft.animal === animal ? 'customizer-choice--selected' : ''}`} onClick={() => setDraft({ ...draft, animal })}>{animalLabels[animal]}</button>)}
      </CustomizerRow>
      <CustomizerRow title={t.color}>
        {colors.map((color) => <button key={color} className={`color-choice color-choice--${color} ${draft.color === color ? 'customizer-choice--selected' : ''}`} onClick={() => setDraft({ ...draft, color })} aria-label={color} />)}
      </CustomizerRow>
      <CustomizerRow title={t.accessory}>
        {accessories.map((accessory) => <button key={accessory} className={`customizer-choice customizer-choice--text ${draft.accessory === accessory ? 'customizer-choice--selected' : ''}`} onClick={() => setDraft({ ...draft, accessory })}>{accessoryLabels[accessory]}</button>)}
      </CustomizerRow>
      <CustomizerRow title={t.expression}>
        {expressions.map((expression) => <button key={expression} className={`customizer-choice customizer-choice--text ${draft.expression === expression ? 'customizer-choice--selected' : ''}`} onClick={() => setDraft({ ...draft, expression })}>{expression === 'happy' ? '😊' : expression === 'calm' ? '🙂' : '🤩'}</button>)}
      </CustomizerRow>
      <button className="primary-button" type="button" onClick={() => { onSave(draft); onClose(); }}>{t.save}<span aria-hidden="true">✓</span></button>
    </main>
  );
}

function CustomizerRow({ title, children }: { title: string; children: import('react').ReactNode }) {
  return <section className="customizer-row"><h2>{title}</h2><div className="customizer-options">{children}</div></section>;
}
