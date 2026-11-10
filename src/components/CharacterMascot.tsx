import type { AvatarConfig, AnimalKind } from '../types';
import { FoxMascot } from './FoxMascot';

interface CharacterMascotProps {
  avatar: AvatarConfig;
  size?: 'small' | 'medium' | 'large';
  mood?: 'hello' | 'cheer' | 'think' | 'celebrate' | 'excited' | 'sleep' | 'love';
}

const animalEmoji: Record<AnimalKind, string> = { fox: '🦊', cat: '🐱', panda: '🐼', rabbit: '🐰', owl: '🦉' };
const accessoryEmoji = { none: '', glasses: '🕶️', scarf: '🧣', crown: '👑' };

export function CharacterMascot({ avatar, size = 'medium', mood = 'hello' }: CharacterMascotProps) {
  if (avatar.animal === 'fox') {
    return <FoxMascot size={size} mood={mood} avatar={avatar} />;
  }

  return (
    <span className={`character-mascot character-mascot--${size} character-mascot--${avatar.color}`} role="img" aria-label={avatar.animal}>
      <span className="character-mascot__animal">{animalEmoji[avatar.animal]}</span>
      {avatar.accessory !== 'none' && <span className="character-mascot__accessory">{accessoryEmoji[avatar.accessory]}</span>}
    </span>
  );
}
