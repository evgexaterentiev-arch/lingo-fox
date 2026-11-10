import type { AvatarConfig } from '../types';

interface FoxMascotProps {
  size?: 'small' | 'medium' | 'large';
  mood?: 'hello' | 'cheer' | 'think' | 'celebrate' | 'excited' | 'sleep' | 'love';
  className?: string;
  animate?: boolean;
  avatar?: AvatarConfig;
}

export function FoxMascot({ size = 'medium', mood = 'hello', className = '', animate = true, avatar }: FoxMascotProps) {
  const showSparkle = mood === 'celebrate' || mood === 'cheer' || mood === 'excited';
  const showHeart = mood === 'love';
  
  // Разные выражения глаз для разных настроений
  const eyePath = mood === 'think' 
    ? 'M 73 98 Q 80 103 87 98' 
    : mood === 'sleep'
    ? 'M 74 98 L 86 98'
    : mood === 'love' || mood === 'celebrate'
    ? 'M 73 95 Q 80 90 87 95'
    : 'M 74 98 Q 80 92 86 98';

  // Разные выражения рта
  const foxColor = avatar?.color === 'mint' ? '#62b49d' : avatar?.color === 'berry' ? '#a85e87' : avatar?.color === 'sky' ? '#5e9bc2' : '#ef7b48';
  const mouthPath = mood === 'think' 
    ? 'M79 122q11 3 22-1'
    : mood === 'sleep'
    ? 'M84 124q6 2 12 0'
    : mood === 'excited' || mood === 'celebrate'
    ? 'M75 120q15 18 30 0'
    : mood === 'love'
    ? 'M80 120q10 8 20 0'
    : 'M78 122q12 12 24 0';

  return (
    <svg
      aria-label="Линго Лис"
      className={`fox fox--${size} ${animate ? 'fox--animated' : ''} fox--${mood} ${className}`}
      viewBox="0 0 180 180"
      role="img"
    >
      {/* Хвост с анимацией */}
      <g className="fox__tail">
        <path d="M135 123c28 2 33 35 8 42-17 5-31-8-29-22 2-12 10-18 21-20Z" fill={foxColor} />
        <path d="M135 145c8 1 13 5 13 10-5 7-17 5-22-1 1-4 4-7 9-9Z" fill="#fff4df" />
      </g>
      
      {/* Уши */}
      <g className="fox__ears">
        <path d="M44 68 40 18c0-7 8-10 13-4l28 36Z" fill={foxColor} />
        <path d="M50 54 48 30l16 24Z" fill="#713b35" />
        <path d="M130 68 136 18c1-7-7-11-13-5L95 50Z" fill={foxColor} />
        <path d="m125 55 4-25-17 24Z" fill="#713b35" />
      </g>
      
      {/* Тело */}
      <ellipse cx="90" cy="120" rx="55" ry="43" fill="#6b4b68" />
      <path d="M45 91c0-31 18-52 45-52s45 21 45 52c0 31-20 55-45 55S45 122 45 91Z" fill={foxColor} />
      <path d="M53 111c8 21 21 32 37 32s30-11 37-32c-7 4-14 6-22 6H75c-8 0-15-2-22-6Z" fill="#fff4df" />
      <path d="M90 107c12 0 23 6 29 17-9 12-18 18-29 18s-20-6-29-18c6-11 17-17 29-17Z" fill="#fffaf0" />
      
      {/* Глаза с анимацией моргания */}
      <g className="fox__eyes">
        <path d={eyePath} fill="none" stroke="#3b2d3d" strokeLinecap="round" strokeWidth="5" />
        <path 
          d={eyePath.replaceAll('73', '93').replaceAll('80', '100').replaceAll('87', '107').replaceAll('74', '94').replaceAll('86', '106')} 
          fill="none" 
          stroke="#3b2d3d" 
          strokeLinecap="round" 
          strokeWidth="5" 
        />
      </g>
      
      {/* Нос */}
      <path d="M84 108q6 5 12 0" fill="#3b2d3d" stroke="#3b2d3d" strokeLinecap="round" strokeWidth="4" />
      
      {/* Рот */}
      <path className="fox__mouth" d={mouthPath} fill="none" stroke="#3b2d3d" strokeLinecap="round" strokeWidth="4" />
      
      {/* Румянец */}
      <path d="M59 79q12-10 22-3" fill="none" stroke="#d45e38" strokeLinecap="round" strokeWidth="4" opacity="0.6" />
      <path d="M100 76q10-7 21 3" fill="none" stroke="#d45e38" strokeLinecap="round" strokeWidth="4" opacity="0.6" />
      
      {/* Лапа */}
      <path d="M42 137c11-8 21-10 30-5l-7 31H42Z" fill={foxColor} />
      
      {/* Жесты в зависимости от настроения */}
      {mood === 'hello' && (
        <path className="fox__wave" d="M52 117c-16-7-24-21-20-32" fill="none" stroke="#ef7b48" strokeLinecap="round" strokeWidth="13" />
      )}
      {(mood === 'cheer' || mood === 'excited') && (
        <path className="fox__cheer" d="M128 112c14-11 19-23 15-35" fill="none" stroke="#ef7b48" strokeLinecap="round" strokeWidth="13" />
      )}
      
      {/* Искорки */}
      {showSparkle && (
        <g className="fox__sparkles">
          <path d="m145 67 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#f7c858" />
          <path d="m35 91 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#f7c858" />
          <path d="m155 105 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="#ffa07a" />
        </g>
      )}
      
      {/* Корона для celebrate */}
      {mood === 'celebrate' && (
        <path d="M57 51c-11-9-14-21-8-31 12 6 18 17 17 30" fill="#f7c858" />
      )}
      
      {/* Сердечки для love */}
      {showHeart && (
        <g className="fox__hearts">
          <path d="M145 75c0-4 3-7 7-7 4 0 7 3 7 7 0 7-7 11-7 11s-7-4-7-11Z" fill="#ff6b9d" opacity="0.8" />
          <path d="M30 85c0-3 2-5 5-5s5 2 5 5c0 5-5 8-5 8s-5-3-5-8Z" fill="#ff6b9d" opacity="0.8" />
        </g>
      )}
      
      {/* Zzz для sleep */}
      {mood === 'sleep' && (
        <g className="fox__sleep" fill="#8b7e87" opacity="0.6">
          <text x="145" y="75" fontSize="20" fontFamily="Arial">Z</text>
          <text x="155" y="65" fontSize="16" fontFamily="Arial">z</text>
          <text x="162" y="58" fontSize="12" fontFamily="Arial">z</text>
        </g>
      )}
    </svg>
  );
}
