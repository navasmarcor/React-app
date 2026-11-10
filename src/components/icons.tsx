import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'home' | 'profile' | 'schools' | 'advice' | 'email' | 'play' | 'lock' | 'check' | 'plus' | 'close';

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: string }) {
  const p = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />}
      {name === 'profile' && (
        <>
          <Circle {...p} cx={12} cy={8} r={4} />
          <Path {...p} d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
        </>
      )}
      {name === 'schools' && (
        <>
          <Path {...p} d="M2 9l10-5 10 5-10 5z" />
          <Path {...p} d="M6 11v5c3 2.5 9 2.5 12 0v-5" />
        </>
      )}
      {name === 'advice' && <Path {...p} d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" />}
      {name === 'email' && (
        <>
          <Rect {...p} x={3} y={5} width={18} height={14} rx={2} />
          <Path {...p} d="M3 7l9 6 9-6" />
        </>
      )}
      {name === 'play' && <Path d="M7 4l13 8-13 8z" fill={color} />}
      {name === 'lock' && (
        <>
          <Rect {...p} x={5} y={11} width={14} height={10} rx={2} />
          <Path {...p} d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )}
      {name === 'check' && <Path {...p} strokeWidth={3} d="M5 12.5l4.5 4.5L19 7.5" />}
      {name === 'plus' && <Path {...p} d="M12 5v14M5 12h14" />}
      {name === 'close' && <Path {...p} d="M6 6l12 12M18 6L6 18" />}
    </Svg>
  );
}
